import React, { Component } from 'react';
import { Input, Modal, message } from 'antd';
import Map from '../../../components/map/Map';

export default class MapInput extends Component {
  constructor (props) {
    super(props);
    this.state = {
      visible: false,
      address: '',
      location: '',
      district: '',
      adCode: ''
    };
  }

  OpenModal = () => {
    this.setState({
      visible: true,
      // district: '',
    });
  }

  onCancel = () => {
    const { value, id, formData } = this.props;
    let long;
    let lat;
    if (value) {
      long = (value && value[id === 'deliveryAddressObject' ? 'deliveryLongitude' : 'receivingLongitude']) || '';
      lat = (value && value[id === 'deliveryAddressObject' ? 'deliveryLatitude' : 'receivingLatitude']) || '';
    } else {
      long = (formData && formData[id === 'deliveryAddressObject' ? 'deliveryLongitude' : 'receivingLongitude']) || '';
      lat = (formData && formData[id === 'deliveryAddressObject' ? 'deliveryLatitude' : 'receivingLatitude']) || '';
    }
    if (long && lat) {
      this.mapModal.refreshMarker(long, lat);
    }
    this.mapModal.state.searchValue = '';
    this.setState({
      visible: false
    });
  }

  onMarkerAddress = (location, address, adCode = "", district = '') => {
    this.setState({
      address,
      adCode,
      district,
      location
    });
  }

  Ok = () => {
    const { form, id } = this.props;
    const { address, location, adCode, district } = this.state;
    if (!address && !location) {
      message.error('请选择地址！');
      return false;
    }
    const AddressObject = {
      [id === 'deliveryAddressObject' ? 'deliveryDistrict' : 'receivingDistrict']: district,
      [id === 'deliveryAddressObject' ? 'deliveryAdCode' : 'receivingAdCode']: adCode,
      [id === 'deliveryAddressObject' ? 'deliveryAddress' : 'receivingAddress']: address,
      [id === 'deliveryAddressObject' ? 'deliveryLongitude' : 'receivingLongitude']: location && location.split(',')[0],
      [id === 'deliveryAddressObject' ? 'deliveryLatitude' : 'receivingLatitude']: location && location.split(',')[1]
    };
    this.mapModal.state.searchValue = '';
    form.setFieldsValue({ [id]: AddressObject });
    this.setState({
      visible: false
    });
  }

  render () {
    const { value, formData, id, name } = this.props;
    const { visible, address } = this.state;
    const bodyStyle = {
      width: '40vw',
      height: '60vh'
    };
    const addressStyle = {
      marginBottom: 10
    };
    const inputValue = (value && value[id === 'deliveryAddressObject' ? 'deliveryDistrict' : 'receivingDistrict'])
      || formData[id === 'deliveryAddressObject' ? 'deliveryDistrict' : 'receivingDistrict'] || '';
    const long = (formData && formData[id === 'deliveryAddressObject' ? 'deliveryLongitude' : 'receivingLongitude']) || '';
    const lat = (formData && formData[id === 'deliveryAddressObject' ? 'deliveryLatitude' : 'receivingLatitude']) || '';
    return (
      <>
        <Input readOnly value={inputValue} placeholder={`请选择${name}`} onClick={this.OpenModal} />
        <Modal
          width='40vw'
          visible={visible}
          title={`选择${name}`}
          maskClosable={false}
          bodyStyle={bodyStyle}
          onOk={this.Ok}
          onCancel={this.onCancel}
        >
          <div style={addressStyle}>当前选中地址：{address}</div>
          <Map
            ref={c => (this.mapModal = c)}
            long={long}
            lat={lat}
            onMarkerAddress={this.onMarkerAddress}
          />
        </Modal>
      </>
    );
  }
}
