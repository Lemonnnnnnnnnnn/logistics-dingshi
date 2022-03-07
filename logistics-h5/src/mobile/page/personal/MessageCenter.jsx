import React, { Component } from 'react';
import { List, Icon, NoticeBar, Badge, Toast } from 'antd-mobile';
import { Icon as AntdIcon } from 'antd';
import router from 'umi/router';
import moment from 'moment'
import { formatTime } from '@/utils/utils'
import { MESSAGE_STATUS } from '@/constants/project/project'
import ListContainer from '@/mobile/page/component/ListContainer'
import { readMessage, getMessage, readAllMessage } from '@/services/apiService'
import logo from '@/assets/logo.png'
import { PREBOOK, TRANSPORT, GOODSPLAN, CONTRACT } from '@/constants/message/message'

const {
  PREBOOK_UNAUDITED, PREBOOK_REFUSE, PREBOOK_UNCOMPLETED, PREBOOK_COMPLETE, TRANSPORT_UNTREATED, TRANSPORT_REFUSE, TRANSPORT_ACCEPT, TRANSPORT_SIGNED,
  TRANSPORT_SHIPMENT_REFUSE, TRANSPORT_SHIPMENT_AUDITED, TRANSPORT_CONSIGNMENT_REFUSE, TRANSPORT_COMPLETE, TRANSPORT_EXECPTION, GOODSPLANS_CONSIGNMENT_UNTREATED,
  GOODSPLANS_CUSTOMER_CANCEL, GOODSPLANS_CONSIGNMENT_REFUSE, GOODSPLANS_COMPLETED, GOODSPLANS_FINISH, GOODSPLANS_GOINGON, TRANSPORT_CUSTOMER_CONFIRM, TRANSPORT_CUSTOMER_REFUSE,
  TRANSPORT_CUSTOMER_UNAUDITED, CONTRACT_CUSTOMER_UNAUDITED, CONTRACT_CUSTOMER_REJECT, CONTRACT_CUSTOMER_AUDITED, CONTRACT_PLAT_UNAUDITED, CONTRACT_SHIPMENT_UNAUDITED,
  CONTRACT_PLAT_REFUSE, APPLY_ADD_CONTRACT, PASS_APPLY_CONTRACT, REFUSE_APPLY_CONTRACT
} = MESSAGE_STATUS

const { Item } = List
const { Brief } = Item
const noticeBarStyle = { position: 'fixed', left: 0, right: 0, top: 0, zIndex: 9 }


class MessageItem extends Component {

  readMessage = () => {
    const { item: { messageType: type, objectId: id, messageId } } = this.props

    readMessage({ messageId, isRead: 1 })
    switch (type) {
      case TRANSPORT:
        router.push(`transportDetail?transportId=${id}`)
        break;
      case GOODSPLAN:
        router.push(``) // 要货计划单url  TODO
        break;
      case CONTRACT:
        Toast.info('请至电脑端进行相关操作', 2, null, false)
        break
      case PREBOOK:
        router.push(`prebookingDetail?prebookingId=${id}`)
        break
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
    const time = formatTime(createTime) // moment(item.createTime).fromNow()

    return <div style={{ fontSize: '13px' }}>{time}</div>
  }

  render () {
    const { item } = this.props
    return (
      <Item onClick={this.readMessage} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }} extra={this.getMessageTime()} align="top" multipleLine>
        <Badge dot={!item.isRead} style={{ top:0 }}>
          <img src={logo} alt='' />
        </Badge>
        <span style={{ marginLeft:'10px' }}>{this.renderMessageStatus(item.messageStatus)}</span>
        <Brief style={{ fontSize: '13px' }}>
          {item.messageContent}
        </Brief>
        <Icon style={{ position: 'absolute', right: '10', bottom: '12' }} type='right' />
      </Item>
    )
  }
}

const MessageList = ListContainer(MessageItem)

export default class MessageCenter extends Component {

  state = {
    noReadCount: 0
  }

  constructor (props) {
    super(props)
    this.messageListRef = React.createRef()
  }

  componentDidMount () {
    this.getNoReadMessage()
  }

  getNoReadMessage = () => {
    getMessage({ isRead: 0, limit: 1000, offset: 0 })
      .then((data) => {
        this.setState({
          noReadCount: data.count
        })
      })
  }

  renderList = () => {
    const props = {
      action: getMessage,
      primaryKey: 'messageId'
    }

    return (
      <MessageList style={{ paddingTop: '36px' }} ref={this.messageListRef} useBodyScroll whiteSpace={false} {...props} />
    )
  }

  readAllMessage = () => {
    const { refresh } = this.messageListRef.current
    readAllMessage()
      .then(() => {
        refresh()
        this.getNoReadMessage()
      })
  }

  render () {
    const { noReadCount } = this.state

    return (
      <>
        <NoticeBar style={noticeBarStyle} action={<div onClick={this.readAllMessage}><AntdIcon type='fire' />全部已读</div>} mode="link" icon={null}>{`${noReadCount}条未读消息`}</NoticeBar>
        {this.renderList()}
      </>
    )
  }
}


