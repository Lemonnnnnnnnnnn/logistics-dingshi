import React, { useEffect, useCallback, useState } from "react";
import { Form, Button, Radio, Spin, message } from "antd";
import { Location, History } from "history";
import CommonHeader from "../components/common-header";
import InputResultItem from "./components/input-result-item";
import ConfirmModal from "../../../components/confirm-modal";
import PriceModal from "./components/price-modal";
import TextArea from "antd/lib/input/TextArea";
import { postEvaluation } from "@/services/tender-manage-server";
import { IStoreProps, ITenderManageStoreProps } from "@/declares";
import { connect } from "dva";
import { omit, unionBy, uniqBy } from "lodash";

interface ILocation extends Location {
  state: {
    tenderTitle: string;
    tenderNo: string;
    tenderId: number;
    modify?: boolean;
    tenderStatus: number;
  };
}

interface IProps {
  location: ILocation;
  history: History;
  tenderManageStore: ITenderManageStoreProps;
  loading: any;
  tenderId: number;
  getEvaluation: (tenderId: number) => void;
}

const Index: React.FC<IProps> = ({
  getEvaluation,
  tenderManageStore: { evaluationInfo },
  loading,
  location: {
    state: { tenderTitle, tenderNo, tenderId, modify, tenderStatus }
  },
  history
}) => {
  const isLoading = loading.effects["tenderManageStore/getEvaluation"];

  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getEvaluation(tenderId);
  }, []);

  useEffect(() => {
    if (evaluationInfo && evaluationInfo.shipmentListDetailResps) {
      evaluationInfo.shipmentListDetailResps?.forEach(item => {
        item.organizationEvaluationReqs = item.orgDataResps
          .sort((a, b) => a.bidderSequence - b.bidderSequence)
          .map(org => {
            if (modify) {
              return {
                organizationId: org?.organizationId,
                isWinBid: org.tenderBidderPackageStatus
              };
            } else {
              return undefined;
            }
          }); // 初始化候选人
      });
      console.log(evaluationInfo)
      form.setFieldsValue({
        tenderPackageEvaluationReqs: evaluationInfo.shipmentListDetailResps
      });
    }
  }, [evaluationInfo]);

  const onSubmit = useCallback(
    evaluationOperate => () => {
      form.validateFields().then(values => {
        const {
          tenderEvaluationResult,
          isShowPrice,
          tenderPackageEvaluationReqs
        } = values;
        const newList = tenderPackageEvaluationReqs.map(item => {
          if (item.isAbortive) {
            item.organizationEvaluationReqs = [];
          } else {
            item.organizationEvaluationReqs?.forEach((element, i) => {
              element.isWinBid = element.isWinBid ? 1 : 0;
              element.bidderSequence = i + 1;
            });
          }

          return {
            ...omit(item, ["orgDataResps", "tenderPackageTitle"]),
            isAbortive: item.isAbortive ? 1 : 0
          };
        });
        if (
          !newList.some(item => item.organizationEvaluationReqs.length) &&
          newList.every(item => !item.isAbortive)
        ) {
          return message.info("未录入结果！");
        }
        // tslint:disable-next-line:forin
        for (const i in newList) {

          const unionByList = uniqBy(
            newList[i].organizationEvaluationReqs,
            "organizationId"
          );
          if (
            unionByList.length !== newList[i].organizationEvaluationReqs.length
          ) {
            return message.info("同一公司不能为多个候选人");
          }
        }

        if (evaluationOperate === 3) {
          // 判断是否都是流标如果都是流标就不能价格确认 “所有包件都流标不用发起价格确认”

          if (tenderPackageEvaluationReqs.every(item => item.isAbortive)) {
            return message.info("所有包件都流标不用发起价格确认!");
          }
          // 否则判断为流标的是否有多个候选人 如果都只有一个就提示“所有包件的中标人均只有一个或者没有，不能发起价格确认!”
          if (
            !tenderPackageEvaluationReqs
              .filter(item => !item.isAbortive)
              .every(
                item =>
                  item.organizationEvaluationReqs.filter(org => org.isWinBid)
                    .length <= 1
              )
          ) {
            postEvaluation(tenderId, {
              evaluationOperate: 1,
              isShowPrice: Number(isShowPrice),
              tenderEvaluationResult,
              tenderPackageEvaluationReqs: newList
            }).then(res => {
              setVisible(true);
            });
          } else {
            message.info(
              "所有非流标包件的中标人均只有一个或者没有，不能发起价格确认!"
            );
          }
        } else {
          postEvaluation(tenderId, {
            evaluationOperate,
            isShowPrice: Number(isShowPrice),
            tenderEvaluationResult,
            tenderPackageEvaluationReqs: newList
          }).then(res => {
            history.push("/tenderManage");
            message.success(
              evaluationOperate === 1 ? "保存草稿成功！" : "保存并公示成功！"
            );
            // history.goBack();
          });
        }
      });
    },
    []
  );

  return (
    <Spin tip="Loading..." spinning={isLoading}>
      <div className="center-main border-gray" style={{ marginBottom: "20px" }}>
        <CommonHeader
          tenderTitle={tenderTitle}
          tenderNo={tenderNo}
          history={history}
          tenderId={tenderId}
        />
        <div className="m-2">
          <Form form={form}>
            <Form.List name="tenderPackageEvaluationReqs">
              {fields => (
                <>
                  {fields.map((field, index) => (
                    <InputResultItem
                      index={index + 1}
                      key={field.key}
                      dataItem={field}
                      form={form}
                    />
                  ))}
                </>
              )}
            </Form.List>
            <Form.Item
              name="tenderEvaluationResult"
              label="评标说明"
              style={{ marginTop: "20px", width: "40%" }}
            >
              <TextArea rows={5} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="isShowPrice"
              label="结果公示展示选项"
              initialValue={1}
              style={{ marginTop: "20px" }}
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio value={0}>不展示价格</Radio>
                <Radio value={1}>展示价格</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
          <div className="commonBtn">
            <Button type="primary" onClick={onSubmit(1)}>
              保存草稿
            </Button>
            <Button
              type="primary"
              onClick={ConfirmModal(
                "一旦公示，评标结果不可更改和撤回！确认要公示？",
                onSubmit(2)
              )}
            >
              保存并公示
            </Button>
            {!evaluationInfo?.priceConfirmTime ? (
              <Button type="primary" onClick={onSubmit(3)}>
                保存并发起价格确认
              </Button>
            ) : null}
            <Button onClick={() => history.push("/tenderManage")}>取消</Button>
          </div>
        </div>
        {visible ? (
          <PriceModal
            visible={visible}
            setVisible={setVisible}
            tenderId={tenderId}
            history={history}
          />
        ) : null}
      </div>
    </Spin>
  );
};

const mapStoreToProps = ({ tenderManageStore, loading }: IStoreProps) => ({
  tenderManageStore,
  loading
});
const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: { tenderId: number } }) => any
) => ({
  getEvaluation: (tenderId: number) =>
    dispatch({
      type: "tenderManageStore/getEvaluation",
      payload: { tenderId }
    })
});
export default connect(mapStoreToProps, mapDispatchToProps)(Index);
