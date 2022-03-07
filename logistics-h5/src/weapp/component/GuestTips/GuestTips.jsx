import React from 'react'
import { Button } from 'antd-mobile'
import guestIcon from '@/assets/todo_list.png'
import styles from './GuestTips.css'

const toLogin = () => {
  wx.miniProgram.redirectTo({
    url: '/pages/index/index?setIsLoggedFalse=true'
  })
}

export default ({ icon = guestIcon, message = '无法获取信息' }) => (
  <div className={styles.guestWrap}>
    <img src={icon} alt="" />
    <p className={styles.tip}>{message}</p>
    <p className={styles.description}>登录后可查看，快登录吧~</p>
    <Button onClick={toLogin} type="ghost" size="small" inline>立即登录</Button>
  </div>
)
