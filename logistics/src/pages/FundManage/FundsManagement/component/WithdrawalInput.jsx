import React, { Component } from 'react';
import { Input } from 'antd'
import { isFunction } from '@/utils/utils'

class WithdrawalInput extends Component {

  inputChange = (e) => {
    const { value } = e.target
    const { onChange } = this.props
    isFunction(onChange) && onChange(value)
  }

  allIn = () => {
    const { maxMoney=0 } = this.props
    const { setFieldsValue } = this.props.form
    setFieldsValue({ transferAmount: maxMoney })
  }

  render () {
    const { maxMoney=0, value } = this.props
    return (
      <Input size="large" onChange={this.inputChange} value={value} placeholder={`可提现金额${Number(maxMoney || 0).toFixed(2)._toFixed(2)}元`} addonAfter={<div style={{ cursor: 'pointer' }} onClick={this.allIn}>全部提现</div>} />
    );
  }
}

export default WithdrawalInput;
