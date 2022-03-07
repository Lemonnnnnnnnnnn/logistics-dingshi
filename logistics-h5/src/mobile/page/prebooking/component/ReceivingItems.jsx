import React, { Component } from 'react'
import { Card, WingBlank, WhiteSpace, List } from 'antd-mobile';

export default class ReceivingItem extends Component{
  render(){
    const {item:{receivingName,receivingAddress,contactPhone,contactName,receivingNum,categoryName,goodsName,goodsUnitCN}} =this.props
    return(
      <List>
        <List.Item><span style={{color:'#333333'}}>{receivingName}</span></List.Item>
        <List.Item>{receivingAddress}</List.Item>
        <List.Item extra={<span style={{color:'gray'}} >{contactPhone}</span>} >{contactName}</List.Item>
        <List.Item extra={<span style={{color:'gray'}} >{`${receivingNum}${goodsUnitCN}`}</span>} >{`${categoryName}-${goodsName}`}</List.Item>
      </List>
    )
  }
}
