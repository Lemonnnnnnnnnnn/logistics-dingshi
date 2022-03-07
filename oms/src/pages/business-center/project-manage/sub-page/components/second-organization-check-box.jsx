import React, { Component } from 'react';
import { Checkbox } from 'antd';

export default class SecondOrganizationCheckBox extends Component{
  onChange = e => {
    if (e.target.checked) {
      this.props.onChange(4);
    } else {
      this.props.onChange(undefined);
    }
  }

  render () {
    return (
      <div style={{ width: '250px', height: '32px', lineHeight: '32px', paddingLeft: '20px' }}>
        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{this.props.placeholder}</span>
        <Checkbox disabled={this.props.disabled} checked={this.props.value === 4} onChange={this.onChange}>托运</Checkbox>
      </div>
    );
  }
}