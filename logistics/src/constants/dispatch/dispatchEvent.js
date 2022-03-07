/**
 * 发布运单
 */
export const PUBLISH = 1

/**
 * 司机接单
 */
export const DRIVER_PICK_UP = 2

/**
 * 司机拒绝
 */
export const REJECT = 3

/**
 * 执行任务
 */
export const RUNNING = 4

/**
 * 装车
 */
export const ENTRUCKING = 5

/**
 * 到站
 */
export const WAIT_UNLOADING = 6

/**
 * 提交异常
 */
export const SUBMIT_EXCEPTION = 7

/**
 * 异常审核通过（取消）
 */
export const EXCEPTION_PASSED = 8

/**
 * 异常审核不通过（忽略）
 */
export const EXCEPTION_REJECT = 9

/**
 * 重新调度
 */
export const RE_DISPATCH = 10

/**
 * 签收
 */
export const RECEIVING = 11

/**
 * 重新签收
 */
export const RE_RECEIVING = 12

/**
 * （承运方）回单审核通过
 */
export const SHIPMENT_RECEIPT_PASSED = 13

/**
 * （承运方）回单审核不通过
 */
export const SHIPMENT_RECEIPT_REJECT = 14

/**
 * （托运方）回单审核通过
 */
export const CONSIGNMENT_RECEIPT_PASSED = 15

/**
 * （托运方）回单审核不通过
 */
export const CONSIGNMENT_RECEIPT_REJECT = 16

/**
 * 承运方修改回单
 */
export const SHIPMENT_MODIFY_RECEIPT = 17


export default {
  PUBLISH,
  DRIVER_PICK_UP,
  REJECT,
  RUNNING,
  ENTRUCKING,
  WAIT_UNLOADING,
  SUBMIT_EXCEPTION,
  EXCEPTION_PASSED,
  EXCEPTION_REJECT,
  RE_DISPATCH,
  RECEIVING,
  RE_RECEIVING,
  SHIPMENT_RECEIPT_PASSED,
  SHIPMENT_RECEIPT_REJECT,
  CONSIGNMENT_RECEIPT_PASSED,
  CONSIGNMENT_RECEIPT_REJECT,
  SHIPMENT_MODIFY_RECEIPT
}
