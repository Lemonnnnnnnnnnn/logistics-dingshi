import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'
// function createEmptyRow () {
//   return { deliveryId: Math.random() }
// }

export default formatModel(bindSource({
  name: 'projects',
  getShipments: params => request.get(`/v1/consignments/${params.organizationId}/shipments`, { params })
})({
  namespace: 'projects'
}))
