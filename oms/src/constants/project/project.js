export const PROJECT_AUDIT_STATUS = {
  UNAUDITED: 2, // 2待审
  AUDITED: 1, // 1已审
  REFUSE: 0,  // 0拒绝
  SHIPMENT_UNAUDITED: 3, // 3承运待审核
  SHIPMENT_REFUSE: 4, // 4承运已拒绝
  CUSTOMER_UNAUDITED: 5, // 客户待审
  CUSTOMER_REFUSE: 6, // 客户拒绝
  CUSTOMER_AUDITED: 7 // 客户审核通过（托运待审）
};

export const SHIPMENT_AUDIT_STATUS = {
  REFUSE:0,
  ACCEPT:1,
  UNAUDITED:2
};

export const IS_FORBID = {
  ENABLE: 1, // 1启用
  DISABLE: 0 // 0禁用
};

export const IS_AVAILABLE = {
  ENABLE: true, // 1启用
  DISABLE: false // 0禁用
};

export const CHARGE_MODE = {
  DELIVERY: 1, // 提货重量
  RECEIVING: 2 // 卸货重量
};

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
};

export const CONSIGNMENT_TYPE = {
  DIRECT_DELIVERY: 0, // 0直接发货
  AGENCY_DELIVERY: 1 // 1代理发货
};

export const ORGANIZATION_TYPE = {
  IS_PLATFORM: 0, // 平台
  NOT_PLATFORM: 1  // 非平台
};

export const PREBOOKING_STAUTS = {
  UNCERTAINTY: 0, // 待确定,
  UNCOMPLETED: 1, // 调度中
  COMPLETE: 2, // 调度完成
  REFUSE: 3,  // 3拒绝
  CANCELED: 4, // 已取消
  WHOLE_COMPLETE:5 // 整体完成
};

export const CARDLIST_CONTENT_TYPE = {
  PREBOOKING: 'prebooking',
  TRANSPORT: 'transport'
};

export const PREBOOKING_EVENT_STATUS = {
  PUBLISHED: 0, // 发布预约单
  ACCEPT_TIME_OUT: 1, // 接单超时
  ACCEPTED: 2, // 已接单
  REFUSED: 3, // 已拒绝
  START_DISPATCH: 4, // 开始调度
  DISPATCHED: 5, // 调度完成
  AUTO_DISPATCHED: 6, // 自动完成
  CANCELED: 7 // 已取消
};

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
  DRIVER_APPLY_ACCEPT:34, // 司机申请
  SHIPMENT_MODIFY_RECEIVING:35, // 承运修改卸货点
};

export const ISEFFECT = 1;

export const TRANSPORT_STATUS = {
  TRANSPORT_UNTREATED: 1, // 待处理
  TRANSPORT_TRANSPORTING: 2, // 运输中
  TRANSPORT_TRANSPORTED: 3, // 运输完成
  TRANSPORT_FINISH: 9, // 结束
  TRANSPORT_SHIPMENT_UNTREATED: 4, // 待确认
  TRANSPORT_DELIVERY_UNTREATED: 5, // 提货待审核
};

export const PROCESS_STATUS = {
  PROCESS_INITIALIZATION: 0, // 初始化
  PROCESS_ACCEPT: 1, // 接受
  PROCESS_DELIVERY: 2, // 装货
  PROCESS_RECEIVING: 3, // 卸货
  PROCESS_SIGNED: 4, // 签收
  PROCESS_START_WORKING: 5, // 执行任务
  PROCESS_RESIGNED: 6, // 签收
};

export const EXECPTION_STATUS = {
  EXECPTION_INITIALIZATION: 0, // 初始化
  EXECPTION_UNAUDITED: 1, // 待审核
  EXECPTION_REFUSE: 2, // 审批未通过
  EXECPTION_AUDITED: 3 // 审批通过
};

export const SHIPMENT_RECEIPT_STATUS = {
  SHIPMENT_RECEIPT_INITIALIZATION: 0, // 初始化
  SHIPMENT_RECEIPT_UNAUDITED: 1, // 待审核
  SHIPMENT_RECEIPT_REFUSE: 2, // 审批未通过
  SHIPMENT_RECEIPT_AUDITED: 3 // 审批通过
};

