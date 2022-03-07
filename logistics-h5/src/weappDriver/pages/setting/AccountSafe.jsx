import React, { Component } from 'react';
import { List, Button, Modal } from 'antd-mobile'
import CSSModules from 'react-css-modules'
import router from 'umi/router'
import styles from './index.less'

const { Item } = List

@CSSModules(styles, { allowMultiple: true })
class Index extends Component {
  userLogin = () => {
    wx.miniProgram.reLaunch({
      url: '/pages/index/index?setIsLoggedFalse=true'
    })
  }

  routerToModifyPhone = () => {
    router.push('accountSafe/modifyPhone')
  }

  routerToModifyPassword = () => {
    router.push('accountSafe/modifyPassword')
  }

  render () {
    return (
      <>
        <List renderHeader={() => ''} styleName="setting-list">
          <Item prefixCls='setting-list' onClick={this.routerToModifyPhone} style={{ height:'56px' }} arrow="horizontal">更改手机号</Item>
          <Item prefixCls='setting-list' onClick={this.routerToModifyPassword} style={{ height:'56px' }} arrow="horizontal">修改密码</Item>
        </List>
      </>
    );
  }
}

export default Index;
