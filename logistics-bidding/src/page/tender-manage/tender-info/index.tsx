import React, { useCallback, useEffect, useState } from "react";
import { Button, Form, message, Spin, Modal } from "antd";
import { Location, History } from "history";
import BasicsInfo from "./components/basics-info";
import PackageInfoItem from "./components/package-info-item";
import UploadX from "../../../components/uploadX";
import styles from "./index.scss";
import {
  UpdateType,
  PageType,
  IPutBiddingParams,
  IPackageCorrelationCreateReqsItem,
  IPackageCreateItem,
  IStoreProps,
  ITenderManageStoreProps
} from "../../../declares";
import EventBar from "./components/detail-tab-bar";
import {
  putBidding,
  updateBidding
} from "../../../services/tender-manage-server";
import { omit, flatMap, compact } from "lodash";
import { connect } from "dva";
import dayjs from "dayjs";
import ConfirmModal from "@/components/confirm-modal";
import { browserTenderDetail } from "@/services/tender-manage-server";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface ILocation extends Location {
  state: {
    pageType: string;
    tenderId: number;
  };
}

interface IProps extends IStoreProps {
  history: History;
  tenderManageStore: ITenderManageStoreProps;
  location: ILocation;
  loading: any;
  getBiddingDetail: (tenderId: number) => void;
}

