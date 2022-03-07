import React from 'react'
import { Tabs } from 'antd-mobile'
import { connect } from 'dva'
import model from '@/models/preBooking'
import ListContainer from '@/mobile/page/component/ListContainer'
import PrebookingItem from './component/PrebookingItem'

const { actions: { getPreBooking } } = model

const ListPage = ListContainer(PrebookingItem)

@connect(null, { getPreBooking })
export default class Index extends React.Component{
  tabs = [
    { title: '待接单', index:0, type: 1 },
    { title: '待确认', isPosted:true, index:1, type: 2 },
  ]

  renderTabBar = (props) => <Tabs.DefaultTabBar {...props} page={4} />

  renderTabsContent = ({ isPosted, type }) => {
    const props = {
      action: this.props.getPreBooking,
      params: isPosted? { isPosted, isAwaitReceived: true }: {},
      wingBlank:true,
      key: 'prebookingId',
      style:{
        height:'calc(100% - 10px)'
      },
      itemProps:{
        type
      }
    }
    return (
      <>
        <ListPage {...props} />
      </>
    )
  }

  render () {
    return (
      <Tabs
        tabs={this.tabs}
        prerenderingSiblingsNumber={0}
        renderTabBar={this.renderTabBar}
      >
        {this.renderTabsContent}
      </Tabs>
    )
  }
}
