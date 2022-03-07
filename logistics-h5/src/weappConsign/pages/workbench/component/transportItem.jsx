import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Toast } from 'antd-mobile'
import router from 'umi/router'
import TransportListInfo from './step'
import styles from './transportItem.less'
import { unitPrice } from '@/utils/utils'
import driverPickUpHeader from '@/assets/driverPickUpHeader.png'
import phoneCall from '@/assets/consign/phoneCall.png'
import copyable from '@/assets/consign/copyable.png'

@CSSModules(styles, { allowMultiple: true })
export default class DetailItem extends Component{

  state = {
    isCopy: true
  }

  item = {
    label: '运单号',
    content: this.props.item.transportNo,
  }

  toDetail = () => {
    router.push(`/WeappConsign/main/staging/transportDetail?transportId=${this.props.item.transportId}`)
  }

  stop = e => {
    e.stopPropagation()
  }

  getTotal = () => {
    const total = this.props.item.deliveryItems.reduce((total, current)=>total+(current.freightPrice || 0), 0).toFixed(2)
    if (total !== 1){
      return `￥${total._toFixed(2)}`
    }
    return <span styleName='no-price'>协商价</span>
  }

  getTransport = () => {
    const { refresh } = this.props
    return refresh()
  }

  toPhoneCall = () => {
    const { item:{ driverPhone } } = this.props
    wx.miniProgram.navigateTo({
      url: `/pages/phoneCall/phoneCall?driverPhone=${driverPhone}`
    })
  }

  onCopy = () => {
    Toast.success('已复制运单号到剪切板', 1)
    this.setState({
      isCopy: false
    })
  }


  render () {
    const { item:{ createTime, driverUserName, plateNumber, transportNo }, type } = this.props
    const { isCopy } = this.state
    return (
      <div styleName='container' onClick={this.toDetail}>
        <header>
          <span>运单号：</span>
          <span>{transportNo}</span>
          {
            isCopy ?
              <div onClick={this.stop}>
                <CopyToClipboard onCopy={this.onCopy} text={this.item.text||this.item.content}>
                  <img src={copyable} alt="图片加载失败" />
                </CopyToClipboard>
              </div>
              :
              null
          }
        </header>
        <div styleName='line' />
        <TransportListInfo item={this.props.item} tab={type} />
        <div style={{ padding: '10px 15px 0 15px' }}>提货时间：{this.props.item.deliveryTime?moment(this.props.item.deliveryTime).format('YYYY-MM-DD HH:mm:ss'):'无'}</div>
        <div styleName='dateBox'>
          <span>{moment(createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
          <span>{unitPrice(this.props.item, 4)}</span>
        </div>
        <div styleName='line' style={{ marginBottom:0 }} />
        <div styleName='driver-box'>
          <div styleName='car_plate_number'>{plateNumber}</div>
          <div styleName='driver-info'>
            <img styleName='driver-head' src={driverPickUpHeader} alt="" />
            <div style={{ marginLeft:'5px' }}>{driverUserName}</div>
          </div>
          <img styleName='phone-call-img' src={phoneCall} alt="" onClick={this.toPhoneCall} />
        </div>
      </div>
    )
  }
}
