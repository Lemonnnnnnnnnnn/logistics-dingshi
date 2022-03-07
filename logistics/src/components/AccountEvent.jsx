import React, { Component } from 'react';
import { Timeline } from 'antd';
import moment from 'moment';
// import { getAccountEvent } from '@/services/apiService';
import { isFunction } from "@/utils/utils";

class AccountEvent extends Component {

  state = {
    data: [],
    ready: false
  }

  componentDidMount () {
    const { func, params  } = this.props;
    if (isFunction(func)){
      func(params).then((data) => {
        this.setState({
          ready: true,
          data
        });
      });
    }
  }

  renderPrebookingEvent = (item, index) => {
    const { eventDist, type = 'transportAccount' } = this.props;
    const { nickName, organizationName, eventStatus, oddNumbers, eventDetail, createTime } = item;

    const itemConfig = eventDist[eventStatus] || { color:'red', text:'未定义事件' };

    if (type === 'transportAccount'){
      return (
        <Timeline.Item key={index} color={itemConfig.color}>
          <>
            <div className="color-gray">{moment(createTime).format('YYYY-MM-DD HH:mm')}</div>
            <div>{`${nickName}(${organizationName})${itemConfig.text}`}</div>
            <div>{`${eventStatus === 3? '运单单号': '对账单号'}：${oddNumbers}`}</div>
            <div>备注：{eventDetail}</div>
          </>
        </Timeline.Item>
      );
    }

    if (type === 'goodsAccount'){
      return (
        <Timeline.Item key={index} color={itemConfig.color}>
          <>
            <div className="color-gray">{moment(createTime).format('YYYY-MM-DD HH:mm')}</div>
            <div>{`${nickName}(${organizationName})${itemConfig.text}`}</div>
            <div>对账单号：{oddNumbers}</div>
            <div>备注：{eventDetail}</div>
          </>
        </Timeline.Item>
      );
    }

  }

  render () {
    const { data, ready } = this.state;
    return (
      ready &&
      <Timeline>
        {data.map(this.renderPrebookingEvent)}
      </Timeline>
    );
  }
}

export default AccountEvent;
