import React from 'react'
import { Checkbox } from 'antd';

export default class CheckBox extends React.Component{
  onChange = val => {
    this.props.onChange(val.join(','))
    this.props.form.setFieldsValue({
      measurementSource: undefined
    })
  }

  render () {
    return (
      <div style={{ display: 'flex', width: '100%' }}>
        <span>{this.props.customLabel}</span>
        <Checkbox.Group options={this.props.options} disabled={this.props.disabled} value={this.props.value? this.props.value.split(',').map(item => Number(item)): []} onChange={this.onChange} />
      </div>
    )
  }
}