import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import { certificate } from '@/services/apiService'

export default formatModel(bindSource({
  name: 'organizations',
  certificateShipment: params => certificate(params),
})({
  namespace: 'shipments',
  effects: {
    certificateShipment: (params, requests) => requests.certificateShipment(params)
  }
}))
