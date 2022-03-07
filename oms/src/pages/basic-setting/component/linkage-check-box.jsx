import React from 'react';
import { Checkbox } from 'antd';

export default class LinkageCheckBox extends React.Component{

  state = {
    val:[]
  }

  static getDerivedStateFromProps (props, state) {
    if (props.value) {
      state.val = props.value.split(',').map(item => Number(item));
    } else {
      state.val = [];
    }
    return state;
  }

  onChange = val => {
    this.setState(
      val
    );
    this.props.onChange(val.join(','));
  }

  render () {
    const { val } = this.state;
    return (
      <div style={{ display: 'flex', width: '100%' }}>
        <span>{this.props.customLabel}</span>
        <Checkbox.Group options={this.props.options} disabled={this.props.disabled} value={val} onChange={this.onChange} />
      </div>
    );
  }
}
