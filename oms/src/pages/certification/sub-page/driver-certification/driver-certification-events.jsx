import React from 'react';
import { Timeline } from 'antd';
import moment from 'moment';
import {
  CREATE,
  MODIFY,
  PASSED,
  REJECT,
  REGISTER,
  PADDED_INFO,
  MODIFY_BANK_ACCOUNT,
} from '../../../../constants/certification/certificationStatus';

export default ({ value = [] }) => value.length
  ? (
    <Timeline>
      {
        value.map(({ createTime, eventStatus, nickName, organizationName, eventDetail, phone }) => {
          const msg = {
            [CREATE]: '创建',
            [MODIFY]: '禁用/启用账号',
            [PASSED]: '审核通过',
            [REJECT]: eventDetail,
            [REGISTER]: '提交审核',
            [PADDED_INFO]: '重新提交',
            [MODIFY_BANK_ACCOUNT]: eventDetail,
          }[eventStatus];

          return (
            <Timeline.Item>
              {
                eventStatus === REJECT &&
                <>
                  <div className='color-gray'>{moment(createTime).format('YYYY-MM-DD HH:mm')}</div>
                  <div className='color-red'>{`${nickName} 审核拒绝（${organizationName}）拒绝原因：${msg} ${phone}`}</div>
                </>
              }
              {
                eventStatus === MODIFY_BANK_ACCOUNT &&
                <>
                  <div className='color-gray'>{moment(createTime).format('YYYY-MM-DD HH:mm')}</div>
                  <div>{msg}</div>
                </>
              }
              {
                (eventStatus === CREATE || eventStatus === MODIFY || eventStatus === PASSED || eventStatus === REGISTER || eventStatus === PADDED_INFO) &&
                <>
                  <div className='color-gray'>{moment(createTime).format('YYYY-MM-DD HH:mm')}</div>
                  <div>{`${nickName}${organizationName ? `（${organizationName}）` : ''}${msg || '审核'} ${phone}`}</div>
                </>
              }
            </Timeline.Item>
          );
        })
      }
    </Timeline>
  )
  : <div>暂无数据</div>
