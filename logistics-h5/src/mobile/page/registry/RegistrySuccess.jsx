import React from 'react'
import { Result, Icon, Button } from 'antd-mobile'
import router from 'umi/router'
import styles from './RegistrySuccess.css'

const redirectToCompleteInfo = () => router.replace('/')

export default () => (
  <div className={styles.result}>
    <Result
      style={{ borderBottom: 'none' }}
      img={<Icon style={{ width: '60px', height: '60px' }} color="#1890ff" type="check-circle" size="lg" />}
      title="恭喜您注册成功"
      message={<div style={{ fontSize: '13px' }}><div>完善认证信息并通过平台审核后</div><div>您才可以使用易键达系统</div></div>}
    />
    <Button onClick={redirectToCompleteInfo} inline type="primary" size="small">完善资料</Button>
  </div>
)
