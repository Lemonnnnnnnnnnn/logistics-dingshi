import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import { Steps } from 'antd-mobile'
import router from 'umi/router'
import phoneNoBorder from '@/assets/driver/phone_noBorder.png'
import heading from '@/assets/driver/heading.png'
import styles from './ListItem.less'

const { Step } = Steps

@CSSModules(styles, { allowMultiple: true })
export default class DetailItem extends Component{

  circle = (styleName) => (
    <div styleName='circle_container'>
      <div styleName={styleName} />
    </div>
  )

  renderList = () => {
    const addressArr = this.props.item.deliveryItems.map(item => (
      <Step key={item.deliveryId} title={item.name} icon={this.circle('green')} description={`${item.categoryName}${item.goodsName},预约${item.receivingNum}${item.goodsUnitCN}`} />
    ))
    const receivingAddress = (this.props.item.receivingItems || []).map(item => (
      (<Step key={item.receivingId} title={item.name} icon={this.circle('yellow')} description={`${item.categoryName}${item.goodsName},预约${item.receivingNum}${item.goodsUnitCN}`} />)
    ))
    return [...addressArr, ...receivingAddress]
  }

  takeOrder = e => {
    e.stopPropagation()
    // console.log(this.props.item)
    this.props.takeOrder(this.props.item)
  }

  toDetail = () => {
    router.push(`/WeappDriver/prebookingDetail?prebookingId=${this.props.item.prebookingId}`)
  }

  unitPrice = () => {
    const { item } = this.props
    let price = item.maximumShippingPrice
    if (!item.logisticsTradingSchemeEntity) return price.toFixed(2)._toFixed(2)
    if (item.shipmentType === 0) {
      price *= (1 - (item.logisticsTradingSchemeEntity.shipmentServiceRate))
      if (item.logisticsTradingSchemeEntity.driverServiceStandard === 3) return price
      price *= (1 - (item.logisticsTradingSchemeEntity.driverServiceRate))
    }
    if (item.shipmentType === 1) {
      if (item.logisticsTradingSchemeEntity.driverServiceStandard === 3) return price
      price *= (1 - (item.logisticsTradingSchemeEntity.driverServiceRate))
    }
    return price.toFixed(2)._toFixed(2)
  }

  stopPropagation = e => {
    e.stopPropagation()
  }

  render () {
    const { acceptanceTime, nickName, fixtureNumber, feedbackRate, prebookingRemark, logisticsTradingSchemeEntity, logisticsUserEntity } = this.props.item
    return (
      <div styleName='container' onClick={this.toDetail}>
        <Steps className='orderHall_prebookingItem_detail_item_step'>
          {this.renderList()}
        </Steps>
        <div styleName='line0' />
        <div styleName='dateBox'>
          {
            acceptanceTime? <span styleName='useCar'>用车时间：{moment(acceptanceTime).format('YYYY/MM/DD HH点')}</span>: <span styleName='marTop10'>用车时间：无</span>
          }
          {
            <span>单价：{this.unitPrice()}元</span>
          }
          {/* <span>{`￥${((deliveryItems.reduce((total, current)=>total+current.receivingNum, 0)) * Number(maximumShippingPrice || 0)).toFixed(2)._toFixed(2)}`}</span> */}
        </div>
        {
          logisticsTradingSchemeEntity && logisticsTradingSchemeEntity.driverServiceAmount?
            <p styleName='tips_p text_right'>手续费{logisticsTradingSchemeEntity.driverServiceAmount}元</p>
            :
            null
        }
        {
          prebookingRemark?
            <p styleName='tips_p'>备注：{prebookingRemark}</p>
            :
            null
        }
        <div styleName='consign_card'>
          <div styleName='consign_info'>
            <img src={heading} alt="图片加载错误" />
            <span>{nickName}</span>
          </div>
          <div styleName='consign_evaluate'>
            <span>成交&nbsp;{fixtureNumber || 0}</span>
            <span />
            <span>好评率&nbsp;{feedbackRate || '0%'}</span>
          </div>
        </div>
        <div styleName='line0' />
        <div styleName='btn_container'>
          <button type='button' onClick={this.takeOrder}>接单</button>
          <a styleName='button_a' href={`tel: ${logisticsUserEntity.phone}`} onClick={this.stopPropagation}>
            <img src={phoneNoBorder} alt='图片加载失败' />
            电话
          </a>
        </div>
      </div>
    )
  }
}
