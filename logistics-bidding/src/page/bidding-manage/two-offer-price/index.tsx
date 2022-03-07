import React, { useEffect, useMemo, useState } from "react";
import { History } from "history";
import { Button, Form, message } from "antd";
import CommonHeader from "../../tender-manage/components/common-header";
import PriceModalItem from "../../tender-manage/input-result/components/price-modal-item";
import {
  IStoreProps,
  ITenderBidderManageStoreProps,
  IBidderOfferItem,
  IBidderOfferConfirmItems,
  IPriceConfirmParams,
  ITenderPackageItems,
  IDictionary
} from "@/declares";
import { connect } from "dva";
import {
  patchPriceConfirm,
  patchTenderBidderTwo
} from "@/services/bidding-manage-server";
import { cloneDeep, merge, uniq } from "lodash";

interface ILocation extends Location {
  state: {
    tenderTitle: string;
    tenderNo: string;
    tenderId: number;
  };
}
interface IProps {
  location: ILocation;
  history: History;
  biddingManageStore: ITenderBidderManageStoreProps;
  getTenderBidderDetail: (tenderId: number) => void;
}

const Index: React.FC<IProps> = ({
  location: {
    pathname,
    state: { tenderTitle, tenderNo, tenderId }
  },
  biddingManageStore: { tenderBidderDetail },
  getTenderBidderDetail,
  history
}): JSX.Element => {
  const [form] = Form.useForm();
  const isSure = pathname.indexOf("surePrice") !== -1;
  const [values, setValues] = useState<IBidderOfferItem[]>([]);
  const [agrees, setAgrees] = useState<IBidderOfferConfirmItems[]>([]);
  useEffect(() => {
    getTenderBidderDetail(tenderId);
  }, []);

  const priceSureList = useMemo(() => {
    if (!tenderBidderDetail) {
      return [];
    }

    if (!isSure) {
      return tenderBidderDetail.tenderPackageItems;
    } else {
      const weigh: IDictionary = {
        1: 1,
        2: 2,
        0: 3,
        "-1": -1
      };

      const newTenderPackageItems = cloneDeep(
        tenderBidderDetail.tenderPackageItems
      );

      const list = newTenderPackageItems.reduce(
        (total: ITenderPackageItems[], current: ITenderPackageItems) => {
          //筛选有价格确认的
          current.packageCorrelationResps = current.packageCorrelationResps.filter(
            _item =>
              _item.bidderOfferItems?.some(__item => __item.offerTimes === 0)
          );
          // 遍历线路
          current.packageCorrelationResps?.forEach(item => {
            item.bidderOfferItems = item?.bidderOfferItems?.sort(
              (a, b) => weigh[a.offerTimes || -1] - weigh[b.offerTimes || -1]
            );
            if (
              !total.some(
                item => item.tenderPackageId === current.tenderPackageId
              )
            ) {
              total.push(current);
            }
            // return total;
          });
          return total;
        },
        []
      );

      return list;
    }
  }, [tenderBidderDetail]);

  useEffect(() => {
    // if (tenderBidderDetail) {
    form.setFieldsValue({
      tableList: priceSureList
    });
    // }
  }, [priceSureList]);

  const onSubmit = () => {
    form.validateFields().then(res => {
      if (isSure) {
        const params = {
          tenderBidderId: tenderBidderDetail?.tenderBidderId,
          bidderOfferConfirmItems: agrees.reduce((r, n) => {
            n?.forEach(item => {
              r.push(item);
            });
            return r;
          }, [])
        };
        if (
          params.bidderOfferConfirmItems.some(
            item => item.offerConfirmation === undefined
          )
        ) {
          return message.error("请选择是否同意！");
        }
        patchPriceConfirm(tenderId, params as IPriceConfirmParams).then(res => {
          message.success("价格确认成功");
          history.push("/biddingManage");
        });
      } else {
        let err = false;
        const params = {
          offerTimes: 2,
          bidderOfferItems: values.reduce((r, n) => {
            n?.forEach(item => {
              if (item.taxContain && item.taxNotContain) {
                r.push(item);
              } else {
                err = true;
              }
            });

            return r;
          }, []),
          tenderBidderId: tenderBidderDetail?.tenderBidderId
        };
        if (err) {
          message.destroy();
          return message.info("请输入二次报价！");
        }
        patchTenderBidderTwo(tenderId, params).then(res => {
          message.success("报价成功！");
          history.push("/biddingManage");
        });
      }
    });
  };

  return (
    <div
      className="center-main border-gray"
      style={{ marginBottom: "20px", paddingBottom: 20 }}
    >
      <CommonHeader
        tenderTitle={tenderTitle}
        tenderNo={tenderNo}
        history={history}
        tenderId={tenderId}
      />
      <div style={{ padding: "20px" }}>
        <div>{isSure ? "项目价格确认：" : "项目二次报价："}</div>
        <Form form={form}>
          <Form.List name="tableList">
            {fields => (
              <>
                {fields.map((field, index) => (
                  <PriceModalItem
                    key={field.key}
                    field={field}
                    values={values}
                    setValues={setValues}
                    pageType={isSure ? "sure" : "two"}
                    agrees={agrees}
                    setAgrees={setAgrees}
                    priceSureList={priceSureList}
                  />
                ))}
              </>
            )}
          </Form.List>
        </Form>
      </div>
      {(isSure && (
        <div className="m-2">
          (注：价格不同意将可能取消中标资格，请慎重填写！)
        </div>
      )) ||
        null}

      <div className="commonBtn">
        <Button onClick={onSubmit} type="primary">
          {isSure ? "保存确认结果" : "提交报价"}
        </Button>
        <Button onClick={() => history.push("/biddingManage")}>取消</Button>
      </div>
    </div>
  );
};
const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: { tenderId: number } }) => any
) => ({
  getTenderBidderDetail: (tenderId: number) =>
    dispatch({
      type: "biddingManageStore/getTenderBidderDetail",
      payload: { tenderId }
    })
});

const mapStoreToProps = ({ biddingManageStore, loading }: IStoreProps) => ({
  biddingManageStore,
  loading
});

export default connect(mapStoreToProps, mapDispatchToProps)(Index);
