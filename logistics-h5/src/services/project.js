import {
  PROJECT_AUDIT_STATUS, IS_AVAILABLE, CONSIGNMENT_TYPE, PROJECT_STATUS, PREBOOKING_STAUTS,
  TRANSPORT_STATUS, PROCESS_STATUS, EXECPTION_STATUS, SHIPMENT_RECEIPT_STATUS, CONSIGNMENT_RECEIPT_STATUS, IS_EFFECTIVE_STATUS, TRANSPORT_FINAL_STATUS,
  ACCOUNT_LIST_STATUS, TRANSPORT_ACCOUNT_LIST_STATUS
} from '@/constants/project/project'

export const getStatus = (projectStatus, isStatus=false) => {
  if (isStatus === IS_AVAILABLE.DISABLE) return PROJECT_STATUS.FORBID
  // return PROJECT_AUDIT_STATUS.hasOwnProperty(projectStatus) ? projectStatus : console.error("Error projectStatus!")
  if (projectStatus === PROJECT_AUDIT_STATUS.UNAUDITED) return PROJECT_STATUS.UNAUDITED
  if (projectStatus === PROJECT_AUDIT_STATUS.AUDITED) return PROJECT_STATUS.AUDITED
  if (projectStatus === PROJECT_AUDIT_STATUS.REFUSE) return PROJECT_STATUS.REFUSE
  if (projectStatus === PROJECT_AUDIT_STATUS.SHIPMENT_UNAUDITED) return PROJECT_STATUS.SHIPMENT_UNAUDITED
  if (projectStatus === PROJECT_AUDIT_STATUS.SHIPMENT_REFUSE) return PROJECT_STATUS.SHIPMENT_REFUSE
  if (projectStatus === PROJECT_AUDIT_STATUS.CUSTOMER_UNAUDITED) return PROJECT_STATUS.CUSTOMER_UNAUDITED
  if (projectStatus === PROJECT_AUDIT_STATUS.CUSTOMER_REFUSE) return PROJECT_STATUS.CUSTOMER_REFUSE
  if (projectStatus === PROJECT_AUDIT_STATUS.CUSTOMER_AUDITED) return PROJECT_STATUS.CUSTOMER_AUDITED
  throw new Error("Error projectStatus!")
}

export const getStatusConfig = (projectStatus, isStatus) => {
  const status = getStatus(projectStatus, isStatus)
  const statusConfig = {
    [PROJECT_STATUS.FORBID]: [
      { key: 1, word: "禁用", color: "gray" },
    ],
    [PROJECT_STATUS.UNAUDITED]: [
      { key: 1, word: "平台待审核", color: "red" },
    ],
    [PROJECT_STATUS.AUDITED]: [
      { key: 1, word: "合同进行中", color: "green" },
    ],
    [PROJECT_STATUS.REFUSE]: [
      { key: 1, word: "平台已拒绝", color: "red" },
    ],
    [PROJECT_STATUS.SHIPMENT_REFUSE]: [
      { key: 1, word: "承运已拒绝", color: "red" },
    ],
    [PROJECT_STATUS.SHIPMENT_UNAUDITED]: [
      { key: 1, word: "承运待审核", color: "orange" },
    ],
    [PROJECT_STATUS.CUSTOMER_UNAUDITED]: [
      { key: 1, word: "客户待确认", color: "orange" },
    ],
    [PROJECT_STATUS.CUSTOMER_REFUSE]: [
      { key: 1, word: "客户审核不通过", color: "red" },
    ],
    [PROJECT_STATUS.CUSTOMER_AUDITED]: [
      { key: 1, word: "待托运确认", color: "green" },
    ]
  }[status]

  if (!statusConfig) {
    throw new Error("Error projectStatus!")
  }

  return statusConfig
}

export const getConsignmentType = (consignmentType) => {
  if (consignmentType === CONSIGNMENT_TYPE.DIRECT_DELIVERY) return { key: 1, word: "直发" }
  if (consignmentType === CONSIGNMENT_TYPE.AGENCY_DELIVERY) return { key: 1, word: "代发" }
  throw new Error("Error consignmentType!")
}

