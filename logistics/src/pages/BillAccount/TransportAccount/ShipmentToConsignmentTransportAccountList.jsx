import React, { Component } from 'react';
import AccountList from './component/AccountList';
import auth from '@/constants/authCodes';

const {
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_VISIT,
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_CREATE,
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_ADJUST_BILL,
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_CANCEL,
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_EXCEL,
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_TRANSPORT
} = auth;

// 承运对托运发起货品对账列表
export default class ShipmentToConsignmentTransportAccountList extends Component{
  render (){
    // 对账方类型(1.承运和托运，2.承运和平台，3.平台和托运，4.平台和司机)
    const searchCondition = { accountOrgType:1, isCanFind :1, order : 'desc' };
    const authConfig = {
      detailAuth:[SHIPMENT_TO_CONSIGNMENT_ACCOUNT_VISIT],
      createAuth:[SHIPMENT_TO_CONSIGNMENT_ACCOUNT_CREATE],
      adjustBillAuth:[SHIPMENT_TO_CONSIGNMENT_ACCOUNT_ADJUST_BILL],
      cancelAuth:[SHIPMENT_TO_CONSIGNMENT_ACCOUNT_CANCEL],
      excelExportAuth:[SHIPMENT_TO_CONSIGNMENT_ACCOUNT_EXCEL],
      transportExport : [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_TRANSPORT],
    };
    return (
      <AccountList {...authConfig} searchCondition={searchCondition} {...this.props} />
    );
  }
}
