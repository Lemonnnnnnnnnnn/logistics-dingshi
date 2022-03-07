import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import { detailGroup } from '@/services/apiService'

export default formatModel(bindSource({
  name:'groups',
  detailGroups: params => detailGroup(params)
})({
  namespace: 'groups'
}))
