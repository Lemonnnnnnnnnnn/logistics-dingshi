import React, { Component } from "react";
import { Select, Input } from "antd";
import { connect } from "dva";
import { FORM_MODE } from "@gem-mine/antd-schema-form";
import { getLocal , getGoodsName } from "@/utils/utils";
import EditableTable from "@/components/editable-table/editable-table";
import GoodsSelectInput from '@/components/goods-select-input/goods-select-input';

function mapStateToProps(state) {
  return {
    commonStore: state.commonStore,
    goodsUnits: state.dictionaries.items
  };
}

@connect(mapStateToProps, {})

class ReceivingTable extends Component {

  saveReceiving = (value) => Promise.resolve({
    ...value,
    receivingNum: (+value.receivingNum),
    prebookingObjectId: value.receivingId
  });

  renderReceivings = (record, form) => {
    const { receivingItems: options = [] } = this.props.options;
    const selectReceivings = (value) => {
      const record = options.find(item => item.receivingId === value);
      form.setFieldsValue({
        receivingAddress: record.receivingAddress,
        contactName: record.contactName,
        contactPhone: record.contactPhone
      });
    };
    const receivingOptions = options.map(({ receivingId, receivingName }) => <Select.Option
      key={receivingId}
      value={receivingId}
    >{receivingName}
    </Select.Option>);

    return form.getFieldDecorator("receivingId", {
      rules: [{ required: true, message: "请选择卸货点" }]
    })(
      <Select onSelect={selectReceivings} placeholder="请选择卸货点" style={{ width: '100%' }}>
        {receivingOptions}
      </Select>
    );
  };

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);
    const localData = getLocal(currentTab.id) || { formData: {} };
    if (getLocal("local_commonStore_tabs").tabs.length > 1) {
      localStorage.removeItem(currentTab.id);
      localStorage.setItem(currentTab.id, JSON.stringify({
        formData: { ...localData.formData, receivingItems: this.props.value }
      }));
    }
  }

  renderGoods = (record, form) => {
    const options = window.goodsItems || [];
    // const { goodsItems: options = [] } = this.props.options
    const selectGoods = (value) => {
      const record = options.find(item => item.goodsId === value);
      form.setFieldsValue({
        goodsUnit: record.receivingUnit,
        goodsId : value
      });
    };
    const data = (this.props.form.getFieldValue("receivingItems") || []).map(item => item.goodsId);
    const goods = options.filter(item => {
      const check = data.indexOf(item.goodsId);
      return check < 0;
    });
    // const goodsOptions = goods.map(({ goodsId, goodsName, categoryName }) => <Select.Option
    //   key={goodsId}
    //   value={goodsId}
    // >{`${categoryName}-${goodsName}`}
    // </Select.Option>);

    return form.getFieldDecorator("goodsId", {
      rules: [{ required: true, message: "请选择货品" }]
    })(
      <GoodsSelectInput form={form} options={goods} onSelect={goodsNo => selectGoods(goodsNo)} />,
      // <Select onSelect={selectGoods} placeholder="请选择货品" style={{ width: '100%' }}>
      //   {goodsOptions}
      // </Select>
    );
  };

  renderReceivingUnit = (record, form) => {
    const { goodsUnits } = this.props;
    const goodsUnitsOptions = goodsUnits.map(({ dictionaryCode, dictionaryName }) => <Select.Option
      key={dictionaryCode}
      value={(+dictionaryCode)}
    >{dictionaryName}
    </Select.Option>);
    return form.getFieldDecorator("goodsUnit", {
      rules: [{ required: true, message: "请选择货品单位" }]
    })(
      <Select disabled>
        {goodsUnitsOptions}
      </Select>
    );
  };

  renderSurplusGoodsNum = (record, form) => {
    const options = window.goodsItems||[];

    const data = (this.props.form.getFieldValue('receivingItems') || []).map(item => item.goodsId);
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

  render() {
    const preBookingReceivingTableColumns = [
      {
        title: "卸货点",
        dataIndex: "receivingId",
        key: "receivingId",
        editingRender: this.renderReceivings,
        width: "200px",
        render: (text, record) => {
          const receivingItems = this.props.options ? this.props.options.receivingItems : [];
          const receiving = (receivingItems || []).find(item => item.receivingId === text);
          if (!receiving) return record.receivingName;
          return receiving.receivingName;
        }
      }, {
        title: "卸货地址",
        dataIndex: "receivingAddress",
        key: "receivingAddress",
        editingRender: (record, form) => form.getFieldDecorator("receivingAddress", {
          rules: [{ required: true, message: "请填写卸货地址" }]
        })(<Input readOnly />),
        width: "320px"
      }, {
        title: "联系人",
        dataIndex: "contactName",
        key: "contactName",
        editingRender: (record, form) => form.getFieldDecorator("contactName", {
          rules: [{ required: true, message: "请填写联系人" }]
        })(<Input readOnly />),
        width: "120px"
      }, {
        title: "联系电话",
        dataIndex: "contactPhone",
        key: "contactPhone",
        editingRender: (record, form) => form.getFieldDecorator("contactPhone", {
          rules: [{ required: true, message: "请填写联系电话" }]
        })(<Input readOnly />),
        width: "150px"
      }, {
        title: "货品名称",
        dataIndex: "goodsId",
        key: "goodsId",
        editingRender: this.renderGoods,
        width: "300px",
        render: (text, record) => {
          const goodsItems = window.goodsItems ? window.goodsItems : [];
          const goods = (goodsItems || []).find(item => item.goodsId === text);
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
        title: "计划数量",
        dataIndex: "receivingNum",
        key: "receivingNum",
        editingRender: (record, form) => form.getFieldDecorator("receivingNum", {
          rules: [{
            max: 10, message: "计划数量超出限制"
          }, {
            pattern: /^\d+(\.\d+)?$/, message: "请填写正确的货品数量"
          }, {
            required: true, message: "请填写正确的货品数量"
          }, {
            validator: (rule, value, callback) => {
              if (+value === 0) {
                callback("货品数量不能为0");
              }
              callback();
            }
          }]
        })(<Input placeholder="请填写货品数量" />),
        width: "150px"
      }, {
        title: "货品单位",
        dataIndex: "goodsUnit",
        key: "goodsUnit",
        editingRender: this.renderReceivingUnit,
        width: "100px",
        render: (text, record) => {
          if (record.receivingUnitCN) return record.receivingUnitCN;
          const goodsUnit = this.props.goodsUnits.find(item => (+item.dictionaryCode) === text);
          if (goodsUnit) return goodsUnit.dictionaryName;
          return "";
          // return record.receivingUnitCN
        }
      }];
    const readOnly = this.props.mode === FORM_MODE.DETAIL;
    return (
      <EditableTable
        onChange={this.props.onChange}
        readOnly={readOnly}
        rowKey="goodsId"
        onAdd={this.saveReceiving}
        columns={preBookingReceivingTableColumns}
        pagination={false}
        dataSource={this.props.value}
      />
    );
  }
}

export default ReceivingTable;
