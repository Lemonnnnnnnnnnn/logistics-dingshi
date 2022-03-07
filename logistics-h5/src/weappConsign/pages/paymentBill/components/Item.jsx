import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Toast, Steps } from 'antd-mobile'
import router from 'umi/router'
import copyable from '@/assets/driver/copyable.png'
import styles from './item.less'

const { Step } = Steps

@CSSModules(styles, { allowMultiple: true })
export default class DetailItem extends Component{
  state = {
    isCopy: true
  }

  constructor (props) {
    super(props)
    this.item = {
      label: '付款单号',
      content: this.props.item.orderNo,
    }
  }

  onCopy = () => {
    Toast.success('已复制付款单号到剪切板', 1)
    this.setState({
      isCopy: false
    })
  }

  circle = (styleName) => (
    <div styleName='circle_container'>
      <div styleName={styleName} />
    </div>
  )

  renderList = () => {
    const addressArr = this.props.item.consignmentDeliveryEntities.map(item => (
      <Step key={item.deliveryId} title={item.deliveryName} icon={this.circle('green')} description={item.deliveryAddress} />
    ))
    if (!this.props.item.receivingId) return addressArr
    this.props.item.consignmentReceivingEntities.map(item => (
      addressArr.push(<Step key={item.receivingId} title={item.receivingName} icon={this.circle('green')} description={item.receivingAddress} />)
    ))
    return addressArr
  }

  toDetail = () => {
    router.push(`paymentBill/detail?orderId=${this.props.item.orderId}`)
  }

  stop = e => {
    e.stopPropagation()
  }

  getOrderState = () => {
    const { orderState } = this.props.item
    const stateConfig = {
      0:{ tips:'未支付', class:'tab_unpaid' },
      1:{ tips:'未支付', class:'tab_unpaid' },
      2:{ tips:'已支付', class:'tab_paid' },
      3:{ tips:'已作废', class:'tab_cancel' },
      4:{ tips:'未支付', class:'tab_unpaid' },
      5:{ tips:'已支付', class:'tab_paid' },
    }[orderState] || { tips:'未支付', class:'tab_unpaid' }
    return (
      <div styleName={stateConfig.class}>
        {stateConfig.tips}
      </div>
    )
  }

  render () {
    const { isCopy } = this.state
    const { orderNo, createTime, totalFreight, damageCompensation, serviceCharge, orderInternalStatus } = this.props.item
    return (
      <div styleName='container' onClick={this.toDetail}>
        {this.getOrderState()}
        <header>
          <span>付款单号：</span>
          <span>{orderNo}</span>
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
        <Steps className='transports_detail_item_step_colorful'>
          {this.renderList()}
        </Steps>
        <div styleName='line0' />
        <div styleName='dateBox_colorful'>
          {
            createTime? <span>{moment(createTime).format('YYYY/MM/DD HH:mm:ss')}</span>: <span>无</span>
          }
          {orderInternalStatus === 1 ? <span>{`-￥${(Number(totalFreight || 0) + Number(damageCompensation || 0))._toFixed(2)}`}</span>
          :<span>{`-￥${(Number(totalFreight || 0) + Number(damageCompensation || 0) + Number(serviceCharge || 0))._toFixed(2)}`}</span>}

        </div>
      </div>
    )
  }
}
