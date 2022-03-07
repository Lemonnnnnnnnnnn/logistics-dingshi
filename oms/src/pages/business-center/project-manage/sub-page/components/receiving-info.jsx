import React, { Component } from 'react';
import { FORM_MODE } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import { Input, AutoComplete, message, Select, InputNumber } from 'antd';
import EditableTable from '../../../../../components/editable-table/editable-table';
import { isFunction } from '../../../../../utils/utils';
import receivingModel from '../../../../../models/receiving';
import UploadFile from '../../../../../components/upload/upload-file';
import MapEdit from './map-edit';
import { getAllCustomer } from '@/services/apiService';

const { actions: { postReceiving } } = receivingModel;

const mapStateToProps = state => ({
  receivings: state.receiving.items,
});

@connect(mapStateToProps, { postReceiving })

export default class ReceivingInfo extends Component {
  state = {
    customerOrgIdOptions: [],
    isSelectedDeliveryName: false,
    isModifying: false,
  }

  async componentDidMount() {
    const { items } = await getAllCustomer({ limit: 500, offset: 0, selectType: 1 });
    const customerOrgIdOptions = items.map(item => ({
      key: item.organizationId,
      value: item.organizationId,
      label: item.organizationName
    }));
    this.setState({ customerOrgIdOptions });

  }

  getLabelReceiving = () => {
    const { receivingLabelId } = this.props.formData;
    if (!receivingLabelId) {
      message.error('请先选择项目标签');
      return true;
    }
  }

  save = value => {
    const { isSelectedDeliveryName } = this.state;
    const params = { ...value, receivingLabelId: this.props.formData.receivingLabelId };
    if (isSelectedDeliveryName) {
      return Promise.resolve(params);
    }

    this.props.postReceiving(params)
      .then((result) => {
        if (!result) return;
        return Promise.resolve(result);
      });
  }

  onModify = (value) => Promise.resolve({ ...value, receivingLabelId: this.props.formData.receivingLabelId })

  beforeModify = () => {
    this.setState({ isSelectedDeliveryName: true, isModifying: true });
  }

  selectReceivings = (receiving, form) => {
    const receivingId = (+receiving);
    const { receivings } = this.props;
    const selectedReceivings = receivings.find(item => (+item.receivingId) === receivingId);

    form.setFieldsValue({
      receivingId: selectedReceivings.receivingId,
      receivingName: selectedReceivings.receivingName,
      customerOrgId: selectedReceivings.customerOrgId,
      customerOrgName: selectedReceivings.customerOrgName,
      receivingAddress: selectedReceivings.receivingAddress,
      contactName: selectedReceivings.contactName,
      contactPhone: selectedReceivings.contactPhone,
      isOpenFence: selectedReceivings.isOpenFence,
      radius: selectedReceivings.radius,
      signDentryid: selectedReceivings.signDentryid
    });
    this.setState({ isSelectedDeliveryName: true });
  }

  renderReveivings = (record, form) => {
    const receivings = this.props.receivings.filter(item => item.isAvailable);
    const data = (this.props.form.getFieldValue('receivingItems') || []).map(item => item.receivingId);
    const options = receivings.filter(item => {
      const check = data.indexOf(item.receivingId);
      return check < 0;
    });

    return (
      <>
        {
          form.getFieldDecorator('receivingName', {
            rules: [{
              max: 30, message: '内容不能超过30字',
            }, {
              required: true, message: '请填写卸货点',
            },
            ],
            initialValue: record.receivingName
          })(
            <div>
              <AutoComplete
                disabled={this.state.isModifying}
                defaultValue={record.receivingName}
                onSelect={(e) => this.selectReceivings(e, form)}
                placeholder="请填写卸货点"
                filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
              >
                {options.map(item => <AutoComplete.Option key={item.receivingId} value={`${item.receivingId}`}>{item.receivingName}</AutoComplete.Option>)}
              </AutoComplete>
            </div>
          )
        }
        {
          form.getFieldDecorator('receivingId', {
            rules: [{
              required: true, message: '请填写卸货点',
            },
            ],
            initialValue: record.receivingId
          })
        }
      </>
    );
  }


