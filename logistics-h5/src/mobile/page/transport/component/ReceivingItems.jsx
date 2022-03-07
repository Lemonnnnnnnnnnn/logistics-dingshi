import React, { Component } from 'react'
import { List } from 'antd-mobile';

export default class ReceivingItems extends Component{
  render (){
    const { item:{ receivingAddress, contactName, contactPhone } } =this.props
    const desStyle = { color: '#999', fontSize: '13px' }
    return (
      <List class="list-line">
        <List.Item><span style={desStyle}>{receivingAddress}</span></List.Item>
        <List.Item extra={<span style={desStyle}>{`${contactPhone}`}</span>}><span style={desStyle}>{`${contactName}`}</span></List.Item>
      </List>
    )
  }
}
