export const PROJECT_AUDIT_STATUS = {
  UNAUDITED: 2, // 2待审
  AUDITED: 1, // 1已审
  REFUSE: 0,  // 0拒绝
  SHIPMENT_UNAUDITED: 3, // 3承运待审核
  SHIPMENT_REFUSE: 4, // 4承运已拒绝
  CUSTOMER_UNAUDITED: 5, // 客户待审
  CUSTOMER_REFUSE: 6, // 客户拒绝
  CUSTOMER_AUDITED: 7 // 客户审核通过（托运待审）
}

export const NETWORK_CONTRACT_LIST_STATUS = {
  DISABLE: 0, // 0禁用
  UNAUDITED: 1, // 1待审核
  AUDITED: 2, // 2已审
  REFUSE: 3,  // 3被拒绝
};

export const SHIPMENT_AUDIT_STATUS = {
  REFUSE:0,
  ACCEPT:1,
  UNAUDITED:2
}

export const IS_FORBID = {
  ENABLE: 1, // 1启用
  DISABLE: 0 // 0禁用
}

export const IS_AVAILABLE = {
  ENABLE: true, // 1启用
  DISABLE: false // 0禁用
}

export const CHARGE_MODE = {
  DELIVERY:1, // 提货重量
  RECEIVING:2 // 卸货重量
}

export const PROJECT_STATUS = {
  UNAUDITED: 2, // 0待审
  AUDITED: 1, // 1已审
  FORBID: 5,  // 2禁用
  REFUSE: 0,  // 3平台拒绝
  SHIPMENT_UNAUDITED: 3, // 承运待审核
  SHIPMENT_REFUSE: 4, // 承运已拒绝
  CUSTOMER_UNAUDITED: 6, // 客户待审
  CUSTOMER_REFUSE: 7, // 客户拒绝
  CUSTOMER_AUDITED: 8 // 客户审核通过（托运待审）
}

export const CONSIGNMENT_TYPE = {
  DIRECT_DELIVERY: 0, // 0直接发货
  AGENCY_DELIVERY: 1 // 1代理发货
}

export const ORGANIZATION_TYPE = {
  IS_PLATFORM: 0, // 平台
  NOT_PLATFORM: 1  // 非平台
}

export const PREBOOKING_STAUTS = {
  UNCERTAINTY: 0, // 待确定,
  UNCOMPLETED: 1, // 调度中
  COMPLETE: 2, // 调度完成
  REFUSE: 3,  // 3拒绝
  CANCELED: 4 // 已取消
}

export const CARDLIST_CONTENT_TYPE = {
  PREBOOKING: 'prebooking',
  TRANSPORT: 'transport'
}

export const PREBOOKING_EVENT_STATUS = {
  PUBLISHED: 0, // 发布预约单
  ACCEPT_TIME_OUT: 1, // 接单超时
  ACCEPTED: 2, // 已接单
  REFUSED: 3, // 已拒绝
  START_DISPATCH: 4, // 开始调度
  DISPATCHED: 5, // 调度完成
  AUTO_DISPATCHED: 6, // 自动完成
  CANCELED: 7 // 已取消
}

export const TRANSPORT_ENVENT_STATUS = {
  PUBLISHED: 1, // 发布运单
  ACCEPTED: 2, // 司机接单
  REFUSED: 3, // 司机拒绝
  ACTION_START: 4, // 执行任务
  CAR_LOADING: 5, // 装车
  ARRIVE: 6, // 到站
  HANDLE_EXCEPTION: 7, // 提交异常
  EXCEPTION_PASS: 8, // 异常审核通过
  EXCEPTION_INGORE: 9, // 异常审核不通过
  REDISPATCH: 10, // 重新调度
  SIGNED: 11, // 签收
  RESINGED: 12, // 重新签收
  SHIPMENT_RECEIPT_PASS: 13, // 承运方回单审核通过
  SHIPMENT_RECEIPT_REFUSE: 14, // 承运方回单审核不通过
  CONSIGNMENT_RECEIPT_PASS: 15, // 托运方回单审核通过
  CONSIGNMENT_RECEIPT_REFUSE: 16, // 托运方回单审核不通过
  SHIPMENT_MODIFY_RECEIPT: 17, // 承运方修改回单
  SHIPMENT_MODIFY_TRANSPORT:18, // 承运修改运单
  CUSTOMER_RECEIPT_PASS:19, // （客户）回单审核通过
  CUSTOMER_RECEIPT_REFUSE:20, // （客户）回单审核不通过
  DRIVER_DELIVERY_OUT_OF_FENSE: 21, // 司机围栏外运单提货
  DRIVER_SIGN_OUT_OF_FENSE: 22, // 司机围栏外签收
  SHIPMENT_CANCEL_TRANSPORT:23, // 承运取消运单
  DRIVER_ACCEPT_AUDIT:24, // 司机接单待确认
  DRIVER_ACCEPT_PASS:25, // 司机接单审核通过
  DRIVER_ACCEPT_REFUSE:26, // 司机接单审核不过
  DRIVER_LOAD_AUTO_COMPLETE:27, // 司机提货后超时自动转完成
  DRIVER_CANCEL_APPLY:28, // 司机取消申请
  OVERTIME_CANCEL:29, // 运单超时自动关闭
  DRIVER_LOAD_AUDIT:30, // 司机提货待审核
  DRIVER_LOAD_PASS:31, // 司机提货审核通过
  DRIVER_LOAD_REFUSE:32, // 司机提货审核不通过
  DRIVER_MODIFY_LOAD_INFO:33, // 司机修改提货审核
  DRIVER_APPLY_ACCEPT:34, // 司机申请接单
  SHIPMENT_MODIFY_RECEIVING:35, // 承运修改卸货点
}

