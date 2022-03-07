import React, { useState, useEffect } from 'react'
import { Divider } from 'antd'
import moment from 'moment'
import { getFeedbackDetail } from '@/services/apiService'
import { typeDist, replyStatus } from '@/constants/feedback/feedback'

const RecordDetail =({ history :{ location :{ query : { feedbackId } } } })=> {
  const [detail, setDetail] = useState({})
  useEffect(()=>{
    getFeedbackDetail({ feedbackId }).then(data=>setDetail(data))
  }, [])

  return <div style={{ padding: '1rem' }}>
    <div>
      <div style={{ fontWeight: 'bold', padding: '1rem 0' }}>{typeDist[detail.feedbackType]}</div>
      <div>{detail.feedbackContent}</div>
      <div style={{ float: 'right', margin :'1rem' }}>{moment(detail.createTime).format('YYYY-MM-DD HH:mm')}</div>
    </div>
    <Divider />
    <div>
      <div style={{ fontWeight: 'bold', padding: '1rem 0' }}>回复内容</div>
      {
        detail.feedbackStatus === replyStatus.REPLY_WAIT && <div>暂无回复，请耐心等待，如您急需解决相关问题，请通过易键达平台客服电话 <span style={{ fontWeight: 'bold' }}> 400-1056156</span>咨询</div>
      }
      {
        detail.feedbackStatus === replyStatus.REPLY_OVER && (
          <div>
            <div>
              {detail.feedbackReplyContent}
            </div>
            <div style={{ float: 'right', margin :'1rem' }}>{moment(detail.feedbackReplyTime).format('YYYY-MM-DD HH:mm')}</div>
          </div>
        )
      }
    </div>
  </div>
}

export default RecordDetail
