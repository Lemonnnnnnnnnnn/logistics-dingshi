import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name: 'accountDetail',
  patchAccountDetail: params => request.patch(`/v1/accountDetail/${params.accountDetailId}`, { data: params })
})({
  namespace: 'accountDetail'
}))
