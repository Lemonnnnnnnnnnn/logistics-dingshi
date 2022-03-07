import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'

export default formatModel(bindSource({
  name: 'supplementOrder',
  url:'supplementDetails'
})({
  namespace: 'supplementOrder',
}))