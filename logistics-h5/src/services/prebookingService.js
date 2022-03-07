// 预约单类型service
import { patchPrebooking } from './apiService'

// 托运取消预约单
const consignmentCancelPrebooking = params =>patchPrebooking(params)

// 托运修改预约单

const consignmentPatchPrebooking = params =>patchPrebooking(params)

// 托运完结预约单

const consignmentFinishPrebooking = params =>patchPrebooking(params)

// 承运拒绝预约单

const shipmentRefusePrebooking = params =>patchPrebooking(params)

export default {
  shipmentRefusePrebooking,
  consignmentFinishPrebooking,
  consignmentCancelPrebooking,
  consignmentPatchPrebooking
}
