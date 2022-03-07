import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import request from '@/utils/request'
import moment from 'moment'

export default formatModel(bindSource({
  name: 'outboundAccount',
  rowKey: 'accountOutboundId',
  url: 'account/outbound',
  getOutboundAccount: params => request.get(`/v1/account/outbound`, { params: { supplierOrganizationId:params.supplierOrganizationIdTab1, offset:params.offset, limit:params.limit } }).then(data => {
    const { items } = data
    items.map(_item => {
      const startTime = _item.outboundStartTime == null ? '' : moment(_item.outboundStartTime).format('YYYY-MM-DD')
      const endTime = _item.outboundEndTime == null ? '' : moment(_item.outboundEndTime).format('YYYY-MM-DD')
      _item.outboundStartAndEndTime = `${startTime}-${endTime}`
      return _item
    })
    return data
  }),
  postOutboundAccount: params => request.post(`/v1/account/outbound`, { data: params })
    .then(data => {
      const { accountOutboundResp } = data
      const startTime = accountOutboundResp.outboundStartTime == null ? '' : moment(accountOutboundResp.outboundStartTime).format('YYYY-MM-DD')
      const endTime = accountOutboundResp.outboundEndTime == null ? '' : moment(accountOutboundResp.outboundEndTime).format('YYYY-MM-DD')
      const createTime = accountOutboundResp.createTime == null ? '' : moment(accountOutboundResp.createTime).format('YYYY-MM-DD HH:mm:ss')
      accountOutboundResp.outboundStartAndEndTime = `${startTime}-${endTime}`
      accountOutboundResp.createTime = createTime
      return data
    }),
  detailOutboundAccount: params => request.get(`/v1/account/outbound/${params.accountOutboundId}`)
    .then(data => {
      const { accountOutboundResp } = data
      const startTime = accountOutboundResp.outboundStartTime == null ? '' : moment(accountOutboundResp.outboundStartTime).format('YYYY-MM-DD')
      const endTime = accountOutboundResp.outboundEndTime == null ? '' : moment(accountOutboundResp.outboundEndTime).format('YYYY-MM-DD')
      const createTime = accountOutboundResp.createTime == null ? '' : moment(accountOutboundResp.createTime).format('YYYY-MM-DD HH:mm:ss')
      accountOutboundResp.outboundStartAndEndTime = `${startTime}-${endTime}`
      accountOutboundResp.createTime = createTime
      return data
    }),
})({
  namespace: 'outboundAccount',
}))

