import React from 'react'
import { Steps, Flex } from 'antd-mobile'
import deliveryIcon from '@/assets/delivery_icon.png'
import receivingIcon from '@/assets/receiving_icon.png'
import styles from './PrebookingInfoStep.less'

const { Step } = Steps

const getDeliveryDesc = ({ deliveryAddress, contactPhone, contactName, receivingNum, categoryName, goodsName, goodsUnitCN }) => (
  <>
    <Flex>
      <span className={styles['flex-item']}>{deliveryAddress}</span>
    </Flex>
    <Flex justify="between">
      <span className={styles['flex-item']}>{contactName}</span>
      <span className={styles['flex-item']}>{contactPhone}</span>
    </Flex>
    <Flex justify="between">
      <span className={styles['flex-item']}>{categoryName}-{goodsName}</span>
      <span className={styles['flex-item']}>{receivingNum}{goodsUnitCN}</span>
    </Flex>
  </>
)

const getReceivingDesc = ({ receivingAddress, contactPhone, contactName, receivingNum, categoryName, goodsName, goodsUnitCN }) => (
  <>
    <Flex>
      <span className={styles['flex-item']}>{receivingAddress}</span>
    </Flex>
    <Flex justify="between">
      <span className={styles['flex-item']}>{contactName}</span>
      <span className={styles['flex-item']}>{contactPhone}</span>
    </Flex>
    <Flex justify="between">
      <span className={styles['flex-item']}>{categoryName}-{goodsName}</span>
      <span className={styles['flex-item']}>{receivingNum}{goodsUnitCN}</span>
    </Flex>
  </>
)

const getDeliveryItem = ({ deliveryName, projectCorrelationId, ...restItem }) =>
  <Step icon={<img src={deliveryIcon} />} key={projectCorrelationId} title={deliveryName} description={getDeliveryDesc(restItem)} />

const getReceivingItem = ({ receivingName, projectCorrelationId, ...restItem }) =>
  <Step icon={<img src={receivingIcon} />} key={projectCorrelationId} title={receivingName} description={getReceivingDesc(restItem)} />

export default class PrebookingInfoStep extends React.Component {
  render () {
    const { dataSource } = this.props

    return (
      <Steps size="small" className={styles['info-steps']}>
        {
          dataSource.map((item) => {
            const getComponent = item.hasOwnProperty('deliveryId') ? getDeliveryItem : getReceivingItem

            return getComponent(item)
          })
        }
      </Steps>
    )
  }
}
