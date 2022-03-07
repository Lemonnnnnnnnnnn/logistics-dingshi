import React from 'react'
import { Tabs } from 'antd-mobile'
import { connect } from 'dva'
import model from '@/models/preBooking'
import ListContainer from '@/mobile/page/component/ListContainer'
import ReservationItem from './reservationItem'

const { actions: { getPreBooking } } = model

const ListPage = ListContainer(ReservationItem)

@connect(null, { getPreBooking })
export default class ReservationList extends React.Component {

  tabs = [
    { title: '待接单', index: 0, type: 1 },
    { title: '待确认', isPosted: true, index: 1, type: 2 },
  ]

  state = {
    tabs: {},
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const { value } = nextProps
    // 当传入的type发生变化的时候，更新state
    if (value !== prevState.value) {
      return {
        projectId: value[0],
      }
    }
    // 否则，对于state不进行任何操作
    return null
  }

  renderTabBar = (props) => <Tabs.DefaultTabBar {...props} page={4} />

  onChangeTabs = (tabs) => {
    this.setState({ tabs })
  }

  renderTabsContent = () => {
    const { tabs, projectId } = this.state
    const { isPosted, type = 1 } = tabs
    let params
    if (projectId === undefined || projectId === -1) {
      params = isPosted ? { isPosted, isAwaitReceived: true } : {}
    } else {
      params = isPosted ? { isPosted, isAwaitReceived: true, projectId } : { projectId }
    }

    const props = {
      action: this.props.getPreBooking,
      params,
      wingBlank: true,
      style: {
        height: 'calc(100% - 10px)',
      },
      itemProps: {
        type,
      },
    }
    return <ListPage key={projectId} {...props} />
  }

  render () {
    return (
      <Tabs
        tabs={this.tabs}
        prerenderingSiblingsNumber={0}
        renderTabBar={this.renderTabBar}
        onChange={this.onChangeTabs}
      >
        {this.renderTabsContent()}
      </Tabs>
    )
  }
}
