import React, { Component } from 'react'
import { Input, message } from 'antd'
import { InputItem, Modal, Button } from 'antd-mobile'
import Map from '@/weapp/component/Map'

export default class MapInput extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: false,
      display: 'none',
      address: '',
      location: ''
    }
  }

  OpenModal = () => {
    this.setState({
      visible: true,
      display:'inline-block'
    })
  }

  onCancel = () => {
    const { value, field: { key }, formData } = this.props
    let long
    let lat
    if (value) {
      long = (value && value[key === 'deliveryAddressObject' ? 'deliveryLongitude' : 'receivingLongitude']) || ''
      lat = (value && value[key === 'deliveryAddressObject' ? 'deliveryLatitude' : 'receivingLatitude']) || ''
    } else {
      long = (formData && formData[key]?.[key === 'deliveryAddressObject' ? 'deliveryLongitude' : 'receivingLongitude']) || ''
      lat = (formData && formData[key]?.[key === 'deliveryAddressObject' ? 'deliveryLatitude' : 'receivingLatitude']) || ''
    }
    if (long && lat) {
      this.mapModal.refreshMarker(long, lat)
    }
    this.mapModal.state.searchValue = ''
    this.setState({
      visible: false,
      display: 'none'
    })
  }

  onMarkerAddress = (location, address) => {
    this.setState({
      address,
      location
    })
  }

  Ok = () => {
    const { form, field: { key } } = this.props
    const { address, location } = this.state
    if (!address && !location) {
      message.error('请选择地址！')
      return false
    }
    const AddressObject = {
      [key === 'deliveryAddressObject' ? 'deliveryAddress' : 'receivingAddress']: address,
      [key === 'deliveryAddressObject' ? 'deliveryLongitude' : 'receivingLongitude']: location && location.split(',')[0],
      [key === 'deliveryAddressObject' ? 'deliveryLatitude' : 'receivingLatitude']: location && location.split(',')[1]
    }
    this.mapModal.state.searchValue = ''
    // isFunction(onChange) && onChange(AddressObject)
    form.setFieldsValue({ [key]: AddressObject })
    this.setState({
      visible: false,
      display: 'none'
    })
  }

  render () {
    const { value, formData, field: { key, placeholder } } = this.props
    const { visible, address, display } = this.state
    const addressStyle = {
      marginBottom: 10,
      height: '30px',
      fontSize: '12px',
      lineHeight: '15px',
    }
    const inputValue = (value && value[key === 'deliveryAddressObject' ? 'deliveryAddress' : 'receivingAddress'])
    || formData[key === 'deliveryAddressObject' ? 'deliveryAddress' : 'receivingAddress'] || ''
    const long = (formData && formData[key]?.[key === 'deliveryAddressObject' ? 'deliveryLongitude' : 'receivingLongitude']) || ''
    const lat = (formData && formData[key]?.[key === 'deliveryAddressObject' ? 'deliveryLatitude' : 'receivingLatitude']) || ''
    return (
      <>
        <InputItem editable={false} value={inputValue} placeholder={placeholder || '请选择地址'} onClick={this.OpenModal}>详细地址</InputItem>
        {/* <Modal
          visible={visible}
          title={placeholder || '请选择地址'}
          maskClosable={false}
          onOk={this.Ok}
          onClose={this.onCancel}
          closable
          style={{ zIndex: '100' }}
        >
        </Modal> */}
        <div style={{ position:'absolute', left:0, right:0, top:0, bottom:0, display, zIndex:1000, backgroundColor:'white' }}>
          <div style={addressStyle}>当前选中地址：{address}</div>
          <Map
            ref={c => (this.mapModal = c)}
            long={long}
            lat={lat}
            okFunc={this.Ok}
            onMarkerAddress={this.onMarkerAddress}
          />
          <Button type="primary" style={{ marginTop:20 }} onClick={this.Ok}>确定</Button>
        </div>
      </>
    )
  }
}
