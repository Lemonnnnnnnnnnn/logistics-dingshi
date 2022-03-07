import React, { useEffect, useState } from "react";
import { History } from "history";
import { Button } from "antd";
import ReactToPrint from "react-to-print";
import styles from "./index.scss";
import CommonHeader from "../../components/common-header";
import BidEvaluationResultItem from "./bid-evalution-result-item";
import {
  IStoreProps,
  ITenderManageStoreProps,
  TENDER_TYPE_DICT
} from "@/declares";
import { connect } from "dva";

interface ILocation extends Location {
  state: {
    tenderTitle: string;
    tenderNo: string;
    tenderId: number;
  };
}

interface IProps {
  history: History;
  location: ILocation;
  getBidEvaluationResults: (tenderId: number) => any;
  tenderManageStore: ITenderManageStoreProps;
}

const ResultPrint: React.FC<IProps> = ({
  history,
  location: {
    state: { tenderTitle, tenderNo, tenderId }
  },
  getBidEvaluationResults,
  tenderManageStore: { bidEvaluationResults }
}): JSX.Element => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getBidEvaluationResults(tenderId).then(() => {
      setReady(true);
    });
  }, []);

  let refs: React.ReactInstance | null = null;
  return (
    <div className={`center-main ${styles.lookBiddingPrint}`}>
      <div style={{ marginBottom: 20 }}>
        <ReactToPrint
          trigger={() => <Button type="primary">打印</Button>}
          content={() => refs}
        />
      </div>
      <div className="wrapBox" ref={el => (refs = el)}>
        {ready ? (
          <>
            <h1 className="text-center mt-2 mb-2">
              {bidEvaluationResults.organizationName}
              {TENDER_TYPE_DICT[bidEvaluationResults.tenderType]}评标结果
            </h1>
            <CommonHeader
              tenderTitle={tenderTitle}
              tenderNo={tenderNo}
              history={history}
              tenderId={tenderId}
              showLink={false}
            />
            <BidEvaluationResultItem
              bidEvaluationResults={bidEvaluationResults}
            />
          </>
        ) : null}
      </div>
      <p style={{ color: "#999", marginTop: 20, paddingLeft: 20 }}>
        *中标信息为公司隐私，请注意保护。意外获得此单据，敬请销毁。
      </p>
    </div>
  );
};

const mapStoreToProps = ({ tenderManageStore, loading }: IStoreProps) => ({
  tenderManageStore,
  loading
});
const mapDispatchToProps = (
  dispatch: (arg0: {
    type: string;
    payload: {
      tenderId: number;
    };
  }) => any
) => ({
  getBidEvaluationResults: (tenderId: number) =>
    dispatch({
      type: "tenderManageStore/getBidEvaluationResults",
      payload: { tenderId }
    })
});

export default connect(mapStoreToProps, mapDispatchToProps)(ResultPrint);
