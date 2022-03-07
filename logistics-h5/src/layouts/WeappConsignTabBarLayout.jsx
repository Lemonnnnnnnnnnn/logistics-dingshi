import React from 'react';
import { TabBar } from 'antd-mobile';
import { connect } from 'dva';
import router from 'umi/router';
import { Base64 } from 'js-base64';
import FastClick from 'fastclick';
import styles from './WeappLayout.css';
import mine from '@/assets/consign/mine.png';
import mineOn from '@/assets/consign/mineOn.png';
import plat from '@/assets/consign/plat.png';
import platOn from '@/assets/consign/platOn.png';
import release from '@/assets/consign/release.png';
import releaseOn from '@/assets/consign/releaseOn.png';
import dataStatistics from '@/assets/consign/dataStatistics.png';
import dataStatisticsOn from '@/assets/consign/dataStatisticsOn.png';
import './WeappTabBarLayout.css';

// FastClick.attach(document.body)

@connect(null, dispatch => ({
  login: payload => dispatch({ type: 'user/login', payload }),
}))
class WeappLayout extends React.PureComponent {
  tabs = [
    {
      title: '首页',
      key: 'datastatistics',
      icon: dataStatistics,
      selectedIcon: dataStatisticsOn,
      to: '/WeappConsign/main/dataStatistics',
    },
    { title: '工作台', key: 'staging', icon: plat, selectedIcon: platOn, to: '/WeappConsign/main/staging' },
    { title: '发布预约单', key: 'release', icon: release, selectedIcon: releaseOn, to: '/WeappConsign/main/release' },
    { title: '我的', key: 'personalcenter', icon: mine, selectedIcon: mineOn, to: '/WeappConsign/main/personalCenter' },
  ];

  constructor (props) {
    super(props);
    const key = this.getDefaultActiveTab();
    this.state = {
      activeTab: key,
    };
  }

  componentWillMount () {
    // const { login, location: { query: { __mac } } } = this.props
    // this.setTitle()
    // console.warn('__mac', __mac)
    // if (__mac) {
    //   // const tokenStr = Base64.decode(__mac)
    //   const token = JSON.parse(__mac)
    //   console.warn('token', token)
    //   login({ ...token, mobileToken: true })
    // } else {
    //   // todo 设置游客模式
    // }
  }

  componentDidUpdate () {
    this.setTitle();
    // 其他页面跳到主页面需要更新tabs active状态
    const key = this.getDefaultActiveTab();
    this.setState({
      activeTab: key,
    });
  }

  getDefaultActiveTab = () => {
    const { location: { pathname } } = this.props;
    const currentTab = this.tabs.find(tab => pathname.includes(tab.to)) || this.tabs[1];
    return currentTab.key;
  };

  setTitle = () => {
    const { route: { routes }, location: { pathname } } = this.props;
    const matchedRoute = routes.find(({ path }) => path === pathname);
    const title = matchedRoute ? matchedRoute.name : '易键达托运端';
    document.title = title;
  };

  onChangeTab = (tab) => {
    const { activeTab } = this.state;
    if (activeTab === tab.key) return false;
    // router.replace(tab.to);

    if (tab.key==='datastatistics'){
      window.location.href = tab.to
      // router.replace(`${tab.to}?random=${new Date().getTime()}`)
      // children.status
    } else {
      router.replace(tab.to)
    }

    this.setState({
      activeTab: tab.key,
    });
  };

  renderTabBar = (tabs) => {
    const { activeTab } = this.state;
    const { children } = this.props;

    return (
      tabs.map((tab) => {
        const { key, title, icon, selectedIcon } = tab;
        const selected = activeTab === key;
        return (
          <TabBar.Item
            key={key}
            title={title}
            selected={selected}
            icon={<img className={styles.tabBarIcon} src={icon} alt="home" />}
            selectedIcon={<img className={styles.tabBarIcon} src={selectedIcon} alt="home" />}
            onPress={() => this.onChangeTab(tab)}
          >
            <div style={{ position: 'relative', height: '100%' }}>
              {children}
            </div>
          </TabBar.Item>
        );
      })
    );
  };

  render () {
    const tabBarProps = {
      unselectedTintColor: '#949494',
      tintColor: '#33A3F4',
      barTintColor: 'white',
      prerenderingSiblingsNumber: 0,
    };

    return (
      <>
        <TabBar {...tabBarProps}>
          {this.renderTabBar(this.tabs)}
        </TabBar>
      </>
    );
  }
}

export default WeappLayout;
