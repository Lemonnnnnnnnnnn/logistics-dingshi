import React, { Component } from 'react'
import { Checkbox } from 'antd'

class AuditStatusField extends Component {

  state = {
    value:[]
  }

  options = [
    { label: '全部运单', value: 0 },
    { label: '退回运单', value: 2 },
    { label: '新增运单', value: 1 },
    { label: '修改运单', value: 3 },
  ];

  onChange = checkedValue => {
    const { auditStatusChange } = this.props
    auditStatusChange(checkedValue)
    this.setState({
      value:checkedValue,
    })
  }

  resetValue = (value=[]) => {
    this.setState({
      value
    })
  }

  render () {
    const { value } = this.state
    return (
      <Checkbox.Group value={value} options={this.options} onChange={this.onChange} />
    )
  }
}

export default AuditStatusField
