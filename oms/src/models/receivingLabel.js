import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name:'receivingLabels',
  detailReceivingLabels: params=> request.get(`/v1/receivingLabels/${params.receivingLabelId}`)
})({
  namespace: 'receivingLabels'
}))
