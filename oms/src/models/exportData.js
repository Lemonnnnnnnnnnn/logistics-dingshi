import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import { getExportData } from '@/services/apiService'

export default formatModel(bindSource({
  name: 'exportData',
  rowKey: 'exportDataId',
  getExportData: params => getExportData(params)
})({
  namespace: 'exportData',
  effects: {
    getExportData: (params, requests) => requests.getExportData(params)
  },
  reducers: {
    _getExportDataReduce (state, { payload }) {
      return { ...state, exportData: payload.items, count: payload.count }
    }
  }
}))
