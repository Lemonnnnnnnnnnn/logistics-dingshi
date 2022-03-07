import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
// import request from '@/utils/request'
// import moment from 'moment'


export default formatModel(bindSource({
  name: 'mobileTransport',
  url:'transports/{:type}',
  rowKey:'transportId'
})({
  namespace: 'mobileTransport'
}))
