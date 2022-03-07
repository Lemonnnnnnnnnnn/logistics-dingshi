import React, { Component } from 'react';
import { Flex, WingBlank } from 'antd-mobile'
import moment from 'moment';

const mt5 = { marginTop:'8px' }

class IncomeDetailItem extends Component {
  render () {
    const { item: { transactionId, createTime, payerName, payeeAccount, transportNo, transactionAmount, totalTaxes } = {} } = this.props
    return (
      <div key={transactionId} style={{ background:'white', padding:'8px 0', position:'relative' }}>
        <WingBlank>
          <div style={{ fontSize:'15px', color:'black' }}>{moment(createTime).format('YYYY/MM/DD HH:mm')}</div>
          {totalTaxes ? (
            <div style={{ float : 'right', marginTop : '0.5rem' }}>
              <span>其中代扣税费</span>
              <span>￥{totalTaxes}元</span>
            </div>) : null}
          <p style={{ marginTop:'15px', width:'200px' }}>付款方：{payerName}</p>
          <div style={mt5}>收款账号：{payeeAccount}</div>
          <div style={mt5}>运单号：{transportNo}</div>
        </WingBlank>
        <div style={{ fontSize:'16px', fontWeight:'bold', position:'absolute', right:15, top:0 }}>
          收入<span style={{ fontSize:'25px', color:'#70B603' }}>{transactionAmount}</span>元
        </div>
      </div>
    )
  }
}

export default IncomeDetailItem;
