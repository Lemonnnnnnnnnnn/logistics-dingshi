import React, { useState, useEffect } from "react";
import { History } from "history";
import { Button, Spin } from "antd";
import SecondQuoteModal from "./second-quote-modal";
import UnlockInfoDetailItem from "./look-bidding-detail-item";
import styles from "./index.scss";
import { connect } from "dva";
import { IStoreProps, ITenderManageStoreProps, TenderStatus } from "@/declares";
import dayjs from "dayjs";
interface IProps {
  history: History;
  tenderTitle: string;
  tenderNo: string;
  tenderId: number;
  loading: any;
  tenderManageStore: ITenderManageStoreProps;
  getBidderMainDetail: (tenderId: number) => void;
}
const UnlockInfoDetail: React.FunctionComponent<IProps> = ({
  history,
  tenderTitle,
  tenderId,
  loading,
  getBidderMainDetail,
  tenderManageStore: { bidderMainDetail },
  tenderNo
}): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const isLoading = loading.effects["tenderManageStore/getBidderMainDetail"];
  useEffect(() => {
    getBidderMainDetail(tenderId);
  }, [tenderId]);
  return (
    <Spin tip="Loading..." spinning={isLoading}>
      <div className={styles.unlockInfo}>
        <div className={styles.unlockInfoTitle}>
          <span>注：投标商家按照投标时间升序排列，排名不分先后。</span>
        </div>
        {bidderMainDetail &&
        bidderMainDetail.tenderBidderResps &&
        bidderMainDetail.tenderBidderResps.length ? (
          bidderMainDetail.tenderBidderResps.map((item, index) => (
            <UnlockInfoDetailItem
              data={item}
              index={index + 1}
              key={item.tenderBidderId}
            />
          ))
        ) : (
          <div>暂无数据</div>
        )}

        <div className="commonBtn">
          {bidderMainDetail &&
          bidderMainDetail.tenderBidderResps &&
          bidderMainDetail.tenderBidderResps.length ? (
            <>
              {bidderMainDetail.tenderStatus ===
              TenderStatus.InBidEvaluation ? (
                <Button
                  type="primary"
                  onClick={() => {
                    history.push({
                      pathname: "/tenderManage/inputResult",
                      state: {
                        tenderTitle,
                        tenderNo,
                        tenderId,
                        tenderStatus: bidderMainDetail.tenderStatus
                      }
                    });
                  }}
                >
                  输入评标结果
                </Button>
              ) : null}

              {[
                TenderStatus.Daft,
                TenderStatus.Prediction,
                TenderStatus.InBidding,
                TenderStatus.InBidEvaluation
              ].includes(bidderMainDetail.tenderStatus) &&
              !bidderMainDetail.priceTwoTime ? (
                <Button type="primary" onClick={() => setVisible(true)}>
                  发起二次报价
                </Button>
              ) : null}
              <Button
                onClick={() =>
                  history.push(
                    "/tenderManage/lookBiddingInfo/lookBiddingPrint",
                    {
                      tenderTitle,
                      tenderNo,
                      tenderId
                    }
                  )
                }
              >
                打印
              </Button>
            </>
          ) : null}
          <Button onClick={() => history.push("/tenderManage")}>返回</Button>
        </div>
        <SecondQuoteModal
          visible={visible}
          setVisible={setVisible}
          tenderId={tenderId}
          history={history}
        />
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
  getBidderMainDetail: (tenderId: number) =>
    dispatch({
      type: "tenderManageStore/getBidderMainDetail",
      payload: { tenderId }
    })
});
export default connect(mapStoreToProps, mapDispatchToProps)(UnlockInfoDetail);
