import React from 'react'
import { Steps, Button, Flex } from 'antd-mobile'
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
    const { item:{ deliveryItems, receivingId, receivingName, receivingAddress, signItems, transportImmediateStatus, contactName, contactPhone } } = this.props
    const addressArr = deliveryItems.map(item => {
      const description = (
        <div style={{ width : '100%' }}>
          <div style={{ marginBottom : '0.5rem', wordBreak : 'normal', whiteSpace : 'normal' }}>{item.deliveryAddress || '如未收到信息，请联系发单方获取位置信息'} </div>
          <div>
            <Flex align='start' justify='between'>
              <span>提货联系人：</span>
              <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}>{item.contactName} {item.contactPhone}</span>
            </Flex>
            <Flex align='start' justify='between'>
              <span>货品：</span>
              <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}>{item.categoryName} {item.goodsName}</span>
            </Flex>
            <Flex align='start' justify='between'>
              <span>计划量：</span>
              <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}>{item.goodsNum} {item.goodsUnitCN}</span>
            </Flex>
            <Flex align='start' justify='between'>
              <span>实提量：</span>
              <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}>{item.deliveryNum} {item.deliveryUnitCN}</span>
            </Flex>
          </div>
        </div>)
      return (
        <Step
          key={item.transportCorrelationId}
          title={this.renderTitle(item, transportImmediateStatus)}
          icon={this.circle('green')}
          description={description}
        />
      )
    })
    if (receivingId) {
      const description = (
        <div>
          <div style={{ marginBottom : '0.5rem', wordBreak : 'normal', whiteSpace : 'normal' }}>{receivingAddress}</div>
          <Flex align='start' justify='between'>
            <span>卸货联系人：</span>
            {signItems ? <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}>{signItems[0]?.contactName} {signItems[0]?.contactPhone}</span> :
            <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}> {contactName} {contactPhone}</span>}
          </Flex>
        </div>
      )
      addressArr.push(<Step key={receivingId} title={receivingName} icon={this.circle('yellow')} description={description} />)
    }
    return addressArr
  }

  driverPickup = item => e => {
    e.stopPropagation()
    const { transportCorrelationId, deliveryType } = item
    const { item:{ transportId } } = this.props
    if (`${deliveryType}` === '1') {
      router.push(`/WeappDriver/driverPickup?transportId=${transportId}&transpotCorrelationId=${transportCorrelationId}`)
    } else {
      router.push(`/WeappDriver/deliveryMap?transportId=${transportId}&transpotCorrelationId=${transportCorrelationId}`)
    }
  }

  renderTitle = (item, transportImmediateStatus) => (
    <>
      <span style={{ width:'70%', display:'inline-block', overflow:'hidden', textOverflow:'ellipsis' }}>{item.deliveryName}</span>
      {(transportImmediateStatus === 5 || transportImmediateStatus === 22) && !item.isPicked && <Button className={styles.pick_button} onClick={this.driverPickup(item)}>提货</Button>}
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
