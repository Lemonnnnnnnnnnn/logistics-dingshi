import React, { Component } from 'react'
import { Button, List, Modal, Toast } from 'antd-mobile'
import { Icon } from 'antd'
import router from 'umi/router'
import { ACCOUNT_TYPE } from '@/constants/user/accountType'
import { getUserInfo, clearUserInfo, setUserInfo } from '@/services/user'
import defaultUserAvatar from '@/assets/logo.png'
import breakIcon from '@/assets/breakIcon.png'
import contractIcon from '@/assets/contractIcon.png'
import chartIcon from '@/assets/chartIcon.png'
import exitIcon from '@/assets/exitIcon.png'
import accountIcon from '@/assets/accountIcon.svg'
import styles from './personalCenter.css'
import { exit, modifyUserInfo } from '@/services/apiService'

export default class PersonalIndex extends Component {
  constructor (props) {
    super(props)
    this.userInfo = getUserInfo()
    this.listItems = [
      {
        text: '卸货点管理',
        icon: breakIcon,
        clickRouter: '/Weapp/receivingList'
      },
      {
        text: '合同管理',
        icon: contractIcon,
        clickRouter: '/Weapp/personalCenter/contractList'
      },
      {
        text: '子账号管理',
        icon: accountIcon,
        clickRouter: '/Weapp/personalCenter/SubAccountList',
        hideInMenu: this.userInfo.accountType !== ACCOUNT_TYPE.MAIN_ACCOUNT
      },
      {
        text: '客服号码',
        icon: chartIcon,
        onClick: () => {
          Modal.alert(undefined, '028-61676700', [{
            text: '取消',
            onPress: () => console.log('cancel')
          }, {
            text: <a id="qw" href="tel:028-61676700">确定</a>,
            onPress: () => {
              this.telDom.current.click()
            }
          }])
        }
      },
      {
        text: '退出',
        icon: exitIcon,
        onClick: ()=>{
          if (!this.loginStatus){
            Toast.fail('请先登录', 1)
            return
          }
          Modal.alert(undefined, '确认退出登录吗?', [{ text: '取消' }, { text: '确定', onPress:()=>{
            exit().then(()=>{
              clearUserInfo()
              this.userLogin()
            })
          }
          }]
          )
        }
      }
    ]
    this.loginStatus = this.userInfo.accessToken
    this.telDom = React.createRef()
  }

  state = {
    // loginStatus: false,
    nickName: undefined
  }

  componentDidMount () {
    this.setState({
      nickName: this.userInfo.nickName
    })
  }

  toPage = page => {
    if (this.loginStatus) {
      router.push(page)
    } else {
      Toast.fail('请先登录', 1)
    }
  }

  // renderTelModal = ()

  renderList = () => {
    const list = this.listItems.map(item => item.hideInMenu ?
      null
      :
      (
        <List.Item
          key={item.text}
          thumb={item.icon}
          arrow="horizontal"
          onClick={(e) => {
            e.stopPropagation()
            item.onClick
              ? item.onClick(item)
              : (item.clickRouter && this.toPage(item.clickRouter))
          }}
        >
          <span>{item.text}</span>
        </List.Item>)
    )
    return (
      <List>
        {list}
      </List>
    )
  }

  userLogin = () => {
    wx.miniProgram.redirectTo({
      url: '/pages/index/index?setIsLoggedFalse=true'
    })
  }

  editUserName = () => {
    const { nickName } = this.state
    Modal.prompt(<div style={{ fontSize: '16px', fontWeight: 'bold' }}>修改注册名</div>, null, [
      { text: '取消' },
      {
        text: '保存', onPress: value => {
          modifyUserInfo({ nickName: value, accountType: ACCOUNT_TYPE.NORMAL_ACCOUNT })
            .then(()=>{
              Toast.success('修改成功', 1, false)
            })
          this.setState({
            nickName:value
          }, ()=>{
            const userInfo = getUserInfo()
            userInfo.nickName = value
            setUserInfo(userInfo)
          })
        }
      }
    ], 'default', nickName)
  }

  renderUserInfo = () => {
    const { avatar = defaultUserAvatar } = this.userInfo
    const { nickName } = this.state
    return (
      <div className={styles.userBlock}>
        <div className={styles.avatarWrap}>
          <img src={avatar} alt="" className={styles.avatar} />
        </div>
        <div>
          <span style={{ fontSize: '18px', position: 'relative', left: '5px' }}>{nickName}</span>
          <Icon onClick={this.editUserName} type='edit' style={{ left: '15px', position: 'relative' }} />
        </div>
      </div>
    )
  }

  renderLoginButton = () => <Button inline size="small" className={styles.loginBtn} onClick={this.userLogin}>登录</Button>

  render () {
    return (
      <>
        <a style={{ display: 'none' }} ref={this.telDom} href="tel:028-61676700">期望</a>
        <div className={styles.headerBlock}>
          {
            this.loginStatus
              ? this.renderUserInfo()
              : this.renderLoginButton()
          }
        </div>
        {this.renderList()}
      </>
    )
  }

}
