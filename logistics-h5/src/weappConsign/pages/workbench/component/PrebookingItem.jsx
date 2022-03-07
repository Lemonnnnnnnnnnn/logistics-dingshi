import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import { Steps } from 'antd-mobile'
import router from 'umi/router'
import styles from './PrebookingItem.less'

const { Step } = Steps

@CSSModules(styles, { allowMultiple: true })
export default class DetailItem extends Component{

  constructor (props) {
    super(props)
    this.item = {
      label: '运单号',
      content: this.props.item.transportNo,
    }
  }

  circle = (styleName) => (
    <div styleName='circle_container'>
      <div styleName={styleName} />
    </div>
  )

  renderList = () => {
    const { item:{ deliveryItems, receivingItems, receivingId, receivingName, receivingAddress } } = this.props
    const addressArr = deliveryItems.map(item => (
      <Step key={item.deliveryId} title={item.name} icon={this.circle('green')} description={`${item.categoryName}${item.goodsName},预约${item.receivingNum}${item.goodsUnitCN}`} />
    ))
    const useless = (receivingItems || []).forEach(item => {
      addressArr.push(<Step key={item.receivingId} title={item.name} icon={this.circle('yellow')} description={`${item.categoryName}${item.goodsName},预约${item.receivingNum}${item.goodsUnitCN}`} />)
    })
    return addressArr
  }

  toDetail = () => {
    router.push(`/WeappConsign/main/prebookingDetail?prebookingId=${this.props.item.prebookingId}`)
  }

  render () {
    const { acceptanceTime, createTime, deliveryItems, maximumShippingPrice } = this.props.item
    return (
      <div styleName='container' onClick={this.toDetail}>
        <Steps className='prebooking_detail_item_step_colorful'>
          {this.renderList()}
        </Steps>
        <div styleName='line0' />
        {
          acceptanceTime? <span styleName='useCar'>用车时间：{moment(acceptanceTime).format('YYYY/MM/DD HH点')}</span>: <span styleName='marTop10'>用车时间：无</span>
        }
        <div styleName='dateBox'>
          {
            createTime? <span>创建时间：{moment(createTime).format('YYYY/MM/DD HH:mm:ss')}</span>: <span>创建时间：无</span>
          }
          <span>{`￥${((deliveryItems.reduce((total, current)=>total+current.receivingNum, 0)) * Number(maximumShippingPrice || 0)).toFixed(2)._toFixed(2)}`}</span>
        </div>
      </div>
    )
  }
}
