import React, { Component } from 'react';
import { List, WhiteSpace, Toast, Modal, WingBlank, Button, SearchBar } from 'antd-mobile'
import { Icon } from 'antd'
import { connect } from 'dva'
import router from 'umi/router'
import MobileForm, { FormItem, FORM_MODE, FormButton } from '@/components/MobileForm'
import prebookingModel from '@/models/preBooking'
import shipmentCarModel from '@/models/shipmentCars'
import shipmentDriverModel from '@/models/shipmentDrivers'
import transportModel from '@/models/transports'
import logo from '@/assets/logo.png'
import nativeApi from '@/utils/nativeApi';
import { isFunction } from '@/utils/utils';
import { Action } from "antd-mobile/lib/modal/PropsType";
import { NETWORK_CONTRACT_LIST_STATUS } from '@/constants/project/project'
import ReceivingPicker from './component/ReceivingPicker'
import DeliveryList from './component/DeliveryList'

const { actions: { getShipmentCars } } = shipmentCarModel
const { actions: { getShipmentDrivers } } = shipmentDriverModel
const { actions: { detailPreBooking } } = prebookingModel
const { actions: { postTransports } } = transportModel

function mapStateToProps (state) {
  return {
    preBooking: state.preBooking.entity
  }
}

@connect(mapStateToProps, { getShipmentCars, getShipmentDrivers, detailPreBooking, postTransports })
export default class CreateDispatchFrom extends Component {

  state ={
    ready :false
  }

  postTransports = (data) => {
    this.props.postTransports({ ...data })
      .then(()=>{
        router.push(`prebookingList`)
        Toast.success('创建运单成功', 1)
      })
  }

