import React from 'react'
import { TabBar } from 'antd-mobile'
import { connect } from 'dva'
import router from 'umi/router'
import { Base64 } from 'js-base64'
import FastClick from 'fastclick'
import styles from './WeappLayout.css'
import homeIcon from '@/assets/home.png'
import homeOnIcon from '@/assets/home_on.png'
import projectIcon from '@/assets/project.png'
import projectOnIcon from '@/assets/project_on.png'
import messageIcon from '@/assets/message.png'
import messageOnIcon from '@/assets/message_on.png'
import settingIcon from '@/assets/setting.png'
import settingOnIcon from '@/assets/setting_on.png'
import './WeappTabBarLayout.css'
// FastClick.attach(document.body)

@connect(null, dispatch => ({
  login: payload => dispatch({ type: 'user/login', payload })
}))
class WeappLayout extends React.PureComponent {
  tabs = [
    { title: '工作台', key: 'work_space', icon: homeIcon, selectedIcon: homeOnIcon, to: '/Weapp/main/index' },
    // { title: '计划单&运单', key: 'transport', icon: projectIcon, selectedIcon: projectOnIcon, to: '/Weapp/main/goodsplansList' },
    { title: '发货统计', key: 'transport', icon: projectIcon, selectedIcon: projectOnIcon, to: '/Weapp/main/statistics' },
    { title: '消息', key: 'notification', icon: messageIcon, selectedIcon: messageOnIcon, to: '/Weapp/main/messageCenter' },
    { title: '我的', key: 'personalcenter', icon: settingIcon, selectedIcon: settingOnIcon, to: '/Weapp/main/personalCenter' }
  ]

  constructor (props) {
    super(props)

    const key = this.getDefaultActiveTab()
    this.state = {
      activeTab: key
    }
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
    this.setTitle()
  }

  getDefaultActiveTab = () => {
    const { location: { pathname } } = this.props
    const currentTab = this.tabs.find(tab => pathname.includes(tab.to)) || this.tabs[0]
    return currentTab.key
  }

  setTitle = () => {
    const { route: { routes }, location: { pathname } } = this.props
    const matchedRoute = routes.find(({ path }) => path === pathname)
    const title = matchedRoute ? matchedRoute.name : '易键达'
    document.title = title
  }

  onChangeTab = (tab) => {
    const { activeTab } = this.state

    if (activeTab === tab.key) return false
    router.replace(tab.to)
    this.setState({
      activeTab: tab.key
    })
  }

  renderTabBar = (tabs) => {
    const { activeTab } = this.state
    const { children } = this.props
    return (
      tabs.map((tab) => {
        const { key, title, icon, selectedIcon } = tab
        const selected = activeTab === key
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
        )
      })
    )
  }

  render () {
    const tabBarProps = {
      unselectedTintColor: "#949494",
      tintColor: "#33A3F4",
      barTintColor: "white",
      prerenderingSiblingsNumber: 0,
    }

    return (
      <>
        <TabBar {...tabBarProps}>
          {this.renderTabBar(this.tabs)}
        </TabBar>
      </>
    )
  }
}

export default WeappLayout
