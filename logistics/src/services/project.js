import {
  ACCOUNT_EVENT_STATUS,
  ACCOUNT_LIST_STATUS,
  CONFIGURATION_STATUS,
  CONSIGNMENT_TYPE,
  CONTRACT_TYPE,
  CORRELATIONOBJECTTYPE,
  CUSTOMER_TRANSACTION_STATUS,
  CUSTOMER_TRANSFER_LIST_STATE,
  CUSTOMER_TRANSFER_TYPE,
  INVOICES_LIST_STATE,
  INVOICES_PAID_STATE,
  IS_AVAILABLE,
  NETWORK_CONTRACT_LIST_STATUS,
  NETWORK_ORDER_STATE,
  ORDER_COMPLETE_STATUS,
  ORDER_INVOICE_STATUS,
  PROJECT_AUDIT_STATUS,
  PROJECT_STATUS,
  SUPPLEMENT_ORDER_STATUS,
  TRANSACTION_STATUS,
  TRANSPORT_ACCOUNT_LIST_STATUS,
  TRANSPORT_FINAL_STATUS,
} from '@/constants/project/project';
import TRANSPORTIMMEDIATESTATUS from '@/constants/transport/transportImmediateStatus';

export const getStatus = (projectStatus, isStatus=false) => {
  if (isStatus === IS_AVAILABLE.DISABLE) return PROJECT_STATUS.FORBID;
  // return PROJECT_AUDIT_STATUS.hasOwnProperty(projectStatus) ? projectStatus : console.error("Error projectStatus!")
  if (projectStatus === PROJECT_AUDIT_STATUS.UNAUDITED) return PROJECT_STATUS.UNAUDITED;
  if (projectStatus === PROJECT_AUDIT_STATUS.AUDITED) return PROJECT_STATUS.AUDITED;
  if (projectStatus === PROJECT_AUDIT_STATUS.REFUSE) return PROJECT_STATUS.REFUSE;
  if (projectStatus === PROJECT_AUDIT_STATUS.SHIPMENT_UNAUDITED) return PROJECT_STATUS.SHIPMENT_UNAUDITED;
  if (projectStatus === PROJECT_AUDIT_STATUS.SHIPMENT_REFUSE) return PROJECT_STATUS.SHIPMENT_REFUSE;
  if (projectStatus === PROJECT_AUDIT_STATUS.CUSTOMER_UNAUDITED) return PROJECT_STATUS.CUSTOMER_UNAUDITED;
  if (projectStatus === PROJECT_AUDIT_STATUS.CUSTOMER_REFUSE) return PROJECT_STATUS.CUSTOMER_REFUSE;
  if (projectStatus === PROJECT_AUDIT_STATUS.CUSTOMER_AUDITED) return PROJECT_STATUS.CUSTOMER_AUDITED;
  throw new Error("Error projectStatus!");
};

export const getStatusConfig = (projectStatus, isStatus) => {
  const status = getStatus(projectStatus, isStatus);
  const statusConfig = {
    [PROJECT_STATUS.FORBID]: [
      { key: 1, word: "● 禁用", color: "gray" },
    ],
    [PROJECT_STATUS.UNAUDITED]: [
      { key: 1, word: "● 平台待审核", color: "red" },
    ],
    [PROJECT_STATUS.AUDITED]: [
      { key: 1, word: "● 已审核", color: "green" },
    ],
    [PROJECT_STATUS.REFUSE]: [
      { key: 1, word: "● 平台已拒绝", color: "red" },
    ],
    [PROJECT_STATUS.SHIPMENT_REFUSE]: [
      { key: 1, word: "● 承运已拒绝", color: "red" },
    ],
    [PROJECT_STATUS.SHIPMENT_UNAUDITED]: [
      { key: 1, word: "● 承运待审核", color: "orange" },
    ],
    [PROJECT_STATUS.CUSTOMER_UNAUDITED]: [
      { key: 1, word: "● 客户待确认", color: "orange" },
    ],
    [PROJECT_STATUS.CUSTOMER_REFUSE]: [
      { key: 1, word: "● 客户审核不通过", color: "red" },
    ],
    [PROJECT_STATUS.CUSTOMER_AUDITED]: [
      { key: 1, word: "● 待托运确认", color: "green" },
    ]
  }[status];

  if (!statusConfig) {
    throw new Error("Error projectStatus!");
  }

  return statusConfig;
};
export const getConsignmentType = (consignmentType) => {
  if (consignmentType === CONSIGNMENT_TYPE.DIRECT_DELIVERY) return { key: 1, word: "直发" };
  if (consignmentType === CONSIGNMENT_TYPE.AGENCY_DELIVERY) return { key: 1, word: "代发" };
  throw new Error("Error consignmentType!");
};

