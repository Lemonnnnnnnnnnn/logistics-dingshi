import React from 'react';
import { Select, Input, Button, message } from 'antd';
import { getCarGroups, createCarGroups, singleModifyCarGroups } from '@/services/apiService';

const { Option } = Select;

export default class Index extends React.Component {
  state = {
    groups: [],
    showInput: false
  }

  componentDidMount () {
    this.default = this.props.carGroupId;
    const params = { isAvailable: true, offset: 0, limit: 1000, isOrderByTime: true };
    getCarGroups(params).then(({ items }) => {
      this.setState({
        groups: items
      });
    });
  }

  handleChange = (value) => {
    this.value = value;
    if (value === 'other') {
      this.setState({
        showInput: true
      });
    } else {
      this.setState({
        showInput: false
      });
    }
  }

  renderOptions = () => {
    const { groups } = this.state;
    if (!groups || groups.length === 0 || !groups[0]) return (
      <Select placeholder='请选择车组' defaultValue={this.default} style={{ width: 250 }} onChange={this.handleChange}>
        <Option key='other' value='other'>其他</Option>
      </Select>
    );
    return (
      <Select placeholder='请选择车组' defaultValue={this.default} style={{ width: 250 }} onChange={this.handleChange}>
        {
          groups?.map(item => (<Option key={item.carGroupId} value={item.carGroupId}>{item.carGroupName}</Option>))
        }
        <Option key='other' value='other'>其他</Option>
      </Select>
    );
  }

  onChangeName = (e) => {
    const { value } = e.target;
    this.carGroupName = value.trim();
  }

  confirm = () => {
    if (this.value === 'other') {
      if (!this.carGroupName) return message.error('请输入车组名称');
      if (this.carGroupName.length > 10) return message.error('车组名称长度不得超出10个字符');
      createCarGroups({ carGroupName: this.carGroupName }).then(({ carGroupId }) => {
        singleModifyCarGroups({ carGroupId, carIdList: [this.props.carId] }).then(() => {
          message.success('车组成功创建，并成功添加该车辆');
          this.props.closeModal();
          this.props.refresh();
        });
      });
    } else {
      if (!this.value) return message.error('请选择车组名称');
      if (Number(this.default) === Number(this.value)) return message.error('请选择新的车组');
      singleModifyCarGroups({ carGroupId: this.value, carIdList: [this.props.carId] }).then(() => {
        message.success('车组变更成功');
        this.props.closeModal();
        this.props.refresh();
      });
    }
  }

  render () {
    const { showInput } = this.state;
    return (
      <>
        <div style={{ color: '#999999', marginBottom: '15px' }}>可以通过下拉选择车组，如需新建车组，可以选择其他，填写车组名称</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>车组：</span>
          {this.renderOptions()}
          {
            showInput ? <span style={{ marginLeft: '15px', width: '300px' }}><Input placeholder="请输入新建车组名称" onChange={this.onChangeName} /></span> : null
          }
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '30px 0 0' }}>
          <Button onClick={this.props.closeModal}>取消</Button>
          <Button style={{ marginLeft: '10px' }} onClick={this.confirm} type='primary'>确定</Button>
        </div>
      </>
    );
  }
}
