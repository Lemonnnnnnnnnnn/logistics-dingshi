import React, { Component } from 'react';
import { Input } from 'antd';
import { digitUppercase } from '@/utils/utils';

export default class RechargeInput extends Component {

  state = {}

  onChange = (e) => {
    this.props.onChange(e.target.value);
    if (!/^\d+\.?\d{0,2}$/.test(e.target.value)) return this.setState({
      bigPrice: ''
    });
    if (e.target.value <= 0) return this.setState({
      bigPrice: ''
    });
    this.setState({
      bigPrice: digitUppercase(e.target.value)
    });
  }

  render (){
    const { bigPrice } = this.state;
    return (
      [<Input key='1' onChange={this.onChange} />,
        <p key='2' style={this.props.style}>大写金额：{bigPrice}</p>]
    );
  }
}
