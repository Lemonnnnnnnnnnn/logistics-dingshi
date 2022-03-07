import React, { useEffect } from "react";
import { History } from "history";
import CommonHeader from "../components/common-header";
import UnlockInfo from "./components/unlock-info";
import {
  IPutBiddingParams,
  IStoreProps,
  ITenderManageStoreProps,
  TenderStatus
} from "@/declares";
import { connect } from "dva";
import UnlockInfoDetail from "./components/look-bidding-detail";
import { Spin } from "antd";

interface ILocation extends Location {
  state: {
    tenderTitle: string;
    tenderNo: string;
    tenderId: number;
    seeIsConfirm: number;
  };
}
interface IProps {
  location: ILocation;
  history: History;
  loading: any;
  tenderManageStore: ITenderManageStoreProps;
  getBiddingDetail: (tenderId: number) => void;
  setBiddingDetail: (
    store: ITenderManageStoreProps,
    payload: IPutBiddingParams | null
  ) => void;
}

const Index: React.FunctionComponent<IProps> = ({
  location: {
    pathname,
    state: { tenderTitle, tenderNo, tenderId, seeIsConfirm }
  },
  loading,
  tenderManageStore,
  tenderManageStore: { biddingDetail },
  getBiddingDetail,
  setBiddingDetail,
  history
}): JSX.Element => {
  const isLoading = loading.effects["tenderManageStore/getBiddingDetail"];
  useEffect(() => {
    getBiddingDetail(tenderId);
    return () => {
      setBiddingDetail(tenderManageStore, null);
    };
  }, [tenderId]);
  const isBidding = pathname.indexOf("biddingManage") !== -1;
  return (
    <Spin tip="Loading..." spinning={isLoading}>
      <div className="center-main border-gray" style={{ marginBottom: "20px" }}>
        <CommonHeader
          tenderTitle={tenderTitle}
          tenderNo={tenderNo}
          history={history}
          tenderId={tenderId}
          showRight
          tenderStatus={biddingDetail?.tenderStatus}
          priceConfirmTime={
            biddingDetail &&
            biddingDetail.tenderStatus === TenderStatus.twoPrice
              ? biddingDetail.priceTwoTime
              : biddingDetail?.priceConfirmTime
          }
        />
        {biddingDetail ? (
          <>
            {seeIsConfirm &&
            biddingDetail?.contactConfirmRespList?.length &&
            biddingDetail?.contactConfirmRespList?.some(
              item => !item.isUnlock
            ) ? (
              <UnlockInfo history={history} tenderId={tenderId} />
            ) : (
              <UnlockInfoDetail
                history={history}
                tenderTitle={tenderTitle}
                tenderNo={tenderNo}
                tenderId={tenderId}
                isBidding={isBidding}
              />
            )}
          </>
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
  getBiddingDetail: (tenderId: number) =>
    dispatch({
      type: "tenderManageStore/getBiddingDetail",
      payload: { tenderId }
    }),
  setBiddingDetail: (
    store: ITenderManageStoreProps,
    payload: IPutBiddingParams | null
  ) => dispatch({ type: "tenderManageStore/setBiddingDetail", store, payload })
});
export default connect(mapStoreToProps, mapDispatchToProps)(Index);
