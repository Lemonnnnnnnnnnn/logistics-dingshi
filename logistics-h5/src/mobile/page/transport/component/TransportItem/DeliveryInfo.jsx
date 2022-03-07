import React, { Component } from 'react'

export default class DeliveryItem extends Component {
  renderDeliveryName = () => {
    const { item: { deliveryItems = [] } } = this.props

    return (deliveryItems || []).map(item => item.deliveryName).join(',')
  }

  goodsInfoString = () => {
    const { item: { deliveryItems = [] } } = this.props
    const goodsInfo = (deliveryItems || []).map(({ goodsName, categoryName, goodsNum, goodsUnitCN, deliveryNum, deliveryUnitCN, receivingNum, receivingUnitCN }, index) =>
      <li key={index}>
        {`${categoryName}-${goodsName}: 计划${goodsNum}${goodsUnitCN}
        / 实提${deliveryNum === null ? '--' : deliveryNum}${deliveryUnitCN === null ? '' : deliveryUnitCN}
        / 实收${receivingNum === null ? '--' : receivingNum}${receivingUnitCN === null ? '' : receivingUnitCN}`}
      </li>)

    return (
      <ul style={{ padding: '8px' }}>
        {goodsInfo}
      </ul>
    )
  }

  render () {
    return (
      <>
        <div style={{ color: '#333333', fontSize: '16px', lineHeight: '1.2em', paddingLeft: '8px' }}>{this.renderDeliveryName()}</div>
        <div style={{ color: 'gray', fontSize: '13px' }}>{this.goodsInfoString()}</div>
      </>
    )
  }
}