export const ISEFFECT = 1

export const TRANSPORT_STATUS = {
  TRANSPORT_UNTREATED: 1, // 待处理
  TRANSPORT_TRANSPORTING: 2, // 运输中
  TRANSPORT_FINISH: 9 // 结束
}

export const PROCESS_STATUS = {
  PROCESS_INITIALIZATION: 0, // 初始化
  PROCESS_ACCEPT: 1, // 接受
  PROCESS_DELIVERY: 2, // 装货
  PROCESS_RECEIVING: 3, // 卸货
  PROCESS_SIGNED: 4, // 签收
  PROCESS_START_WORKING: 5, // 执行任务
  PROCESS_RESIGNED: 6, // 签收
}

export const EXECPTION_STATUS = {
  EXECPTION_INITIALIZATION: 0, // 初始化
  EXECPTION_UNAUDITED: 1, // 待审核
  EXECPTION_REFUSE: 2, // 审批未通过
  EXECPTION_AUDITED: 3 // 审批通过
}

export const SHIPMENT_RECEIPT_STATUS = {
  SHIPMENT_RECEIPT_INITIALIZATION: 0, // 初始化
  SHIPMENT_RECEIPT_UNAUDITED: 1, // 待审核
  SHIPMENT_RECEIPT_REFUSE: 2, // 审批未通过
  SHIPMENT_RECEIPT_AUDITED: 3 // 审批通过
}

export const CONSIGNMENT_RECEIPT_STATUS = {
  CONSIGNMENT_RECEIPT_INITIALIZATION: 0, // 初始化
  CONSIGNMENT_RECEIPT_UNAUDITED: 1, // 待审核
  CONSIGNMENT_RECEIPT_REFUSE: 2, // 审批未通过
  CONSIGNMENT_RECEIPT_AUDITED: 3 // 审批通过
}

export const IS_EFFECTIVE_STATUS = {
  IS_EFFECTIVE_DELETE: 0, // 删除
  IS_EFFECTIVE_NORMAL: 1, // 正常
  IS_EFFECTIVE_TRANSPORT_REFUSE: -1, // 运单拒绝
  IS_EFFECTIVE_EXECPTION_TRANSPORT: -2, // 异常运单
}

export const SHIPMENT_REJECT_STATUS = {
  SHIPMENT_REJECT_INITIALIZATION: 0, // 初始化
  SHIPMENT_REJECT_DELIVERY: 1, // 提货单未通过
  SHIPMENT_REJECT_RECEIVING: 2, // 卸货单未通过
  SHIPMENT_REJECT_ALL: 3, // 全部未通过
}

export const CONSIGNMENT_REJECT_STATUS = {
  CONSIGNMENT_REJECT_INITIALIZATION: 0, // 初始化
  CONSIGNMENT_REJECT_DELIVERY: 1, // 提货单未通过
  CONSIGNMENT_REJECT_RECEIVING: 2, // 卸货单未通过
  CONSIGNMENT_REJECT_ALL: 3, // 全部未通过
}

export const ACCOUNT_STATUS = {
  DISACCOUNT:1,
  ACCOUNTED:2
}

export const ACCOUNT_LIST_STATUS = {
  UNAUDITED:1, // 待审核
  AUDITED:2, // 审核完成
  AUDITING:3, // 审核中
  REFUSE:4, // 审核不通过
  CANCEL:5, // 作废
  NOT_HANDLE:6 // 待提交
}

export const TRANSPORT_ACCOUNT_LIST_STATUS = {
  UNAUDITED:1, // 待审核
  AUDITED:2, // 已审核
  REFUSE:4, // 已拒绝
  CANCEL:5, // 作废
  NOT_HANDLE:6 // 待提交
}

