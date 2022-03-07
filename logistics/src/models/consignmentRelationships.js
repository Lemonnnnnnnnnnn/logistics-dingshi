import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name: 'consignmentRelationships',
  deleteConsignmentRelationships: params=> request.delete(`/v1/consignmentRelationships/${params.consignmentRelationshipId}`)
})({ namespace: 'consignmentRelationships' }))  // bindSource(dataSource)(model)
// export default formatModel(model)
