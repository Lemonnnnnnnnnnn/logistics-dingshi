import React, { Component } from 'react';
import { Select, Input } from 'antd';
import { connect } from 'dva';
import EditableTable from '../../../../components/editable-table/editable-table';

function mapStateToProps (state) {
  return {
    preBooking : state.preBooking.entity
  };
}

@connect(mapStateToProps, {})
export default class TransportDelivery extends Component{

  constructor (props){
    super(props);
    this.tableSchema=[
      {
        title: '货品名称',
        dataIndex: 'goodsInfo',
        editingRender: this.renderGoodsInfo,
        render:(text, record)=>`${record.categoryName}-${record.goodsName}`,
        width: '300px',
        fixed: 'left',
      },
      {
        title: '提货点',
        dataIndex: 'deliveryName',
        editingRender: this.renderDelivery,
      },
      {
        title: '提货地址',
        dataIndex: 'deliveryAddress',
        editingRender: this.renderDeliveryAddress
      },
      {
        title: '提货点联系人',
        dataIndex: 'contactName',
        editingRender: this.renderContactName,
        width:'140px'
      },
      {
        title: '提货点联系电话',
        dataIndex: 'contactPhone',
        editingRender: this.rendercCntactPhone,
        width:'160px'
      },
      {
        title: '分配重量',
        dataIndex: 'goodsNum',
        editingRender: this.renderGoodsNum,
        render:(text, record)=>`${record.goodsNum}${record.goodsUnitCN}`
      },
      {
        title: '实提重量',
        dataIndex: 'deliveryNum',
        editingRender: ()=><span>未提货</span>,
        render:(text, record)=>{
          if (record.isPicked){
            return `${record.deliveryNum}${record.deliveryUnitCN}`;
          }
          return '未提货';
        },
        width:'130px'
      },
      {
        title: '运费单价',
        dataIndex: 'freightPrice',
        editingRender: (record, form) => form.getFieldDecorator('freightPrice', {
          rules: [{
            max: 10, message: '运费单价超出限制',
          }, {
            pattern: /^\d+(\.\d+)?$/, message: '请填写正确的价格',
          }, {
            required: true, message: '请填写运费单价',
          }],
          initialValue:'0'
        })(<Input />)
      },
    ];
  }

  renderGoodsInfo = (record, form) =>{
    let deliveryItems = [...this.props.preBooking.deliveryItems];
    const selectGoods = (value)=>{
      const delivery = deliveryItems.find(item => item.goodsId === value);
      form.setFieldsValue({
        deliveryName:delivery.deliveryName,
        deliveryAddress: delivery.deliveryAddress,
        contactName:delivery.contactName,
        contactPhone:delivery.contactPhone,
      });
    };
    const data = (this.props.form.getFieldValue('deliveryItems') || []).map(item => item.goodsId);
    if (data.length>0){
      const { goodsId } = this.props.form.getFieldValue('deliveryItems')[0];
      const { receivingId } = this.props.preBooking.receivingItems.find(item=>item.goodsId===goodsId);
      const deliveryGoodsId = this.props.preBooking.receivingItems.filter(item=>item.receivingId===receivingId).map(item => item.goodsId);
      deliveryItems = deliveryItems.filter(item=>{
        const index = deliveryGoodsId.indexOf(item.goodsId);
        return index >= 0;
      });
    }
    const options = deliveryItems.filter(item => {
      const check = data.indexOf(item.goodsId);
      return check < 0;
    });
    const goodsOptions = options.map(item=><Select.Option key={item.goodsId} value={item.goodsId}>{`${item.categoryName}-${item.goodsName}`}</Select.Option>);
    return form.getFieldDecorator('goodsId', {
      rules: [{ required: true, message: '请选择货品', }]
    })(
      <Select onSelect={selectGoods} placeholder="请选择货品">
        {goodsOptions}
      </Select>
    );
  }

  saveDeliveryGoods = (value) => {
    const { deliveryItems, receivingItems } = this.props.preBooking;
    const delivery = deliveryItems.find(item => item.goodsId === value.goodsId);
    const receiving = receivingItems.find(item => item.goodsId === value.goodsId);
    return Promise.resolve({ ...delivery, goodsNum: (+value.goodsNum), freightPrice: (+value.freightPrice), receivingUnit: receiving.goodsUnit, correlationObjectId: delivery.deliveryId, transportCorrelationId:Math.random() });
  }

  renderDeliveryAddress = (record, form) =>form.getFieldDecorator('deliveryAddress', {
    rules: [{ required: true, message: '请填写提货地址', }]
  })(
    <Input placeholder="请填写提货地址" readOnly />
  )

  renderContactName = (record, form) =>form.getFieldDecorator('contactName', {
    rules: [{ required: true, message: '请填写提货点联系人', }]
  })(
    <Input placeholder="请填写提货点联系人" readOnly />
  )

  rendercCntactPhone = (record, form) =>form.getFieldDecorator('contactPhone', {
    rules: [{ required: true, message: '请填写提货点联系电话', }]
  })(
    <Input placeholder="请填写提货点联系电话" readOnly />
  )

  renderDelivery = (record, form) =>form.getFieldDecorator('deliveryName', {
    rules: [{ required: true, message: '请填写提货点名称', }]
  })(
    <Input placeholder="请填写提货点名称" readOnly />
  )

  renderGoodsNum = (record, form) =>form.getFieldDecorator('goodsNum', {
    rules: [{
      max: 10, message: '分配量超出限制',
    }, {
      pattern: /^\d+(\.\d+)?$/, message: '请填分配重量'
    }, {
      required: true, message: '请填分配重量',
    }, {
      validator: (rule, value, callback) => {
        if (+value===0) {
          callback('分配重量不能为0');
        }
        callback();
      }
    }]
  })(
    <Input placeholder="请填写分配重量" />
  )

  isDeliveryed = record =>{
    if (record.isPicked){
      return false;
    }
    return true;
  }

  render (){
    const { readOnly = false } = this.props;
    return (
      <EditableTable
        rowKey="transportCorrelationId"
        readOnly={readOnly}
        minWidth={1800}
        isAbleToDelete={this.isDeliveryed}
        onChange={this.props.onChange}
        onAdd={this.saveDeliveryGoods}
        columns={this.tableSchema}
        pagination={false}
        dataSource={this.props.value}
      />
    );
  }
}
