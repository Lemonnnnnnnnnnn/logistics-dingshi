import React, { Component } from 'react';
import { FORM_MODE } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import { Input, Select, AutoComplete, message } from 'antd';
import { findUnKnownDelivery } from '@/services/apiService';
import EditableTable from '@/components/EditableTable/EditableTable';
import { isFunction } from '@/utils/utils';
import deliveryModel from '@/models/createProject';
import organizationsModel from '@/models/supplier';
import MapEdit from './MapEdit';

const { actions: { getDeliveries, postDeliveries } } = deliveryModel;
const { actions: { getOrganizations } } = organizationsModel;

const mapStateToProps = state => ({
  deliveries: state.deliveries.items,
  supplierOrg: state.supplier.items,
});

@connect(mapStateToProps, { getDeliveries, postDeliveries, getOrganizations })
export default class DeliveryInfo extends Component {
  componentDidMount () {
    findUnKnownDelivery().then(data => this.setState({ unKnownItem:data }));
    this.props.getDeliveries({ offset:0, limit:1000 });
    this.props.getOrganizations({ organizationType: 6, selectType: 1, auditStatus:1, isAvailable:1, offset:0, limit:1000 });
  }

  getBusinessTypeId = () => {
    const { formData: { businessTypeId, deliveryType }, value } = this.props;
    if (!businessTypeId) {
      message.error('请先选择业务类型');
      return true;
    }
    if (`${deliveryType}` === '3' && value?.length > 0) {
      message.error('无法继续添加提货点');
      return true;
    }
  }

  saveTest = (value) => this.props.postDeliveries({ ...value, isAvailable: true, radius:1000 })
    .then((data) => {
      if (!data) return;
      return Promise.resolve(data);
    })

  selectDeliveries = delivery => {
    const deliveryId = (+delivery);
    const { unKnownItem } = this.state;
    const { onChange, deliveries, value: addedDeliveries = [] } = this.props;
    const selectedDeliveries = ([...deliveries, unKnownItem]).find(item => (item.deliveryId) === deliveryId);
    const nextAddedDeliveries = [...addedDeliveries, selectedDeliveries];
    isFunction(onChange) && onChange(nextAddedDeliveries);
  }

  renderDeliveries = (record, form) => {
    const { unKnownItem } = this.state;
    const { deliveryType } = this.props.formData;
    const deliveries = `${deliveryType}` !== '3'? this.props.deliveries.filter(item => item.isAvailable) : [unKnownItem];
    const data = (this.props.form.getFieldValue('deliveryItems') || []).map(item => item.deliveryId);
    const options = deliveries.filter(item => {
      const check = data.indexOf(item.deliveryId);
      return check < 0;
    });
    return form.getFieldDecorator('deliveryName', {
      rules: [{
        max: 30, message: '内容不能超过30字',
      }, {
        required: true, message: '请填写提货点',
      },
      // {
      //   pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{1,30}$/, message: "输入正确的提货点"
      // }
      ]
    })(
      <div>
        <AutoComplete
          onSelect={this.selectDeliveries}
          placeholder="请填写提货点"
          filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
        >
          {options.map(item => <AutoComplete.Option key={item.deliveryId} value={`${item.deliveryId}`}>{item.deliveryName}</AutoComplete.Option>)}
        </AutoComplete>
      </div>
    );
  }

  renderSupplier = (record, form) => form.getFieldDecorator('supplierOrgId', {
    rules: [{ required: true, message: '请选择提货单位' }]
  })(
    <Select
      placeholder="请选择提货单位"
      style={{ width: '100%' }}
      showSearch
      filterOption={(input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    >
      {this.props.supplierOrg.map(item => <Select.Option key={item.organizationId} value={item.organizationId}>{item.organizationName}</Select.Option>)}
    </Select>
  )

  render () {
    const columns = [{
      title: '序号',
      dataIndex: 'orderNum',
      key: 'orderNum',
      render: (text, record, index) => index + 1,
      width: '80px'
    }, {
      title: '提货点',
      dataIndex: 'deliveryName',
      key: 'deliveryName',
      editingRender: this.renderDeliveries,
      width: '250px'
    }, {
      title: '提货单位',
      dataIndex: 'supplierOrgId',
      key: 'supplierOrgId',
      editingRender: this.renderSupplier,
      width: '300px',
      render: (text, record) => record.supplierOrgName
    }, {
      title: '提货地址',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
      editingRender: (record, form) => {
        form.getFieldDecorator('deliveryLongitude')(<Input />);
        form.getFieldDecorator('deliveryLatitude')(<Input />);
        return form.getFieldDecorator('deliveryAddress', {
          rules: [
            {
              required: true, message: '请输入提货地址'
            }
          ]
        })(<MapEdit form={form} type='delivery' />);
      },
      width: '300px'
    }, {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactName',
      editingRender: (record, form) => form.getFieldDecorator('contactName', {
        rules: [
          {
            required: true, message: '请输入联系人姓名'
          }, {
            max: 30, message: '内容不能超过30字',
          }
        ]
      }
      )(<Input placeholder="联系人" />),
      width: '200px'
    }, {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      editingRender: (record, form) => form.getFieldDecorator('contactPhone', {
        rules: [{
          required: true, message: '请输入联系电话'
        }, {
          pattern: /^1\d{10}$/, message: "请输入正确的联系人电话"
        }]
      })(<Input placeholder="联系电话" />),
      width: '200px'
    }, {
      title: '电子围栏',
      dataIndex: 'isOpenFence',
      key: 'isOpenFence',
      editingRender: (record, form) => form.getFieldDecorator('isOpenFence', {
        rules: [{
          required: true, message: '请选择围栏开启状态'
        }],
        initialValue:true
      })(
        <Select>
          <Select.Option key={1} value>开启</Select.Option>
          <Select.Option key={0} value={false}>关闭</Select.Option>
        </Select>),
      render:(text)=>{
        if (text) return '开启';
        return '关闭';
      }
    }];
    const readOnly = this.props.mode === FORM_MODE.DETAIL;
    return (
      <EditableTable readOnly={readOnly} beforeAddRow={this.getBusinessTypeId} onChange={this.props.onChange} onAdd={this.saveTest} rowKey="deliveryId" pagination={false} columns={columns} dataSource={this.props.value} />
    );
  }
}
