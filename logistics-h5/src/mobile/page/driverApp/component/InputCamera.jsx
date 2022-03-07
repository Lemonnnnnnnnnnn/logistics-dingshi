import React, { Component } from 'react';
import { Input } from 'antd'
import { isFunction } from '@/utils/utils'

class InputCamera extends Component {

  onChangeValue = e => {
    const { value } = e.target
    const { onChange } = this.props
    isFunction(onChange) && onChange(value)
  }

  render () {
    return (
      <Input onChange={this.onChangeValue} value={this.props.value} placeholder="请输入银行卡卡号" style={{ width:'75%' }} />
    );
  }
}

export default InputCamera;
