import { OWNER as CONSIGNMENT, PLATFORM, SHIPMENT } from "@/constants/organization/organizationType";

export const DELIVERY_NUMBER = 1;
export const SIGN_NUMBER = 2;
export const THREE_NUMBER_MIN = 3;
export const WEIGH_NUMBER = 4;
export const HANDLE_INPUT = 5;

export const SHIPMENT_TO_CONSIGNMENT = 1;
export const SHIPMENT_TO_PLAT = 2;
export const CONSIGNMENT_TO_PLAT = 3;
export const SUBORDINATE_SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT = 4;
export const SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT = 5;

export const SHIPMENT_ACCOUNT_MANAGE_PARAMS = `${SHIPMENT_TO_PLAT},${CONSIGNMENT_TO_PLAT},${SUBORDINATE_SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT},${SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT}`;

export const SUPERIOR_SHIPMENT = 1;
export const SUBORDINATE_SHIPMENT = 2;

export const UNPAID = 1;
export const PART_PAID = 2;
export const PAID = 3;

export const SHIPMENT_TO_CONSIGN = 1;
export const SHIPMENT_ACCOUNT_MANAGE = 2;

export const SHIPMENT_ROUTER = '/net-transport/shipmentTransportAccountManage/transportAccountBillDetail';
export const CONSIGNMENT_ROUTER = '/bill-account/consignmentTransportAccountManage/transportAccountBillDetail';
export const PLAT_ROUTER = '/bill-account/platTransportAccountManage/transportAccountBillDetail';

export const ACCOUNT_MANAGE_ROUTER = {
  [PLATFORM] : PLAT_ROUTER,
  [CONSIGNMENT] : CONSIGNMENT_ROUTER,
  [SHIPMENT] : SHIPMENT_ROUTER,
};

export const ACCOUNT_BILL_NUMBER_RULE = {
  [DELIVERY_NUMBER]: {  val: DELIVERY_NUMBER, text: "提货量" },
  [SIGN_NUMBER]: {  val: SIGN_NUMBER, text: "签收量" },
  [THREE_NUMBER_MIN]: {  val: THREE_NUMBER_MIN, text: "提货量、过磅量、签收量、三者最小值" },
  [WEIGH_NUMBER]: {  val: WEIGH_NUMBER, text: "过磅量" },
  [HANDLE_INPUT]: {  val: HANDLE_INPUT, text: "手动输入量" }
};


export const ACCOUNT_SOURCE_DIST = {
  [SHIPMENT_TO_CONSIGNMENT] :'承运方',
  [SHIPMENT_TO_PLAT] :'承运方',
  [CONSIGNMENT_TO_PLAT] : '托运方',
  [SUBORDINATE_SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT] :'下级承运方',
  [SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT] : '承运方',
};

export const PAY_STATUS_DIST = {
  [UNPAID] : { color : 'gray', text : '未支付' },
  [PART_PAID] : { color : '#906800', text : '部分支付' },
  [PAID] : { color : 'green', text : '已支付' },
};

