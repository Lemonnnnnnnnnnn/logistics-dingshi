import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import { getCarByShipment } from '@/services/apiService'

export default formatModel(bindSource({
  name: 'shipmentCars',
  url:'shiment/cars',
  getPlatformAllCars : params => getCarByShipment({ ...params, isAll:true })
})({
  namespace: 'shipmentCars',
  effects: {
    getPlatformAllCars: (params, requests) => requests.getPlatformAllCars(params),
  },
  reducers: {
    _getPlatformAllCarsReduce (state, { payload }) {
      return { ...state, allCars: payload.items }
    }
  }
}))
