import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import { getAllProject } from '@/services/apiService'

export default formatModel(bindSource({
  name:'contracts',
  getAllProject: (params) => getAllProject({ isPermissonSelectAll: true, offset: 0, limit: 10000, projectStatus: 1, isAvailable:true })
})({
  namespace: 'contracts',
  effects: {
    getAllProject: (params, requests) => requests.getAllProject()
  },
  reducers: {
    _getAllProjectReduce (state, { payload }) {
      return { ...state, project: payload.items }
    }
  }
}))