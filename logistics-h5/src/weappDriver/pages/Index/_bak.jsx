import React, { Component } from 'react';
import { Tabs } from 'antd-mobile'
import { connect } from 'dva'
import { pick } from '@/utils/utils'
import styles from './index.less'
import model from '@/models/mobileTransport'
import TransportItem from './component/transportItem'
import ListContainer from '@/mobile/page/component/ListContainer'

const { actions: { getMobileTransport } } = model

function mapStateToProps (state) {
  return {
    transports: pick(state.mobileTransport, ['items', 'count'])
  }
}

const List = ListContainer(TransportItem)

@connect(mapStateToProps, { getMobileTransport })
class Index extends Component {

  tabs = [
    { title: '待接单', type:'process', index:0 },
    { title: '待执行', type:'accept', index:1 },
    { title: '运输中', type:'execute', index:2 },
    { title: '重新签收', type:'againsignin', index:3 },
  ]

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

  getTransports = (params) => this.props.getMobileTransport(params)

  renderTabsContent = ({ type }) => {
    const props = {
      action: this.getTransports,
      params: { type },
      wingBlank:true,
      style:{
        height:'calc(100% - 10px)'
      },
      itemProps:{
        type
      }
    }
    return (
      <>
        <List {...props} />
      </>
    )
  }

  render () {
    return (
      <div className={styles.goodsPlanList}>
        <Tabs
          tabs={this.tabs}
          prerenderingSiblingsNumber={0}
          renderTabBar={this.renderTabBar}
        >
          {this.renderTabsContent}
        </Tabs>
      </div>
    );
  }
}

export default Index;