export const CONSIGNMENT_RECEIPT_STATUS = {
  CONSIGNMENT_RECEIPT_INITIALIZATION: 0, // 初始化
  CONSIGNMENT_RECEIPT_UNAUDITED: 1, // 待审核
  CONSIGNMENT_RECEIPT_REFUSE: 2, // 审批未通过
  CONSIGNMENT_RECEIPT_AUDITED: 3 // 审批通过
};

export const IS_EFFECTIVE_STATUS = {
  IS_EFFECTIVE_DELETE: 0, // 删除
  IS_EFFECTIVE_NORMAL: 1, // 正常
  IS_EFFECTIVE_TRANSPORT_REFUSE: -1, // 运单拒绝
  IS_EFFECTIVE_EXECPTION_TRANSPORT: -2, // 异常运单
};

export const SHIPMENT_REJECT_STATUS = {
  SHIPMENT_REJECT_INITIALIZATION: 0, // 初始化
  SHIPMENT_REJECT_DELIVERY: 1, // 提货单未通过
  SHIPMENT_REJECT_RECEIVING: 2, // 卸货单未通过
  SHIPMENT_REJECT_ALL: 3, // 全部未通过
};

export const CONSIGNMENT_REJECT_STATUS = {
  CONSIGNMENT_REJECT_INITIALIZATION: 0, // 初始化
  CONSIGNMENT_REJECT_DELIVERY: 1, // 提货单未通过
  CONSIGNMENT_REJECT_RECEIVING: 2, // 卸货单未通过
  CONSIGNMENT_REJECT_ALL: 3, // 全部未通过
};

export const ACCOUNT_STATUS = {
  DISACCOUNT:1,
  ACCOUNTED:2
};

export const ACCOUNT_LIST_STATUS = {
  UNAUDITED:1, // 待审核
  AUDITED:2, // 审核完成
  AUDITING:3, // 审核中
  REFUSE:4, // 审核不通过
  CANCEL:5, // 作废
  NOT_HANDLE:6 // 待提交
};

export const TRANSPORT_ACCOUNT_LIST_STATUS = {
  UNAUDITED:1, // 待审核
  AUDITED:2, // 已审核
  REFUSE:4, // 已拒绝
  CANCEL:5, // 作废
  NOT_HANDLE:6, // 待提交
  SHIPMENT_UNAUDITED : 7, // 本级承运待审
};

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
  SHIPMENT_UNAUDITED:13, // 承运待审核
  ACCEPT_UNTREATED: 14, // 接单待确认
  DELIVERY_UNTREATED: 15, // 提货待审核
  DELIVERY_REFUSE: 16, // 提货已拒绝
};

export const TRANSPORT_IMMEDIATE_STATUS = {
  UNTREATED: { key : 0, value : 1 }, // 未接单
  ACCEPT: { key :  1, value : 2 }, // 已接单
  DRIVER_REFUSE: { key : 2, value : 13 }, // 司机拒绝
  CANCEL: { key :3, value : '19,18,3' }, // 已取消
  CONSIGNMENT_REFUSE: { key :4, value : 10 }, // 托运拒绝
  COMPLETE: { key: 5, value : 4 }, // 已完成
  SHIPMENT_REFUSE: { key :6, value :8 }, // 客户已拒绝
  UNDELIVERY: { key :7, value : 5 }, // 待提货
  TRANSPORTING: { key : 8, value : 7 }, // 运输中
  RECEIVED: { key :9, value : 6 }, // 已到站
  SIGNED: { key :10, value : 16 }, // 已签收
  SHIPMENT_UNAUDITED: { key : 13, value : 11 }, // 承运待审核
  TRANSPORT_EXECPTION: { key :11, value : 14 }, // 运单异常
  ACCEPT_UNTREATED: { key :14, value : 17 }, // 接单待确认
  DELIVERY_UNTREATED: { key : 15, value : 21 }, // 提货待审核
  DELIVERY_REFUSE: { key :16, value : 22 }, // 提货已拒绝
};

