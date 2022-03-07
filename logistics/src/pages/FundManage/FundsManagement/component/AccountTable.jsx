import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { pick, translatePageType } from '@/utils/utils';
import Table from '@/components/Table/Table';
import model from '@/models/accountReconciliation';

const { actions } = model;

function mapStateToProps (state) {
  return {
    accountReconciliation: pick(state.accountReconciliation, ['items', 'count']),
  };
}

@connect(mapStateToProps, actions, null, { withRef: true })
export default class Index extends React.Component{
  state = {
    nowPage: 1,
    pageSize: 5
  }

  tableSchema = {
    minWidth:1500,
    columns: [
      {
        title: '匹配结果',
        dataIndex: 'abnormalAccount',
        render: (text) => {
          if (text === 0) return <span style={{ color: '#BCDF83' }}>匹配</span>;
          return <span style={{ color: 'red' }}>不匹配</span>;
        }
      },
      {
        title: '日期',
        dataIndex: 'createTime',
        render: (text) => text? moment(text).format('YYYY/MM/DD HH:mm:ss'): '',
      },
      {
        title: '平台余额汇总',
        dataIndex: 'virtualBalance',
      },
      {
        title: '银行账户余额',
        dataIndex: 'bankBalance',
      },
    ]
  }

  substituteSchema = {
    minWidth : 1700,
    columns: [
      {
        title: '匹配结果',
        dataIndex: 'abnormalAccount',
        render: (text) => {
          if (text === 0) return <span style={{ color: '#BCDF83' }}>匹配</span>;
          return <span style={{ color: 'red' }}>不匹配</span>;
        }
      },
      {
        title: '日期',
        dataIndex: 'createTime',
        render: (text) => text? moment(text).format('YYYY/MM/DD HH:mm:ss'): '',
      },
      {
        title : '代收平台账号余额',
        dataIndex: 'virtualBalance'
      },
      {
        title :'微信代支付平台余额',
        dataIndex: 'chatVirtualBalance',
      },
      {
        title : '未入账资金平台余额',
        dataIndex: 'unrecordedVirtualBalance'
      },
      {
        title : '代扣税费平台余额',
        dataIndex: 'withholdTaxBalance'
      },
      {
        title : '代收招投标费账户',
        dataIndex: 'tenderFee'
      },
      {
        title : '代收账号银行账户余额',
        dataIndex: 'bankBalance'
      },
    ]
  }

  balanceSchema = {
    minWidth:1700,
    columns: [
      {
        title: '匹配结果',
        dataIndex: 'abnormalAccount',
        render: (text) => {
          if (text === 0) return <span style={{ color: '#BCDF83' }}>匹配</span>;
          return <span style={{ color: 'red' }}>不匹配</span>;
        }
      },
      {
        title: '付款单生成时间',
        dataIndex: 'createTime',
        render: (text) => text? moment(text).format('YYYY/MM/DD HH:mm:ss'): '',
      },
      {
        title: '付款单号',
        dataIndex: 'orderNo',
      },
      {
        title: '收款金额（平台记录）',
        dataIndex: 'expenses',
      },
      {
        title: '司机金额（银行流水）',
        dataIndex: 'transactionAmount',
      },
      {
        title : '外部服务费支出（业务往来）',
        dataIndex: 'shipmentServiceCost'
      },
      {
        title : '税费合计',
        dataIndex:  'totalTax'
      },
      {
        title: '平台收入金额（银行流水）',
        dataIndex: 'platformAmount',
      },
    ]
  }

  wechatSchema = {
    minWidth:1700,
    columns : [
      {
        title: '匹配结果',
        dataIndex: 'abnormalAccount',
        render: (text) => {
          if (text === 0) return <span style={{ color: '#BCDF83' }}>匹配</span>;
          return <span style={{ color: 'red' }}>不匹配</span>;
        }
      },
      {
        title: '日期',
        dataIndex: 'createTime',
        render: (text) => text? moment(text).format('YYYY/MM/DD HH:mm:ss'): '',
      },
      {
        title : '微信平台账号',
        dataIndex: 'virtualBalance',
      },
      {
        title : '微信设备保证金账户',
        dataIndex: 'chatVirtualBalance',
      },
      {
        title : '微信银行账号',
        dataIndex: 'bankBalance',
      },
    ]
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    this.props.surplusPageChange({
      offset,
      limit
    });
  }

  renderTable = () =>{
    const { accountReconciliation, accountType } = this.props;
    const { nowPage, pageSize } = this.state;
    switch (accountType){
      case 'BALANCE' : return <Table key={accountType} schema={this.balanceSchema} rowKey="reconciliationId" pagination={{ current: nowPage, pageSize, showSizeChanger: false }} onChange={this.onChange} dataSource={accountReconciliation} />;
      case 'SUBSTITUTE' : return <Table key={accountType} schema={this.substituteSchema} rowKey="reconciliationId" pagination={{ current: nowPage, pageSize, showSizeChanger: false }} onChange={this.onChange} dataSource={accountReconciliation} />;
      case 'WECHAT' : return <Table key={accountType} schema={this.wechatSchema} rowKey="reconciliationId" pagination={{ current: nowPage, pageSize, showSizeChanger: false }} onChange={this.onChange} dataSource={accountReconciliation} />;
      default : return <Table key={accountType} schema={this.tableSchema} rowKey="reconciliationId" pagination={{ current: nowPage, pageSize, showSizeChanger: false }} onChange={this.onChange} dataSource={accountReconciliation} />;
    }
  }

  render () {
    return (
      <>
        {this.renderTable()}
      </>
    );
  }
}
