import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name:'goods',
  rowKey: 'goodsId',
  patchGoods:params =>request.patch(`/v1/goods/${params.goodsId}`, { data:params }),
  detailGoods:params =>request.get(`/v1/goods/${params.goodsId}`),
  dataSchema: {
    get: data => {
      data.items.forEach(item => item._categoryName = item.categoryName)
      return data
    }
  }
})({ namespace: 'goods' }))
