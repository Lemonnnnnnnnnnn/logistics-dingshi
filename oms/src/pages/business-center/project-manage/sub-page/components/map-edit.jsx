import React, { Component } from 'react';
import { Input, Modal, message } from 'antd';
import Map from '../../../../../components/map/Map';

export default class MapEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      address: '',
      location: '',
    };
  }

  OpenModal = () => {
    this.setState({
      visible: true,
    });
  }

  onCancel = () => {
    const { form, type } = this.props;
    const lon = type === 'delivery' ? 'deliveryLongitude' : 'receivingLongitude';
    const lng = type === 'delivery' ? 'deliveryLatitude' : 'receivingLatitude';
    const long = form.getFieldValue(lon);
    const lat = form.getFieldValue(lng);
    if (long && lat) {
      this.mapRef.refreshMarker(long, lat);
    }
    this.mapRef.state.searchValue = '';
    this.setState({
      visible: false,
    });
  }

  /**
   * 地址改变
   * @memberof MapEdit
   */
  onMarkerAddress = (location, address) => {
    this.setState({
      address,
      location,
    });
  }

  Ok = () => {
    const { form, type = 'delivery' } = this.props;
    const { address, location } = this.state;
    if (!address && !location) {
      message.error('请选择地址！');
      return false;
    }
    this.mapRef.state.searchValue = '';
    this.setState({
      visible: false,
    }, () => {
      const addressName = type === 'delivery' ? 'deliveryAddress' : 'receivingAddress';
      const lon = type === 'delivery' ? 'deliveryLongitude' : 'receivingLongitude';
      const lng = type === 'delivery' ? 'deliveryLatitude' : 'receivingLatitude';
      form.setFieldsValue({ [addressName]: address });
      form.setFieldsValue({ [lon]: location.split(',')[0] });
      form.setFieldsValue({ [lng]: location.split(',')[1] });
    });
  }

  render() {
    const { visible, address,  } = this.state;
    const { value, type, disabled } = this.props;
    const bodyStyle = {
      width: '40vw',
      height: '60vh',
    };
    const addressStyle = {
      marginBottom: 10,
    };
    return (
      <>
        <Input
          readOnly
          disabled={disabled}
          value={value}
          placeholder={type === 'receiving' ? '请选择卸货地址' : '请选择提货地址'}
          onClick={this.OpenModal}
        />
        <Modal
          width='40vw'
          visible={visible}
          title={type === 'receiving' ? '选择卸货地址' : '选择提货地址'}
          maskClosable={false}
          bodyStyle={bodyStyle}
          onOk={this.Ok}
          onCancel={this.onCancel}
        >
          <div style={addressStyle}>当前选中地址：{address}</div>
          <Map
            ref={c => (this.mapRef = c)}
            onMarkerAddress={this.onMarkerAddress}
          />
        </Modal>
      </>
    );
  }
}