export const TRANSPORT_STATUS_OPTIONS = [
  {
    key: TRANSPORT_IMMEDIATE_STATUS.UNTREATED.key,
    value: TRANSPORT_IMMEDIATE_STATUS.UNTREATED.value,
    title: '未接单'
  }, {
    key: TRANSPORT_IMMEDIATE_STATUS.ACCEPT.key,
    value: TRANSPORT_IMMEDIATE_STATUS.ACCEPT.value,
    title: '已接单'
  }, {
    key: TRANSPORT_IMMEDIATE_STATUS.DRIVER_REFUSE.key,
    value: TRANSPORT_IMMEDIATE_STATUS.DRIVER_REFUSE.value,
    title: '司机拒绝'
  }, {
    key: TRANSPORT_IMMEDIATE_STATUS.CANCEL.key,
    value: TRANSPORT_IMMEDIATE_STATUS.CANCEL.value,
    title: '已作废'
  }, {
    key: TRANSPORT_IMMEDIATE_STATUS.CONSIGNMENT_REFUSE.key,
    value: TRANSPORT_IMMEDIATE_STATUS.CONSIGNMENT_REFUSE.value,
    title: '托运已拒绝'
  }, {
    key: TRANSPORT_IMMEDIATE_STATUS.COMPLETE.key,
    value: TRANSPORT_IMMEDIATE_STATUS.COMPLETE.value,
    title: '已完成'
  }, {
    key: TRANSPORT_IMMEDIATE_STATUS.SHIPMENT_REFUSE.key,
    value: TRANSPORT_IMMEDIATE_STATUS.SHIPMENT_REFUSE.value,
    title: '承运已拒绝'
  }, {
    key: TRANSPORT_IMMEDIATE_STATUS.UNDELIVERY.key,
    value: TRANSPORT_IMMEDIATE_STATUS.UNDELIVERY.value,
    title: '待提货'
  }, {
    key: TRANSPORT_IMMEDIATE_STATUS.TRANSPORTING.key,
    value: TRANSPORT_IMMEDIATE_STATUS.TRANSPORTING.value,
    title: '运输中'
  }, {
    key: TRANSPORT_IMMEDIATE_STATUS.RECEIVED.key,
    value: TRANSPORT_IMMEDIATE_STATUS.RECEIVED.value,
    title: '已到站'
  }, {
    key: TRANSPORT_IMMEDIATE_STATUS.SIGNED.key,
    value: TRANSPORT_IMMEDIATE_STATUS.SIGNED.value,
    title: '托运待审核'
  }, {
    key: TRANSPORT_IMMEDIATE_STATUS.SHIPMENT_UNAUDITED.key,
    value: TRANSPORT_IMMEDIATE_STATUS.SHIPMENT_UNAUDITED.value,
    title: '承运待审核'
  }, {
    key: TRANSPORT_IMMEDIATE_STATUS.TRANSPORT_EXECPTION.key,
    value: TRANSPORT_IMMEDIATE_STATUS.TRANSPORT_EXECPTION.value,
    title: '运单异常'
  },
  {
    key: TRANSPORT_IMMEDIATE_STATUS.ACCEPT_UNTREATED.key,
    value: TRANSPORT_IMMEDIATE_STATUS.ACCEPT_UNTREATED.value,
    title: '接单待确认'
  },
  {
    key: TRANSPORT_IMMEDIATE_STATUS.DELIVERY_UNTREATED.key,
    value: TRANSPORT_IMMEDIATE_STATUS.DELIVERY_UNTREATED.value,
    title: '提货待审核'
  },
  {
    key: TRANSPORT_IMMEDIATE_STATUS.DELIVERY_REFUSE.key,
    value: TRANSPORT_IMMEDIATE_STATUS.DELIVERY_REFUSE.value,
    title: '提货已拒绝'
  }
];

