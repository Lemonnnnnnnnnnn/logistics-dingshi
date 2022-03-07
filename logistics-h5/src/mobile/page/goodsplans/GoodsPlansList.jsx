import React, { Component } from 'react';
import { Tabs } from 'antd-mobile';
import { getGoodsPlansList } from '@/services/apiService'
import { CONSIGNMENT_UNTREATED, CONSIGNMENT_REFUSED, GOINGON, COMPLETE, CANCEL, FINISH } from '@/constants/goodsPlans/goodsPlans'
import ListContainer from '@/mobile/page/component/ListContainer'
import auth from '@/constants/authCodes'
import { getAuthority } from '@/utils/authority'
import GoodsPlansItem from './components/GoodsPlansItem'

const { ACCOUNT } = auth

const List = ListContainer(GoodsPlansItem)
class GoodsPlansList extends Component {
  constructor (props) {
    super(props)
    const { location: { query: { tab } } } = props
    this.state = {
      activeTab: +tab || 0
    }
  }

  onChangeTab = (tab, index) => this.setState({ activeTab: index })

  renderContent = tab => {
    const ownedPermissions = getAuthority()
    const spacialAuthes = [ACCOUNT]  // 能够查看全部项目预约单运单的权限
    const check = spacialAuthes.some(auth => ownedPermissions.indexOf(auth) > -1)
    const props = {
      action: getGoodsPlansList,
      params: { planStatus: tab.goodsPlansStatus, isPermissonSelectAll:check||undefined },
      prebookingStatus: tab.prebookingStatus,
      primaryKey:'goodsPlanId',
      style:{
        height: '100%'
      }
    }

    return <List {...props} />
  }

  getTabs = () => [
    { title: '待确认', goodsPlansStatus: CONSIGNMENT_UNTREATED },
    { title: '进行中', goodsPlansStatus: GOINGON },
    { title: '已完成', goodsPlansStatus: COMPLETE },
    { title: '已结束', goodsPlansStatus: FINISH },
    { title: '已拒绝', goodsPlansStatus: CONSIGNMENT_REFUSED },
    // { title: '已撤销', goodsPlansStatus: CANCEL },
    { title: '全部', goodsPlansStatus: undefined }
  ]

  renderTabBar = (props) => <Tabs.DefaultTabBar {...props} page={5} />

  render () {
    const { activeTab } = this.state
    return (
      <Tabs onChange={this.onChangeTab} tabBarTextStyle={{ fontSize:'13px' }} swipeable={false} page={activeTab} tabs={this.getTabs()} prerenderingSiblingsNumber={0} renderTabBar={this.renderTabBar}>
        {this.renderContent}
      </Tabs>
    )
  }
}

export default GoodsPlansList;
