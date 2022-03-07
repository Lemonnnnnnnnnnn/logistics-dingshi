import React, { Component } from 'react';
import { Tabs } from 'antd-mobile';
import { connect } from 'dva'
import { PREBOOKING_STAUTS } from '@/constants/project/project'
import prebookingModel from '@/models/mobilePrebooking'
import { getAuthority } from '@/utils/authority'
import { pick } from '@/utils/utils'
import { getPrebooking } from '@/services/apiService'
import ListContainer from '@/mobile/page/component/ListContainer'
import PrebookingItem from './component/PrebookingItem/PrebookingItem'
import auth from '@/constants/authCodes'

const { ACCOUNT } = auth

const { actions: { getMobilePrebooking } } = prebookingModel

function mapStateToProps (state) {
  return {
    preBooking: pick(state.mobilePrebooking, ['items', 'count'])
  }
}

const List = ListContainer(PrebookingItem)

@connect(mapStateToProps, { getMobilePrebooking })
export default class PrebookingList extends Component {

  constructor (props) {
    super(props)
    const { location: { query: { tab } } } = props
    this.state = {
      activeTab: +tab || 0,
    }
  }

  renderContent = tab => {
    const { location: { query: { goodsPlanId } } } = this.props
    const ownedPermissions = getAuthority()
    const spacialAuthes = [ACCOUNT]  // 能够查看全部项目预约单运单的权限
    const check = spacialAuthes.some(auth => ownedPermissions.indexOf(auth) > -1)
    const props = {
      action: getPrebooking,
      params: { prebookingStatus: tab.prebookingStatus, isPermissonSelectAll:check||undefined, goodsPlanId },
      prebookingStatus: tab.prebookingStatus,
      primaryKey:'prebookingId'
    }

    return <List {...props} />
  }

  onChangeTab = (tab, index) => this.setState({ activeTab: index })

  renderTabBar = (props) => <Tabs.DefaultTabBar {...props} page={5} />

  getTabs = () => [
    { title: '待确定', prebookingStatus: PREBOOKING_STAUTS.UNCERTAINTY },
    { title: '调度中', prebookingStatus: PREBOOKING_STAUTS.UNCOMPLETED },
    { title: '调度完成', prebookingStatus: PREBOOKING_STAUTS.COMPLETE },
    { title: '已拒绝', prebookingStatus: PREBOOKING_STAUTS.REFUSE },
    { title: '已取消', prebookingStatus: PREBOOKING_STAUTS.CANCELED },
    { title: '全部', prebookingStatus: undefined },
  ]

  render () {
    const { activeTab } = this.state
    return (
      <Tabs onChange={this.onChangeTab} tabBarTextStyle={{ fontSize:'13px' }} distanceToChangeTab={0.4} page={activeTab} tabs={this.getTabs()} prerenderingSiblingsNumber={0} renderTabBar={this.renderTabBar}>
        {this.renderContent}
      </Tabs>
    )
  }
}
