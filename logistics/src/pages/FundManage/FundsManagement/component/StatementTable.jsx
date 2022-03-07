import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { pick, translatePageType } from '@/utils/utils';
import Table from '@/components/Table/Table';
import model from '@/models/accountStatement';

const { actions } = model;

function mapStateToProps (state) {
  return {
    accountStatement: pick(state.accountStatement, ['items', 'count']),
  };
}

@connect(mapStateToProps, actions, null, { withRef: true })
export default class Index extends React.Component{
  state = {
    nowPage: 1,
    pageSize: 10
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    this.props.statementPageChange({
      offset,
      limit
    });
  }

  render () {
    const { nowPage, pageSize } = this.state;
    const { accountStatement, accountType } = this.props;
    const tableSchema = {
      minWidth: accountType === 4? 2400: 2200,
      variable:true,
      columns: [
        {
          title: '匹配结果',
          dataIndex: 'abnormalAccount',
          fixed:'left',
          width: 100,
          render: (text) => {
            if (text === 1) return <span style={{ color: '#BCDF83' }}>匹配</span>;
            return <span style={{ color: 'red' }}>不匹配</span>;
          }
        },
        {
          title: '交易日期',
          dataIndex: 'transactionTime',
          render: (text) => text? moment(text).format('YYYY/MM/DD HH:mm:ss'): '',
          fixed:'left',
          width:150,
        },
        {
          title: '付款单号',
          dataIndex: 'orderNo',
          fixed:'left',
          width:200,
          visible: accountType === 4
        },
        {
          title: '平台交易流水号',
          dataIndex: 'transactionSerialNumber',
          width:150,
          fixed:'left',
        },
        {
          title: '平台交易类型',
          dataIndex: 'transactionType',
          render: (text) => ({
            1:'货主充值',
            2:'平台充值',
            3:'收款转支付账号',
            4:'收款转收入账号',
            5:'客户申请退款',
            6:'收款转入支付账号',
            7:'收入转入支付账号',
            8:'司机提现',
            9:'货主服务费支出',
            10:'收款转入收入账号',
            11:'货主服务费收入',
            12:'收入转收款账号',
            13:'收入转支付账号',
            14:'收入账号提现',
            15:'承运服务费收入',
            16:'司机服务费收入',
            17:'承运服务费支出',
            18:'司机服务费支出',
            19:'自动退款',
            20:'合伙人提现',
            21:'银行其他收费',
            22:'银行其他收费',
            23:'银行其他收费',
            24:'平台代充值',
            25:'平台支付司机运费',
            // 26:'平台其他费用',
            27:'充值失败-平台代收款',
            28:'退款失败-平台代收款',
            29:'退款失败 - 收款转代收账号',
            30:'平台手工上账-收款转代收账号',
            31 : '平台代收司机运费 - 支付转代收账号',
            32 : '退款失败 - 收款账号转入',
            33 : '平台手工上账-代收转收款账号',
            34 : '代收转微信财付通账号',
            35 : '平台代收司机运费 - 支付账号转入',
            36 : '微信财付通账号 - 代收账号转入',
            37 : '司机提现（微信）',
            38 : 'GPS设备押金收取',
            39 : 'GPS设备押金退回',
            40 : '代扣税费 - 支付账号转入',
            41 : '代扣税费转出 - 代收转税务局账号',
            42 : '代扣税费（出）-支付转代收账号',
            43 : '支付投标保证金(收款到代收)',
            44 : '支付标书费(收款到代收)',
            45 : '投标保证金退回(代收到收款)',
            46 : '标书费退回(代收到收款)',
            47 : '标书费收入(代收到收款)'
          }[text] || '未知类型')
        },
        {
          title: '发起方',
          dataIndex: 'payerName',
        },
        {
          title: '发起方账号',
          dataIndex: 'payerAccount',
        },
        {
          title: '接受方',
          dataIndex: 'payeeName',
        },
        {
          title: '接受方账号',
          dataIndex: 'payeeAccount',
        },
        {
          title: '平台交易金额(元)',
          dataIndex: 'transactionAmountPlatform',
        },
        {
          title: '发起方银行账号',
          dataIndex: 'bankAccount',
        },
        {
          title: '接受方银行账号',
          dataIndex: 'oppositeAccountNo',
        },
        {
          title: '流水类型',
          dataIndex: 'statementType',
          render: (text) => ({
            1: '支出',
            2: '收入',
            3: '退款'
          }[text])
        },
        {
          title: '银行流水号',
          dataIndex: 'bankTransactionNo',
        },
        {
          title: '银行交易金额(元)',
          dataIndex: 'transactionAmountBank',
        },
      ]
    };
    return (
      <Table key={accountType} schema={tableSchema} rowKey="statementId" pagination={{ current: nowPage, pageSize }} onChange={this.onChange} dataSource={accountStatement} />
    );
  }
}
