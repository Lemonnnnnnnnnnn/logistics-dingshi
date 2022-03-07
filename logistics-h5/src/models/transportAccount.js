import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name: 'transportAccount',
  rowKey: 'accountTransportId',
  url: 'account/transport',
  detailTransportAccount : params => request.get(`/v1/account/transport/${params.accountTransportId}`)
    .then(data=>{
      const newAccountDetailItems = data.accountDetailItems.map(item=>{
        item.projectId = data.projectId
        item.deliveryItems = (item.accountCorrelationCnItems || []).map(deliveryItem=>{
          deliveryItem.transportId = item.transportId
          return deliveryItem
        })
        item.chargeMode = item.deliveryItems[0].chargeMode
        delete item.accountCorrelationCnItems
        return item
      })
      data.accountDetailItems = newAccountDetailItems
      return data
    })
})({
  namespace: 'transportAccount'
}))
