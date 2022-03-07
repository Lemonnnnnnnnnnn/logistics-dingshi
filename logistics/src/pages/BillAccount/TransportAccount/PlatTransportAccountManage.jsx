import React, {  useState } from "react";
import { Tabs } from "antd";
import { connect } from 'dva';
import AccountList from "./component/AccountList";
import { TRANSPORT_ACCOUNT_LIST_STATUS } from "@/constants/project/project";
import auth from "@/constants/authCodes";
import { getLocal } from "@/utils/utils";

const {
  PLAT_AUDIT_CONSIGNMENT_ACCOUNT_VISIT,
  PLAT_AUDIT_CONSIGNMENT_ACCOUNT_EXCEL,
  PLAT_AUDIT_CONSIGNMENT_ACCOUNT_EXECUTE,
  PLAT_AUDIT_CONSIGNMENT_ACCOUNT_TRANSPORT,

  PLAT_AUDIT_SHIPMENT_ACCOUNT_VISIT,
  PLAT_AUDIT_SHIPMENT_ACCOUNT_EXCEL,
  PLAT_AUDIT_SHIPMENT_ACCOUNT_EXECUTE,
  PLAT_AUDIT_SHIPMENT_ACCOUNT_TRANSPORT
} = auth;

const { TabPane } = Tabs;
const { CANCEL, AUDITED, REFUSE, NOT_HANDLE, UNAUDITED } = TRANSPORT_ACCOUNT_LIST_STATUS;
const STATUS_EXCEPT_UNREVIEWED = `${CANCEL},${AUDITED},${REFUSE},${NOT_HANDLE}`;

const authConfig = {
  detailAuth: [PLAT_AUDIT_CONSIGNMENT_ACCOUNT_VISIT, PLAT_AUDIT_SHIPMENT_ACCOUNT_VISIT],
  excelExportAuth: [PLAT_AUDIT_CONSIGNMENT_ACCOUNT_EXCEL, PLAT_AUDIT_SHIPMENT_ACCOUNT_EXCEL],
  transportExportAuth :[PLAT_AUDIT_SHIPMENT_ACCOUNT_TRANSPORT, PLAT_AUDIT_CONSIGNMENT_ACCOUNT_TRANSPORT],
  auditedAuth: [PLAT_AUDIT_CONSIGNMENT_ACCOUNT_EXECUTE, PLAT_AUDIT_SHIPMENT_ACCOUNT_EXECUTE]
};


const PlatTransportAccountManage = (props) => {
  const { tabs, activeKey : pageKey } = props;
  const currentTab = tabs.find(item => item.id === pageKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {}  };
  const [activeKey, setActiveKey] = useState(localData.activeKey ? localData.activeKey : '1');

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
        searchCondition={{ accountStatus: UNAUDITED, isCanFind: 1 }}
      />
    },
    {
      title: "全部",
      key: "1",
      content: <AccountList
        {...props}
        {...authConfig}
        searchCondition={{  isCanFind: 1 }}
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

export default  connect(({ commonStore })=>({
  ...commonStore
}))(PlatTransportAccountManage);
