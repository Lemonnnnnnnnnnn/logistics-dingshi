import moment from 'moment'
import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'


export default formatModel(bindSource({
  name: 'transports',
  detailTransports: params => request.get(`/v1/transports/${params.transportId}`, { params })
    .then(data => {
      data.createTime = moment(data.createTime).format('YYYY/MM/DD HH:mm:ss')
      const time = data.signItems[0].processPointCreateTime===null? '--':moment(data.signItems[0].processPointCreateTime).format('YYYY-MM-DD HH:mm:ss')
      data.processPointCreateTime = time
      data.deliveryItems = data.deliveryItems.map(item=>{
        item.correlationObjectId=item.deliveryId
        return item
      })
      const freightPrice = data.deliveryItems.reduce((total, current)=>total+current.freightPrice, 0)
      data.freightPrice = `${freightPrice}元`
      return data
    }),
  getTransportReject: transportId => request.get(`/v1/transportProcesses/${transportId}/reject`)
})({
  namespace: 'transports',
  effects:{
    getTransportReject: async (transportId, requests) => requests.getTransportReject(transportId)
  },
  reducers: {
    _getTransportRejectReduce (state, { payload }) {
      return {
        ...state,
        transportReject: payload.items
      }
    },
    transportDetail (state, { payload }) {
      return {
        ...state,
        entity: payload
      }
    }
  }
}))
