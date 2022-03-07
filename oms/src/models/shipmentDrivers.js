import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import { getDriverByShipment } from '@/services/apiService'

export default formatModel(bindSource({
  name: 'shipmentDrivers',
  url:'shiment/drivers',
  getPlatformAllDrivers: params => getDriverByShipment({ ...params, isAll:true })
})({
  namespace: 'shipmentDrivers',
  effects: {
    getPlatformAllDrivers: (params, requests) => requests.getPlatformAllDrivers(params),
  },
  reducers: {
    _getPlatformAllDriversReduce (state, { payload }) {
      return { ...state, allDrivers: payload.items }
    }
  }
}))
