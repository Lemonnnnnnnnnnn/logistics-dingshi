import React, { Component } from 'react';
import { FORM_MODE } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import { Input, Select, Cascader, AutoComplete } from 'antd';
import { MapTreeData, isFunction, getLocal, getGoodsName } from "@/utils/utils";
import EditableTable from '@/components/EditableTable/EditableTable';
import goodsModel from '@/models/goods';
import categoryModel from '@/models/category';
import dictionariesModel from '@/models/dictionaries';
import { DICTIONARY_TYPE } from '@/services/dictionaryService';

const { getDictionaries } = dictionariesModel.actions;
const { getGoods, postGoods } = goodsModel.actions;
const { getCategory } = categoryModel.actions;

const mapStateToProps = state => ({
  goods: state.goods.items,
  category: state.category.items,
  goodsUnit: state.dictionaries.items,
  commonStore: state.commonStore
});
let dirty = false;
let disabled = false;

@connect(mapStateToProps, { getGoods, getCategory, postGoods, getDictionaries })
export default class GoodsInfo extends Component {

  selectedGoods = undefined

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  syncGoodName = (() => {
    const cache = {};

    return (type, value, form) => {
      cache[type] = value;
      const { category = '', brand = '' } = cache;
      const finalValue = `${category}-${brand}`;
      form.setFieldsValue({ goodsItems: finalValue });
    };
  })()

  componentDidMount () {
    this.props.getGoods({ limit: 1000, offset: 0 });
    this.props.getCategory({ limit: 1000, offset: 0 });
    this.props.getDictionaries( DICTIONARY_TYPE.GOOD_UNIT );
  }

  renderDeliveryUnit = (record, form) => form.getFieldDecorator('deliveryUnit', {
    rules: [{ required: true, message: '请选择提货货品单位' }]
  })(
    <Select
      onSelect={value=>this.selectUnit(value, form)}
      placeholder="请选择提货货品单位"
      style={{ width: '100%' }}
    >
      {this.props.goodsUnit.map(item => <Select.Option key={item.dictionaryId} value={item.dictionaryCode}>{`${item.dictionaryName}`}</Select.Option>)}
    </Select>
  )

  renderReceivingUnit = (record, form) => form.getFieldDecorator('receivingUnit', {
    rules: [{ required: true, message: '请选择卸货货品单位' }]
  })(
    <Select onSelect={value=>this.selectUnit(value, form)} placeholder="请选择卸货货品单位" style={{ width: '100%' }}>
      {this.props.goodsUnit.map(item => <Select.Option key={item.dictionaryId} value={item.dictionaryCode}>{`${item.dictionaryName}`}</Select.Option>)}
    </Select>
  )

  selectUnit = (value, form) =>{
    form.setFieldsValue({ receivingUnit:value, deliveryUnit:value });
  }

  getCategoryIds = (leafId) => {
    const { category } = this.props;
    const result = [leafId];
    let node = category.find(item => item.categoryId === leafId);

    while (node && node.parentId) {
      result.unshift(node.parentId);
      node = category.find(item => item.categoryId === node.parentId);
    }

    return result;
  }

  selectGoods = (goodsNo, form) => {
    const goodsId = +goodsNo;
    const { onChange, goods, value: addedGoods = [], category } = this.props;

    const selectedGoods = this.selectedGoods = goods.find(item => (+item.goodsId) === goodsId);
    selectedGoods.categoryName = this.getCategoryIds(selectedGoods.categoryId);
    selectedGoods.goodsId = selectedGoods.goodsId;

    dirty = false;
    disabled = true;

    this.syncGoodName('brand', selectedGoods.goodsName, form);
    this.syncGoodName('category', selectedGoods._categoryName, form);
    form.setFieldsValue(selectedGoods);
  }

  addGoods = (value) => dirty
    ? this.props.postGoods({ ...value, categoryId: value.categoryName[value.categoryName.length - 1] })// errorHandler: () => {}自定义报错
      .then(data => {
        if (!data) return;
        const { categoryName } = data;
        return { ...data, _categoryName: categoryName, categoryName, deliveryUnit: value.deliveryUnit, receivingUnit: value.receivingUnit, freightCost: value.freightCost, goodsNum:value.goodsNum };
      })
    : Promise.resolve({ ...value, ...this.selectedGoods })

