import React, { Component } from 'react'
import { connect } from 'dva'
import moment from 'moment'
import router from 'umi/router'
import CardList from '@/weapp/component/CardList'
import { getTransportStatus } from '@/services/project'
import model from '@/models/transports'

const { actions: { getTransports } } = model
@connect(null, { getTransports })
export default class RelationTransport extends Component{
  fieldConfig = [
    {
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
      render: item => {
        const goodsItems = item.deliveryItems.map(item=>({ word:`${item.categoryName}-${item.goodsName}`, key:item.transportCorrelationId, goodsNum:`${item.goodsNum}${item.goodsUnitCN}` }))
        const list = goodsItems.map(item=><li key={item.key}>{item.word}<span style={{ marginLeft:'20px' }}>{item.goodsNum}</span></li>)
        return (
          <ul>
            {list}
          </ul>
        )
      },
      layout:'horizontal'
    }, {
      key:'projectName',
      label:'合同名称'
    }, {
      key:'createTime',
      label:'创建日期',
      render: item =>moment(item.createTime).format('YYYY-MM-DD HH:mm')
    }, {
      key:'status',
      render: item => {
        const statusArr = getTransportStatus(item)[0]
        return (<span style={{ position:'absolute', right:20, top:15, color:statusArr.color }}>{statusArr.word}</span>)
      }
    }
  ]

  getTransport = (params) => this.props.getTransports(params)

  routerToDetail = item => {
    router.push(`transportDetail?transportId=${item.transportId}`)
  }

  render (){
    const { location: { query: { goodsPlanId } } } = this.props
    const _props = {
      action:this.getTransport,
      params:{ goodsPlanId },
      style:{
        height: 'calc( 100% - 14px )',
        marginTop: '14px'
      }
    }
    return (
      <CardList primaryKey='transprotId' onCardClick={this.routerToDetail} {..._props} fieldConfig={this.fieldConfig} />
    )
  }
}
