import React from 'react';
import router from 'umi/router';
import { Icon } from 'antd';
import styles from './user-layout.less';
import logo from '../assets/logo.png';
import wenzi from '../assets/wenzi.png';

class UserLayout extends React.PureComponent {

  changeCSS = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "link";
  }

  toggleLogin = () => {
    const { pathname } = this.props.location;
    this.imageDom.style.left = '0';
    this.imageDom.style.top = '0';
    console.log(this.imageDom.style.left, this.imageDom.style.top);
    if (pathname.indexOf('platLogin') > -1) {
      router.replace('login');
    } else {
      router.replace('platLogin');
    }
  }


  render () {
    const { children, location: { query } } = this.props;
    const currentHref = window.location.href;
    return (
      <div className={styles.loginHtml}>
        <div className={styles.loginHeader}>
          <div className={styles.loginContent}>
            <div className={styles.logo}>
              <img width='46' height='41' alt='logo' draggable src={logo} />
              <a href={query.redirect ? `${window.envConfig.url}/user/role?redirect=${query.redirect}` : `${window.envConfig.url}/user/role`} style={{ color: '#fff' }}>易键达物流供应链管理平台</a>
            </div>
            <div className={styles.loginMenu}>
              <a href={query.redirect ? `${window.envConfig.url}/user/login?redirect=${query.redirect}` : `${window.envConfig.url}/user/login`} rel="noreferrer">承运登录</a>
            </div>

          </div>
        </div>

        <div className={styles.loginBody} style={{ display: currentHref.indexOf('/role') !== -1 ? 'flex' : 'block', justifyContent: 'space-between' }}>
          <div className={styles.loginFont} style={{ textAlign: currentHref.indexOf('/role') !== -1 ? 'left' : 'center' }}>
            <img src={wenzi} alt="" />
          </div>
          {children}
        </div>
        <div className={styles.loginFooter}>
          <p>
            <Icon type="copyright" /> {new Date().getFullYear()} ejianda 版权所有 <a href="https://beian.miit.gov.cn">备案号: 闽ICP备17029994号-2</a>  <span>业务支持电话: 028-61676700  技术支持电话:17760427036 版本{window.version && window.version.prod}</span>
          </p>
        </div>
      </div>
    );
    // }
    // return (
    //   <div className={styles.container} onDragOver={this.moveImage} onDrop={this.changeImgPosition}>
    //     <div className={styles.lang} />
    //     <div className={styles.content}>
    //       {currentHref.indexOf('user/authentication') === -1 &&
    //       <div className={styles.top}>
    //         <div className={styles.header}>
    //           <img alt="logo" onDrop={this.toPlatLogin} onDragOver={this.changeCSS} className={`${styles.logo}`} src={logo} />
    //           <span className={styles.title}>易键达</span>
    //         </div>
    //         <div className={styles.desc}>为大宗物资供应链上下游的客户提供基于协同、协作、去中心化概念的智慧供应链服务平台。为参与大宗物资供应链过程的各协作方提供统一的货物订单、运输订单、结算协同作业、全物流过程可视化监控、专业的SaaS订单管理、运输管理、结算管理系统服务，使得大宗物资贸易管理更便捷，提高管理效率，降低大宗物资管理系统的成本。</div>
    //       </div>}
    //       {children}
    //     </div>
    //     <img width='20' height='20' alt='logo' draggable src={logo} className={styles.positionAbs} onDragStart={this.getImageDom} />
    //     <Footer />
    //   </div>);
  }
}

export default UserLayout;