// TRANSPORT_STATUS, PROCESS_STATUS, EXECPTION_STATUS, SHIPMENT_RECEIPT_STATUS, CONSIGNMENT_RECEIPT_STATUS, IS_EFFECTIVE_STATUS, TRANSPORT_FINAL_STATUS
export const translateTransportStauts = ({ transportImmediateStatus }) => ({
  [TRANSPORTIMMEDIATESTATUS.UNTREATED]: TRANSPORT_FINAL_STATUS.UNTREATED,
  [TRANSPORTIMMEDIATESTATUS.ACCEPT]: TRANSPORT_FINAL_STATUS.ACCEPT,
  [TRANSPORTIMMEDIATESTATUS.CANCEL]: TRANSPORT_FINAL_STATUS.CANCEL,
  [TRANSPORTIMMEDIATESTATUS.COMPLETE]: TRANSPORT_FINAL_STATUS.COMPLETE,
  [TRANSPORTIMMEDIATESTATUS.UNDELIVERY]: TRANSPORT_FINAL_STATUS.UNDELIVERY,
  [TRANSPORTIMMEDIATESTATUS.RECEIVED]: TRANSPORT_FINAL_STATUS.RECEIVED,
  [TRANSPORTIMMEDIATESTATUS.TRANSPORTING]: TRANSPORT_FINAL_STATUS.TRANSPORTING,
  [TRANSPORTIMMEDIATESTATUS.SHIPMENT_REFUSE]: TRANSPORT_FINAL_STATUS.SHIPMENT_REFUSE,
  [TRANSPORTIMMEDIATESTATUS.SHIPMENT_AUDITED]: TRANSPORT_FINAL_STATUS.SIGNED, // 承运已审核即托运待审
  [TRANSPORTIMMEDIATESTATUS.CONSIGNMENT_REFUSE]: TRANSPORT_FINAL_STATUS.CONSIGNMENT_REFUSE,
  [TRANSPORTIMMEDIATESTATUS.SIGNED]: TRANSPORT_FINAL_STATUS.SHIPMENT_UNAUDITED,
  // [TRANSPORTIMMEDIATESTATUS.RESINGED]: 12,
  [TRANSPORTIMMEDIATESTATUS.DRIVER_REFUSE]: TRANSPORT_FINAL_STATUS.DRIVER_REFUSE,
  [TRANSPORTIMMEDIATESTATUS.TRANSPORT_EXECPTION]: TRANSPORT_FINAL_STATUS.TRANSPORT_EXECPTION,
  // [TRANSPORTIMMEDIATESTATUS.CUSTOMER_UNAUDITED]:15,
  [TRANSPORTIMMEDIATESTATUS.CONSIGNMENT_UNAUDITED]:TRANSPORT_FINAL_STATUS.SIGNED,
  [TRANSPORTIMMEDIATESTATUS.UNJUDGE]:TRANSPORT_FINAL_STATUS.ACCEPT_UNTREATED,
  [TRANSPORTIMMEDIATESTATUS.JUDGE_REFUCE]:TRANSPORT_FINAL_STATUS.CANCEL,
  [TRANSPORTIMMEDIATESTATUS.CANCEL_APPLY]:TRANSPORT_FINAL_STATUS.CANCEL,
  [TRANSPORTIMMEDIATESTATUS.TRANSPORT_TIMEOUT]:TRANSPORT_FINAL_STATUS.CANCEL,
  [TRANSPORTIMMEDIATESTATUS.DELIVERY_UNAUDITED]:TRANSPORT_FINAL_STATUS.DELIVERY_UNTREATED,
  [TRANSPORTIMMEDIATESTATUS.DELIVERY_AUDITED_REFUSE]:TRANSPORT_FINAL_STATUS.DELIVERY_REFUSE
}[transportImmediateStatus]);

