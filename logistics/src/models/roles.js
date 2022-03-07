import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import { getRolePermissions } from '@/services/apiService'

export default formatModel(bindSource({
  name: 'roles',
  rowKey: 'roleId',
  getPermissions: roleId => getRolePermissions(roleId)
})({
  namespace: 'roles',
  effects: {
    getPermissions: (roleId, requests) => requests.getPermissions(roleId)
  },
  reducers: {
    _getPermissionsReduce(state, {payload}) {
      return {
        ...state,
        entity: {
          ...state.entity,
          auth: payload.items || []
        }
      }
    }
  }
}))
