import React, { Component } from 'react';
import ShipmentDeliverStatementList from '@/pages/DeliveryStatement/subPage/ShipmentDeliverStatementList';
import auth from '@/constants/authCodes';

const {
  OUTBOUND_ACCOUNT_EXCEL,
  OUTBOUND_ACCOUNT_RELATION,
  OUTBOUND_ACCOUNT_MODIFY
} = auth;
export default class ShipmentDeliveryStatement extends Component {

  render() {
    const authConfig = {
      modifyAuth:[OUTBOUND_ACCOUNT_MODIFY],
      relationAuth:[OUTBOUND_ACCOUNT_RELATION],
      excelAuth:[OUTBOUND_ACCOUNT_EXCEL]
    };

    return (
      <ShipmentDeliverStatementList {...authConfig} />
    );
  }
}
