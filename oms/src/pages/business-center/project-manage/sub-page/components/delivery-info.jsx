import React, { Component, forwardRef } from 'react';
import { FORM_MODE } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import { Input, Select, AutoComplete, message, InputNumber } from 'antd';
import { findUnKnownDelivery } from '../../../../../services/apiService';
import EditableTable from '@/components/editable-table/editable-table';
import { isFunction } from '../../../../../utils/utils';
import deliveryModel from '../../../../../models/createProject';
import organizationsModel from '../../../../../models/supplier';
import MapEdit from './map-edit';

const { actions: { getDeliveries, postDeliveries } } = deliveryModel;
const { actions: { getOrganizations } } = organizationsModel;

const mapStateToProps = state => ({
  deliveries: state.deliveries.items,
  supplierOrg: state.supplier.items,
});

@connect(mapStateToProps, { getDeliveries, postDeliveries, getOrganizations })
export default class DeliveryInfo extends Component {

  /**
   * 添加的两种情况：
   * 选择提货点后，不能修改提货单位、提货地址、联系人、联系电话。可以修改电子围栏及半径
   * 没有选择提货点，可以主动输入所有信息，并添加新提货点。
   *
   * 修改时，不能修改【提货点】、提货单位、提货地址、联系人、联系电话。可以修改电子围栏及半径
   *
   * 卸货点相同逻辑
   */
  state = {
    isSelectedDeliveryName: false,
    isModifying: false,
  }

