import React from 'react'
import { Layout, Icon, Tooltip } from 'antd'
import styles from './Footer.less'

// todo 添加 下载二维码
const { Footer } = Layout
const FooterView = () => (
  <Footer className={styles.footer}>
    {/* <p>
      <Tooltip placement="top" title={Android}>
        <span><Icon type="android" />android端下载</span>
      </Tooltip>
      <Tooltip placement="top" title={IOS}>
        <span><Icon type="apple" />iOS端下载</span>
      </Tooltip>
    </p> */}
    <p>
      <Icon type="copyright" /> {new Date().getFullYear()} ejianda 版权所有 <a href="https://beian.miit.gov.cn">备案号: 闽ICP备17029994号-2</a>
      <br />
      业务支持电话: 028-61676700  技术支持电话:17760427036 版本{window.version && window.version.prod}
    </p>
  </Footer>
)
export default FooterView

function Android (){
  return (
    <div>android端下载</div>
  )
}


function IOS (){
  return (
    <div>iOS端下载</div>
  )
}