export const getPreBookingStauts = (preBookingStatus) => {
  const statusConfig = {
    [PREBOOKING_STAUTS.UNCERTAINTY]: [
      { key: 1, word: "● 待确定", _word: '待确定', color: "red" },
      { key: 2, word: "● 待确定", color: "red", authority: '2' },
      { key: 3, word: "● 待确定", color: "red", authority: '3' }
    ],
    [PREBOOKING_STAUTS.UNCOMPLETED]: [
      { key: 1, word: "● 调度中", _word: '调度中', color: "orange" },
      { key: 2, word: "● 调度中", color: "orange", authority: '2' },
      { key: 3, word: "● 调度中", color: "orange", authority: '3' }
    ],
    [PREBOOKING_STAUTS.COMPLETE]: [
      { key: 1, word: "● 调度完成", _word: '调度完成', color: "green" },
      { key: 2, word: "● 调度完成", color: "green", authority: '2' },
      { key: 3, word: "● 调度完成", color: "green", authority: '3' }
    ],
    [PREBOOKING_STAUTS.REFUSE]: [
      { key: 1, word: "● 已拒绝", _word: '已拒绝', color: "red" },
      { key: 2, word: "● 已拒绝", color: "gray", authority: '2' },
      { key: 3, word: "● 已拒绝", color: "gray", authority: '3' }
    ],
    [PREBOOKING_STAUTS.CANCELED]: [
      { key: 1, word: "● 已取消", _word: '已取消', color: "black" },
      { key: 2, word: "● 已取消", color: "black", authority: '2' },
      { key: 3, word: "● 已取消", color: "black", authority: '3' }
    ]
  }[preBookingStatus]

  // if (!statusConfig) {
  //   throw new Error("Error projectStatus!")
  // }

  return statusConfig || [{ key: 1, word: "● bug", color: "red" }]
}
// TRANSPORT_STATUS, PROCESS_STATUS, EXECPTION_STATUS, SHIPMENT_RECEIPT_STATUS, CONSIGNMENT_RECEIPT_STATUS, IS_EFFECTIVE_STATUS, TRANSPORT_FINAL_STATUS
export const translateTransportStauts = ({ transportStatus, processStatus, exceptionStatus, shipmentReceiptStatus, consignmentReceiptStatus, iseffectiveStatus }) => {
  // console.log(transportStatus, processStatus, exceptionStatus, shipmentReceiptStatus, consignmentReceiptStatus, iseffectiveStatus)
  if (iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_TRANSPORT_REFUSE) return TRANSPORT_FINAL_STATUS.DRIVER_REFUSE // 司机拒绝
  if (iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_DELETE||iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_EXECPTION_TRANSPORT) return TRANSPORT_FINAL_STATUS.CANCEL // 已取消
  if (iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL&&exceptionStatus===EXECPTION_STATUS.EXECPTION_UNAUDITED) return TRANSPORT_FINAL_STATUS.TRANSPORT_EXECPTION // 运单异常
  if (processStatus === PROCESS_STATUS.PROCESS_ACCEPT && iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL) return TRANSPORT_FINAL_STATUS.ACCEPT // 已接单
  if (processStatus === PROCESS_STATUS.PROCESS_INITIALIZATION && iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL) return TRANSPORT_FINAL_STATUS.UNTREATED // 待处理
  if (transportStatus === TRANSPORT_STATUS.TRANSPORT_FINISH && iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL) return TRANSPORT_FINAL_STATUS.COMPLETE // 已完成
  if (shipmentReceiptStatus === SHIPMENT_RECEIPT_STATUS.SHIPMENT_RECEIPT_REFUSE && iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL) return TRANSPORT_FINAL_STATUS.SHIPMENT_REFUSE // 承运拒绝
  if (consignmentReceiptStatus === CONSIGNMENT_RECEIPT_STATUS.CONSIGNMENT_RECEIPT_REFUSE && iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL) return TRANSPORT_FINAL_STATUS.CONSIGNMENT_REFUSE // 托运拒绝
  if (shipmentReceiptStatus === SHIPMENT_RECEIPT_STATUS.SHIPMENT_RECEIPT_AUDITED && iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL) return TRANSPORT_FINAL_STATUS.SHIPMENT_AUDITED // 承运审核
  if (processStatus === PROCESS_STATUS.PROCESS_START_WORKING && iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL) return TRANSPORT_FINAL_STATUS.UNDELIVERY // 待提货
  if (processStatus === PROCESS_STATUS.PROCESS_DELIVERY && iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL) return TRANSPORT_FINAL_STATUS.TRANSPORTING // 运输中
  if (processStatus === PROCESS_STATUS.PROCESS_RECEIVING && iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL) return TRANSPORT_FINAL_STATUS.RECEIVED // 已到站
  if ((processStatus === PROCESS_STATUS.PROCESS_SIGNED || processStatus === PROCESS_STATUS.PROCESS_RESIGNED) && iseffectiveStatus === IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL) return TRANSPORT_FINAL_STATUS.SIGNED // 已签收
  // throw new Error("Error transportStatus!")
}

