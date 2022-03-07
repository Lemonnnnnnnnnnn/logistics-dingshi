import React from 'react'
import { Steps, Flex } from 'antd-mobile'
import deliveryIcon from '@/assets/delivery_icon.png'
import receivingIcon from '@/assets/receiving_icon.png'
import styles from '../../../prebooking/component/PrebookingInfoStep/PrebookingInfoStep.less'

const { Step } = Steps

const getDeliveryDesc = ({ deliveryAddress, contactPhone, contactName, receivingNum,
  categoryName, goodsName, goodsUnitCN, goodsNum, deliveryNum, deliveryUnitCN, receivingUnitCN }) => (
    <>
      <Flex>
        <span className={styles['flex-item']}>{deliveryAddress}</span>
      </Flex>
      <Flex justify="between">
        <span className={styles['flex-item']}>{contactName}</span>
        <span className={styles['flex-item']}>{contactPhone}</span>
      </Flex>
      <Flex justify="between">
        <span className={styles['flex-item']}>货品</span>
        <span className={styles['flex-item']}>{categoryName}-{goodsName}</span>
      </Flex>
      <Flex justify="between">
        <span className={styles['flex-item']}>计划重量</span>
        <span className={styles['flex-item']}>{goodsNum}{goodsUnitCN}</span>
      </Flex>
      <Flex justify="between">
        <span className={styles['flex-item']}>实提重量</span>
        <span className={styles['flex-item']}>{`${deliveryNum===null?'--':deliveryNum}${deliveryUnitCN===null?'':deliveryUnitCN}`}</span>
      </Flex>
      <Flex justify="between">
        <span className={styles['flex-item']}>实收重量</span>
        <span className={styles['flex-item']}>{`${receivingNum===null?'--':receivingNum}${receivingUnitCN===null?'':receivingUnitCN}`}</span>
      </Flex>
    </>
)

const getReceivingDesc = ({ receivingAddress, contactPhone, contactName }) => (
  <>
    <Flex>
      <span className={styles['flex-item']}>{receivingAddress}</span>
    </Flex>
    <Flex justify="between">
      <span className={styles['flex-item']}>{contactName}</span>
      <span className={styles['flex-item']}>{contactPhone}</span>
    </Flex>
  </>
)
const getDeliveryItem = ({ deliveryName, projectCorrelationId, ...restItem }) =>
  <Step icon={<img src={deliveryIcon} />} key={projectCorrelationId} title={deliveryName} description={getDeliveryDesc(restItem)} />

const getReceivingItem = ({ receivingName, projectCorrelationId, ...restItem }) =>
  <Step icon={<img src={receivingIcon} />} key={projectCorrelationId} title={receivingName} description={getReceivingDesc(restItem)} />

export default class TransportInfoStep extends React.Component {
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
