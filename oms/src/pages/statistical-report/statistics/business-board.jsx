import React, { Component } from 'react';
import CssModule from 'react-css-modules';
import auth from '../../../constants/authCodes';
import Authorized from '../../../utils/Authorized';
import { getAuthority } from '../../../utils/authority';
import styles from './business-board.less';
import BusinessData from './components/business-data';
import OperationRevenue from './components/operation-revenue';
import TransportData from './components/transport-data';

const { BUSINESS_BOARD_BUSINESSDATA, BUSINESS_BOARD_TRANSPORTDATA, BUSINESS_BOARD_OPERATIONREVENUEDATA } = auth;
@CssModule(styles, { allowMultiple: true })
export default class Index extends Component {

  authority = getAuthority()

  constructor (props) {
    super(props);
    const tabs = [
      {
        key: 0,
        title: '运营数据',
        component: <BusinessData />,
        auth:[BUSINESS_BOARD_BUSINESSDATA],
        status: false
      },
      {
        key: 1,
        title: '运单数据',
        component: <TransportData />,
        auth:[BUSINESS_BOARD_TRANSPORTDATA],
        status: false
      },
      {
        key: 2,
        title: '营收数据',
        component: <OperationRevenue />,
        auth:[BUSINESS_BOARD_OPERATIONREVENUEDATA],
        status: false
      },
    ].filter(item => {
      const { auth } = item;
      const check = auth.some(auth => this.authority.indexOf(auth) > -1);
      return check;
    });
    tabs[0].status = true;
    this.state = {
      tabs
    };
  }

  selectTab = e => {
    const { tabs } = this.state;
    const index = e.currentTarget.getAttribute('index');
    tabs.forEach((item) => {
      item.status = false;
    });
    tabs[index].status = true;
    this.setState({
      tabs
    });
  }

  renderTabs = () => {
    const { tabs } = this.state;
    return tabs.map((item => (
      <Authorized authority={item.auth}>
        <div key={item.key} index={item.key} onClick={this.selectTab} styleName={item.status? 'active bolck': 'normal bolck'}>{item.title}</div>
      </Authorized>
    )));
  }

  renderComponent = () => {
    const { tabs } = this.state;
    const index = tabs.findIndex((item) => item.status);
    return tabs[index].component;
  }

  render () {
    return (
      <>
        {this.renderTabs()}
        {this.renderComponent()}
      </>
    );
  }
}
