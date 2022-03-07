import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import { getCertificationEvents, certificate } from '@/services/apiService'

export default formatModel(bindSource({
  name:'organizations',
  certificateOrganization: params => certificate(params),
  getCertificationEvents: organizationId => getCertificationEvents({ authObjId: organizationId, authObjType: 1 }),
})({
  namespace: 'organizations',
  effects: {
    getCertificationEvents: (organizationId, requests) => requests.getCertificationEvents(organizationId),
    certificateOrganization: (params, requests) => requests.certificateOrganization(params)
  },
  reducers: {
    _getCertificationEventsReduce (state, { payload }) {
      return { ...state, certificationEvents: payload.items }
    }
  }
}))
