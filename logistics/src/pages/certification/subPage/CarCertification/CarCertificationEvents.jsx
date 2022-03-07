import React from 'react'
import { Timeline } from 'antd'
import moment from 'moment'
import { CREATE, MODIFY, PASSED, REJECT, REGISTER, PADDED_INFO } from '@/constants/certification/certificationStatus'

export default ({ value = [] }) =>
  value.length
    ? (
      <Timeline>
        {
          value.map(({ createTime, eventStatus, nickName, organizationName, eventDetail, phone }) => {
            const msg = {
              [CREATE]: '创建',
              [MODIFY]: '禁用/启用车辆',
              [PASSED]: '审核通过',
              [REJECT]: eventDetail,
              [REGISTER]: '提交审核',
              [PADDED_INFO]: '重新提交'
            }[eventStatus]

            return (
              <Timeline.Item>
                {
                  eventStatus === 4 ?
                    <>
                      <div className="color-gray">{moment(createTime).format('YYYY-MM-DD HH:mm')}</div>
                      <div className="color-red">{`${nickName} 审核拒绝（${organizationName}）拒绝原因：${msg} ${phone}`}</div>
                    </>
                    :
                    <>
                      <div className="color-gray">{moment(createTime).format('YYYY-MM-DD HH:mm')}</div>
                      <div>{`${nickName}${organizationName ? `（${organizationName}）` : ''}${msg || '审核'} ${phone}`}</div>
                    </>
                }
              </Timeline.Item>
            )
          })
        }
      </Timeline>
    )
    : <div>暂无数据</div>
