import React, { Component } from 'react'
import { connect } from 'dva'
import moment from 'moment'
import router from 'umi/router'
import { Icon, Toast } from 'antd-mobile'
import CardContent from '@/weapp/component/CardContent'
import ListContainer from '@/mobile/page/component/ListContainer'
import model from '@/models/transports'
import { getTransportStatus } from '@/services/project'

const List = ListContainer(props => <CardContent {...props} />)

const { actions: { getTransports, detailTransports } } = model
@connect(null, { getTransports, detailTransports })
export default class TransportList extends Component{

  fieldConfig = [
    {
      key:'createTime',
      render: item => <span style={{ color: '#9B9B9B' }}>{moment(item.createTime).format('YYYY-MM-DD HH:mm')}</span>
    }, {
      key:'projectName',
      label:'合同名称',
      labelStyle: { marginTop: '5px' }
    }, {
      key:'transportNo',
      label:'运单'
    }, {
      key:'plateNumber',
      label:'车牌号',
    }, {
      key:'receivingName',
      label:'卸货点'
    }, {
      key:'deliveryItems',
      label:'商品',
      labelStyle: { verticalAlign: 'top', width:'14vw' },
      contentStyle: { width:'70vw' },
      render: item => {
        const goodsItems = item.deliveryItems.map(item=>({ word:`${item.categoryName}-${item.goodsName}`, key:item.transportCorrelationId, goodsNum:`${item.goodsNum}${item.goodsUnitCN}` }))
        const list = goodsItems.map(item=><li key={item.key}>{item.word}<span style={{ marginLeft:'20px' }}>{item.goodsNum}</span></li>)
        return (
          <ul>
            {list}
          </ul>
        )
      },
      // layout:'horizontal'
    }, {
      key: 'predictArriveTime',
      label:'预计到达时间',
      render: item => {
        const { predictArriveTime } = item
        return predictArriveTime?moment(predictArriveTime).format('YYYY-MM-DD HH:mm') : '--'
      }
    }, {
      key:'status',
      render: item => {
        const statusArr = getTransportStatus(item)[0]
        return (<span style={{ position:'absolute', right:20, top:15, color:statusArr.color }}>{statusArr.word}</span>)
      }
    }, {
      render: (item) => <span style={{ position:'absolute', right:10, bottom:5 }} onClick={(e)=>this.goToTrackMap(e, item.transportId)}>查看轨迹<Icon style={{ verticalAlign: 'bottom' }} type="right" /></span>
    }
  ]

  goToTrackMap = (e, transportId) => {
    e.stopPropagation( )
    Toast.loading('加载中', 100)
    this.props.detailTransports({ transportId })
      .then(()=>{
        Toast.hide()
        router.push('/Weapp/transportDetail/trackMap')
      })
  }

  getTransport = (params) => this.props.getTransports(params)

  routerToDetail = item => {
    router.push(`/Weapp/transportDetail?transportId=${item.transportId}&initialPage=1`)
  }

  renderList = () =>{
    // if (!isArray(data)) throw new Error('数据类型错误')
    const _props = {
      action:this.getTransport,
      showSearchBar: true,
      keyName: 'vagueSelect', // TODO搜索关键字 提交时使用的字段名
      searchBarProps:{
        placeholder: '关键字',
        maxLength: 20
      },
    }
    const itemProps = {
      fieldConfig: this.fieldConfig,
      onCardClick: this.routerToDetail
    }
    return <List primaryKey='transprotId' itemProps={itemProps} {..._props} />
  }

  render (){
    return (
      this.renderList()
    )
  }
}
