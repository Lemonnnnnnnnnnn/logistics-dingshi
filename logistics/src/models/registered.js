import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'
import { SMSCODE_TYPE } from '@/constants/regisetred'

export default formatModel(bindSource({
  name: 'authregister',
  getSmscode: params => request.post(`/authsendsms?phone=${params.phone}&template=${SMSCODE_TYPE[params.type]}&code=${params.code}`, {
    data: {
      code: params.code,
      phone: params.phone,
      template: SMSCODE_TYPE[params.type]
    },
    noAuth: true
  }),
  postAuthregister: data => request.post('/authregister', { data, noAuth: true })
})({ namespace: 'registered' }))