export const TRANSPORT_FINAL_STATUS = {
  UNTREATED: 0, // 未接单
  ACCEPT: 1, // 已接单
  DRIVER_REFUSE: 2, // 司机拒绝
  CANCEL: 3, // 已取消
  CONSIGNMENT_REFUSE: 4, // 托运拒绝
  COMPLETE: 5, // 已完成
  SHIPMENT_REFUSE: 6, // 客户已拒绝
  UNDELIVERY: 7, // 待提货
  TRANSPORTING: 8, // 运输中
  RECEIVED: 9, // 已到站
  SIGNED: 10, // 已签收
  TRANSPORT_EXECPTION: 11, // 运单异常
  SHIPMENT_AUDITED: 12, // 客户已审核
  SHIPMENT_UNAUDITED:13 // 客户待审核
}

export const MESSAGE_STATUS = {
  PREBOOK_UNAUDITED:1, // 预约单待确定
  PREBOOK_REFUSE:2, // 预约单拒绝
  PREBOOK_UNCOMPLETED:3, // 预约单调度中
  PREBOOK_COMPLETE:4, // 预约单调度完成
  TRANSPORT_UNTREATED:5, // 运单未接单
  TRANSPORT_REFUSE:6, // 司机拒绝运单
  TRANSPORT_ACCEPT:7, // 运单已接单
  TRANSPORT_SIGNED:8, // 运单已签收
  TRANSPORT_SHIPMENT_REFUSE:9, // 承运已拒绝运单
  TRANSPORT_SHIPMENT_AUDITED:10, // 承运已审核运单
  TRANSPORT_CONSIGNMENT_REFUSE:11, // 托运已拒绝运单
  TRANSPORT_COMPLETE:12, // 运单已完成
  TRANSPORT_EXECPTION:13, // 运单异常
  GOODSPLANS_CONSIGNMENT_UNTREATED: 14, // 14待托运方确认(要货计划单)
  GOODSPLANS_CUSTOMER_CANCEL: 15, // 15客户已取消(要货计划单)
  GOODSPLANS_CONSIGNMENT_REFUSE: 16, // 16托运方已拒绝(要货计划单)
  GOODSPLANS_COMPLETED: 17, // 17已完成(要货计划单)
  GOODSPLANS_FINISH: 18, // 18已结束(要货计划单)
  GOODSPLANS_GOINGON: 19, // 19进行中(要货计划单)
  TRANSPORT_CUSTOMER_CONFIRM: 20, // 20客户已确认收货(运单)
  TRANSPORT_CUSTOMER_REFUSE: 21, // 21客户已拒绝(运单)
  TRANSPORT_CUSTOMER_UNAUDITED: 22, // 22待客户确认收货(运单)
  CONTRACT_CUSTOMER_UNAUDITED: 23, // 23待客户审核(合同)
  CONTRACT_CUSTOMER_REJECT: 24, // 24客户审核不通过(合同)
  CONTRACT_CUSTOMER_AUDITED: 25, // 25客户审核通过(合同)
  CONTRACT_PLAT_UNAUDITED: 26, // 26平台待审(合同)
  CONTRACT_SHIPMENT_UNAUDITED: 27, // 27承运待审(合同)
  CONTRACT_PLAT_REFUSE: 28, // 28平台拒绝(合同)
  APPLY_ADD_CONTRACT: 29, // 子账号申请加入(合同)
  PASS_APPLY_CONTRACT: 30, // 子账号加入申请通过(合同)
  REFUSE_APPLY_CONTRACT: 31 // 子账号加入申请不通过(合同)
}

// =================================================================================================================== //
// ===================================================二期项目新增定义================================================= //
// =================================================================================================================== //

// ====合同状态==== //

export const CONTRACT_AUDIT_STATUS = {
  UNAUDITED: 5, // 2待审
  AUDITED: 7, // 1已审
  REFUSE: 6,  // 0拒绝
}

// ====子账号合同审核状态 //

export const USERPROJECTSTATUS = {
  FAIL: 0,
  SUCCESS: 1,
  UNTREATED: 2,
  NO_JOINED: 3
}

export const USERPROJECTSTATUSSCRIPT = {
  [USERPROJECTSTATUS.FAIL]: '主账号已拒绝',
  [USERPROJECTSTATUS.SUCCESS]: '审核通过',
  [USERPROJECTSTATUS.UNTREATED]: '待主账号确认',
  [USERPROJECTSTATUS.NO_JOINED]: '未加入合同'
}

export const USERPROJECTSTATUSCONFIG = {
  [USERPROJECTSTATUS.FAIL]: {
    word: USERPROJECTSTATUSSCRIPT[USERPROJECTSTATUS.FAIL],
    color: "red"
  },
  [USERPROJECTSTATUS.SUCCESS]: {
    word: USERPROJECTSTATUSSCRIPT[USERPROJECTSTATUS.SUCCESS],
    color: "green"
  },
  [USERPROJECTSTATUS.UNTREATED]: {
    word: USERPROJECTSTATUSSCRIPT[USERPROJECTSTATUS.UNTREATED],
    color: "orange"
  },
  [USERPROJECTSTATUS.NO_JOINED]: {
    word: USERPROJECTSTATUSSCRIPT[USERPROJECTSTATUS.NO_JOINED],
    color: "orange"
  },
}
