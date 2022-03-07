import React, { Component } from 'react'
import { Card, Icon } from 'antd-mobile'
import router from 'umi/router'
import styles from './TransportInformCard.css'

const fieldNameConfig = {
  'transportNo':'运单号',
  'expectTime':'要求送达时间',
  'supplier':'供货方',
  'driverUserName':'司机',
  'plateNumber':'车牌号',
  'driverUserPhone':'联系电话',

}
export default class TransportInformCard extends Component{
  renderTransportInformItem = (label, content) => {
    const labelStyle = {
      display: 'inline-block',
    }
    const contentStyle = {
      display: 'inline-block',
    }
    return (
      <div key={label}>
        <div style={labelStyle}>
          {fieldNameConfig[label]}：
        </div>
        <div style={contentStyle}>
          {content}
        </div>
      </div>
    )
  }

  goTrackMap = () => {
    router.push('./transportDetail/trackMap')
  }

  render (){
    const { value: transportInform } = this.props
    return (
      <Card>
        <Card.Header title="运单信息" extra={<div onClick={this.goTrackMap}>查看轨迹 <Icon type="right" style={{ verticalAlign: 'middle' }} /></div>} />
        <Card.Body>
          <div className={styles.content}>
            {
              transportInform && Object.keys(transportInform).map( key => this.renderTransportInformItem(key, transportInform[key]))
            }
          </div>
        </Card.Body>
      </Card>
    )
  }
}
