import React, { Component } from 'react'
import { TextareaItem, List, Button } from 'antd-mobile'
import router from 'umi/router'
import { SchemaForm, FORM_MODE, Item, FormButton, ErrorNoticeBar, Parent } from '@gem-mine/mobile-schema-form';
import '@gem-mine/mobile-schema-form/src/fields'
import { getGoodsPlansDetail } from '@/services/apiService'
import GoodsCorrelationItems from './components/GoodsCorrelationItems'
import TransportCorrelationCnItems from './components/TransportCorrelationCnItems'
import { classifyGoodsWeight } from '@/utils/utils'

const PLANSTATUS = [
  '托运待确认',
  '托运已拒绝',
  '进行中',
  '已完成',
  '已撤销',
  '已结束'
]

export default class GoodsPlansDetail extends Component{

  componentDidMount (){
    const { location: { query: { goodsPlanId } } } = this.props
    getGoodsPlansDetail(goodsPlanId).then(data=>{
      data = this.calculatingGoodsTotalNum(data)
      this.setState({
        data
      })
    })
  }

  state={
    data: {}
  }

  // fileditem
  // calendar hide input inputitem picker teatArea
  schema = {
    planStatus:{
      label:'计划单状态',
      component: 'inputItem',
      format:{
        input:(value)=>PLANSTATUS[value]
      },
      props: {
        extra: <Button style={{ position:'relative', top:'-3px', borderRadius:'15px' }} onClick={this.goToTransportList} size='small' type='primary'>查看关联运单</Button>,
      }
    },
    projectName:{
      label: '合同名称',
      component: 'inputItem'
    },
    transportCorrelationCnItems:{
      component: TransportCorrelationCnItems
    },
    consignmentName: {
      label: '托运方',
      component: 'inputItem'
    },
    arrivalTime: {
      label: '期望到货时间',
      component: 'calender'
    },
    remarks: {
      component: 'textArea',
      props:{
        title: '备注',
        rows:3,
        clear: true
      }
    },
    goodsCorrelationItems: {
      component: GoodsCorrelationItems
    }
  }

  goToTransportList=()=>{
    // TODO
    const { location: { query: { goodsPlanId } } } = this.props
    router.go('')
  }

  calculatingGoodsTotalNum = (data) => {
    //
    data.transportCorrelationCnItems = classifyGoodsWeight(data.transportCorrelationCnItems, 'goodsId',
      [
        'goodsUnit', 'transportCorrelationId', 'goodsId', 'goodsNum', 'deliveryNum', 'receivingNum', 'goodsUnitCN',
        'deliveryUnitCN', 'receivingUnitCN', 'transportImmediateStatus', 'goodsName'
      ],
      (summary, current) => {
        // TODO这里需要添加运单状态的判断条件
        summary.goodsNum += current.goodsNum
        summary.deliveryNum += current.deliveryNum
        summary.receivingNum += current.receivingNum
      })
    // 计算要货数量
    data.transportCorrelationCnItems.forEach(transportCorrelationCnItem=>{
      transportCorrelationCnItem.goodTotalNum=0
      data.goodsCorrelationItems.forEach(goodsCorrelationItem=>{
        if (transportCorrelationCnItem.goodsId === goodsCorrelationItem.goodsId){
          transportCorrelationCnItem.goodTotalNum += goodsCorrelationItem.goodsNum
        }
      })
    })
    return data
  }

  render (){
    return (
      <div style={{ marginBottom: '50px' }}>
        <SchemaForm mode={FORM_MODE.DETAIL} schema={this.schema} data={this.state.data}>
          <List>
            <Item field='planStatus' />
            <Item field='transportCorrelationCnItems' />
            <Item field='projectName' />
            <Item field='consignmentName' />
            <Item field='arrivalTime' />
            <Item field='remarks' />
            <Item field='goodsCorrelationItems' />
          </List>
        </SchemaForm>
        <Button type="primary" style={{ zIndex:100, position:'fixed', bottom: '0px', width: '100%' }} onClick={router.goBack}>返回</Button>
      </div>
    )
  }
}
