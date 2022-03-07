import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Button, message } from 'antd';
import memoize from "memoize-one";
import { isFunction, getLocal } from '@/utils/utils';

const phoneReg = /^1\d{10}$/;
const emailReg = /^\w+@[a-z0-9]+\.[a-z]{2,4}$/;

function mapStateToProps (state) {
  return {
    entity: state.groups.entity,
    commonStore: state.commonStore,
  };
}
@connect(mapStateToProps)
class MemberList extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  constructor (props){
    super(props);
    this.state = {
      data: props.value || new Array(5).fill({})
    };
  }

  onChange = e => {
    const input = e.target;
    const { value } = input;
    const changeFiled = input.getAttribute('changefiled');
    const index = input.getAttribute('index');
    const { data } = this.state;
    const { onChange } = this.props;
    const check = this.validateValue(value, changeFiled);
    const warning = input.nextSibling;
    const _data = JSON.parse(JSON.stringify(data));
    _data[index][changeFiled] = value;
    if (check) {
      if (warning){
        warning.style.visibility = 'hidden';
      }
      this.setState({
        data:_data
      });
    } else {
      warning.style.visibility = 'visible';
    }
    isFunction(onChange) && onChange(this.getUsefulData(_data));
  }

  getUsefulData = data => data.filter(({ groupMemberName, groupMemberTelephone, groupMemberEmail }) => {
    const check1 = phoneReg.test(groupMemberTelephone);
    const check2 = emailReg.test(groupMemberEmail);
    return groupMemberName && check1 && check2;
  })

  validateValue = (value, field) => {
    switch (field) {
      case 'groupMemberName' :
        return true;
      case 'groupMemberTelephone' :
        return phoneReg.test(value);
      case 'groupMemberEmail' :
        return emailReg.test(value);
      default: false;
    }
  }

  componentWillUnmount() {
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabs')?.tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...this.props.formData, logisticsGroupDetailEntities: this.state.data },
      }));
    }
  }

  renderMenberData = memoize(
    (data) => data.map((item, index) => (
      <Row key={index} style={{ marginTop:'10px' }}>
        <Col span={8}>
          <Input style={{ width:'70%' }} index={index} onChange={this.onChange} changefiled='groupMemberName' defaultValue={item.groupMemberName} />
        </Col>
        <Col span={8}>
          <Input style={{ width:'70%' }} index={index} onChange={this.onChange} changefiled='groupMemberTelephone' defaultValue={item.groupMemberTelephone} />
          <div style={{ marginLeft:'5px', visibility:'hidden', color:'red' }}>请输入正确的手机号</div>
        </Col>
        <Col span={8}>
          <Input style={{ width:'70%' }} index={index} onChange={this.onChange} changefiled='groupMemberEmail' defaultValue={item.groupMemberEmail} />
          <div style={{ marginLeft:'5px', visibility:'hidden', color:'red' }}>请输入正确的邮箱地址</div>
        </Col>
      </Row>
    ))
  )

  addMember = () => {
    const { data } = this.state;
    if (data.length < 20) {
      this.setState({
        data:[...data, {}]
      });
    } else {
      message.error('最多只可添加20名成员');
    }
  }

  render (){
    const { data } = this.state;
    const getMenberData = this.renderMenberData;
    return (
      <>
        <Row>
          <Col span={8}>姓名</Col>
          <Col span={8}>手机号</Col>
          <Col span={8}>邮箱</Col>
        </Row>
        {getMenberData(data)}
        <Button style={{ marginTop:'20px' }} onClick={this.addMember}>新增</Button>
      </>
    );
  }
}

export default MemberList;
