import React, { Component } from 'react';
import { Tabs } from 'antd-mobile';
import { connect } from 'dva'
import model from '@/models/mobileTransport'
import { pick, isNumber } from '@/utils/utils'
import { getAuthority } from '@/utils/authority'
import ListContainer from '@/mobile/page/component/ListContainer'
import { getUserInfo } from '@/services/user'
import auth from '@/constants/authCodes'
import TransportItem from './component/TransportItem/TransportItem'

const { ACCOUNT } = auth

const { actions: { getMobileTransport } } = model

const List = ListContainer(TransportItem, () => document.getElementsByClassName('am-tabs-pane-wrap-active')[0])

function mapStateToProps (state) {
  return {
    transports: pick(state.mobileTransport, ['items', 'count'])
  }
}
@connect(mapStateToProps, { getMobileTransport })
export default class PrebookingList extends Component {

  organizationType = +getUserInfo().organizationType

  constructor (props) {
    super(props)
    const ALL_TRANSPORT_INDEX = '9'
    const { location: { query: { tab, prebookingId, goodsPlanId } } } = props
    const activeTab = (prebookingId || goodsPlanId) ? ALL_TRANSPORT_INDEX : `${tab}` // 有prebookingId表示显示该预约单下的全部运单 否则根据路由tab确定
    this.state = {
      activeTab: isNumber(+tab) ? activeTab : '9'
    }
  }

  getTabs = () => this.organizationType === 4?[
    { title: '未接单', type: 'process', key:'0' },
    { title: '已接单', type: 'accept', key:'1' },
    { title: '待提货', type: 'tobepick', key:'7' },
    { title: '运输中', type: 'execute', key:'2' },
    { title: '已签收', type: 'signedcon', key:'4' },
    { title: '待审核', type: 'auditwait', key:'3' },
    { title: '运单异常', type: 'exception', key:'5' },
    { title: '重新签收', type: 'againsignin', key:'6' },
    { title: '被拒绝', type: 'drirefuse', key:'8' },
    { title: '全部', type: 'all', key:'9' }
  ]:[
    { title: '未接单', type: 'process', key:'0' },
    { title: '已接单', type: 'accept', key:'1' },
    { title: '待提货', type: 'tobepick', key:'7' },
    { title: '运输中', type: 'execute', key:'2' },
    { title: '已签收', type: 'signedcon', key:'4' },
    // { title: '待审核', type: 'auditwait', key:'3' },
    { title: '运单异常', type: 'exception', key:'5' },
    { title: '重新签收', type: 'againsignin', key:'6' },
    { title: '被拒绝', type: 'drirefuse', key:'8' },
    { title: '全部', type: 'all', key:'9' }
  ]


  renderContent = ({ type }) => {
    const { prebookingId, goodsPlanId } = this.props.location.query
    const ownedPermissions = getAuthority()
    const spacialAuthes = [ACCOUNT]  // 能够查看全部项目预约单运单的权限
    const check = spacialAuthes.some(auth => ownedPermissions.indexOf(auth) > -1)
    const formatSearchValue = value => {
      const keyList = value.split(' ').filter(item=>item)
      return keyList.join(',')
    }
    const placeholderWord = this.organizationType === 4? '合同、承运方、运单号，多关键词空格隔开': '合同、运单号、司机，多关键词空格隔开'
    const props = {
      searchBarProps:{
        placeholder: <span style={{ fontSize:'12px' }}>{placeholderWord}</span>
      },
      showSearchBar:true,
      formatSearchValue,
      keyName:'vagueList',
      action: this.getMobileTransport,
      params: { type, prebookingId, isPermissonSelectAll:check||undefined, goodsPlanId },
      type
    }

    return <List {...props} />
  }

  getMobileTransport = (params) => this.props.getMobileTransport(params)

  onChangeTab = (tab) => {
    const { type, key } = tab
    const { prebookingId } = this.props.location.query
    this.setState({ activeTab: key })
    // this.getMobileTransport({ type, prebookingId, offset: 0, limit: 30 })
    //   .then(() => this.setState({ activeTab: index }))
  }

  render () {
    const { activeTab } = this.state
    return (
      <Tabs onChange={this.onChangeTab} page={activeTab} tabBarTextStyle={{ fontSize:'13px' }} tabs={this.getTabs()} prerenderingSiblingsNumber={0} renderTabBar={props => <Tabs.DefaultTabBar {...props} page={5} />}>
        {this.renderContent}
      </Tabs>
    );
  }
}