// TRANSPORT_STATUS, PROCESS_STATUS, EXECPTION_STATUS, SHIPMENT_RECEIPT_STATUS, CONSIGNMENT_RECEIPT_STATUS, IS_EFFECTIVE_STATUS, TRANSPORT_FINAL_STATUS
export const SEPARATE_TRANSPORT_STAUTS = {
  [TRANSPORT_FINAL_STATUS.UNTREATED]: {
    transportImmediateStatus:1
  },
  [TRANSPORT_FINAL_STATUS.ACCEPT]: {
    transportImmediateStatus:2
  },
  [TRANSPORT_FINAL_STATUS.DRIVER_REFUSE]: {
    transportImmediateStatus:13
  },
  [TRANSPORT_FINAL_STATUS.CANCEL]: {
    transportImmediateStatus:'19,18,3'
  },
  [TRANSPORT_FINAL_STATUS.CONSIGNMENT_REFUSE]: {
    transportImmediateStatus:10
  },
  [TRANSPORT_FINAL_STATUS.COMPLETE]: {
    transportImmediateStatus:4
  },
  [TRANSPORT_FINAL_STATUS.SHIPMENT_REFUSE]: {
    transportImmediateStatus:8
  },
  [TRANSPORT_FINAL_STATUS.UNDELIVERY]: {
    transportImmediateStatus:5
  },
  [TRANSPORT_FINAL_STATUS.TRANSPORTING]: {
    transportImmediateStatus:7
  },
  [TRANSPORT_FINAL_STATUS.RECEIVED]: {
    transportImmediateStatus:6
  },
  [TRANSPORT_FINAL_STATUS.SIGNED]:{
    transportImmediateStatus:16
  },
  [TRANSPORT_FINAL_STATUS.SHIPMENT_UNAUDITED]: {
    transportImmediateStatus:11
  },
  [TRANSPORT_FINAL_STATUS.TRANSPORT_EXECPTION]: {
    transportImmediateStatus:14
  },
  [TRANSPORT_FINAL_STATUS.ACCEPT_UNTREATED]: {
    transportImmediateStatus:17
  },
  [TRANSPORT_FINAL_STATUS.DELIVERY_UNTREATED]: {
    transportImmediateStatus:21
  },
  [TRANSPORT_FINAL_STATUS.DELIVERY_REFUSE]: {
    transportImmediateStatus:22
  }
};

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
  REFUSE_APPLY_CONTRACT: 31, // 子账号加入申请不通过(合同)
  TRANSFER_BILL_DELIVERY : 32// 实体单据转交
};

export const NETWORK_CONTRACT_LIST_STATUS = {
  DISABLE: 0, // 0禁用
  UNAUDITED: 1, // 1待审核
  AUDITED: 2, // 2已审
  REFUSE: 3,  // 3被拒绝
};

export const NETWORK_ORDER_STATE = {
  FAIL: 0, // 支付失败
  UNPAID: 1, // 未支付
  PROCESSING: 2, // 处理中
  CANCEL: 3, // 已作废
  PARTIALLY_COMPLETED: 4, // 部分已完成
  COMPLETED: 5, // 已完成
};

export const CUSTOMER_TRANSFER_LIST_STATE = {
  UNCONFIRMED: 0, // 待确认
  CONFIRM: 1, // 已确认
  EXPIRE: 2, // 已过期
};

export const UNRECORDED_FUNDS_STATE = {
  UNRECORDED : 0, // 未入账
  RECORDED : 1, // 已入账
  RECORDING : 3, // 入账中
};

export const CONTRACT_TYPE = {
  ACCEPT: 0, // 承运合同
  DISPATCH: 1, // 调度合同
  NETWORK: 2, // 网络货运合同
  FREIGHT_CONTRACT: 3 // 运输合同
};

export const CUSTOMER_TRANSFER_TYPE = {
  OFFLINE: 0, // 线下汇款
  ONLINE: 1, // 线上
  REPLACE: 2, // 代充值
};

export const INVOICES_LIST_STATE = {
  DRAFT: 0, // 草稿
  PENDING: 1, // 待审核
  PROCESSING: 2, // 开票中
  PARTIALLY_DONE: 3, // 部分已开票
  DONE: 4, // 已开票
  REFUSE: 5, // 被拒绝
  CANCEL: 6 // 已作废
};