export const getTransportStatus = (transport) => {
  const status = translateTransportStauts(transport);
  const statusConfig = {
    [TRANSPORT_FINAL_STATUS.UNTREATED]: [
      { key: 1, word: '未接单', color: 'gray' },
    ],
    [TRANSPORT_FINAL_STATUS.ACCEPT]: [
      { key: 1, word: '已接单', color: 'green' },
    ],
    [TRANSPORT_FINAL_STATUS.DRIVER_REFUSE]: [
      { key: 1, word: '司机拒绝', color: 'red' },
    ],
    [TRANSPORT_FINAL_STATUS.CANCEL]: [
      { key: 1, word: '已作废', color: 'black' },
    ],
    [TRANSPORT_FINAL_STATUS.CONSIGNMENT_REFUSE]: [
      { key: 1, word: '托运已拒绝', color: 'red' },
    ],
    [TRANSPORT_FINAL_STATUS.COMPLETE]: [
      { key: 1, word: '已完成', color: 'green' },
    ],
    [TRANSPORT_FINAL_STATUS.SHIPMENT_REFUSE]: [
      { key: 1, word: '承运已拒绝', color: 'red' },
    ],
    [TRANSPORT_FINAL_STATUS.UNDELIVERY]: [
      { key: 1, word: '待提货', color: 'orange' },
    ],
    [TRANSPORT_FINAL_STATUS.TRANSPORTING]: [
      { key: 1, word: '运输中', color: 'orange' },
    ],
    [TRANSPORT_FINAL_STATUS.RECEIVED]: [
      { key: 1, word: '已到站', color: 'orange' },
    ],
    [TRANSPORT_FINAL_STATUS.SIGNED]: [
      { key: 1, word: '托运待审核', color: 'green' },
    ],
    [TRANSPORT_FINAL_STATUS.SHIPMENT_UNAUDITED]: [
      { key: 1, word: '承运待审核', color: 'green' },
    ],
    [TRANSPORT_FINAL_STATUS.TRANSPORT_EXECPTION]: [
      { key: 1, word: '运单异常', color: 'red' },
    ],
    [TRANSPORT_FINAL_STATUS.ACCEPT_UNTREATED]: [
      { key: 1, word: '接单待确认', color: 'gray' },
    ],
    [TRANSPORT_FINAL_STATUS.DELIVERY_UNTREATED]: [
      { key: 1, word: '提货待审核', color: 'orange' },
    ],
    [TRANSPORT_FINAL_STATUS.DELIVERY_REFUSE]: [
      { key: 1, word: '提货已拒绝', color: 'red' },
    ],
  }[status] || [{ key: 1, word: 'bug', color: 'red' }];

  if (!statusConfig) {
    throw new Error("Error transportStatus!");
  }

  return statusConfig;
};

export const getAccountStatus = (accountStatus)=>{
  const statusConfig = {
    [ACCOUNT_LIST_STATUS.UNAUDITED]:{
      word: '● 待审核', color: 'gray'
    },
    [ACCOUNT_LIST_STATUS.AUDITED]:{
      word: '● 审核完成', color: 'green'
    },
    [ACCOUNT_LIST_STATUS.AUDITING]:{
      word: '● 审核中', color: 'orange'
    },
    [ACCOUNT_LIST_STATUS.REFUSE]:{
      word: '● 已拒绝', color: 'red'
    },
    [ACCOUNT_LIST_STATUS.CANCEL]:{
      word: '● 已作废', color: 'gray'
    },
    [ACCOUNT_LIST_STATUS.NOT_HANDLE]:{
      word: '● 待提交', color: 'gray'
    }
  }[accountStatus];

  return statusConfig;
};

export const getTransportAccountStatus = (accountStatus) =>{
  const statusConfig = {
    [TRANSPORT_ACCOUNT_LIST_STATUS.UNAUDITED]:{
      word: '● 待审核', color: 'gray'
    },
    [TRANSPORT_ACCOUNT_LIST_STATUS.AUDITED]:{
      word: '● 已通过', color: 'green'
    },
    [TRANSPORT_ACCOUNT_LIST_STATUS.REFUSE]:{
      word: '● 已拒绝', color: 'red'
    },
    [TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL]:{
      word: '● 已作废', color: 'gray'
    },
    [TRANSPORT_ACCOUNT_LIST_STATUS.NOT_HANDLE]:{
      word: '● 待提交', color: 'gray'
    },
    [TRANSPORT_ACCOUNT_LIST_STATUS.SHIPMENT_UNAUDITED]:{
      word: '● 本级承运待审核', color: 'gray'
    }
  }[accountStatus];
  return statusConfig;
};

export const getNetworkContractStatus = (contractStatus, organizationType) =>{
  const statusConfig = {
    [NETWORK_CONTRACT_LIST_STATUS.UNAUDITED]:{
      word: '● 待审核', color: 'orange'
    },
    [NETWORK_CONTRACT_LIST_STATUS.AUDITED]:{
      word: '● 已审核', color: 'green'
    },
    [NETWORK_CONTRACT_LIST_STATUS.REFUSE]:{
      word: '● 被拒绝', color: 'red'
    }
  };
  if (Number(organizationType) === 1) statusConfig[NETWORK_CONTRACT_LIST_STATUS.REFUSE] = { word: '● 已拒绝', color: 'red' };
  return statusConfig[contractStatus];
};

