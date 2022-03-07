import React, { Component } from 'react'
import { List, Switch } from 'antd-mobile'

class SwitchItem extends Component {
    onHandleChange = (val) => {
      this.props.onChange(val ? 2 : 1)
    }

    render () {
      const { value } = this.props
      return (
        <List>
          <List.Item extra={<Switch checked={value === 2} onChange={this.onHandleChange} />}>
            长期驾驶证
          </List.Item>
        </List>
      );
    }
}

export default SwitchItem