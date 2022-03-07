import React, { Component } from 'react';
import { connect } from 'dva'
import { List, Picker, Toast, WingBlank, WhiteSpace } from 'antd-mobile'
import { getDriverByShipment, getCarByShipment } from '@/services/apiService'
import MobileForm, { FormItem, FORM_MODE, FormButton } from '@/components/MobileForm'
import DeliveryList from './component/TransportDeiveryList'
import transportModel from '@/models/transports'
import prebookingModel from '@/models/preBooking'

const { actions: { detailPreBooking } } = prebookingModel
const { actions: { detailTransports, patchTransports } } = transportModel

function mapStateToProps (state) {
  return {
    transport : state.transports.entity,
    preBooking : state.preBooking.entity
  }
}

@connect(mapStateToProps, { detailPreBooking, detailTransports, patchTransports })
export default class TransportModify extends Component{

  state={
    ready:false
  }

  schema = {
    fields:[
      {
        key: 'carId',
        label: '车辆',
        component: 'picker',
        required: true,
        placeholder: ' ',
        options: async () => {
          const { items: data } = await getCarByShipment({ isPassShipments: true, isAvailable: true, limit:1000, offset:0 })
          const items = data || []
          const result = items
            .filter(item=>item.isBusy===1)
            .map(item => ({
              key: item.carId,
              value: item.carId,
              label: `${item.carNo}(${item.carLoad}吨)${item.isBusy ? '(空闲)' : '(忙碌)'}`,
            }))
          const { carId, plateNumber } = this.props.transport
          const own = { key: carId, value: carId, label:plateNumber }
          return [...result, own]
        },
      },
      {
        key: 'driverUserId',
        label: '司机',
        component: 'picker',
        required: true,
        placeholder: '请选择司机',
        options: async () => {
          const { items: data } = await getDriverByShipment({ limit:1000, offset:0 })
          const items = data || []
          const result = items
            .filter(item=>item.isBusy===1)
            .map(item => ({
              key: item.userId,
              value: item.userId,
              label: `${item.nickName}${item.isBusy ? '(空闲)' : '(忙碌)'}`,
            }))
          const { driverUserId, driverUserName } = this.props.transport
          const own = { key: driverUserId, value: driverUserId, label:driverUserName }
          return [...result, own]
        },
      },
      {
        key: 'deliveryItems',
        component: DeliveryList,
        required: '请输入提货信息',
        validator: ({ value = [] }) => {
          if (!value.length) {
            return '请输入提货信息'
          }
        }
      },
      {
        key: 'receivingId',
        label: '卸货点',
        component: ReceivingPicker,
        required: '请选择卸货点',
        placeholder: ' ',
        options: () => {
          const receiving = this.props.preBooking.receivingItems.reduce((receivingItems, current) => {
            const check = receivingItems.findIndex(item => item.value === current.receivingId)
            if (check < 0) {
              const { receivingName, receivingId } = current
              return [...receivingItems, { key: receivingId, value: receivingId, label: receivingName }]
            }
            return receivingItems
          }, [])
          return receiving
        },
        watcher:{
          key: 'deliveryItems',
          action: (data) =>{
            const delivery = data.formData.deliveryItems[0]||{ goodsId:undefined }
            const receiving = this.props.preBooking.receivingItems.find(item => item.goodsId === delivery.goodsId)
            return receiving && [receiving.receivingId]
          }
        },
        modifiable:false
      }
    ],
    operations:[
      {
        label: '保存',
        type: 'primary',
        action: 'submit',
        onClick: value =>{
          const { patchTransports, transport:{ transportId, exceptionItems=[] }, preBooking:{ acceptanceTime, prebookingId } } = this.props
          const { receivingId:[receivingId], carId:[carId], driverUserId:[driverUserId], deliveryItems } = value
          const { transpotExceptionId:transportExceptionId } = exceptionItems.find(item=>item.processingTime===null)
          patchTransports({ transportId, prebookingId, deliveryItems, receivingId:+receivingId, carId, driverUserId, expectTime:acceptanceTime.format(), transportExceptionId })
            .then(()=>{
              Toast.success('修改运单成功', 1)
            })
        }
      }
    ]
  }

  componentDidMount (){
    const { detailTransports, detailPreBooking, location: { query: { transportId } } } = this.props
    detailTransports({ transportId })
      .then(data=>detailPreBooking({ prebookingId:data.prebookingId }))
      .then(()=>{
        this.setState({
          ready:true
        })
      })
  }

  render (){
    const { ready } = this.state
    const { carId, driverUserId, receivingId } = this.props.transport
    const entity = { ...this.props.transport, carId:[carId], driverUserId:[driverUserId], receivingId:[receivingId] }
    return (
      <>
        {ready&&
        <MobileForm schema={this.schema} entity={entity} mode={FORM_MODE.MODIFY}>
          <List>
            <FormItem fields='carId' />
            <FormItem fields='driverUserId' />
          </List>
          <List renderHeader={() => '提货信息'}>
            <FormItem fields='deliveryItems' />
          </List>
          <List renderHeader={() => '卸货信息'}>
            <FormItem fields='receivingId' />
          </List>
          <WhiteSpace size="lg" />
          <WingBlank>
            <FormButton debounce action='submit' />
          </WingBlank>
        </MobileForm>}
      </>
    )
  }
}

class ReceivingPicker extends React.Component{
  render (){
    const { options=[], disabled=false, value, placeholder='', field:{ key }, label, formData:{ deliveryItems } } = this.props
    const arrow = 'horizontal'
    return (
      <Picker data={options} disabled={disabled} value={deliveryItems&&deliveryItems.length>0?value:[]} cols={1} extra={placeholder}>
        <List.Item key={key} arrow={arrow}>{label}</List.Item>
      </Picker>
    )
  }
}
