import React, { Component } from 'react';
import { Timeline } from 'antd';
import moment from 'moment';
import CssModule from 'react-css-modules';
import { getAccountEventStatus } from '@/services/project';
import { ACCOUNT_EVENT_STATUS, CORRELATIONOBJECTTYPE } from '@/constants/project/project';
import styles from './style.less';

@CssModule(styles, { allowMultiple: true })
class AccountEvent extends Component {

  constructor (props) {
    super(props);
    const tabs = [
      {
        key: 1,
        type: 1,
        title: '承运对托运',
        status: true
      },
      {
        key: 2,
        type: 2,
        title: '承运对平台',
        status: false
      },
      {
        key: 3,
        type: 3,
        title: '托运对平台',
        status: false
      }
    ];
    this.state = {
      tabs,
      ready: false,
      eventData: []
    };
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    return {
      ...prevState,
      eventData: nextProps.detail.transportAccountEventEntities.filter(item => item.accountOrgType === prevState.tabs.findIndex(item => item.status) + 1).sort((a, b) => b.eventId - a.eventId)
    };
  }

  selectTab = e => {
    const { tabs } = this.state;
    const key = Number(e.currentTarget.getAttribute('index'));
    const newTabs = tabs.map((item) => ({
      ...item,
      status: false
    }));
    newTabs[key - 1].status = true;
    this.setState({
      tabs: newTabs
    });
  }

  renderAccountEvent = () => {
    const { tabs, eventData } = this.state;
    const { type } = tabs.find((item) => item.status);
    const indexData = eventData.filter(item => type === item.accountOrgType);
    return indexData.map(item => {
      const obj = getAccountEventStatus(item.eventStatus, item.correlationObjectType);
      return (
        <Timeline key={item.eventId}>
          <Timeline.Item color={obj.color}>
            <p style={{ margin: 0, padding: 0, color: 'rgba(153, 153, 153, 0.65)!important', fontSize: '14px' }}>{moment(item.createTime).format('YYYY-MM-DD HH:mm')}</p>
            <div style={{ margin: 0, padding: 0, color: '#333', fontSize: '14px' }} key={item.eventId}>{item.createUserName}(操作方){obj.word}</div>
            <p style={{ margin: 0, padding: 0, color: '#333', fontSize: '14px' }}>{item.correlationObjectType === CORRELATIONOBJECTTYPE.ACCOUNT ? '对账单号:' : '付款单:'}&nbsp;{item.correlationObjectNo}</p>
            {this.renderBottom(item)}
          </Timeline.Item>
        </Timeline>
      );
    });
  }

  renderBottom = (item) => {
    if ((item.eventStatus === ACCOUNT_EVENT_STATUS.PAY_OK || item.eventStatus === ACCOUNT_EVENT_STATUS.PAY_NO) && item.correlationObjectType === CORRELATIONOBJECTTYPE.PAYMENT) {
      return <p style={{ margin: 0, padding: 0, color: '#333', fontSize: '14px' }}>运单金额：&nbsp;{item.transportCost}</p>;
    }
    if (item.eventStatus === ACCOUNT_EVENT_STATUS.REJECT && item.correlationObjectType === CORRELATIONOBJECTTYPE.PAYMENT) {
      return <p style={{ margin: 0, padding: 0, color: '#333', fontSize: '14px' }}>备注：&nbsp;{item.eventDetail}</p>;
    }
  }

  renderTabs = () => {
    const { tabs } = this.state;
    return tabs.map((item => (
      <div key={item.key} index={item.key} onClick={this.selectTab} styleName={item.status ? 'active bolck' : 'normal bolck'}>{item.title}</div>
    )));
  }

  render () {
    const { eventData } = this.state;
    return (
      <>
        {this.renderTabs()}
        <Timeline>
          {
            eventData && eventData.length > 0?
              this.renderAccountEvent()
              :
              <h4>暂无事件</h4>
          }
        </Timeline>
      </>
    );
  }
}

export default AccountEvent;
