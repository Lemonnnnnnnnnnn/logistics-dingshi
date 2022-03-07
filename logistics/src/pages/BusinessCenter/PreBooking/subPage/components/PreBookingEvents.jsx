import React from 'react';
import { Timeline } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import model from '../../../../../models/preBooking';
import { PREBOOKING_EVENT_STATUS } from '../../../../../constants/project/project';

const { actions: { getPreBookingEvents } } = model;

const mapStateToProps = state => {
  const { events = [] } = state.preBooking;

  events.sort((prev, next) => next.prebookingEventId - prev.prebookingEventId);
  return ({ events });
};

@connect(mapStateToProps, { getPreBookingEvents })
export default class PreBookingEvents extends React.PureComponent {
  componentDidMount () {
    const { getPreBookingEvents, prebookingId } = this.props;

    getPreBookingEvents(prebookingId );
  }

  renderPrebookingEvent = ({ nickName, organizationName, eventStatus, createTime, eventDetail }, index) => {
    // todo 预约单事件与原先不一致？各事件color值？
    const itemConfig = {
      [PREBOOKING_EVENT_STATUS.PUBLISHED]: { color: 'blue', text: '发布预约单' },
      [PREBOOKING_EVENT_STATUS.ACCEPT_TIME_OUT]: { color: 'orange', text: '接单超时' },
      [PREBOOKING_EVENT_STATUS.ACCEPTED]: { color: 'blue', text: '已接单' },
      [PREBOOKING_EVENT_STATUS.REFUSED]: { color: 'red', text: '已拒绝' },
      [PREBOOKING_EVENT_STATUS.START_DISPATCH]: { color: 'orange', text: '开始调度' },
      [PREBOOKING_EVENT_STATUS.DISPATCHED]: { color: 'green', text: '调度完成' },
      [PREBOOKING_EVENT_STATUS.AUTO_DISPATCHED]: { color: 'green', text: '自动完成' },
      [PREBOOKING_EVENT_STATUS.CANCELED]: { color: 'gray', text: '已取消' }
    }[eventStatus]||{ color: 'red', text: 'bug' };
    return (
      <Timeline.Item key={index} color={itemConfig.color}>
        <>
          <div className="color-gray">{moment(createTime).format('YYYY-MM-DD HH:mm')}</div>
          <div>{`${nickName===null?'':nickName} ${organizationName===null?eventDetail:`${organizationName}`} ${itemConfig.text}`}</div>
          {eventStatus === 3 && eventDetail !== undefined && <div style={{ color: 'red', fontWeight: '800' }}>{`理由:${eventDetail}`}</div>}
        </>
      </Timeline.Item>
    );
  }

  render () {
    const { events = [] } = this.props;

    return (
      <Timeline>
        {events.map(this.renderPrebookingEvent)}
      </Timeline>
    );
  }
}
