import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import { getAccountBalance, getAccountReconciliationApi } from '@/services/apiService'

export default formatModel(bindSource({
  name: 'accountReconciliation',
  rowKey: 'reconciliationId',
  getAccountBalance: (params) => getAccountBalance(params),
  getAccountReconciliationApi: (params) => getAccountReconciliationApi(params)
})({
  namespace: 'accountReconciliation',
  effects: {
    getAccountReconciliation: (params, requests) => params.accountType === 4? requests.getAccountBalance(params): requests.getAccountReconciliationApi(params)
  },
  reducers: {
    _getAccountReconciliationReduce (state, { payload }) {
      return { ...state, items: payload.items, count: payload.count }
    }
  }
}))
