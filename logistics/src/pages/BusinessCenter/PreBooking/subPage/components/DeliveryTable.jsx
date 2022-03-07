import React, { Component } from 'react';
import { Select, Input, message } from 'antd';
import { FORM_MODE } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import { getGoodsName, getLocal } from "@/utils/utils";
import EditableTable from '@/components/EditableTable/EditableTable';
import dictionariesModel from '@/models/dictionaries';
import { DICTIONARY_TYPE } from '@/services/dictionaryService';
import '@gem-mine/antd-schema-form/lib/fields';

const { actions: { getDictionaries } } = dictionariesModel;

function mapStateToProps (state) {
  return {
    commonStore: state.commonStore,
    goodsUnits: state.dictionaries.items
  };
}

@connect(mapStateToProps, { getDictionaries })

class DeliveryTable extends Component {

  componentDidMount () {
    this.props.getDictionaries(DICTIONARY_TYPE.GOOD_UNIT);
  }

  getDeliveryType = () => {
    const { options:{ logisticsBusinessTypeEntity }, value } = this.props;
    const { deliveryType } = logisticsBusinessTypeEntity || {};
    if (`${deliveryType}` === '3' && value?.length > 0) {
      message.error('只能添加一个未知提货点');
      return true;
    }
  }

  saveDelivery = (value) => Promise.resolve({ ...value, receivingNum:(+value.deliveryNum), prebookingObjectId:value.deliveryId })

  renderGoods = (record, form) => {
    // const { goodsItems: options = [] } = this.props.options
    const options = window.goodsItems||[];
    const selectGoods = (value) => {
      const record = options.find(item => item.goodsId === value);
      form.setFieldsValue({
        goodsUnit: record.deliveryUnit
      });
    };
    const data = (this.props.form.getFieldValue('deliveryItems') || []).map(item => item.goodsId);
    const goods = options.filter(item => {
      const check = data.indexOf(item.goodsId);
      return check < 0;
    });
    const goodsOptions = goods.map(({ goodsId, goodsName, categoryName }) => <Select.Option key={goodsId} value={goodsId}>{`${categoryName}-${goodsName}`}</Select.Option>);
    return form.getFieldDecorator('goodsId', {
      rules: [{ required: true, message: '请选择货品', }]
    })(
      <Select onSelect={selectGoods} placeholder="请选择货品" style={{ width: '100%' }}>
        {goodsOptions}
      </Select>
    );
  }

  renderSurplusGoodsNum = (record, form) => {
    const options = window.goodsItems||[];

    const data = (this.props.form.getFieldValue('deliveryItems') || []).map(item => item.goodsId);
    const goods = options.filter(item => {
      const check = data.indexOf(item.goodsId);
      return check < 0;
    });
    if (form.getFieldValue('goodsId')){
      const currentGoods = goods.find(item=>item.goodsId === form.getFieldValue('goodsId'));
      return <div>{currentGoods.surplusGoodsNum}</div>;
    }
    return null;
  }


