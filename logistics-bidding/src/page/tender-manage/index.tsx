import React from "react";
import * as H from "history";
import OperateStep from "./components/operate-step";
import ManageList from "./components/manage-list";
import { ICommonStoreProps, IStoreProps } from "@/declares";
import { connect } from "dva";
import { OrganizationType } from '../../declares/common';
interface IProps {
  history: H.History;
  commonStore: ICommonStoreProps;
}

const TenderManage: React.FunctionComponent<IProps> = ({
  history,
  commonStore: { userInfo }
}): JSX.Element => {
  return (
    <div className="center-main">
      {userInfo?.organizationType === OrganizationType.PLATFORM ? null : (
        <OperateStep />
      )}
      <ManageList
        history={history}
        organizationType={userInfo?.organizationType}
      />
    </div>
  );
};

const mapStoreToProps = ({ commonStore }: IStoreProps) => ({
  commonStore
});
export default connect(mapStoreToProps)(TenderManage);
