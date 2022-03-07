import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name:'receiving',
  url:'receivings',
  patchReceiving:params =>request.patch(`/v1/receivings/${params.receivingId}`, { data:params }),
  detailReceiving:params =>request.get(`/v1/receivings/${params.receivingId}`),
  dataSchema: {
    detail: (originalData) => {
      originalData.signDentryid = originalData.signDentryid ? [ originalData.signDentryid ] : []

      return originalData
    }
  }
})({
  namespace: 'receiving'
}))
