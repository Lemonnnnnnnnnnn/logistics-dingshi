import React, { useState, useEffect } from 'react';
import Link from 'umi/link';
import { Modal } from 'antd';
import woshichengyun from '../../assets/woshichengyun@2x.png';
import woshihuoquan from '../../assets/woshihuoquan@2x.png';
import woshituoyun from '../../assets/woshituoyun@2x.png';
import xiaochengxu from '../../assets/xiaochengxu@2x.png';
import app from '../../assets/app@2x.png';
import sjd from '../../assets/sjd.png';
import tyd from '../../assets/tyd.png';
import appewm from '../../assets/appewm.png';
import styles from './Role.less';


const List = (props) => {
  const [state, setState] =  useState({ visible: false, url: '' });
  const { location: { query } } = props;
  return (
    <div className={styles.RoleBlock}>
      <h1>你好，欢迎使用易键达系统！</h1>
      <h2>请选择需要登录的端口</h2>
      <a href={query.redirect ? `${window.envConfig.url}/oms/user/login?redirect=${query.redirect}`: `${window.envConfig.url}/oms/user/login`} rel="noreferrer"><img src={woshichengyun} alt="" width="48" height="48" />我是托运</a>
      <Link to={query.redirect ? `login?redirect=${query.redirect}` : "login?"}><img src={woshituoyun} alt="" width="48" height="48" />我是承运</Link>
      <a href={query.redirect ? `${window.envConfig.url}/oms/user/login?type=5&redirect=${query.redirect}` : `${window.envConfig.url}/oms/user/login?type=5`} rel="noreferrer"><img src={woshihuoquan} alt="" width="48" height="48" />我是货权</a>
      <div style={{ height: '1px', borderTop: '1px dashed #fff', margin: '80px 20px' }} />
      <div className={styles.other}>
        <div className={styles.otherItem}>
          <div className={styles.otherBtn} onClick={() => setState({ visible: true, url: sjd })}>
            <img src={xiaochengxu} alt="" width="44" height="44" />
            <span>司机小程序</span>
          </div>
        </div>
        <div className={styles.otherItem}>
          <div className={styles.otherBtn} onClick={() => setState({ visible: true, url: tyd })}>
            <img src={xiaochengxu} alt="" width="44" height="44" />
            <span>托运小程序</span>
          </div>
        </div>
        <div className={styles.otherItem}>
          <div className={styles.otherBtn} onClick={() => setState({ visible: true, url: appewm })}>
            <img src={app} alt="" width="44" height="44" />
            <span>承运app</span>
          </div>

        </div>
      </div>
      <Modal
        title={state.url.indexOf("appewm") !== -1  ? "承运APP下载二维码" : "二维码"}
        visible={state.visible}
        destroyOnClose
        footer={null}
        closable
        centered
        maskClosable
        onCancel={() => setState({ visible: false, url: '' })}
      >
        <div className={styles.ewm}>
          <img src={state.url} alt="" />
          {
            state.url.indexOf("appewm") !== -1  ? (<p style={{ width: "300px", margin: "0 auto" }}>此二维码仅供安卓手机通过浏览器扫码下载使用，苹果手机请在苹果商店里搜索该应用下载</p>) : null
          }

        </div>
      </Modal>
    </div>
  );
};
export default List;
