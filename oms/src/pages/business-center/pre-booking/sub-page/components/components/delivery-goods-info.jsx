import React, { Component } from 'react';
import { Select, Input } from 'antd';
import { connect } from 'dva';
import { getUserInfo } from '../../../../../../services/user';
import EditableTable from '../../../../../../components/editable-table/editable-table';
import { omit } from '../../../../../../utils/utils';

function mapStateToProps (state) {
  return {
    deliveryItems: state.preBooking.entity.deliveryItems,
    receivingItems: state.preBooking.entity.receivingItems,
    logisticsTradingSchemeEntity: state.preBooking.entity.logisticsTradingSchemeEntity || {},
    maximumShippingPrice: state.preBooking.entity.maximumShippingPrice || 0
  };
}

@connect(mapStateToProps, null)
class DeliveryGoodsInfo extends Component {

  dispatchConfig = JSON.parse(localStorage.getItem('dispatchConfig'))

  organizationType = getUserInfo().organizationType

  saveDeliveryGoods = (value) => {
    const delivery = this.props.deliveryItems.find(item => item.projectCorrelationId === value.deliveryId);
    const receiving = this.props.receivingItems.find(item => item.goodsId === delivery.goodsId);
    // TODO 当预约单内的卸货点，没有卸该种物品时，应有相应提示
    return Promise.resolve({ ...omit(delivery, 'receivingNum'), goodsNum: (+value.goodsNum), loadingNum:(+value.goodsNum), freightPrice: (+value.freightPrice), receivingUnit: receiving?.goodsUnit, correlationObjectId: delivery?.deliveryId });
  }

  renderDelivery = (record, form) => {
    const selectDelivery = (value) => {
      const delivery = this.props.deliveryItems.find(item => item.projectCorrelationId === value);
      form.setFieldsValue({
        deliveryAddress: delivery.deliveryAddress,
        // goodsId: delivery.goodsId
      });
    };
    const { dispatchType, deliveryItems:_deliveryItems, receivingItems } = this.props;
    const dispatchData = this.dispatchConfig[dispatchType];
    let deliveryItems = _deliveryItems.filter(item => {
      const index = dispatchData.findIndex(({ goodsId }) => goodsId === item.goodsId);
      return index>-1;
    });
    // let deliveryItems = filter([..._deliveryItems], dispatchData.map(item => item.goodsId))
    const data = (this.props.form.getFieldValue('deliveryItems') || []).map(item => item.projectCorrelationId);
    if (data.length>0){
      const { goodsId } = this.props.form.getFieldValue('deliveryItems')[0];
      const { receivingId } = receivingItems.find(item=>item.goodsId===goodsId);
      const deliveryGoodsId = receivingItems.filter(item=>item.receivingId===receivingId).map(item => item.goodsId);
      deliveryItems = deliveryItems.filter(item=>{
        const index = deliveryGoodsId.indexOf(item.goodsId);
        return index >= 0;
      });
    }
    const options = deliveryItems.filter(item => {
      const index = data.indexOf(item.projectCorrelationId);
      return index < 0;
    });
    const deliveryOptions = options.map(({ deliveryName, projectCorrelationId, categoryName, goodsName }) => <Select.Option key={projectCorrelationId} value={projectCorrelationId}>{`${deliveryName}-${categoryName}-${goodsName}`}</Select.Option>);
    return form.getFieldDecorator('deliveryId', {
      rules: [{ required: true, message: '请填写提货点', }]
    })(
      <Select onSelect={selectDelivery} placeholder="请选择提货点">
        {deliveryOptions}
      </Select>
    );
  }

  render () {
    const tableSchema = [
      {
        title: '提货信息',
        dataIndex: 'deliveryId',
        editingRender: this.renderDelivery,
        width: '450px',
        render: (text, record) => `${record.deliveryName}-${record.categoryName}-${record.goodsName}`
      }, {
        title: '提货地址',
        dataIndex: 'deliveryAddress',
        editingRender: (record, form) => form.getFieldDecorator('deliveryAddress', {
          // rules: [{ required: true, message: '请填写提货地址', }]
        })(<Input readOnly />),
        width: '300px',
      },
      {
        title: '分配重量',
        dataIndex: 'goodsNum',
        editingRender: (record, form) => form.getFieldDecorator('goodsNum', {
          rules: [{
            max: 10, message: '分配量超出限制',
          }, {
            pattern: /^\d+(\.\d+)?$/, message: '请填分配重量',
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
        })(<Input />),
      },
      {
        title: '运费单价',
        dataIndex: 'freightPrice',
        editingRender: (record, form) => form.getFieldDecorator('freightPrice', {
          rules: [
            {
              validator:(rule, value, callback) => {
                const reg = /^\d+(\.\d+)?$/;
                if (!reg.test(value)) return callback('请填写正确的价格');
                const { maximumShippingPrice, logisticsTradingSchemeEntity } = this.props;
                const { shipmentServiceRate } = logisticsTradingSchemeEntity;
                const price = this.organizationType === 4 ? maximumShippingPrice : ((maximumShippingPrice || 0) * (1 - ((shipmentServiceRate || 0)))).toFixed(2);
                if (price < (+value)) return callback('输入的发单价超过平台发单价');
                callback();
              }
            }
          ]
          // [{
          //   max: (()=>{
          //     const { maximumShippingPrice: value, logisticsTradingSchemeEntity } = this.props
          //     const { shipmentServiceRate } = logisticsTradingSchemeEntity
          //     console.log(this.organizationType === 4?value : ((value || 0)*(1-((shipmentServiceRate || 0)))).toFixed(2))
          //     return this.organizationType === 4?value : ((value || 0)*(1-((shipmentServiceRate || 0)))).toFixed(2)
          //   })(),
          //   message: '输入的发单价超过平台发单价',
          // }, {
          //   pattern: /^\d+(\.\d+)?$/, message: '请填写正确的价格',
          // }, {
          //   required: true, message: '请填写运费单价',
          // }, {
          //   type:'number'
          // }, {
          //   transform:(value) => +value
          // } ]
        })(<Input />)
      }
    ];
    const { readOnly = false } = this.props;
    return (
      <EditableTable
        rowKey="projectCorrelationId"
        readOnly={readOnly}
        onChange={this.props.onChange}
        onAdd={this.saveDeliveryGoods}
        columns={tableSchema}
        pagination={false}
        dataSource={this.props.value}
      />
    );
  }
}

export default DeliveryGoodsInfo;