const TenderInfo: React.FunctionComponent<IProps> = ({
  location,
  history,
  loading,
  tenderManageStore: { biddingDetail },
  commonStore: { userInfo },
  getBiddingDetail
}): JSX.Element => {
  const [form] = Form.useForm();
  const { pageType, tenderId } = location.state;
  const [isEdit, setIsEdit] = useState(false);
  const isAdd = pageType !== PageType.Add;
  const isLoading = isAdd
    ? loading.effects["tenderManageStore/getBiddingDetail"]
    : false;
  useEffect(() => {
    if (isAdd) {
      if (pageType === PageType.Detail && !!userInfo.accessToken) {
        browserTenderDetail(tenderId).then(() => {
          getBiddingDetail(tenderId);
        });
      } else {
        getBiddingDetail(tenderId);
      }
    } else {
      form.setFieldsValue({ packageCreateReqs: [{}] });
    }
  }, []);
  useEffect(() => {
    if (isAdd) {
      if (pageType === PageType.Copy && biddingDetail) {
        form.setFieldsValue({
          ...biddingDetail,
          tenderTitle: `${biddingDetail!.tenderTitle} ??????`
        });
      } else {
        form.setFieldsValue(biddingDetail);
      }
    }
  }, [biddingDetail]);
  const onSubmitFn = (values: any, tenderOperate: number) => {
    if (isEdit) {
      return message.info("????????????????????????????????????");
    }
    let error = false;
    values.packageCreateReqs?.forEach(
      (packageCreate: IPackageCreateItem, index: number) => {
        packageCreate.earnestMoney = Number(packageCreate.earnestMoney);
        packageCreate.tenderFee = Number(packageCreate.tenderFee);
        packageCreate.packageSequence = index + 1;
        packageCreate.packageCorrelationResps = undefined;
        if (packageCreate.packageCorrelationCreateReqs) {
          packageCreate.packageCorrelationCreateReqs?.forEach(
            (item: IPackageCorrelationCreateReqsItem) => {
              item = omit(item, [
                "editing",
                "id"
              ]) as IPackageCorrelationCreateReqsItem;
              item.maxContain = Number(item.maxContain);
              item.maxNotContain = Number(item.maxNotContain);
              item.estimateTransportVolume = Number(
                item.estimateTransportVolume
              );
            }
          );
        } else {
          packageCreate.packageCorrelationCreateReqs = [];
        }

        if (!packageCreate.packageCorrelationCreateReqs?.length) {
          error = true;
        }
      }
    );
    if (error && tenderOperate !== 1) {
      return message.error("?????????????????????????????????");
    }
    if (values.settlementType === 2) {
      values.settlementTypeContent = values.settlementTypeContent1;
    }
    values.tenderOpenTime = values.tenderOpenTime
      ? values.tenderOpenTime.format("YYYY/MM/DD HH:mm:ss")
      : undefined;
    values.performanceBond = Number(values.performanceBond);
    values.offerStartTime = values.offerTime
      ? values.offerTime[0].format("YYYY/MM/DD HH:mm:ss")
      : undefined;
    values.offerEndTime = values.offerTime
      ? values.offerTime[1].format("YYYY/MM/DD HH:mm:ss")
      : undefined;
    values.tenderDentryid = values.tenderDentryid
      ? values.tenderDentryid.join(",")
      : undefined;
    values.seeIsConfirm = values.seeIsConfirm ? 1 : 0;

    if (values.settlementType === 2) {
      values.settlementTypeContent = values.settlementTypeContent1;
    }
    values.contactPurchaseList =
      compact(flatMap([values.contactPurchaseList])).length > 0
        ? flatMap([values.contactPurchaseList])
        : undefined;

    const params = omit(values, [
      "offerTime",
      "settlementTypeContent1"
    ]) as IPutBiddingParams;
    if (pageType === PageType.Add || pageType === PageType.Copy) {
      putBidding({ ...params, tenderOperate }).then((res: any) => {
        if (params.supplierScope === 2 && tenderOperate === 2) {
          Modal.confirm({
            title: "???????????????",
            icon: <ExclamationCircleOutlined />,
            okText: "?????????",
            cancelText: "????????????",
            centered: true,
            content: "????????????????????????????????????????????????????????????????????????",
            onOk: () =>
              history.push({
                pathname: "/tenderManage/inviteDealer",
                state: {
                  tenderTitle: res.tenderTitle,
                  tenderNo: res.tenderNo,
                  tenderId: res.tenderId
                }
              }),
            onCancel: () => history.push("/tenderManage")
          });
        } else {
          message.success(
            tenderOperate === 1 ? "?????????????????????" : "??????????????????"
          );
          history.push("/tenderManage");
        }
      });
    } else if (pageType === PageType.Edit) {
      updateBidding(tenderId, { ...params, tenderOperate }).then((res: any) => {
        if (params.supplierScope === 2 && tenderOperate === 2) {
          Modal.confirm({
            title: "???????????????",
            icon: <ExclamationCircleOutlined />,
            okText: "?????????",
            cancelText: "????????????",
            centered: true,
            content: "????????????????????????????????????????????????????????????????????????",
            onOk: () =>
              history.push({
                pathname: "/tenderManage/inviteDealer",
                state: {
                  tenderTitle: res.tenderTitle,
                  tenderNo: res.tenderNo,
                  tenderId: res.tenderId
                }
              }),
            onCancel: () => history.push("/tenderManage")
          });
        } else {
          message.success(
            tenderOperate === 1 ? "?????????????????????" : "??????????????????"
          );
          history.push("/tenderManage");
        }
      });
    }
  };
  const onSubmit = useCallback(
    (tenderOperate: number) => () => {
      if (tenderOperate === 1) {
        const values = form.getFieldsValue();
        onSubmitFn(values, tenderOperate);
      } else {
        form.validateFields().then(values => {
          onSubmitFn(values, tenderOperate);
        });
      }
    },
    [isEdit]
  );
  return (
    <Spin tip="Loading..." spinning={isLoading}>
      <div className={`center-main ${styles.tenderInfo}`}>
        {/*<Prompt message="????????????????????????????????????????????????????????????" />*/}
        <Form form={form}>
          <div className={styles.tenderInfoTitle}>????????????</div>
          <BasicsInfo form={form} disable={pageType === PageType.Detail} />
          <Form.List name="packageCreateReqs">
            {(fields, { add, remove }) => (
              <>
                <div className={styles.tenderInfoTitle}>
                  ???????????? <span onClick={() => add()}>????????????</span>
                </div>
                {fields.map((field, index) => (
                  <PackageInfoItem
                    key={field.key}
                    num={index + 1}
                    onDelete={remove}
                    form={form}
                    setIsEdit={setIsEdit}
                    disable={pageType === PageType.Detail}
                    dataItem={field}
                    showDelete={fields.length === 1}
                  />
                ))}
              </>
            )}
          </Form.List>
          <div className={styles.tenderInfoTitle}>????????????</div>
          <div className={styles.tenderInfoUpload}>
            <Form.Item name="tenderDentryid" className={styles.uploadItem}>
              <UploadX
                onUpload={(res: string, del: boolean = false) => {
                  const old = form.getFieldValue("tenderDentryid") || [];
                  if (del) {
                    form.setFieldsValue({
                      tenderDentryid: [
                        old.filter((item: string) => item !== res)
                      ]
                    });
                  } else {
                    form.setFieldsValue({ tenderDentryid: [...old, res] });
                  }
                }}
                showList={form.getFieldValue("tenderDentryid")}
                title="????????????"
                showDownload={pageType === PageType.Detail}
                disable={pageType === PageType.Detail}
                maxLength={5}
                extra="?????????doc .docx .pdf .jpg.gif????????????????????????50M???????????????5??????"
                renderMode={UpdateType.Btn}
              />
            </Form.Item>
          </div>
        </Form>
        {pageType === PageType.Detail ? (
          <>
            <EventBar data={biddingDetail} />
            <div className={styles.tenderInfoBtn}>
              <Button onClick={() => history.push("/tenderManage")}>
                ??????
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.tenderInfoBtn}>
            <Button
              onClick={ConfirmModal("?????????????????????????????????????????????", () => {
                history.push("/tenderManage");
              })}
            >
              ??????
            </Button>
            <Button onClick={onSubmit(1)}>????????????</Button>
            <Button type="primary" onClick={onSubmit(2)}>
              ????????????
            </Button>
          </div>
        )}
      </div>
    </Spin>
  );
};
const mapStoreToProps = ({
  tenderManageStore,
  commonStore,
  loading
}: IStoreProps) => ({
  commonStore,
  tenderManageStore,
  loading
});
const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: { tenderId: number } }) => any
) => ({
  getBiddingDetail: (tenderId: number) =>
    dispatch({
      type: "tenderManageStore/getBiddingDetail",
      payload: { tenderId }
    })
});
export default connect(mapStoreToProps, mapDispatchToProps)(TenderInfo);
