import React, { Component } from 'react';
import { connect } from 'dva';
import { Icon } from "antd";
import router from 'umi/router';
import { getUserInfo } from '@/services/user';

function mapStateToProps (state) {
  return {
    transport: state.transports.entity
  };
}

@connect(mapStateToProps)
class Detail extends Component {
  organizationType= getUserInfo().organizationType

  toDetail = () => {
    const { where } = this.props;
    switch (where) {
      case 'driver':
        router.push(`/detailDriver?userId=${this.props.transport.driverUserId}&mode=detail`);
        break;
      case 'license':
        router.push(`/detailCar?carId=${this.props.transport.carId}`);
        break;
      default: return false;
    }
  }

  render () {
    // 付款方机构类型(1.平台;2.运营方;3.货权方;4.托运方;5.承运方;7.供应商;8.客户)
    // 平台、托运、承运都可以跳转
    const { value } = this.props;
    const detailIcon = this.organizationType === 1 || this.organizationType === 4 || this.organizationType === 5 ?
      <>
        <span>{value}</span>
        <Icon type="search" onClick={this.toDetail} style={{ fontSize: '18px', cursor: 'pointer', marginLeft: '20px' }} />
      </>
      :
      <>
        <span>{value}</span>
      </>;
    return detailIcon;
  }
}

export default Detail;