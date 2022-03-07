import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name:'category',
  url:'goodsCategories',
  patchCategory: params => request.patch(`/v1/goodsCategories/${params.categoryId}`, { data: params }),
})({ namespace: 'category' }))

