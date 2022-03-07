import React from 'react'
import { Timeline } from 'antd'
import moment from 'moment'
import { CREATE, MODIFY, PASSED, REJECT, REGISTER, PADDED_INFO } from '@/constants/certification/certificationStatus'

const Item = Timeline.Item

export default ({ value = [] }) => {
  return value.length
    ? (
      <Timeline>
        {
          value.map(({ createTime, eventStatus, nickName, organizationName, eventDetail }) => {
            const msg = {
              [CREATE]: eventDetail,
              [MODIFY]: eventDetail,
              [PASSED]: eventDetail,
              [REJECT]: eventDetail,
              [REGISTER]: eventDetail,
              [PADDED_INFO]: eventDetail
            }[eventStatus]

            return (
              <Timeline.Item>
                <div className="color-gray">{moment(createTime).format('YYYY-MM-DD HH:mm')}</div>
                <div>{`${nickName}（${organizationName}）${msg} PS:无真实数据，消息格式需调整`}</div>
              </Timeline.Item>
            )
          })
        }
      </Timeline>
    )
    : <div>暂无数据</div>
}