export const getNetworkOrderStatus = (orderStatus) =>{
  // orderStatus = orderStatus === NETWORK_ORDER_STATE.PARTIALLY_COMPLETED? NETWORK_ORDER_STATE.PROCESSING: orderStatus;
  const statusConfig = {
    [NETWORK_ORDER_STATE.UNPAID]:{
      word: '未支付', color: 'orange'
    },
    [NETWORK_ORDER_STATE.PROCESSING]:{
      word: '处理中', color: '#1890FF'
    },
    [NETWORK_ORDER_STATE.CANCEL]:{
      word: '已作废', color: 'red'
    },
    [NETWORK_ORDER_STATE.PARTIALLY_COMPLETED]:{
      word: '部分支付', color: '#906800'
    },
    [NETWORK_ORDER_STATE.COMPLETED]:{
      word: '已支付', color: 'green'
    },
    [NETWORK_ORDER_STATE.FAIL]:{
      word: '支付失败', color: 'red'
    }
  }[orderStatus];
  return statusConfig;
};

export const getCustomerTransferState = (state) =>({
  [CUSTOMER_TRANSFER_LIST_STATE.UNCONFIRMED]: {
    word: '未确认', color: 'orange'
  },
  [CUSTOMER_TRANSFER_LIST_STATE.CONFIRM]: {
    word: '已确认', color: 'green'
  },
  [CUSTOMER_TRANSFER_LIST_STATE.EXPIRE]: {
    word: '已过期', color: 'red'
  }
}[state]);

export const getContractType = (type) =>{
  const statusConfig = {
    [CONTRACT_TYPE.ACCEPT]: '承运合同',
    [CONTRACT_TYPE.DISPATCH]: '调度合同',
    [CONTRACT_TYPE.NETWORK]: '网络货运合同',
    [CONTRACT_TYPE.FREIGHT_CONTRACT]: '运输合同'
  }[type];
  return statusConfig;
};

export const getContractOSSFileKey = (type) =>{
  const statusConfig = {
    [CONTRACT_TYPE.ACCEPT]: 'business/contract/承运合同模板.doc',
    [CONTRACT_TYPE.DISPATCH]: 'business/contract/调度合同模板.doc',
    [CONTRACT_TYPE.NETWORK]: 'business/contract/网络货运合同模板.doc'
  }[type];
  return statusConfig;
};

export const getCustomerTransferType = (typeCode) =>{
  const statusConfig = {
    [CUSTOMER_TRANSFER_TYPE.OFFLINE]: '线下汇款',
    [CUSTOMER_TRANSFER_TYPE.ONLINE]: '线上汇款',
    [CUSTOMER_TRANSFER_TYPE.REPLACE]: '平台代充值'
  }[typeCode];
  return statusConfig;
};

export const getInvoicesStatus = (status) =>{
  const statusConfig = {
    [INVOICES_LIST_STATE.DRAFT]:{
      word: '草稿', color: 'gray'
    },
    [INVOICES_LIST_STATE.PENDING]:{
      word: '待审核', color: 'orange'
    },
    [INVOICES_LIST_STATE.PROCESSING]:{
      word: '开票中', color: '#1890FF'
    },
    [INVOICES_LIST_STATE.DONE]:{
      word: '已开票', color: 'green'
    },
    [INVOICES_LIST_STATE.REFUSE]:{
      word: '被拒绝', color: 'red'
    },
    [INVOICES_LIST_STATE.CANCEL]:{
      word: '已作废', color: 'red'
    },
    [INVOICES_LIST_STATE.PARTIALLY_DONE]:{
      word: '部分已开票', color: 'orange'
    }
  }[status];
  return statusConfig;
};

export const getInvoicesPaidStatus = (status) =>{
  const statusConfig = {
    [INVOICES_PAID_STATE.UNPAID]:{
      word: '未支付', color: 'orange'
    },
    [INVOICES_PAID_STATE.PARTIALLY_PAID]:{
      word: '部分支付', color: 'orange'
    },
    [INVOICES_PAID_STATE.PAID]:{
      word: '已支付', color: 'green'
    }
  }[status];
  return statusConfig;
};

