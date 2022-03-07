import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name: 'goodsAccount',
  rowKey: 'accountGoodsId',
  url: 'account/goods',
  // patchGoodsAccount: params => request.patch(`/v1/account/${params.type}/${params.accountGoodsId}`, { data: params }),
  detailGoodsAccount : params => request.get(`/v1/account/goods/${params.accountGoodsId}`)
    .then(data=>{
      data.accountDetailItems = data.accountDetailItems && data.accountDetailItems.map(item => {
        item.projectId = data.projectId
        item.deliveryItems = item.accountCorrelationCnItems.map(deliveryItem => {
          deliveryItem.transportId = item.transportId
          return deliveryItem
        })
        delete item.accountCorrelationCnItems
        return item
      })
      return data
    })
})({
  namespace: 'goodsAccount'
}))
