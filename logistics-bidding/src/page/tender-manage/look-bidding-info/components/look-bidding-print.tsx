import React, { useEffect } from "react";
import { History } from "history";
import ReactToPrint from "react-to-print";
import { Button } from "antd";
import styles from "./index.scss";
import CommonHeader from "../../components/common-header";
import UnlockInfoTable from "./bidding-info-table";
import { connect } from "dva";
import { IStoreProps } from "@/declares";
import LookBiddingPrintTable from "./look-bidding-print-table";

interface ILocation extends Location {
  state: {
    tenderTitle: string;
    tenderNo: string;
    tenderId: number;
  };
}

interface IProps extends IStoreProps {
  history: History;
  location: ILocation;
  getTenderCorrelationMainDetail: (tenderId: number) => void;
}
const LookBiddingPrint: React.FunctionComponent<IProps> = ({
  history,
  location: {
    state: { tenderTitle, tenderNo, tenderId }
  },
  getTenderCorrelationMainDetail,
  tenderManageStore: { tenderCorrelationMainDetail }
}): JSX.Element => {
  let refs: React.ReactInstance | null = null;

  useEffect(() => {
    getTenderCorrelationMainDetail(tenderId);
  }, []);

  return (
    <div className={`center-main ${styles.lookBiddingPrint}`}>
      <div style={{ marginBottom: 20 }}>
        <ReactToPrint
          trigger={() => <Button type="primary">打印</Button>}
          content={() => refs}
        />
      </div>
      <div className="wrapBox" ref={el => (refs = el)}>
        <CommonHeader
          tenderTitle={tenderTitle}
          tenderNo={tenderNo}
          history={history}
          tenderId={tenderId}
          showLink={false}
        />
        {tenderCorrelationMainDetail?.tenderPackageEntities?.map(item => (
          <div>
            <div className="mb-2 mt-2 text-large">
              第{item?.packageSequence}包 {item.tenderPackageTitle}
            </div>
            <LookBiddingPrintTable data={item} />
          </div>
        ))}
      </div>
      <p style={{ color: "#999", marginTop: 20, paddingLeft: 20 }}>
        *投标信息为公司隐私，请注意保护。意外获得此单据，敬请销毁。
      </p>
    </div>
  );
};

const mapStoreToProps = ({ tenderManageStore, loading }: IStoreProps) => ({
  tenderManageStore,
  loading
});
const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: { tenderId: number } }) => any
) => ({
  getTenderCorrelationMainDetail: (tenderId: number) =>
    dispatch({
      type: "tenderManageStore/getTenderCorrelationMainDetail",
      payload: { tenderId }
    })
});
export default connect(mapStoreToProps, mapDispatchToProps)(LookBiddingPrint);
