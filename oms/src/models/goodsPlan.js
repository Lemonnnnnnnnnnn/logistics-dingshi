import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'

export default formatModel(bindSource({
  name: 'goodsPlan',
  url:'goodsPlans',
  rowKey:'goodsPlanId',
})({
  namespace: 'goodsPlan',
}))