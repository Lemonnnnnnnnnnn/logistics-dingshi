import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'

export default formatModel(bindSource({
  name: 'tradingSchemes',
  url:'tradingSchemes'
})({
  namespace: 'tradingSchemes'
}))