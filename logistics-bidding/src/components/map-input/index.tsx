import React, { Component } from "react";
import { Input, Modal, message, Form } from "antd";

import { Rule, FormInstance } from "antd/lib/form";
import Map from "./map";

interface IProps {
  name: string; // 字段key值
  title: string; // label名
  placeholder: string;
  rules: Rule[]; // 校验规则
  form: FormInstance;
  submitKey?: string; // 如果需要区号的key
  relationKey?: string;
  longKey: string; //经度key
  latKey: string; //维度key
}
interface IState {
  visible: boolean;
  address: string;
  location: string;
  district: string;
  adCode: string;
}

export default class MapInput extends Component<IProps, IState> {
  mapModal: any;
  constructor(props: IProps | Readonly<IProps>) {
    super(props);
    this.state = {
      visible: false,
      address: "",
      location: "",
      district: "",
      adCode: ""
    };
  }

  OpenModal = () => {
    this.setState({
      visible: true
      // district: '',
    });
  };

  onCancel = () => {
    let long;
    let lat;
    long = "";
    lat = "";
    if (long && lat) {
      this.mapModal.refreshMarker(long, lat);
    }
    this.mapModal.state.searchValue = "";
    this.setState({
      visible: false
    });
  };

  onMarkerAddress = (
    location: any,
    address: string,
    adCode = "",
    district = ""
  ) => {
    const { name, relationKey, form, submitKey, latKey, longKey } = this.props;
    this.setState({
      address,
      adCode,
      district,
      location
    });
    if (relationKey) {
      form.setFieldsValue({
        [latKey]: location && location.split(",")[1],
        [longKey]: location && location.split(",")[0],
        [name]: district,
        [relationKey]: address,
        [submitKey || "adCode"]: adCode
      });
    } else {
      form.setFieldsValue({
        [name]: adCode,
        [latKey]: location && location.split(",")[1],
        [longKey]: location && location.split(",")[0]
      });
    }
  };

  Ok = () => {
    const { address, location } = this.state;
    if (!address && !location) {
      message.error("请选择地址！");
      return false;
    }
    this.setState({
      visible: false
    });
  };

  render() {
    const {
      name,
      title,
      placeholder,
      rules,
      submitKey,
      latKey,
      longKey
    } = this.props;
    const { visible, address } = this.state;
    const bodyStyle = {
      width: "40vw",
      height: "60vh"
    };
    const addressStyle = {
      marginBottom: 10
    };
    const long = "";
    const lat = "";
    return (
      <>
        <Form.Item name={name} label={title} rules={rules}>
          <Input
            placeholder={`请选择${placeholder}`}
            onClick={this.OpenModal}
          />
        </Form.Item>
        {submitKey ? (
          <Form.Item name={submitKey} style={{ display: "none" }}>
            <Input />
          </Form.Item>
        ) : null}
        <Form.Item name={longKey} style={{ display: "none" }}>
          <Input />
        </Form.Item>
        <Form.Item name={latKey} style={{ display: "none" }}>
          <Input />
        </Form.Item>
        <Modal
          width="40vw"
          visible={visible}
          title={`选择${placeholder}`}
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
