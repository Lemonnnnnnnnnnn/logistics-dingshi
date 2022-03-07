import React from 'react';
import Link from 'umi/link';
import styles from './UserLayout.less';
import logo from '../assets/logo.png';
import defaultImage from '@/assets/error_load_image.png'

class UserLayout extends React.PureComponent {

  componentDidMount () {
    window.addEventListener('error', this.setDefaultImage, true)
  }

  componentWillUnmount (){
    window.removeEventListener('error', this.setDefaultImage, true)
  }

  setDefaultImage = (e) => {
  // 当前异常是由图片加载异常引起的
    if ( e.target.tagName && e.target.tagName.toUpperCase() === 'IMG' ){
      e.target.src = defaultImage
      e.target.style.maxWidth = '40px'
    }
  }

  render () {
    const { children } = this.props;
    const currentHref = window.location.href
    return (
    // @TODO <DocumentTitle title={this.getPageTitle()}>
      <div className={styles.container}>
        <div className={styles.lang} />
        <div className={styles.content}>
          {currentHref.indexOf('user/authentication') === -1 &&
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img alt="logo" className={styles.logo} src={logo} />
                <span className={styles.title}>易键达</span>
              </Link>
            </div>
            <div className={styles.desc}>为大宗物资供应链上下游的客户提供基于协同、协作、去中心化概念的智慧供应链服务平台。为参与大宗物资供应链过程的各协作方提供统一的货物订单、运输订单、结算协同作业、全物流过程可视化监控、专业的SaaS订单管理、运输管理、结算管理系统服务，使得大宗物资贸易管理更便捷，提高管理效率，降低大宗物资管理系统的成本。</div>
          </div>}
          {children}
        </div>
      </div>
    );
  }
}

export default UserLayout;