  componentDidMount() {
    findUnKnownDelivery().then(data => this.setState({ unKnownItem: data }));
    this.props.getDeliveries({ offset: 0, limit: 1000 });
    this.props.getOrganizations({ organizationType: 6, selectType: 1, auditStatus: 1, isAvailable: 1, offset: 0, limit: 1000 });
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

  onAdd = (value) => {
    const { isSelectedDeliveryName } = this.state;
    if (isSelectedDeliveryName) {
      this.setState({ isSelectedDeliveryName: false });
      return Promise.resolve({ ...value, isAvailable: true });
    }
    this.props.postDeliveries({ ...value, isAvailable: true })
      .then((data) => {
        this.setState({ isSelectedDeliveryName: false });
        if (!data) return;
        return Promise.resolve(data);
      });
  }

  onModify = (value) => {
    this.setState({ isSelectedDeliveryName: false, isModifying: false });
    return Promise.resolve({ ...value, isAvailable: true });
  }

  beforeModify = () => {
    this.setState({ isSelectedDeliveryName: true, isModifying: true });
  }


  selectDeliveries = (delivery, form) => {
    const deliveryId = (+delivery);
    const { unKnownItem } = this.state;
    const { deliveries } = this.props;
    const selectedDeliveries = ([...deliveries, unKnownItem]).find(item => (item.deliveryId) === deliveryId);
    form.setFieldsValue({
      deliveryId: selectedDeliveries.deliveryId,
      isOpenFence: selectedDeliveries.isOpenFence,
      radius: selectedDeliveries.radius,
      deliveryName: selectedDeliveries.deliveryName,
      supplierOrgId: selectedDeliveries.supplierOrgId,
      supplierOrgName: selectedDeliveries.supplierOrgName,
      deliveryAddress: selectedDeliveries.deliveryAddress,
      contactName: selectedDeliveries.contactName,
      contactPhone: selectedDeliveries.contactPhone,
    });
    this.setState({ isSelectedDeliveryName: true });
  }

  renderDeliveries = (record, form) => {
    const { unKnownItem } = this.state;
    const { deliveryType } = this.props.formData;
    const deliveries = `${deliveryType}` !== '3' ? this.props.deliveries.filter(item => item.isAvailable) : [unKnownItem];
    const data = (this.props.form.getFieldValue('deliveryItems') || []).map(item => item.deliveryId);
    const options = deliveries.filter(item => {
      const check = data.indexOf(item.deliveryId);
      return check < 0;
    });
    return (
      <>
        {
          form.getFieldDecorator('deliveryName', {
            rules: [{
              max: 30, message: '内容不能超过30字',
            }, {
              required: true, message: '请填写提货点',
            },
            ],
            initialValue: record.deliveryName
          })(
            <div>
              <AutoComplete
                disabled={this.state.isModifying}
                defaultValue={record.deliveryName}
                onSelect={(e) => this.selectDeliveries(e, form)}
                placeholder="请填写提货点"
                filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
              >
                {options.map(item => <AutoComplete.Option key={item.deliveryId} value={`${item.deliveryId}`}>{item.deliveryName}</AutoComplete.Option>)}
              </AutoComplete>
            </div>
          )
        }
        {
          form.getFieldDecorator('deliveryId', {
            rules: [{
              required: true, message: '请填写提货点',
            },
            ],
            initialValue: record.deliveryId
          })
        }
      </>
    );

  }

  renderSupplier = (record, form) => (
    <div>
      {
        form.getFieldDecorator('supplierOrgId', {
          rules: [{ required: true, message: '请选择提货单位' }],
          initialValue: record.supplierOrgId ? Number(record.supplierOrgId) : undefined
        })(
          <Select
            disabled={this.state.isSelectedDeliveryName}
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
      }
      {
        form.getFieldDecorator('supplierOrgName', {
          rules: [{ required: true, message: '请选择提货单位' }],
          initialValue: record.supplierOrgName
        })
      }
    </div>
  )

  render() {
    const columns = [
      {
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
        width: '250px',
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
            ],
            initialValue: record.deliveryAddress
          })(<MapEdit disabled={this.state.isSelectedDeliveryName} form={form} type='delivery' />);
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
          ],
          initialValue: record.contactName
        }
        )(<Input disabled={this.state.isSelectedDeliveryName} placeholder="联系人" />),
        width: '150px'
      }, {
        title: '联系电话',
        dataIndex: 'contactPhone',
        key: 'contactPhone',
        editingRender: (record, form) => form.getFieldDecorator('contactPhone', {
          rules: [{
            required: true, message: '请输入联系电话'
          }, {
            pattern: /^1\d{10}$/, message: "请输入正确的联系人电话"
          }],
          initialValue: record.contactPhone
        })(<Input disabled={this.state.isSelectedDeliveryName} placeholder="联系电话" />),
        width: '150px'
      }, {
        title: '电子围栏',
        dataIndex: 'isOpenFence',
        key: 'isOpenFence',
        editingRender: (record, form) => form.getFieldDecorator('isOpenFence', {
          rules: [{
            required: true, message: '请选择围栏开启状态'
          }],
          initialValue: record.isOpenFence
        })(
          <Select>
            <Select.Option key={1} value>开启</Select.Option>
            <Select.Option key={0} value={false}>关闭</Select.Option>
          </Select>),
        render: (text) => {
          if (text) return '开启';
          return '关闭';
        }
      },
      {
        title: '围栏半径',
        dataIndex: 'radius',
        key: 'radius',
        editingRender: (record, form) => form.getFieldDecorator('radius', {
          rules: [
            {
              required: true, message: '请输入围栏半径'
            },
            {
              pattern: /^([5-9][0-9]|1[0-9][0-9]|2[0-9][0-9]|3[0-9][0-9]|4[0-9][0-9]|500)$/,
              message : '围栏半径请输入50-500内的整数数字'
            },
          ],
          initialValue: record.radius
        })(
          <Input />
        ),
      }
    ];
    const readOnly = this.props.mode === FORM_MODE.DETAIL;
    return (
      <EditableTable
        minWidth={1650}
        readOnly={readOnly}
        modifyable
        beforeAddRow={this.getBusinessTypeId}
        onChange={this.props.onChange}
        onAdd={this.onAdd}
        onModify={this.onModify}
        beforeModify={this.beforeModify}
        rowKey="deliveryId"
        pagination={false}
        columns={columns}
        dataSource={this.props.value}
      />
    );
  }
}
