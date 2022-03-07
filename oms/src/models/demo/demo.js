import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name: 'deliveries',
  getOrganizations: params => request.get(`/v1/organizations`, { params })
})({
  namespace: 'xxx',
  effects: {
    getOrganizations: (params, requests) => requests.getOrganizations(params)
  },
  reducers: {
    _getOrganizationsReduce (state, { payload }) {
      return { ...state, getOrganizations: payload.items }
    }
  }
}))