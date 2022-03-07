import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name: 'outboundAccountExcel',
  rowKey: 'accountOutboundExcelId',
  url: 'account/outbound/excel',
})({
  namespace: 'outboundAccountExcel',
}))