export const INVOICES_PAID_STATE = {
  UNPAID: 1, // 未支付
  PARTIALLY_PAID: 2, // 部分支付
  PAID: 3, // 已支付
};

export const ORDER_COMPLETE_STATUS = {
  UNCOMPLETE: 0, // 未完成
  COMPLETE: 1 // 完成
};

export const ORDER_INVOICE_STATUS = {
  UNCOMPLETE: 0, // 未开票
  COMPLETE: 1, // 完成
  PENDING: 2, // 开票中
  UNAUDITED : 3, // 待审核
};

export const CONFIGURATION_STATUS = {
  UNNECESSARY: 1, // 无需配置
  UNCOMPLETE: 2, // 待配置
  COMPLETE: 3, // 已配置
};

export const SUPPLEMENT_ORDER_STATUS = {
  FAILED: 0, // 补单失败
  SUCCESS: 1, // 补单成功
  UNCOMMIT: 2, // 未提交
  DETECTION_FAILED: 3, // 校验失败
  MISSING_PICTURE:4, // 图片缺失
};

export const REFUND_OPERATION_TYPE = {
  AUTO: 1, // 自动
  MANUAL: 2 // 手动
};

export const GOOD_UNIT_CN = {
  0: '吨',
  1: '方',
  2: '米',
  3: '根',
  4: '袋',
  5: '张',
  6: '块',
};

export const TRANSACTION_TYPE = {
  1: '充值',
  2: '支付付款单',
  3: '平台手续费',
  4: '支付司机运单',
  5: '退款',
  6: '合伙人提现',
  7: '平台代充值',
  8: '司机提现(微信)',
  9: '平台手工上账',
};

export const TRANSACTION_TYPE_CODE = {
  RECHARGE: 1,
  PAY_PAYMENT: 2,
  SERVICE_CHARGES: 3,
  PAY_DRIVER: 4,
  REFUND: 5,
  PARTNER_WITHDRAW: 6
};

export const TRANSACTION_STATUS = {
  FAILED: 0, // 失败
  SUCCESS: 1, // 成功
  PENDING: 2, // 处理中
  CANCEL: 3, // 撤销
  OVERTIME: 4, // 超时
  AUDITED: 5, // 审核通过
  REFUSED: 6, // 拒绝
};

export const ACCOUNT_TYPE = {
  EXPENDITURE: 1, // 支出
  COLLECTION: 2, // 收款
  INCOME: 3, // 收入
  BALANCE: 4, // 收支平衡
  SUBSTITUTE: 5, // 代收
  WECHAT : 6  // 微信
};

export const ACCOUNT_TYPE_DIST = {
  EXPENDITURE: '支出账号对账', // 支出
  COLLECTION: '收款账号对账', // 收款
  INCOME: '收入账号对账', // 收入
  BALANCE: '收支平衡对账', // 收支平衡
  SUBSTITUTE: '代收账号对账', // 代收
  WECHAT : '微信账号对账'  // 微信
};

export const FLOWING_WATER_TYPE = {
  OK: 1,
  PART_ABNORMAL: 2,
  ALL_ABNORMAL: 3
};

export const ACCOUNT_EVENT_STATUS = {
  ADD: 1,
  REMOVE: 2,
  PASS: 3,
  REJECT: 4,
  PAY_OK: 5,
  PAY_NO: 6,
};

export const CORRELATIONOBJECTTYPE = {
  ACCOUNT: 0,
  PAYMENT: 1,
};

export const CUSTOMER_TRANSACTION_STATUS = {
  RECORDED: 0, // 已入账
  UNRECORDED: 1, // 未入账
};

export const ORDER_INTERNAL_STATUS = {
  NO_NEED_TO_GENERATE: 0, // 不需要生成
  INSIDE: 1, // 内部支付单
  FORMAL: 2, // 正式支付单
  MERGE: 3, // 合并支付单
};
