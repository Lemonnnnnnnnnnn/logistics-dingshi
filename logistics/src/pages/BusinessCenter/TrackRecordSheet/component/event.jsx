import React from 'react';
import { Timeline } from 'antd';
import moment from 'moment';

/**
 * 根据事件状态trajectoryEventStatus 的不同 ， trajectoryEventDetail为不同的信息
 * trajectoryEventStatus  -------   trajectoryEventDetail
 * 1   ----- 单号
 * 2   -----  提货点名称
 * 3   ----- 卸货点名称
 */

const trajectoryEventDict = {
  1: '产生轨迹记录单',
  2: '车辆进入',
  3: '离开',
  4: '轨迹记录单完成'
};

const Event = ({ data }) => {
  const renderAccountEvent = () =>
    data && data.map(item => (
      <Timeline key={item.createTime}>
        <Timeline.Item color="green">
          <p style={{ margin: 0, padding: 0, color: 'rgba(153, 153, 153, 0.65)!important', fontSize: '14px' }}>{moment(item.createTime).format('YYYY-MM-DD HH:mm')}</p>
          <div style={{ margin: 0, padding: 0, color: '#333', fontSize: '14px' }}>【系统自动】【{item.organizationName}】 【{item.createUserName}】{trajectoryEventDict[item.trajectoryEventStatus]}{item.trajectoryEventDetail}</div>
        </Timeline.Item>
      </Timeline>
    ))
    ;


  return (
    <div>
      {renderAccountEvent() || []}
    </div>
  );
};

export default Event;
