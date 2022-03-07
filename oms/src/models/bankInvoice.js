import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'

export default formatModel(bindSource({
  name: 'bankAccount',
  rowKey:'bankAccountId'
})({
  namespace: 'bankAccount',
}))
