import React from 'react'
import Icon from '@/assets/todo_list.png'
import styles from './EmptyTips.css'

export default ({ icon = Icon, message = '暂无数据' }) => (
  <div className={styles.emptyWrap}>
    <img src={icon} alt="" />
    <p className={styles.description}>{message}</p>
  </div>
)