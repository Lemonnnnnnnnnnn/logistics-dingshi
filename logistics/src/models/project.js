import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'

export default formatModel(bindSource({
  name: 'projects',
  detailProjects: params => request.get(`/v1/projects/${params.projectId}`, { params })
    .then(data => {
      data.goodsIds = data.goodsItems.map(item => item.goodsId)
      if (data.isCustomerAudit === 1 ){
        data.receivingItems.forEach(item=>{
          item.customerOrgName = data.customerName
        })
      }
      return data
    })
})({ namespace: 'project' }))
