import React, { Component } from 'react';
import { Tabs } from 'antd-mobile'
import { connect } from 'dva'
import router from 'umi/router'
import { pick } from '@/utils/utils'
import { getAuthority } from '@/utils/authority'
import styles from './index.less'
import model from '@/models/mobileTransport'
import TransportItem from './component/transportItem'
import ListContainer from '@/mobile/page/component/ListContainer'
import auth from '@/constants/authCodes'

const { ACCOUNT } = auth

const { actions: { getMobileTransport } } = model

function mapStateToProps (state) {
  return {
    transports: pick(state.mobileTransport, ['items', 'count'])
  }
}

const List = ListContainer(TransportItem)

@connect(mapStateToProps, { getMobileTransport })
class TransportList extends Component {

    tabs=[
      { title: '待执行', type:'accept', index:0 },
      { title: '待提货', type:'checkPending', index:1 },
      { title: '运输中', type:'execute', index:2 },
      { title: '待审核', type:'auditwait', index:3 },
      { title: '已完成', type:'all', transportImmediateStatus:4, index:4 },
      { title: '已取消', type:'all', transportImmediateStatus:3, index:5 },
      { title: '运单异常', type:'exception', index:6 },
      { title: '全部运单', type:'all', index:7 }
    ]

  renderTabBar = (props) => <Tabs.DefaultTabBar {...props} page={4} />

  getTransports = (params) => this.props.getMobileTransport(params)

  defaultValueTrans=()=>{
    const { location: { query: { transportType, projectId, projectName, dayType, handOverStartTime, handOverEndTime } } } = this.props
    if (Number(transportType)===1){
      if (projectId){
        return `${projectName}项目在途运单查询`
      }
      return `在途运单查询`
    }
    if (Number(transportType)===2) {
      if (projectId){
        if (Number(dayType)===1){
          return `${projectName}项目-近14天所有运单查询`
        } if (Number(dayType)===2){
          return `${projectName}项目-近6个月所有运单查询`
        }
        return `${handOverStartTime}-${handOverEndTime}-${projectName}项目已完成运单查询`
      }
      return `${handOverStartTime}-${handOverEndTime}已完成运单查询`
    }
  }

  renderTabsContent = ({ type, index, transportImmediateStatus }) => {
    const ownedPermissions = getAuthority()
    const spacialAuthes = [ACCOUNT]  // 能够查看全部项目预约单运单的权限
    const check = spacialAuthes.some(auth => ownedPermissions.indexOf(auth) > -1)
    const { location: { query: { handOverStartTime, handOverEndTime, startDistributTime, endDistributTime, transportNotInImmediateStatus, projectId, projectIdList } } } = this.props
    const qTransportImmediateStatus =this.props.location.query.transportImmediateStatus;
    const searchDefVal=this.defaultValueTrans()
    /**
     * projectId // 项目Id
       startDistributTime // 运单开始时间查询
       endDistributTime // 运单结束时间查询
       transportStatus":1, // 运单状态: 1待处理，2运输中，3.运输完成，9结束 4.待确认 5.提货待审核
       transportImmediateStatus:1,2 // 运单即时状态 【多个逗号隔开】(1.未接单;2.已接单;3.已取消(已作废);4.已完成;5.待提货;6.已到站;7.运货中;8.承运已拒绝;10.托运已拒绝;11.承运待审;13.司机拒绝;14.运单异常 15.客户待审;16.托运待审 17.待确定 18.待确定审核不通过,19.司机取消申请;20.运单超时自动关闭 21.提货待审核 22提货审核不通过)
     */
    const props = {
      action: this.getTransports,
      params: {
        type,
        transportImmediateStatus,
        isPermissonSelectAll:check||undefined
      },
      wingBlank:true,
      style:{
        height:'calc(100% - 10px)'
      },
      showSearchBar:index===7,
      searchParams:{
        projectId:projectId||undefined,
        transportImmediateStatus:qTransportImmediateStatus || transportImmediateStatus,
        transportNotInImmediateStatus:transportNotInImmediateStatus || undefined,
        handOverStartTime:handOverStartTime?`${handOverStartTime} 00:00:00`:undefined,
        handOverEndTime:handOverEndTime?`${handOverEndTime} 23:59:59`:undefined,
        startDistributTime:startDistributTime?`${startDistributTime} 00:00:00`:undefined,
        endDistributTime:endDistributTime?`${endDistributTime} 23:59:59`:undefined,
        projectIdList:projectIdList||undefined,
      },
      searchDefaultValue:searchDefVal,
      searchBarProps:{
        defaultValue:searchDefVal,
        placeholder:'可输入运单号\\车牌号\\司机\\项目名称搜索',
        onClear:() => {
          // router.replace(`/WeappConsign/main/staging?initialPage=1&transportPage=7`);
          // window.location.href=`/WeappConsign/main/staging?initialPage=1&transportPage=7`
        }
      },
      SearchBarClearOther:{
        projectId:undefined,
        projectIdList:undefined,
        handOverStartTime:undefined,
        handOverEndTime:undefined,
        transportImmediateStatus:undefined,
        transportNotInImmediateStatus:undefined,
        startDistributTime:undefined,
        endDistributTime:undefined
      },
      keyName:'vagueSelect',
      itemProps:{
        type
      }
    }

    /* Todo 查询订单结果显示当前是什么状态下的查询条件 */
    return (
      <>
        <List {...props} />
      </>
    )
  }

  componentDidMount (){

  }


  onChange = (tabData, index)=>{
    const { location:{ pathname, query:{ initialPage } } } = this.props
    console.log(this.props.location)
    router.replace(`${pathname}?initialPage=${initialPage}&transportPage=${index}`)
  }

  render () {
    let { location: { query: { transportPage } } } = this.props
    transportPage = parseInt(transportPage, 10)

    return (
      <div className={styles.goodsPlanList}>
        <Tabs
          tabs={this.tabs}
          onChange={this.onChange}
          initialPage={transportPage}
          swipeable={false}
          // distanceToChangeTab={0.7}
          prerenderingSiblingsNumber={0}
          renderTabBar={this.renderTabBar}
        >
          {this.renderTabsContent}
        </Tabs>
      </div>
    );
  }
}

export default TransportList;
