import React from 'react'
import { Steps, Button } from 'antd-mobile'
import router from 'umi/router'
import styles from './transportItem.less'

const { Step } = Steps

export default class TransportInfoStep extends React.Component {

  circle = (styleName) => (
    <div className={styles.circle_container}>
      <div className={`${styles.circle} ${styles[styleName]}`} />
    </div>
  )

  renderList = () => {
    const { item:{ deliveryItems, receivingId, receivingName, receivingAddress }, tab } = this.props
    const addressArr = deliveryItems.map(item => (
      <Step key={item.deliveryId} title={this.renderTitle(item, tab)} icon={this.circle('green')} description={item.deliveryAddress} />
    ))
    if (receivingId) {
      addressArr.push(<Step key={receivingId} title={receivingName} icon={this.circle('yellow')} description={receivingAddress} />)
    }
    return addressArr
  }

  renderTitle = (item, tab) => (
    <>
      <span style={{ width:'70%', display:'inline-block', overflow:'hidden', textOverflow:'ellipsis' }}>{item.deliveryName}</span>
    </>
  )

  render () {
    return (
      <Steps className='transports_detail_item_step'>
        {this.renderList()}
      </Steps>
    )
  }
}
