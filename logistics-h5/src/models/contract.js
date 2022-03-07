import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import { getContractFromAuthCode } from '@/services/apiService'
// import request from '@/utils/request'

export default formatModel(bindSource({
  name: 'projects',
  rowKey:'projectId',
})({
  namespace: 'project',
  effects:{
    detailProjectsByQrCode: code => getContractFromAuthCode(code)
  },
  reducers: {
    _detailProjectsByQrCodeReduce (state, { payload }) {
      return {
        ...state,
        entity: payload
      }
    }
  }
}))
