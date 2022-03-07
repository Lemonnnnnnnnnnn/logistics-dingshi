import React, { Component } from 'react'
import { Tabs } from 'antd-mobile'
import router from 'umi/router'
import TransportList from './TransportList'
import PrebookingList from './PrebookingList'
import styles from './index.less'

export default class Workbench extends Component {

  tabs = [
    { title: '预约单', index: 0 },
    { title: '运单', index: 1 }
  ]

  renderTabsContent = currentTabObj => {
    const { index } = currentTabObj
    if (index === 0) {
      return <PrebookingList />
    }
    return <TransportList {...this.props} />

  }

  renderTabBar = ({ activeTab, goToTab, tabs }) => (
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
    </>
  )

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
          swipeable={false}
          onChange={this.onChange}
          initialPage={initialPage}
          prerenderingSiblingsNumber={0}
          renderTabBar={this.renderTabBar}
        >
          {this.renderTabsContent}
        </Tabs>
      </div>
    )
  }
}
