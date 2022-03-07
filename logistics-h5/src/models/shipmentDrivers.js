import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'

export default formatModel(bindSource({
  name: 'shipmentDrivers',
  url:'shiment/drivers'
})({
  namespace: 'shipmentDrivers'
}))
