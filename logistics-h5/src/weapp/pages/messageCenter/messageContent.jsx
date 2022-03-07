import React, { Component } from 'react'
import { WhiteSpace, Badge, Icon, WingBlank, Card } from 'antd-mobile'
import moment from 'moment'
import router from 'umi/router';
import { MESSAGE_STATUS } from '@/constants/project/project'
import { readMessage } from '@/services/apiService'
import styles from './messageCenter.css'
import { TRANSPORT, GOODSPLAN, CONTRACT } from '@/constants/message/message'

const {
  PREBOOK_UNAUDITED, PREBOOK_REFUSE, PREBOOK_UNCOMPLETED, PREBOOK_COMPLETE, TRANSPORT_UNTREATED, TRANSPORT_REFUSE, TRANSPORT_ACCEPT, TRANSPORT_SIGNED,
  TRANSPORT_SHIPMENT_REFUSE, TRANSPORT_SHIPMENT_AUDITED, TRANSPORT_CONSIGNMENT_REFUSE, TRANSPORT_COMPLETE, TRANSPORT_EXECPTION, GOODSPLANS_CONSIGNMENT_UNTREATED,
  GOODSPLANS_CUSTOMER_CANCEL, GOODSPLANS_CONSIGNMENT_REFUSE, GOODSPLANS_COMPLETED, GOODSPLANS_FINISH, GOODSPLANS_GOINGON, TRANSPORT_CUSTOMER_CONFIRM, TRANSPORT_CUSTOMER_REFUSE,
  TRANSPORT_CUSTOMER_UNAUDITED, CONTRACT_CUSTOMER_UNAUDITED, CONTRACT_CUSTOMER_REJECT, CONTRACT_CUSTOMER_AUDITED, CONTRACT_PLAT_UNAUDITED, CONTRACT_SHIPMENT_UNAUDITED,
  CONTRACT_PLAT_REFUSE, APPLY_ADD_CONTRACT, PASS_APPLY_CONTRACT, REFUSE_APPLY_CONTRACT
} = MESSAGE_STATUS

export default class MessageItem extends Component {

  readMessage = () => {
    const { item: { messageType: type, messageStatus, objectId: id, messageId } } = this.props
    readMessage({ messageId, isRead: 1 })
    switch (type) {
      case TRANSPORT:
        router.push(`/Weapp/transportDetail?transportId=${id}&isEnterByMessage=1`)
        break;
      case GOODSPLAN:
        router.push(`/Weapp/goodsplansDetail?goodsPlanId=${id}`)
        break;
      case CONTRACT:
        if (messageStatus===APPLY_ADD_CONTRACT) return router.push(`/Weapp/personalCenter/SubAccountList`)
        router.push(`/Weapp/personalCenter/contractList/contractDetail?projectId=${id}`)
        break;
      default:
    }
  }

  renderMessageStatus = messageStatus => {
    const itemConfig = {
      [PREBOOK_UNAUDITED]: { text: '待确定' },
      [PREBOOK_REFUSE]: { text: '已拒绝' },
      [PREBOOK_UNCOMPLETED]: { text: '调度中' },
      [PREBOOK_COMPLETE]: { text: '调度完成' },
      [TRANSPORT_UNTREATED]: { text: '未接单' },
      [TRANSPORT_REFUSE]: { text: '司机拒绝运单' },
      [TRANSPORT_ACCEPT]: { text: '司机已接单' },
      [TRANSPORT_SIGNED]: { text: '已签收' },
      [TRANSPORT_SHIPMENT_REFUSE]: { text: '承运已拒绝运单' },
      [TRANSPORT_SHIPMENT_AUDITED]: { text: '承运已审核运单' },
      [TRANSPORT_CONSIGNMENT_REFUSE]: { text: '托运已拒绝运单' },
      [TRANSPORT_COMPLETE]: { text: '运单已完成' },
      [TRANSPORT_EXECPTION]: { text: '运单异常' },
      [GOODSPLANS_CONSIGNMENT_UNTREATED]: { text: '要货计划单托运待确定' },
      [GOODSPLANS_CUSTOMER_CANCEL]: { text: '要货计划单客户已取消' },
      [GOODSPLANS_CONSIGNMENT_REFUSE]: { text: '要货计划单托运已拒绝' },
      [GOODSPLANS_COMPLETED]: { text: '要货计划单托运已完成' },
      [GOODSPLANS_FINISH]: { text: '要货计划单已结束' },
      [GOODSPLANS_GOINGON]: { text: '要货计划单进行中' },
      [TRANSPORT_CUSTOMER_CONFIRM]: { text: '运单客户已确认收货' },
      [TRANSPORT_CUSTOMER_REFUSE]: { text: '运单客户已拒绝' },
      [TRANSPORT_CUSTOMER_UNAUDITED]: { text: '运单待客户确认收货' },
      [CONTRACT_CUSTOMER_UNAUDITED]: { text: '合同待客户审核' },
      [CONTRACT_CUSTOMER_REJECT]: { text: '合同客户审核不通过' },
      [CONTRACT_CUSTOMER_AUDITED]: { text: '合同客户审核通过' },
      [CONTRACT_PLAT_UNAUDITED]: { text: '合同待平审核' },
      [CONTRACT_SHIPMENT_UNAUDITED]: { text: '合同承运待审核' },
      [CONTRACT_PLAT_REFUSE]: { text: '合同平台拒绝' },
      [APPLY_ADD_CONTRACT]: { text: '子账号申请加入提醒' },
      [PASS_APPLY_CONTRACT]: { text: '子账号申请加入提醒' },
      [REFUSE_APPLY_CONTRACT]: { text: '子账号申请加入提醒' }
    }[messageStatus] || { text:'未知类型消息，请联系管理员' }

    return itemConfig.text
  }

  getMessageTime = () => {
    const { item: { createTime } } = this.props
    return moment(createTime).format('YYYY-MM-DD') // moment(item.createTime).fromNow()
  }

  render () {
    const { item: { messageStatus, isRead, messageContent } } = this.props
    const headerCls = isRead ? styles.messageTitle : `${styles.messageTitle} ${styles.unRead}`

    return (
      <WingBlank>
        <div className="textCenter"><div className={styles.messageTime}>{this.getMessageTime()}</div></div>
        <WhiteSpace size="md" />
        <Card onClick={this.readMessage}>
          <Card.Header prefixCls='myCard' className={headerCls} title={this.renderMessageStatus(messageStatus)} extra={<Badge dot={!isRead} />} />
          <Card.Body className={styles.messageContent}>{messageContent}</Card.Body>
          <Card.Footer className={styles.messageFooter} content={<span className={styles.toDetail}>立即查看</span>} extra={<Icon className={styles.detailIcon} type="right" />} />
        </Card>
        <WhiteSpace size="lg" />
      </WingBlank>
    )
  }
}
