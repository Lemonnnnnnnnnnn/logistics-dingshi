import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import { getUser, patchUser, postUser } from '@/services/apiService'

const normalUser = 3

export default formatModel(bindSource({
  name: 'users',
  rowKey: 'userId',
  getUsers: params => getUser({ ...params, accountType: normalUser }),
  patchUsers: params => patchUser({ ...params, accountType: normalUser }),
  postUsers: params => postUser({ ...params, accountType: normalUser })
})({
  namespace: 'normalUser'
}))