  renderGoodsUnit = (record, form) => {
    const { goodsUnits } = this.props;
    const goodsUnitsOptions = goodsUnits.map(({ dictionaryCode, dictionaryName }) => <Select.Option key={dictionaryCode} value={(+dictionaryCode)}>{dictionaryName}</Select.Option>);
    return form.getFieldDecorator('goodsUnit', {
      rules: [{ required: true, message: '请选择货品单位', }]
    })(
      <Select disabled>
        {goodsUnitsOptions}
      </Select>
    );
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);
    const localData = getLocal(currentTab.id) || { formData: {} };
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.removeItem(currentTab.id);
      localStorage.setItem(currentTab.id, JSON.stringify({
        formData: { ...localData.formData, deliveryItems: this.props.value },
      }));
    }
  }

  renderDeliveries = (record, form) => {
    const options = window.deliveryItems || [];
    // const { deliveryItems: options = [] } = this.props.options
    const selectDeliveries = (value) => {
      const record = options.find(item => item.deliveryId === value);
      form.setFieldsValue({
        deliveryAddress: record.deliveryAddress,
        contactName: record.contactName,
        contactPhone: record.contactPhone
      });
    };
    const deliveryOptions = options.map(({ deliveryId, deliveryName }) => <Select.Option key={deliveryId} value={deliveryId}>{deliveryName}</Select.Option>);
    return form.getFieldDecorator('deliveryId', {
      rules: [{ required: true, message: '请选择提货点', }]
    })(
      <Select onSelect={selectDeliveries} placeholder="请选择提货点" style={{ width: '100%' }}>
        {deliveryOptions}
      </Select>
    );
  }

  render () {
    const preBookingDeliveryTableColumns = [
      {
        title: '提货点',
        dataIndex: 'deliveryId',
        key: 'deliveryId',
        editingRender: this.renderDeliveries,
        width: '200px',
        render: (text, record) => {
          const deliveryItems = window.deliveryItems? window.deliveryItems : [];
          // const deliveryItems = this.props.options ? this.props.options.deliveryItems : []
          const delivery = (deliveryItems||[]).find(item => item.deliveryId === text);
          if (!delivery) return record.deliveryName;
          return delivery.deliveryName;
        }
      }, {
        title: '提货地址',
        dataIndex: 'deliveryAddress',
        key: 'deliveryAddress',
        editingRender: (record, form) => form.getFieldDecorator('deliveryAddress', {
        })(<Input readOnly />),
        width: '320px'
      }, {
        title: '联系人',
        dataIndex: 'contactName',
        key: 'contactName',
        editingRender: (record, form) => form.getFieldDecorator('contactName', {
        })(<Input readOnly />),
        width: '120px'
      }, {
        title: '联系电话',
        dataIndex: 'contactPhone',
        key: 'contactPhone',
        editingRender: (record, form) => form.getFieldDecorator('contactPhone', {
        })(<Input readOnly />),
        width: '150px'
      }, {
        title: '货品名称',
        dataIndex: 'goodsId',
        key: 'goodsId',
        editingRender: this.renderGoods,
        width: '300px',
        render: (text, record) => {
          const goodsItems = window.goodsItems? window.goodsItems:[];
          const goods = (goodsItems||[]).find(item => item.goodsId === text);
          if (!goods) return getGoodsName(record);
          return getGoodsName(goods);
        }
      },
      {
        title: "合同余量",
        dataIndex: "surplusGoodsNum",
        key: "surplusGoodsNum",
        width: "150px",
        editingRender: this.renderSurplusGoodsNum,
        render: (text, record) => {
          const goodsItem = window.goodsItems?.find(item=>item.goodsId === record.goodsId);
          return goodsItem ? goodsItem.surplusGoodsNum : '';
        }
      },
      {
        title: '计划数量',
        dataIndex: 'deliveryNum',
        key: 'deliveryNum',
        editingRender: (record, form) => form.getFieldDecorator('deliveryNum', {
          rules: [{
            max: 10, message: '计划数量超出限制',
          }, {
            pattern: /^\d+(\.\d+)?$/, message: '请填写正确的货品数量',
          }, {
            required: true, message: '请填写正确的货品数量',
          }, {
            validator: (rule, value, callback) => {
              if (+value===0) {
                callback('货品数量不能为0');
              }
              // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
              callback();
            }
          }]
        })(<Input placeholder="请填写货品数量" />),
        width: '150px',
        render:(text, record)=>record.receivingNum
      }, {
        title: '货品单位',
        dataIndex: 'goodsUnit',
        key: 'goodsUnit',
        editingRender: this.renderGoodsUnit,
        width: '100px',
        render: (text, record) => {
          if (record.deliveryUnitCN) return record.deliveryUnitCN;
          const goodsUnit = this.props.goodsUnits.find(item => (+item.dictionaryCode) === text);
          if (goodsUnit) return goodsUnit.dictionaryName;
          return '';
          // return record.deliveryUnitCN
        }
      }];
    const { value } = this.props;
    const readOnly = this.props.mode === FORM_MODE.DETAIL;
    return (
      <EditableTable
        rowKey="goodsId"
        beforeAddRow={this.getDeliveryType}
        readOnly={readOnly}
        onChange={this.props.onChange}
        onAdd={this.saveDelivery}
        columns={preBookingDeliveryTableColumns}
        pagination={false}
        dataSource={value}
      />
    );
  }
}

export default DeliveryTable;
