import React, { Component } from 'react'
import { Card, WingBlank, WhiteSpace, List } from 'antd-mobile';

export default class DeliveryItem extends Component{
  render(){
    const {item:{deliveryName,deliveryAddress,contactPhone,contactName,receivingNum,categoryName,goodsName,goodsUnitCN}} =this.props
    return(
      <List>
        <List.Item><span style={{color:'#333333'}}>{deliveryName}</span></List.Item>
        <List.Item>{deliveryAddress}</List.Item>
        <List.Item extra={<span style={{color:'gray'}} >{contactPhone}</span>} >{contactName}</List.Item>
        <List.Item extra={<span style={{color:'gray'}} >{`${receivingNum}${goodsUnitCN}`}</span>} >{`${categoryName}-${goodsName}`}</List.Item>
      </List>
    )
  }
}
