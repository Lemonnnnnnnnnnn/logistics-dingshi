import React, { useState } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import AccountList from './component/AccountList';
import { TRANSPORT_ACCOUNT_LIST_STATUS } from "@/constants/project/project";
import auth from "@/constants/authCodes";
import { getLocal } from "@/utils/utils";

const {
  CONSIGNMENT_TO_PLAT_ACCOUNT_VISIT,
  CONSIGNMENT_TO_PLAT_ACCOUNT_CREATE,
  CONSIGNMENT_TO_PLAT_ACCOUNT_ADJUST_BILL,
  CONSIGNMENT_TO_PLAT_ACCOUNT_CANCEL,
  CONSIGNMENT_TO_PLAT_ACCOUNT_EXCEL,
  CONSIGNMENT_TO_PLAT_ACCOUNT_TRANSPORT,

  CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_VISIT,
  CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_EXCEL,
  CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_TRANSPORT,
  CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_EXECUTE
} = auth;

const { TabPane } = Tabs;
const { CANCEL, AUDITED, REFUSE, NOT_HANDLE, UNAUDITED } = TRANSPORT_ACCOUNT_LIST_STATUS;
const STATUS_EXCEPT_UNAUDITED  = `${CANCEL},${AUDITED},${REFUSE},${NOT_HANDLE}`;

const authConfig = {
  detailAuth:[ CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_VISIT, CONSIGNMENT_TO_PLAT_ACCOUNT_VISIT],
  createAuth:[CONSIGNMENT_TO_PLAT_ACCOUNT_CREATE, ],
  adjustBillAuth:[CONSIGNMENT_TO_PLAT_ACCOUNT_ADJUST_BILL ],
  cancelAuth:[CONSIGNMENT_TO_PLAT_ACCOUNT_CANCEL, ],
  excelExportAuth:[ CONSIGNMENT_TO_PLAT_ACCOUNT_EXCEL, CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_EXCEL],
  auditedAuth:[  CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_EXECUTE],
  transportExportAuth : [CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_TRANSPORT, CONSIGNMENT_TO_PLAT_ACCOUNT_TRANSPORT]
};

const ConsignmentTransportAccountManage = ( props )=>{
  const { tabs, activeKey : pageKey } = props;
  const currentTab = tabs.find(item => item.id === pageKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {}  };
  const [activeKey, setActiveKey] = useState(localData.activeKey ? localData.activeKey : '1');

  const panes = [
    { title : '待审核', key: '0', content : <AccountList {...props} {...authConfig} unaudited searchCondition={{ accountStatus :UNAUDITED, isCanFind : 1 }} /> },
    { title : '全部', key : '1', content : <AccountList {...props} {...authConfig} searchCondition={{ accountStatus :STATUS_EXCEPT_UNAUDITED, isCanFind : 1 }} /> }
  ];

  const changeTabs = (selectedKey) =>{
    setActiveKey(selectedKey);
  };

  return (
    <Tabs type='card' defaultActiveKey='1' activeKey={activeKey} onChange={changeTabs}>
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
}))(ConsignmentTransportAccountManage);