export const getTransportStatus = (transport) => {
  const status = translateTransportStauts(transport)
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
      { key: 1, word: '已取消', color: 'black' },
    ],
    [TRANSPORT_FINAL_STATUS.CONSIGNMENT_REFUSE]: [
      { key: 1, word: '托运已拒绝', color: 'red' },
    ],
    [TRANSPORT_FINAL_STATUS.COMPLETE]: [
      { key: 1, word: '已完成', color: 'green' },
    ],
    [TRANSPORT_FINAL_STATUS.SHIPMENT_REFUSE]: [
      { key: 1, word: '客户已拒绝', color: 'red' },
    ],
    [TRANSPORT_FINAL_STATUS.UNDELIVERY]: [
      { key: 1, word: '待提货', color: 'orange' },
    ],
    [TRANSPORT_FINAL_STATUS.TRANSPORTING]: [
      { key: 1, word: '运输中', color: 'orange' },
      // { key: 2, word:'运输中', color:'orange', authority:'2' },
      // { key: 3, word:'运输中', color:'orange', authority:'3' },
      // { key: 4, word:'运输中', color:'orange', authority:'4' }
    ],
    [TRANSPORT_FINAL_STATUS.RECEIVED]: [
      { key: 1, word: '已到站', color: 'orange' },
    ],
    [TRANSPORT_FINAL_STATUS.SIGNED]: [
      { key: 1, word: '托运待审核', color: 'green' },
    ],
    [TRANSPORT_FINAL_STATUS.TRANSPORT_EXECPTION]: [
      { key: 1, word: '运单异常', color: 'red' },
    ],
    [TRANSPORT_FINAL_STATUS.SHIPMENT_AUDITED]: [
      { key: 1, word: '托运待审核', color: 'green' },
    ],
  }[status] || [{ key: 1, word: 'bug', color: 'red' }]

  if (!statusConfig) {
    throw new Error("Error transportStatus!")
  }

  return statusConfig
}

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
  }[accountStatus]

  return statusConfig
}

export const getTransportAccountStatus = (accountStatus) =>{
  const statusConfig = {
    [TRANSPORT_ACCOUNT_LIST_STATUS.UNAUDITED]:{
      word: '● 待审核', color: 'gray'
    },
    [TRANSPORT_ACCOUNT_LIST_STATUS.AUDITED]:{
      word: '● 已审核', color: 'green'
    },
    [TRANSPORT_ACCOUNT_LIST_STATUS.REFUSE]:{
      word: '● 已拒绝', color: 'red'
    },
    [TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL]:{
      word: '● 已作废', color: 'gray'
    },
    [TRANSPORT_ACCOUNT_LIST_STATUS.NOT_HANDLE]:{
      word: '● 待提交', color: 'gray'
    }
  }[accountStatus]

  return statusConfig
}

// =================================================================================================================== //
// ===================================================二期项目新增定义================================================= //
// =================================================================================================================== //

// ====合同状态==== //

