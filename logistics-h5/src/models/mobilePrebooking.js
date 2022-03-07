import moment from 'moment'
import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'
import prebookingService from '@/services/prebookingService'
import { PREBOOKING_STAUTS } from '@/constants/project/project'

export default formatModel(bindSource({
  name: 'mobilePrebooking',
  url: 'prebookings',
  rowKey: 'prebookingId',
  detailMobilePrebooking: params => request.get(`/v1/prebookings/${params.prebookingId}`, { params })
    .then(data => {
      data.acceptanceTime = moment(data.acceptanceTime)
      data.projectId = [data.projectId]
      data.shipmentId = [data.shipmentId]
      return data
    }),
  patchMobilePrebooking: params => {
    if (params.receivingItems && params.deliveryItems) {
      params.receivingItems.map(item => {
        item.prebookingObjectId = item.receivingId
        delete item.deliveryId
        return item
      })
      params.deliveryItems.map(item => {
        item.prebookingObjectId = item.deliveryId
        delete item.receivingId
        return item
      })
    }
    const { prebookingStatus } = params
    switch (prebookingStatus){
      case PREBOOKING_STAUTS.CANCELED:
        return prebookingService.consignmentCancelPrebooking(params)
      case PREBOOKING_STAUTS.REFUSE:
        return prebookingService.shipmentRefusePrebooking(params)
      case PREBOOKING_STAUTS.COMPLETE:
        return prebookingService.consignmentFinishPrebooking(params)
      default:return prebookingService.consignmentPatchPrebooking(params)
    }
  }
})({
  namespace: 'mobilePrebooking'
}))
