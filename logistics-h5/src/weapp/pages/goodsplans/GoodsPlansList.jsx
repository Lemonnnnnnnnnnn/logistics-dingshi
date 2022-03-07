import React, { Component } from 'react'
import { Tabs, Modal, Icon } from 'antd-mobile'
import router from 'umi/router'
import ListContainer from '@/mobile/page/component/ListContainer'
import GoodsPlansItem from './components/GoodsPlansItem'
import GuestTips from '@/weapp/component/GuestTips/GuestTips'
import { getUserInfo } from '@/services/user'
import { getGoodsPlansList } from '@/services/apiService'
import TransportList from '../transport/TransportList'
import styles from './GoodsPlansList.css'

const CreatNewPlanButton = (porps) => {
  const componentStyle = {
    position: 'fixed',
    bottom: '30px',
    right: '10px',
    width: '50px',
    height: '50px',
    borderRadius: '40px',
    background: '#1890ff',
    color: '#fff',
    fontSize: '25px',
    lineHeight: '50px',
    textAlign: 'center',
    boxShadow: '0 0 10px 2px rgba(0,0,0,0.2)'
  }
  return (
    <div style={componentStyle} {...porps}>
      <Icon type="plus" />
    </div>
  )
}

const List = ListContainer(GoodsPlansItem)
const { alert } = Modal
export default class GoodsPlansList extends Component {

  tabs = [
    { title: '计划单', index: 0 },
    { title: '运单', index: 1 }
  ]

  isLogin = !!getUserInfo().accessToken

  creatNewPlans = () => {
    // TODO需要判断当前是否具有创建新预约单的权限,暂无接口
    const randomResult = [true, false]
    const result = randomResult[Math.floor(Math.random() * 2)]
    if (result) {
      // router.push()
    } else {
      alert('您有1张运单未确认收货', '需要确认收货后才可以新建要货计划单', [
        { text: '稍后再说', onPress: () => console.log('稍后再说') },
        { text: '立刻查看', onPress: () => console.log('立刻查看') },
      ])
    }
  }

  renderGuest = () => <GuestTips message="无法获取数据" />

  renderTabsContent = currentTabObj => {
    const { index } = currentTabObj
    if (index === 0) {
      return this.renderGoodsPlansList()
    }
    return <TransportList />

  }

  renderGoodsPlansList = () => {
    const props = {
      action: getGoodsPlansList,
      primaryKey: 'goodsPlanId',
      showSearchBar: true,
      searchBarProps: {
        placeholder: '关键字'
      },
      keyName: 'goodsPlanName'

    }
    return (
      <>
        <List {...props} />
        <CreatNewPlanButton onClick={()=>{ router.push('/Weapp/createGoodsPlans') }} />
      </>
    )
  }

  renderTabBar = ({ activeTab, goToTab, tabs, ...rest }) => {
    const underlineStyle = {
      width: '60px',
      transform: 'translate3d(50%, -2px, 0)',
      borderColor: '#000',
      left: `${activeTab * 110}px`,
      transition: 'left .15s ease-out',
      willChange: 'left'
    }
    rest.tabBarBackgroundColor = '#000'
    return (
      <>
        <ul className={styles.tabs}>
          {
            tabs.map(tab => {
              const { title, index } = tab
              const itemCls = index === activeTab ? `${styles.tabItem} ${styles.on}` : styles.tabItem
              return <li onClick={() => goToTab(index)} key={index} className={itemCls}>{title}</li>
            })
          }
        </ul>
        <div className="am-tabs-default-bar-underline" style={underlineStyle} />
      </>
    )
  }

  onChange = (tabData, index)=>{
    const { location:{ pathname } } = this.props
    router.replace(`${pathname}?initialPage=${index}`)
  }

  render () {
    let { location: { query: { initialPage } } } = this.props
    initialPage = parseInt(initialPage, 10)
    return (
      <div className={styles.goodsPlanList}>
        <Tabs
          tabs={this.tabs}
          initialPage={initialPage}
          prerenderingSiblingsNumber={0}
          renderTabBar={this.renderTabBar}
          onChange={this.onChange}
        >
          {
            this.isLogin
              ? this.renderTabsContent
              : this.renderGuest
          }
        </Tabs>
      </div>
    )
  }
}
