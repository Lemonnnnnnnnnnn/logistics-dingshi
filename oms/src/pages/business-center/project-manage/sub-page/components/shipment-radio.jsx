import React, { Component } from 'react';
import { Radio } from 'antd';
import { connect } from 'dva';
import { FORM_MODE } from '@gem-mine/antd-schema-form';
import { getLocal } from '../../../../../utils/utils';


const mapStateToProps = state => ({
  commonStore: state.commonStore
});
@connect(mapStateToProps)
class ShipmentRadio extends Component {

  radioChange = e =>{
    const { value } = e.target;
    this.props.onChange(value);
  }

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const localData = getLocal(this.currentTab.id) || { formData: {} };
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabs').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...localData.formData, shipmentType: this.props.value },
      }));
    }
  }

  render () {
    const options = { 0: '平台', 1: '指定承运方' };
    const readOnly = this.props.mode === FORM_MODE.DETAIL; // 用来判断是否schema模式
    const _readOnly =this.props.isAudited; // 用来判断是否过审项目
    const readOnlyFinal = readOnly||_readOnly;
    const shown = this.props.value;
    return (
      readOnlyFinal
        ?<span>{options[shown]}</span>
        : (
          <Radio.Group value={this.props.value} onChange={this.radioChange}>
            <Radio value={0}>平台</Radio>
            <Radio value={1}>指定承运方</Radio>
          </Radio.Group>
        )
    );
  }
}

export default ShipmentRadio;
