import React, { Component } from 'react'
import moment from 'moment'

export default class ReceivingItem extends Component {

  renderReceivingName = () => {
    const { item: { receivingItems } } = this.props

    return (receivingItems || []).map(item => item.name).join(',')
  }

  renderReceivingInfo = () => {
    const { item: { acceptanceTime, shipmentName } } = this.props

    return (
      <ul style={{ padding: '8px' }}>
        <li>{`预计送达时间：${moment(acceptanceTime).format('YYYY.MM.DD')}`}</li>
        <li>承运方：{shipmentName}</li>
      </ul>
    )
  }

  render = () => (
    <>
      <div style={{ color: '#333333', fontSize: '16px', lineHeight: '1.2em', paddingLeft: '8px' }}>{this.renderReceivingName()}</div>
      <div style={{ color: 'gray', fontSize: '13px' }}>{this.renderReceivingInfo()}</div>
    </>
  )
}
