import React, { useEffect, useState } from "react";
import { History } from "history";
import BidEvaluationResultItem from "./components/bid-evalution-result-item";
import { Button, Form, Input, Radio } from "antd";
import Header from "./components/header/index";
import { IStoreProps, ITenderManageStoreProps } from "@/declares";
import { connect } from "dva";

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
  getBidEvaluationResults: (tenderId: number) => any;
  tenderManageStore: ITenderManageStoreProps;
}

const BidEvaluationResults: React.FC<IProps> = ({
  location: {
    state: { tenderTitle, tenderNo, tenderId }
  },
  history,
  getBidEvaluationResults,
  tenderManageStore: { bidEvaluationResults }
}): JSX.Element => {
  const [ready, setReady] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    getBidEvaluationResults(tenderId).then(() => {
      setReady(true);
    });
  }, []);

  return (
    <div
      className="center-main border-gray"
      style={{ marginBottom: "20px", paddingBottom: 20 }}
    >
      {ready && bidEvaluationResults ? (
        <>
          <Header
            history={history}
            bidEvaluationResults={bidEvaluationResults}
          />
          <BidEvaluationResultItem
            bidEvaluationResults={bidEvaluationResults}
          />
        </>
      ) : null}
      <div className="commonBtn">
        <Button onClick={() => history.push("/tenderManage")}>返回</Button>
      </div>
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
  getBidEvaluationResults: (tenderId: number) =>
    dispatch({
      type: "tenderManageStore/getBidEvaluationResults",
      payload: { tenderId }
    })
});

export default connect(
  mapStoreToProps,
  mapDispatchToProps
)(BidEvaluationResults);
