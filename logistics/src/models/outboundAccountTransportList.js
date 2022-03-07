import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'

export default formatModel(bindSource({
  name: 'outboundAccountTransportList',
  rowKey: 'transportCorrelationId',
  url: 'account/outbound/transportList',
})({
  namespace: 'outboundAccountTransportList',
}))

