import React, { Component } from 'react';
import { InputNumber } from 'antd'

class NumberInput extends Component {
  render () {
    const { onChange, placeholder='0.00', precision=2 } = this.props
    return (
      <InputNumber style={{ width:'100%' }} precision={precision} placeholder={placeholder} onChange={onChange} />
    );
  }
}

export default NumberInput;
