import React from 'react'
import { TabBar } from 'antd-mobile'
import { connect } from 'dva'
import router from 'umi/router'
import styles from './WeappLayout.css'
import home from '@/assets/driver/home.png'
import homeOn from '@/assets/driver/home_on.png'
import hall from '@/assets/driver/hall.png'
import hallOn from '@/assets/driver/hall_on.png'
import personal from '@/assets/driver/personal.png'
import personalOn from '@/assets/driver/personal_on.png'
import './WeappTabBarLayout.css'

@connect(null, dispatch => ({
  login: payload => dispatch({ type: 'user/login', payload })
}))
class WeappLayout extends React.PureComponent {
  tabs = [
    { title: '首页', key: 'work_space', icon: home, selectedIcon: homeOn, to: '/WeappDriver/main/index' },
    { title: '接单大厅', key: 'notification', icon: hall, selectedIcon: hallOn, to: '/WeappDriver/main/hall' },
    { title: '我的', key: 'personalcenter', icon: personal, selectedIcon: personalOn, to: '/WeappDriver/main/personalCenter' }
  ]

  constructor (props) {
    super(props)
    const key = this.getDefaultActiveTab()
    this.state = {
      activeTab: key
    }
  }

  componentWillMount () {}

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
    const title = matchedRoute ? matchedRoute.name : '易键达司机端'
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
