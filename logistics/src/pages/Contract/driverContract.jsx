import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { connect } from 'dva';
import { getOssImg } from '@/utils/utils';
import moment from 'moment';
import defaultSettings from '@/defaultSettings';

function mapStateToProps(state) {
  return {
    entity: state.drivers.entity,
  };
}

function mapDispatchToProps(dispatch) {
  return ({
    dispatch,
  });
}

@connect(mapStateToProps, mapDispatchToProps)
class DriverContract extends Component {

  render() {
    const domain = window.location.host;
    const {
      entity: {
        driverContractDentryid,
        phone,
        driverContractEventEntities,
        userId,
      },
    } = this.props;
    return (
      <div style={{ margin: '5rem' }}>
        <Row type='flex' justify='center'>
          <Col><p style={{ fontSize: '4rem' }}>承运合同</p></Col>
        </Row>
        <Row type='flex' justify='center'>
          <Col><img src={getOssImg(driverContractDentryid)} alt='暂无合同图片' /></Col>
        </Row>
        {
          driverContractEventEntities &&
          <Row type='flex' justify='center'>
            <Col>
              <div style={{ padding: '5rem' }}>
                <div style={{ padding: '0.5rem 0px' }}>通知手机号：{phone}</div>
                <Row style={{ padding: '0.5rem 0px' }} type='flex' justify='center'>
                  <Col>通知内容：</Col>
                  <Col>
                    <div>【易键达】承运合同已签订成功，若需要查看合同请点击下方的合同地址进入后输入合同码进行查看。</div>
                    <div>
                      合同地址：
                      <a href={(domain === 'localhost:8000' || domain === '47.99.218.209:8003') ? 'https://mobile.51ejd.cn/mobile/contract' : 'https://mobile.51ejd.com/mobile/contract'}>
                        {(domain === 'localhost:8000' || domain === '47.99.218.209:8003') ? 'https://mobile.51ejd.cn/mobile/contract' : 'https://mobile.51ejd.com/mobile/contract'}
                      </a>
                    </div>
                    <div>合同码：{userId}</div>
                    <div>如您对该合同有异议，请电话联系易键达客服4001056156</div>
                  </Col>
                </Row>
                <div style={{ padding: '0.5rem 0px' }}>
                  发送日期：{moment(driverContractEventEntities[0].createTime).format('YYYY-MM-DD HH:mm:ss')}
                </div>
                <div style={{ padding: '0.5rem 0px' }}>
                  <span>发送是否成功：</span>
                  <span style={{
                    background: 'green',
                    color: '#fff',
                    borderRadius: '5px',
                    padding: '5px',
                  }}
                  >{driverContractEventEntities[0].eventDetail}
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        }
      </div>
    );
  }

}

export default DriverContract;
