import React, { Component } from 'react'

export default class ReceivingItem extends Component {
  transportInfoString = () => {
    const { item: { shipmentOrganizationName, driverUserName, plateNumber } } = this.props
    return (
      <ul style={{ padding: '8px' }}>
        <li>{`承运方 ：${shipmentOrganizationName}`}</li>
        <li>{`司机 ：${driverUserName} ${plateNumber}`}</li>
      </ul>
    )
  }

  render() {
    const { item: { receivingName } } = this.props
    return (
      <>
        <div style={{ color: '#333333', fontSize: '16px', lineHeight: '1.2em', paddingLeft: '8px' }}>{receivingName}</div>
        <div style={{ color: 'gray', fontSize: '13px' }}>{this.transportInfoString()}</div>
      </>
    )
  }
}
