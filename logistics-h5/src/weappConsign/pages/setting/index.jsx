import React, { Component } from 'react';
import { List, Button, Modal } from 'antd-mobile'
import CSSModules from 'react-css-modules'
import router from 'umi/router'
import { clearUserInfo, getUserInfo } from '@/services/user'
import styles from './index.less'
import { exit } from '@/services/apiService'

const { Item } = List

@CSSModules(styles, { allowMultiple: true })
class Index extends Component {

  logoOut = () => {
    Modal.alert(undefined, '确认退出登录吗?', [{ text: '取消' }, { text: '确定', onPress:()=>{
      const { avatar } = getUserInfo()
      if (avatar) {
        exit().then(()=>{
          clearUserInfo()
          localStorage.removeItem('dataStatisticsInfo')
          this.userLogin()
        })
      } else {
        clearUserInfo()
        localStorage.removeItem('dataStatisticsInfo')
        this.userLogin()
      }
    }
    }]
    )
  }

  userLogin = () => {
    wx.miniProgram.reLaunch({
      url: '/pages/index/index?setIsLoggedFalse=true'
    })
  }

  routerToLaw = () => {
    router.push('setting/legalNotes')
  }

  routerToUserNotes = () => {
    router.push('setting/registerNotes')
  }

  routerToSafe = () => {
    router.push('setting/accountSafe')
  }

  render () {
    return (
      <>
        <List renderHeader={() => ''} styleName="setting-list">
          <Item prefixCls='setting-list' onClick={this.routerToLaw} style={{ height:'56px' }} arrow="horizontal">法律条款</Item>
          <Item prefixCls='setting-list' onClick={this.routerToUserNotes} style={{ height:'56px' }} arrow="horizontal">用户协议</Item>
        </List>
        <Button onClick={this.logoOut} style={{ width:'345px', fontSize:'17px', color:'rgba(153,153,153,1)', margin:'60px auto 0 auto', }}>退出登录</Button>
      </>
    );
  }
}

export default Index;
