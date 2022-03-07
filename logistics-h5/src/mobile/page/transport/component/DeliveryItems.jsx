import React, { Component } from 'react'
import { List } from 'antd-mobile';

export default class DeliveryItem extends Component{
  render () {
    const { item: { deliveryAddress, contactPhone,
      contactName, goodsNum, receivingNum, receivingUnitCN,
      categoryName, goodsName, goodsUnitCN,
      deliveryNum, deliveryUnitCN } } =this.props
    const desStyle = { color: '#999', fontSize: '13px' }
    return (
      <List class="list-line">
        <List.Item><span style={desStyle}>{deliveryAddress}</span></List.Item>
        <List.Item extra={<span style={desStyle}>{contactPhone}</span>}><span style={desStyle}>{contactName}</span></List.Item>
        <List.Item extra={<span style={desStyle}>{`${categoryName}-${goodsName}`}</span>}><span style={desStyle}>货品</span></List.Item>
        <List.Item extra={<span style={desStyle}>{`${goodsNum}${goodsUnitCN}`}</span>}><span style={desStyle}>计划重量</span></List.Item>
        <List.Item extra={<span style={desStyle}>{`${deliveryNum===null?'--':deliveryNum}${deliveryUnitCN===null?'':deliveryUnitCN}`}</span>}><span style={desStyle}>实提重量</span></List.Item>
        <List.Item extra={<span style={desStyle}>{`${receivingNum===null?'--':receivingNum}${receivingUnitCN===null?'':receivingUnitCN}`}</span>}><span style={desStyle}>实收重量</span></List.Item>
      </List>
    )
  }
}