export const getOrderCompleteStatus = (status) =>{
  const statusConfig = {
    [ORDER_COMPLETE_STATUS.UNCOMPLETE]:{
      word: '未完成', color: 'orange'
    },
    [ORDER_COMPLETE_STATUS.COMPLETE]:{
      word: '已完成', color: 'green'
    }
  }[status];
  return statusConfig;
};

export const getOrderInvoiceStatus = (status) =>{
  const statusConfig = {
    [ORDER_INVOICE_STATUS.UNCOMPLETE]:{
      word: '未开票', color: 'orange'
    },
    [ORDER_INVOICE_STATUS.COMPLETE]:{
      word: '已开票', color: 'green'
    },
    [ORDER_INVOICE_STATUS.PENDING]:{
      word: '开票中', color: '#1890FF'
    },
    [ORDER_INVOICE_STATUS.UNAUDITED]:{
      word: '待审核', color: 'gray'
    }
  }[status];
  return statusConfig;
};

export const getConfigurationStatus = (status) =>{
  const statusConfig = {
    [CONFIGURATION_STATUS.UNNECESSARY]:{
      word: '● 无需配置', color: 'gray'
    },
    [CONFIGURATION_STATUS.UNCOMPLETE]:{
      word: '● 待配置', color: 'orange'
    },
    [CONFIGURATION_STATUS.COMPLETE]:{
      word: '● 已配置', color: 'green'
    }
  }[status];
  return statusConfig;
};

export const getSupplementOrderStatus = (status) =>{
  const statusConfig = {
    [SUPPLEMENT_ORDER_STATUS.FAILED]:{
      word: '补单失败', color: 'red'
    },
    [SUPPLEMENT_ORDER_STATUS.SUCCESS]:{
      word: '补单成功', color: 'green'
    },
    [SUPPLEMENT_ORDER_STATUS.UNCOMMIT]:{
      word: '未提交', color: 'orange'
    },
    [SUPPLEMENT_ORDER_STATUS.DETECTION_FAILED]:{
      word: '校验失败', color: 'red'
    },
    [SUPPLEMENT_ORDER_STATUS.MISSING_PICTURE]:{
      word: '图片缺失', color: 'red'
    }
  }[status];
  return statusConfig;
};

export const getTransactionStatus = (statusCode) => {
  const statusConfig = {
    [TRANSACTION_STATUS.FAILED]:{
      word: '已失败', color: 'red'
    },
    [TRANSACTION_STATUS.SUCCESS]:{
      word: '已退款', color: 'green'
    },
    [TRANSACTION_STATUS.PENDING]:{
      word: '待审核', color: 'orange'
    },
    [TRANSACTION_STATUS.CANCEL]:{
      word: '已撤销', color: 'gray'
    },
    [TRANSACTION_STATUS.OVERTIME]:{
      word: '已关闭', color: 'gray'
    },
    [TRANSACTION_STATUS.AUDITED]:{
      word: '待退款', color: 'orange'
    },
    [TRANSACTION_STATUS.REFUSED]:{
      word: '已拒绝', color: 'red'
    }
  }[statusCode];
  return statusConfig;
};

export const getAccountEventStatus = (statusCode, correlationObjectType) => {
  const type = {
    [CORRELATIONOBJECTTYPE.ACCOUNT]: '对账单',
    [CORRELATIONOBJECTTYPE.PAYMENT]: '付款单',
  }[correlationObjectType];
  const statusConfig = {
    [ACCOUNT_EVENT_STATUS.ADD]:{
      word: type === '对账单'? `将运单加入对账单`: `将运单所属对账单加入付款单`, color: 'green'
    },
    [ACCOUNT_EVENT_STATUS.REMOVE]:{
      word: `将运单移除${type}`, color: 'red'
    },
    [ACCOUNT_EVENT_STATUS.PASS]:{
      word: `审核关联${type}通过`, color: 'green'
    },
    [ACCOUNT_EVENT_STATUS.REJECT]:{
      word: `审核关联${type}拒绝`, color: 'red'
    },
    [ACCOUNT_EVENT_STATUS.PAY_OK]:{
      word: `关联${type}付款成功`, color: 'green'
    },
    [ACCOUNT_EVENT_STATUS.PAY_NO]:{
      word: `关联${type}付款失败`, color: 'red'
    },
  }[statusCode];
  return statusConfig;
};


export const getCustomerTransactionStatus = (state) =>{
  const statusConfig = {
    [CUSTOMER_TRANSACTION_STATUS.RECORDED]:{
      word: '已入账', color: 'orange'
    },
    [CUSTOMER_TRANSACTION_STATUS.UNRECORDED]:{
      word: '未入账', color: 'green'
    },
  }[state];
  return statusConfig;
};
