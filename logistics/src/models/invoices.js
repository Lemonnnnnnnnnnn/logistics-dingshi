import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'

export default formatModel(bindSource({
  name: 'invoices',
  rowKey: 'invoiceId',
})({
  namespace: 'invoices'
}))