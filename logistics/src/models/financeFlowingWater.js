import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'

export default formatModel(bindSource({
  name:'financeFlowingWater',
  rowKey:'flowingWaterId'
})({
  namespace: 'financeFlowingWater',
  reducers: {
    _patchFinanceFlowingWaterReduce (state, { payload }) {
      const { items } = state
      items.forEach(item => {
        if (item.flowingWaterId === payload.flowingWaterId) {
          item.remarks = payload.remarks
        }
      })
      return {
        ...state,
        items
      }
    },
  }
}))