  componentDidMount () {
    this.props.detailPreBooking({ prebookingId: this.props.location.query.prebookingId })
      .then((prebooking)=>{
        const { contractItems = [] } = prebooking
        const hasNetContract = (contractItems || []).findIndex(({ contractState, isAvailable, contractType }) => contractType === 2 && contractState === NETWORK_CONTRACT_LIST_STATUS.AUDITED && isAvailable) > -1;
        const schema = {
          fields: [
            {
              key: 'carId',
              label: '车辆',
              required: true,
              component: ListMap,
              options: async () => {
                let cars
                if (hasNetContract){
                  cars = await this.props.getShipmentCars({ limit:1000, offset:0, isAll : true })
                } else {
                  cars = await this.props.getShipmentCars({ limit:1000, offset:0 })
                }

                return cars.items.map(item => ({
                  key: item.carId,
                  value: item.carId,
                  item,
                  label: `${item.carNo}(${item.carLoad}吨)${item.isBusy ? '(空闲)' : '(忙碌)'}`,
                }))
              }
            },
            {
              key: 'driverUserId',
              label: '司机',
              component: ListMap,
              required: true,
              placeholder: '请选择司机',
              options: async () => {
                let driver
                if (hasNetContract){
                  driver = await this.props.getShipmentDrivers({ limit:1000, offset:0, isAll : true })
                } else {
                  driver = await this.props.getShipmentDrivers({ limit:1000, offset:0 })
                }

                return driver.items.map(item => ({
                  key: item.userId,
                  value: item.userId,
                  label: `${item.nickName}${item.isBusy ? '(空闲)' : '(忙碌)'}`,
                }))
              }
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
              options: async () => {
                const { receivingItems: data } = prebooking
                const receiving = data.reduce((receivingItems, current) => {
                  const check = receivingItems.findIndex(item => item.receivingId === current.receivingId)
                  if (check < 0) {
                    const { projectCorrelationId, receivingName, receivingId } = current
                    return [...receivingItems, { key: projectCorrelationId, value: receivingId, label: receivingName, receivingId }]
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
              readOnly:true
            }
          ],
          operations: [{
            label: '保存',
            type: 'primary',
            action: 'submit',
            onClick: (value) => {
              const { driverUserId: [driverUserId], receivingId: [receivingId] } = value
              const { carId } = value.carId
              // 校验货品类目
              let tip = ''
              let successAll = false
              value.deliveryItems.map((item) => {
                tip += `${item.firstCategoryName}、`
                let success = false
                if (value.carId.carCategoryEntityList) {
                  value.carId.carCategoryEntityList.map((itemCar) => {
                    if (item.firstCategoryId === itemCar.categoryId) {
                      success = true
                    }
                    return itemCar
                  })
                }
                if (!success) {
                  successAll = true
                }
                return item
              })
              if (successAll) {
                tip = !tip ? '' : tip.substring(0, tip.length - 1)
                // 匹配不上
                Modal.alert('', `当前选择车辆可承接货品与该预约单货品${tip}不匹配，是否确认派单？`,
                  [ { text: '取消', onPress: () => {
                    Toast.fail('请重新选择匹配的车辆', 1)
                  } }, { text: '确定', onPress: () => {
                    console.log('ok')
                    this.postTransports({ ...value, carId, driverUserId, receivingId, expectTime: this.props.preBooking.acceptanceTime.format(), prebookingId: this.props.preBooking.prebookingId })
                  } } ])
              } else {
                this.postTransports({ ...value, carId, driverUserId, receivingId, expectTime: this.props.preBooking.acceptanceTime.format(), prebookingId: this.props.preBooking.prebookingId })
              }
            }
          }]
        }
        this.setState({
          schema,
          ready :true
        })
      })
  }

  render () {
    const { ready } = this.state
    return (ready &&
      <MobileForm schema={this.state.schema} mode={FORM_MODE.ADD}>
        <List>
          <FormItem fields='carId' preData={this.props.preBooking} />
          <FormItem fields='driverUserId' />
        </List>
        <List renderHeader={() => '提货点'}>
          <FormItem fields='deliveryItems' />
        </List>
        <List renderHeader={() => '卸货信息'}>
          <FormItem fields='receivingId' />
        </List>
        <WhiteSpace size='lg' />
        <WingBlank>
          <FormButton debounce action='submit' />
        </WingBlank>
        {/* <FormButton debounce action='cancel' /> */}
      </MobileForm>
    )
  }
}


class ListMap extends Component{

  state={
    display:'none',
  }

  clickToSelect = () =>{
    const { readOnly = false } = this.props.field
    if (readOnly) return
    nativeApi.hideHeader()
    this.setState({
      display:'block'
    })
  }

  renderList = () =>{
    const { options=[] } = this.props
    let filterOptions = options
    const { selectId, searchKey } = this.state
    if (searchKey){
      filterOptions = options.filter(item=> item.label.indexOf(searchKey)!== -1)
    }
    const listContent = filterOptions.map(item=>(
      <List.Item onClick={()=>this.selectRow(item.value)} extra={(selectId&&selectId===item.value&&<Icon style={{ color:'green' }} type='check' />)}>
        <img src={logo} alt='' style={{ marginRight: '10px' }} />
        <div style={{ textAlign:"left", fontSize:'13px', display:'inline-block' }}>{item.label}</div>
      </List.Item>
    ))
    return (
      <List style={{ overflowY:'scroll', width:'100%', position:'absolute', bottom:'47px', top:'44px' }}>
        {listContent}
      </List>
    )
  }

  selectRow = rowId =>{
    this.setState({
      selectId:rowId
    })
  }

  saveValue = () =>{
    const { selectId } = this.state
    if (!selectId) return Toast.fail('未选择', 1)
    const { onChange, options=[] } = this.props
    const option = options.find(item=>item.value===selectId)
    isFunction(onChange)&&onChange([option.value])
    nativeApi.showHeader()
    this.setState({
      display:'none',
      text:option.label
    })
    if (option.item) {
      this.props.onChange(option.item)
    }
  }

  onCancel = () =>{
    nativeApi.showHeader()
    const { value } = this.props
    this.setState({
      selectId:value?.[0],
      display:'none'
    })
  }

  submitSearch = searchKey =>{
    this.setState({
      searchKey,
      selectId:undefined
    })
  }

  findOptionsLabel = () =>{
    const { value, options=[] } = this.props
    const opiton = options.find(item=>item.value===value)
    return opiton? opiton.label:undefined
  }

  render (){
    const { placeholder, field:{ label, readOnly = false } } = this.props
    const { display, text } = this.state
    return (
      <>
        <div style={{ position:'fixed', height:'100vh', width:'100%', top:0, display, zIndex:'1000', backgroundColor:'white' }}>
          <SearchBar placeholder="搜索" onSubmit={this.submitSearch} />
          {display==='block'&&this.renderList()}
          <div style={{ position:'absolute', bottom:'0', width:'100%', height:'47px', backgroundColor:'#FFFFFF' }}>
            <Button onClick={this.saveValue} style={{ color:'#FF6633', borderRadius:'54px', fontSize:'13px', width:'80px', height:'28px', margin:'9px 10px', float:'right', lineHeight:'28px', border:'1px solid #FF6633' }}>保存</Button>
            <Button onClick={this.onCancel} style={{ color:'#000', borderRadius:'54px', fontSize:'13px', width:'80px', height:'28px', margin:'9px 10px', float:'right', lineHeight:'28px', border:'1px solid #000' }}>取消</Button>
          </div>
        </div>
        <List.Item extra={text||this.findOptionsLabel()||placeholder||`请选择${label}`} arrow={readOnly?"empty":"horizontal"} onClick={this.clickToSelect}>{label}</List.Item>
      </>
    )
  }
}
