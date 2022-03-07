import React, { Component } from 'react';
import { FORM_MODE } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import { Input, message, Select } from 'antd';
import EditableTable from '@/components/EditableTable/EditableTable';
import { isFunction } from '@/utils/utils';
import receivingModel from '@/models/receiving';
import UploadFile from '@/components/Upload/UploadFile';
import MapEdit from './MapEdit';

const { actions: { postReceiving } } = receivingModel;

const mapStateToProps = state => ({
  receivings: state.receiving.items,
});

@connect(mapStateToProps, { postReceiving })

export default class ReceivingInfo extends Component {

  getLabelReceiving = () =>{
    const { receivingLabelId } = this.props.formData;
    if (!receivingLabelId) {
      message.error('请先选择项目标签');
      return true;
    }
  }

  selectReceivings = receiving => {
    const receivingId = (+receiving);
    const { onChange, receivings, value: addedReceivings = [] } = this.props;
    const selectedReceivings = receivings.find(item => (+item.receivingId) === receivingId);
    const nextAddedReceivings = [...addedReceivings, selectedReceivings];
    isFunction(onChange) && onChange(nextAddedReceivings);
  }

  renderReveivings = (record, form) => {
    const receivings = this.props.receivings.filter(item => item.isAvailable);
    const data = (this.props.form.getFieldValue('receivingItems') || []).map(item => item.receivingId);
    const options = receivings.filter(item => {
      const check = data.indexOf(item.receivingId);
      return check < 0;
    });
    return form.getFieldDecorator('receivingName', {
      rules: [{
        max: 30, message: '内容不能超过30字',
      }, {
        required: true, message: '请填写卸货点',
      },
      ]
    })(
      <div>
        <Select
          onSelect={this.selectReceivings}
          style={{ width: '100%' }}
          optionFilterProp="children"
          showSearch
          placeholder="请选择卸货点"
        >
          {options.map(item => <Select.Option key={item.receivingId} value={`${item.receivingId}`}>{item.receivingName}</Select.Option>)}
        </Select>
      </div>
    );
  }

  save = value =>
    this.props.postReceiving({ ...value, receivingLabelId:this.props.formData.receivingLabelId, signDentryid: value.batchNo[0], radius:1000 })
      .then((result) => {
        if (!result) return;
        return Promise.resolve(result);
      })

  render () {
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
          }]
        })(<MapEdit form={form} type='receiving' />);
      },
      width: '300px'
    }, {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactName',
      width: '150px'
    }, {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: '200px'
    }, {
      title: '样签',
      dataIndex: 'batchNo',
      key: 'batchNo',
      render: (text, record) => <UploadFile value={[record.signDentryid]} readOnly mode={mode} />,
      editingRender: (record, form) => form.getFieldDecorator('batchNo', {
        initialValue: [],
        rules: [{
          required: true, message: '请选择样签'
        }]
      })(<UploadFile />),
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
    const { value = [], onChange, readOnly:_readOnly } = this.props;
    const readOnly = _readOnly || this.props.mode === FORM_MODE.DETAIL;
    return (
      <EditableTable readOnly={readOnly} onChange={onChange} onAdd={this.save} rowKey="receivingId" pagination={false} columns={columns} dataSource={value} />
    );
  }
}
