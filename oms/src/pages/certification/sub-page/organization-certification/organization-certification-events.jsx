import React from 'react';
import { Timeline } from 'antd';
import moment from 'moment';
import { CREATE, MODIFY, PASSED, REJECT, REGISTER, PADDED_INFO } from '../../../../constants/certification/certificationStatus';

const { Item } = Timeline;

export default ({ value = [] }) => (
  value.length
    ? (
      <Timeline>
        {
          value.map(({ createTime, eventStatus, nickName, organizationName, eventDetail }) => {
            const msg = {
              [CREATE]: '未知',
              [MODIFY]: '禁用/启用账号',
              [PASSED]: '审核通过',
              [REJECT]: '审核拒绝',
              [REGISTER]: '提交审核',
              [PADDED_INFO]: '修改资料'
            }[eventStatus];

            return (
              <Item key={createTime}>
                <div className="color-gray">{moment(createTime).format('YYYY-MM-DD HH:mm')}</div>
                <div>{`${nickName}（${organizationName}）${msg}`}</div>
                {eventDetail&&<div>{`备注:${eventDetail}`}</div>}
              </Item>
            );
          })
        }
      </Timeline>
    )
    : <div>暂无数据</div>
);
