import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'

export default formatModel(bindSource({
  name: 'shipmentCars',
  url:'shiment/cars'
})({
  namespace: 'shipmentCars'
}))
