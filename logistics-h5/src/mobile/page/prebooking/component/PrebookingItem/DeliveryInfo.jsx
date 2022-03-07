import React, { Component } from 'react'

export default class DeliveryItem extends Component {

  renderDeliveryName = () => {
    const { item: { deliveryItems = [] } } = this.props
    const deliveryName = deliveryItems.map(item => item.name)

    return deliveryName.join(',')
  }

  render () {
    const { item: { deliveryItems = [] } } = this.props

    return (
      <>
        <div style={{ color: '#333333', fontSize: '16px', lineHeight: '1.2em', paddingLeft: '8px' }}>{this.renderDeliveryName()}</div>
        <div style={{ color: 'gray', fontSize: '13px' }}>
          <ul style={{ padding: '8px' }}>
            {
              deliveryItems.map(({ goodsName, categoryName, receivingNum, goodsUnitCN }, index) =>
                <li key={index}>{`${categoryName}-${goodsName} : ${receivingNum}${goodsUnitCN}`}</li>)
            }
          </ul>
        </div>
      </>
    )
  }
}
