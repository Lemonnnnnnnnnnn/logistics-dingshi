import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'

export default formatModel(bindSource({
  name: 'report',
  url:'consignmentreport'
})({
  namespace: 'report',
}))
