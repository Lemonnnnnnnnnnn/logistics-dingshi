import React from 'react';
import { Layout, Icon } from 'antd';
import styles from './footer.less';

// todo 添加 下载二维码
const { Footer } = Layout;
const FooterView = () => (
  <Footer className={styles.footer}>
    <p>
      <Icon type="copyright" /> {new Date().getFullYear()} ejianda 版权所有 <a href="https://beian.miit.gov.cn">备案号: 闽ICP备17029994号-2</a>
      <br />
      业务支持电话: 028-61676700  技术支持电话:17760427036 版本{window.version && window.version.prod}
    </p>
  </Footer>
);
export default FooterView;