  renderSupplier = (record, form) => (
    <>
      {
        form.getFieldDecorator('customerOrgId', {
          rules: [{ required: true, message: '请选择卸货单位' }],
          initialValue: record.customerOrgId ? Number(record.customerOrgId) : undefined
        })(
          <Select
            disabled={this.state.isSelectedDeliveryName}
            placeholder="请选择卸货单位"
            style={{ width: '100%' }}
            showSearch
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {this.state.customerOrgIdOptions.map(item => <Select.Option key={item.key} value={item.value}>{item.label}</Select.Option>)}
          </Select>
        )
      }
      {
        form.getFieldDecorator('customerOrgName', {
          rules: [{ required: true, message: '请选择卸货单位' }],
          initialValue: record.customerOrgName
        })
      }
    </>
  )

  render() {
    const { mode } = this.props;
    const columns = [{
      title: '序号',
      dataIndex: 'orderNum',
      key: 'orderNum',
      render: (text, record, index) => index + 1,
      width: '60px'
    }, {
      title: '卸货点',
      dataIndex: 'receivingName',
      key: 'receivingName',
      editingRender: this.renderReveivings,
      width: '230px',
    }, {
      title: '卸货单位',
      dataIndex: 'customerOrgId',
      editingRender: this.renderSupplier,
      key: 'customerOrgId',
      width: '230px',
      render: (text, record) => record.customerOrgName
    }, {
      title: '卸货地址',
      dataIndex: 'receivingAddress',
      key: 'receivingAddress',
      editingRender: (record, form) => {
        form.getFieldDecorator('receivingLongitude')(<Input />);
        form.getFieldDecorator('receivingLatitude')(<Input />);
        return form.getFieldDecorator('receivingAddress', {
          rules: [{
            max: 30, message: '内容不能超过30字',
          }, {
            required: true, message: '请填写卸货地址'
          }],
          initialValue: record.receivingAddress
        })(<MapEdit disabled={this.state.isSelectedDeliveryName} form={form} type='receiving' />);
      },
      width: '300px'
    }, {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactName',
      width: '150px',
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
    }, {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: '200px',
      editingRender: (record, form) => form.getFieldDecorator('contactPhone', {
        rules: [{
          required: true, message: '请输入联系电话'
        }, {
          pattern: /^1\d{10}$/, message: "请输入正确的联系人电话"
        }],
        initialValue: record.contactPhone
      })(<Input disabled={this.state.isSelectedDeliveryName} placeholder="联系电话" />),
    }, {
      title: '样签',
      dataIndex: 'signDentryid',
      key: 'signDentryid',
      render: (text, record) => <UploadFile value={[record.signDentryid]} readOnly mode={mode} />,
      editingRender: (record, form) => form.getFieldDecorator('signDentryid', {
        initialValue: record.signDentryid,
        rules: [{
          required: true, message: '请选择样签'
        }],
      })(<UploadFile readOnly={this.state.isSelectedDeliveryName} />),
      width: '200px'
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
    }, {
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
            message: '围栏半径请输入50-500内的整数数字'
          },
        ],
        initialValue: record.radius
      })(
        <Input />),
    }];
    const { value = [], onChange, readOnly: _readOnly } = this.props;
    const readOnly = _readOnly || this.props.mode === FORM_MODE.DETAIL;
    return (
      <EditableTable
        minWidth={1700}
        readOnly={readOnly}
        onChange={onChange}
        modifyable
        onModify={this.onModify}
        beforeModify={this.beforeModify}
        onAdd={this.save}
        rowKey="receivingId"
        pagination={false}
        columns={columns}
        dataSource={value}
      />
    );
  }
}
