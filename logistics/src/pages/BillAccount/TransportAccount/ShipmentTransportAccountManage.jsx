import React, { useState } from "react";
import { Tabs } from "antd";
import { connect } from "dva";
import AccountList from "./component/AccountList";
import { TRANSPORT_ACCOUNT_LIST_STATUS } from "@/constants/project/project";
import auth from "@/constants/authCodes";
import { getLocal } from "@/utils/utils";
import {  SHIPMENT_ACCOUNT_MANAGE_PARAMS } from "@/constants/account";

const {
  SHIPMENT_TO_PLAT_ACCOUNT_VISIT,
  SHIPMENT_TO_PLAT_ACCOUNT_ADJUST_BILL,
  SHIPMENT_TO_PLAT_ACCOUNT_CREATE,
  SHIPMENT_TO_PLAT_ACCOUNT_CANCEL,
  SHIPMENT_TO_PLAT_ACCOUNT_EXCEL,
  SHIPMENT_TO_PLAT_ACCOUNT_TRANSPORT,

  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_VISIT,
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_ADJUST_BILL,
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_CREATE,
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_CANCEL,
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_EXCEL,
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_TRANSPORT,

  SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_VISIT,
  SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_EXCEL,
  SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_TRANSPORT,
  SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_EXECUTE

} = auth;

const { TabPane } = Tabs;
const { CANCEL, AUDITED, REFUSE, NOT_HANDLE, UNAUDITED, SHIPMENT_UNAUDITED } = TRANSPORT_ACCOUNT_LIST_STATUS;
const NEW_UNAUDITED = `${SHIPMENT_UNAUDITED},${UNAUDITED}`;
const STATUS_EXCEPT_UNREVIEWED = `${CANCEL},${AUDITED},${REFUSE},${NOT_HANDLE}`;

const authConfig = {
  detailAuth: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_VISIT, SHIPMENT_TO_PLAT_ACCOUNT_VISIT, SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_VISIT],
  createAuth: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_CREATE, SHIPMENT_TO_PLAT_ACCOUNT_CREATE],
  adjustBillAuth: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_ADJUST_BILL, SHIPMENT_TO_PLAT_ACCOUNT_ADJUST_BILL],
  cancelAuth: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_CANCEL, SHIPMENT_TO_PLAT_ACCOUNT_CANCEL],
  excelExportAuth: [SHIPMENT_TO_PLAT_ACCOUNT_EXCEL, SHIPMENT_TO_CONSIGNMENT_ACCOUNT_EXCEL, SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_EXCEL],
  auditedAuth: [SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_EXECUTE],
  transportExportAuth: [SHIPMENT_TO_PLAT_ACCOUNT_TRANSPORT, SHIPMENT_TO_CONSIGNMENT_ACCOUNT_TRANSPORT, SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_TRANSPORT]
};

const ShipmentTransportAccountManage = (props) => {
  const { tabs, activeKey: pageKey } = props;
  const currentTab = tabs.find(item => item.id === pageKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };
  const [activeKey, setActiveKey] = useState(localData.activeKey ? localData.activeKey : "1");

  const changeTabs = (selectedKey) => {
    setActiveKey(selectedKey);
  };

  const panes = [
    {
      title: "待审核",
      key: "0",
      content: <AccountList
        {...props}
        {...authConfig}
        unaudited
        searchCondition={{
          accountStatus: NEW_UNAUDITED,
          isCanFind: 1,
          accountType: 2,
          accountOrgTypeArr: SHIPMENT_ACCOUNT_MANAGE_PARAMS
        }}
      />
    },
    {
      title: "全部",
      key: "1",
      content: <AccountList
        {...props}
        {...authConfig}
        searchCondition={{
          // accountStatus: STATUS_EXCEPT_UNREVIEWED,
          isCanFind: 1,
          accountType: 2,
          accountOrgTypeArr: SHIPMENT_ACCOUNT_MANAGE_PARAMS
        }}
      />
    }
  ];

  return (
    <Tabs type="card" defaultActiveKey="1" activeKey={activeKey} onChange={changeTabs}>
      {panes.map(pane => (
        <TabPane tab={pane.title} key={pane.key}>
          {pane.key === activeKey ? pane.content : null}
        </TabPane>
      ))}
    </Tabs>
  );
};

export default connect(({ commonStore }) => ({
  ...commonStore
}))(ShipmentTransportAccountManage);
