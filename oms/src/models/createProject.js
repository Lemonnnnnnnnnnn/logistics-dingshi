import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name: 'deliveries',
  addDeliveries: params => request.post('/v1/deliveries', { params }),
  patchDeliveries:params =>request.patch(`/v1/deliveries/${params.deliveryId}`, { data:params }),
  detailDeliveries:params =>request.get(`/v1/deliveries/${params.deliveryId}`)
})({
  namespace: 'deliveries'
}))
