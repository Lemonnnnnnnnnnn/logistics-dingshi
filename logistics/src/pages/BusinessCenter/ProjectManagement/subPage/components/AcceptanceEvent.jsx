import React from 'react';
import { Timeline } from "antd";
import moment from 'moment';

export default class AcceptanceEvent extends React.PureComponent{


  renderPrebookingEvent = ({ createUserName, organizationName, createTime, eventDetail }, index) => (
    <Timeline.Item key={index}>
      <>
        <div className="color-gray">{moment(createTime).format('YYYY-MM-DD HH:mm')}</div>
        <div>【{organizationName || ''}】【{createUserName}】: { eventDetail }</div>
      </>
    </Timeline.Item>
  )

  render () {
    const { eventList = [] } = this.props;
    eventList.sort((prev, next) => moment(next.createTime) > moment(prev.createTime) ? 1 : -1);
    return (
      <>
        <Timeline>
          {eventList.map(this.renderPrebookingEvent)}
        </Timeline>
      </>
    );
  }
}
