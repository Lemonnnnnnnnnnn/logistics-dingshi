import React, { Component } from 'react'
import { NoticeBar, Toast } from 'antd-mobile'
import MessageContent from './messageContent'
import ListContainer from '@/mobile/page/component/ListContainer'
import GuestTips from '@/weapp/component/GuestTips/GuestTips'
import { getMessage, readAllMessage } from '@/services/apiService'
import { getUserInfo } from '@/services/user'
import styles from './messageCenter.css'

const List = ListContainer(MessageContent)


export default class MessageList extends Component {
  constructor (props) {
    super(props)
    this.messageListRef = React.createRef()
  }

  isLogin = !!getUserInfo().accessToken

  state = {
    noReadCount: 0
  }

  componentDidMount () {
    this.getNoReadMessage()
  }

  getNoReadMessage = () => {
    getMessage({ isRead: 0, limit: 1000, offset: 0 })
      .then((data = { count: 0 }) => {
        this.setState({
          noReadCount: data.count
        })
      })
  }

  readAllMessage = () => {
    const { refresh } = this.messageListRef.current
    readAllMessage({})
      .then(() => {
        Toast.success('全部设为已读成功', 2, null, false)
        refresh()
        this.getNoReadMessage()
      })
  }

  renderGuest = () => <GuestTips message="无法获取消息" />

  renderContent = () => {
    const { noReadCount } = this.state
    const props = {
      action: getMessage,
      primaryKey: 'messageId',
      ref: this.messageListRef,
      itemProps: {

      }
    }

    return (
      <>
        <NoticeBar className={styles.noticeBar} action={<div className={styles.readAll} onClick={this.readAllMessage}>全部设为已读</div>} mode="link" icon={null}>{`共${noReadCount}条未读消息`}</NoticeBar>
        <List className={styles.messageList} {...props} />
      </>
    )
  }

  render () {
    return this.isLogin
      ? this.renderContent()
      : this.renderGuest()
  }

}
