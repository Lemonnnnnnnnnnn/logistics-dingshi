import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'

export default formatModel(bindSource({
  name:'dispatch',
  url:'projects/{:projectId}/shipments'
})({
  namespace: 'dispatch'
}))
