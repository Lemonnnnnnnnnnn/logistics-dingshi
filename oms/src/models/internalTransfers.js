import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import { getPlatformVirtualAccount } from '@/services/apiService'

export default formatModel(bindSource({
  name:'internalTransfers',
  getPlatformVirtualAccount
})({
  namespace: 'internalTransfers',

  effects:{
    getPlatformVirtualAccount: async (params, requests) => requests.getPlatformVirtualAccount(params),
  },

  reducers:{
    _getPlatformVirtualAccountReduce (state, { payload }) {
      return {
        ...state,
        platformVirtualAccount: payload.logisticsVirtualAccountEntities
      }
    },
  }
}))