  renderGoods = (record, form) => {
    const initialValue = form.getFieldValue('goodsItems');
    const data = (this.props.form.getFieldValue('goodsItems') || []).map(item => item.goodsId);
    const options = this.props.goods.filter(item => {
      const check = data.indexOf(item.goodsId);
      return check < 0;
    });
    const filterOption=(inputValue, option) =>{
      const conditions = inputValue.split(' ').filter(item=>item);
      return conditions.reduce((check, current)=>{
        if (!check) return false;
        const index = option.props.children.toUpperCase().indexOf(current.toUpperCase());
        return index !== -1;
      }, true);
    };

    return form.getFieldDecorator('goodsItems', {
      rules: [{ required: true, message: '请填写常用货品' }]
    })(
      <div>
        <AutoComplete value={initialValue && `${initialValue}`} filterOption={filterOption} onSelect={goodsNo => this.selectGoods(goodsNo, form)} placeholder="请填写常用货品">
          {options.map(item => {
            const name = item.categoryName ? `${item._categoryName}-${item.goodsName}${item.materialQuality?`(${item.materialQuality})`:''}${item.specificationType?`(${item.specificationType})`:''}` : item.goodsName;
            return <AutoComplete.Option title={name} key={item.goodsId} value={`${item.goodsId}`}>{name}</AutoComplete.Option>;
          })}
        </AutoComplete>
      </div>
    );
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const localData = getLocal(this.currentTab.id) || { formData: {} };
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.removeItem(this.currentTab.id);
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...localData.formData, goodsItems: this.props.value },
      }));
    }
  }

  renderCategory = (record, form) => {
    const goodCategory = new MapTreeData(this.props.category, { privateKey: 'categoryId', labelKey: 'categoryName' });
    const options = goodCategory.getItemTree();
    return form.getFieldDecorator('categoryName', {
      rules: [{ required: true, message: '请选择货品类目', }]
    })(
      <Cascader disabled={disabled} onChange={(...args) => this.changeCategory(...args, form)} options={options} placeholder="请选择货品类目" />
    );
  }

  changeCategory = (values, options, form) => {
    const categories = options.map(({ label }) => label).join('-');
    dirty = true;
    this.syncGoodName('category', categories, form);
  }

  changeBrand = (event, form) => {
    dirty = true;
    this.syncGoodName('brand', event.target.value, form);
  }

  resetDisabled = () => {
    disabled = false;
  }

  render () {
    const { isShowFreightCost, mode } = this.props;

    const columns = [{
      title: '序号',
      dataIndex: 'goodsId',
      key: 'orderNum',
      render: (text, record, index) => index + 1,
      width: '60px'
    }, {
      title: '货品名称',
      dataIndex: 'goodsItems',
      key: 'goodsItems',
      editingRender: this.renderGoods,
      render: (value, record) => getGoodsName(record),
      width: '200px',
    }, {
      title: '货品类目',
      dataIndex: 'categoryName',
      width: '200px',
      key: 'categoryName',
      editingRender: this.renderCategory,
      render: (text, record) => record._categoryName || record.categoryName
    }, {
      title: '品牌名称',
      dataIndex: 'goodsName',
      width: '200px',
      key: 'goodsName',
      editingRender: (record, form) => form.getFieldDecorator('goodsName', {
        rules: [{
          max: 30, message: '内容不能超过30字',
        }, {
          required: true, message: '请填写品牌名称'
        }]
      })(<Input disabled={disabled} onChange={value => this.changeBrand(value, form)} placeholder="品牌名称" />),
    }, {
      title: '提货货品单位',
      dataIndex: 'deliveryUnit',
      key: 'deliveryUnit',
      width: '240px',
      editingRender: this.renderDeliveryUnit,
      render: (text, record) => {
        if (record.deliveryUnitCN) return record.deliveryUnitCN;
        const goodsUnit = this.props.goodsUnit.find(item => item.dictionaryCode === text);
        if (goodsUnit) return goodsUnit.dictionaryName;
        return '';
        // return record.deliveryUnitCN
      }
    }, {
      title: '卸货货品单位',
      dataIndex: 'receivingUnit',
      key: 'receivingUnit',
      editingRender: this.renderReceivingUnit,
      width: '240px',
      render: (text, record) => {
        if (record.receivingUnitCN) return record.receivingUnitCN;
        const goodsUnit = this.props.goodsUnit.find(item => item.dictionaryCode === text);
        if (goodsUnit) return goodsUnit.dictionaryName;
        return '';
        // return record.receivingUnitCN
      }
    }, {
      title: '规格型号',
      dataIndex: 'specificationType',
      key: 'specificationType',
      editingRender: (record, form) => form.getFieldDecorator('specificationType', {
        rules: [{
          max: 30, message: '内容不能超过30字',
        }]
      })(<Input disabled={disabled} placeholder="选填" />),
      render: (text) => text || '--',
      width: '120px'
    }, {
      title: '材质',
      dataIndex: 'materialQuality',
      key: 'materialQuality',
      editingRender: (record, form) => form.getFieldDecorator('materialQuality', {
        rules: [{
          max: 30, message: '内容不能超过30字',
        }]
      })(<Input disabled={disabled} placeholder="选填" />),
      render: (text) => text || '--',
      width: '100px'
    }, {
      title: '包装',
      dataIndex: 'packagingMethod',
      width: '150px',
      editingRender: (record, form) => form.getFieldDecorator('packagingMethod')(
        <Select disabled={disabled} placeholder="选填" style={{ width: '100%' }}>
          {/* TODO 需要定义常量 包装方式 1是袋装 2是散装  */}
          <Select.Option key={1} value={1}>袋装</Select.Option>
          <Select.Option key={2} value={2}>散装</Select.Option>
        </Select>
      ),
      render: (text, record) => {
        if (record.packagingMethod === 1) return '袋装';
        if (record.packagingMethod === 2) return '散装';
        return '--';
      }
    }, {
      title: '数量',
      dataIndex: 'goodsNum',
      width: '120px',
      editingRender: (record, form) => form.getFieldDecorator('goodsNum', {
        rules: [{
          max: 10, message: '货品数量超出限制',
        }, {
          pattern: /^\d+(\.\d+)?$/, message: '请填写正确的货品数量',
        }, {
          required: true, message: '请填写货品数量'
        }, {
          validator: (rule, value, callback) => {
            if (+value===0) {
              callback('货品数量不能为0');
            }
            callback();
          }
        }]
      })(
        <Input placeholder="货品数量" />
      ),
      render: (text) => {
        if (!text) return '';
        return text;
      }
    }, {
      title: '货品单价',
      dataIndex: 'freightCost',
      width: '120px',
      visible:isFunction(isShowFreightCost)&&isShowFreightCost(mode),
      editingRender: (record, form) => form.getFieldDecorator('freightCost', {
        rules: [{
          max: 10, message: '货品单价超出限制',
        }, {
          pattern: /^\d+(\.\d+)?$/, message: '请填写正确的货品单价',
        }, {
          required: true, message: '请填写货品单价'
        }, {
          validator: (rule, value, callback) => {
            if (+value===0) {
              callback('货品单价不能为0');
            }
            callback();
          }
        }]
      })(
        <Input placeholder="货品单价" />
      ),
      render: (text) => `${text}元`
    }];

    const { value = [], onChange, readOnly:_readOnly } = this.props;
    const readOnly = _readOnly || this.props.mode === FORM_MODE.DETAIL;
    return (
      <EditableTable
        minWidth={1800}
        beforeAddRow={this.resetDisabled}
        readOnly={readOnly}
        onChange={onChange}
        rowKey="goodsId"
        onAdd={this.addGoods}
        pagination={false}
        columns={columns}
        dataSource={value}
      />
    );
  }
}
