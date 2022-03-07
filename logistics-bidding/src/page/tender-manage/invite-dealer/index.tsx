import React, { useEffect, useState } from "react";
import { Location, History } from "history";
import { RouteComponentProps } from "dva/router";
import InviteList from "./components/invite-list";
import CommonHeader from "../components/common-header";
import { INVITED_COLUMN, IStoreProps } from "@/declares";
import { connect } from "dva";
import TableX from "@/components/tableX";

interface ILocation extends Location {
  state: {
    tenderTitle: string;
    tenderNo: string;
    tenderId: number;
  };
}

interface IProps extends RouteComponentProps {
  location: ILocation;
  history: History;
  getInvitedList: (payload: { tenderId: number }) => any;
}

const Index: React.FC<IProps & IStoreProps> = ({
  location: {
    state: { tenderId, tenderNo, tenderTitle }
  },
  loading,
  history,
  getInvitedList,
  tenderManageStore: { inviteListDetailResps }
}) => {
  const isLoading = loading.effects["tenderManageStore/getInvitedList"];
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getInvitedList({ tenderId: Number(tenderId) }).then(() => setReady(true));
  }, []);

  return (
    <div className="center-main border-gray">
      <CommonHeader
        tenderTitle={tenderTitle}
        tenderNo={tenderNo}
        history={history}
        tenderId={tenderId}
      />
      <div className="m-2">
        {ready && (
          <InviteList
            history={history}
            inviteListDetailResps={inviteListDetailResps}
            getInvitedList={getInvitedList}
            tenderId={tenderId}
          />
        )}
        已邀请商家：
        <div className="p-2">
          <TableX
            loading={isLoading}
            rowKey="organizationId"
            dataSource={inviteListDetailResps}
            columns={INVITED_COLUMN}
          />
        </div>
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
  getInvitedList: (payload: { tenderId: number }) =>
    dispatch({
      type: "tenderManageStore/getInvitedList",
      payload
    })
});

export default connect(mapStoreToProps, mapDispatchToProps)(Index);
