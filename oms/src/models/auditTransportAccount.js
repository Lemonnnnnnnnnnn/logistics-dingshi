import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name: 'auditTransportAccount',
  url: 'account/transport/audit',
  patchAuditTransportAccount: params => request.patch(`/v1/account/transport/audit`, { data : params })
})({
  namespace: 'auditTransportAccount',
}))
