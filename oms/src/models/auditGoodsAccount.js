import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name: 'auditGoodsAccount',
  url: 'account/goods/audit',
  patchAuditGoodsAccount: params => request.patch(`/v1/account/goods/audit`, { data : params })
})({
  namespace: 'auditGoodsAccount'
}))
