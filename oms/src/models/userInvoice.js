import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import { getUserInvoice, patchUserInvoice } from '@/services/apiService'

export default formatModel(bindSource({
  name:'userInvoice',
  detailUserInvoice: () => getUserInvoice(),
  patchUserInvoice: (params) => patchUserInvoice(params)
})({
  namespace: 'userInvoice',
  effects: {
    patchUserInvoice: (params, requests) => requests.patchUserInvoice(params)
  },
  reducers: {
    _patchUserInvoiceReduce (state, { payload }) {
      return { ...state, entity: { logisticsUserInvoiceEntity: payload } }
    }
  }
}))