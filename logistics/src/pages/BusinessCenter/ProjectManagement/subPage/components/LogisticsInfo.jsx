import React, { useMemo, useEffect } from 'react';
import { Select, Input } from 'antd';
import { connect } from 'dva';
import EditableTable from '../../../../../components/EditableTable/EditableTable';

const LogisticsInfo = ({ projectTransferCreateReqList, organizations, getOrganizations, setValue, setSelectRowKeys, selectRowKeys, bool, readOnly } ) => {

  const onChange = (val) => Promise.resolve(val).then(res => {
    setValue([...projectTransferCreateReqList, val]);
    return Promise.resolve(res);
  });
  useEffect(() => {
    if (!organizations.length) {
      getOrganizations({
        selectType: 1,
        organizationType: 5,
        auditStatus: 1,
        isAvailable: true,
        offset: 0,
        limit: 1000
      });
    }
  }, [projectTransferCreateReqList]);
  const schemaTable = useMemo(() =>  ([{
    title: '序号',
    dataIndex: 'id',
    editingRender: (_, form, index) =>  form.getFieldDecorator('id', {
      initialValue: index + 1,
    })(<Input disabled />),
    render: (text, record, index) => index + 1,
    width: '10%'
  }, {
    title: '指定下级承运方',
    dataIndex: 'shipmentOrganizationId',
    editingRender: (_, form) => form.getFieldDecorator('shipmentOrganizationId', {
      rules: [{
        required: true, message: '请指定下级承运方',
      },
      ]
    })(
      <Select
        style={{ width: '100%' }}
        optionFilterProp="children"
        showSearch
        placeholder="请请指定下级承运方"
      >
        {
          organizations.map(item => (
            <Select.Option key={item.organizationId}>{item.organizationName}</Select.Option>
          ))
        }
      </Select>
    ),
    render: (value) => {
      if (value) {
        return organizations.find(item => item.organizationId.toString() === value.toString()).organizationName;
      }
      return '--';
    },
    width: '20%'
  }, {
    title: '承运服务费（价差）计费依据',
    dataIndex: 'shipmentFeeType',
    editingRender: (_, form) => form.getFieldDecorator(`shipmentFeeType`, {
      rules: [{
        required: true, message: '请选择承运服务费（价差）计费依据',
      },
      ],
    })(
      <Select
        style={{ width: '100%' }}
        placeholder="请选择承运服务费（价差）计费依据"
      >
        <Select.Option key={1}>按运单运费单价加收一定比率金额</Select.Option>
        <Select.Option key={2}>按运单数量单位收取固定金额</Select.Option>
        <Select.Option key={3}>按运单整单收取固定金额</Select.Option>
      </Select>
    ),
    render: (value) => {
      switch (Number(value)) {
        case 1:
          return '按运单运费单价加收一定比率金额';
        case 2:
          return '按运单数量单位收取固定金额';
        case 3:
          return '按运单整单收取固定金额';
        default:
          return '--';
      }
    },
    width: '20%'
  }, {
    title: '承运服务费（价差）计费标准',
    dataIndex: 'modifyPrice',
    editingRender: (row, form) => (form.getFieldDecorator(`modifyPrice`, {
      rules: [{
        required: true, message: '请输入承运服务费（价差）计费标准',
      }, {
        pattern: /^\d+(\.\d+)?$/, message: '请填写正确的承运服务费',
      }
      ]
    })(<Input placeholder="请输入承运服务费" addonAfter={Number(form.getFieldValue(`shipmentFeeType`)) === 1  ? '%' : '元'} />)),
    width: '20%',
    render: (value, row) => `${value}${Number(row.shipmentFeeType) === 1 ? '%' : '元'}`,
  }, {
    title: '预约单流转规则',
    dataIndex: 'transferType',
    editingRender: (_, form) => form.getFieldDecorator('transferType', {
      rules: [{
        required: true, message: '请选择预约单流转规则',
      },
      ]
    })(
      <Select
        style={{ width: '100%' }}
        placeholder="请选择预约单流转规则"
      >
        <Select.Option key={1}>自动转单</Select.Option>
        <Select.Option key={2}>手动转单</Select.Option>
      </Select>
    ),
    render: (val) => {
      switch (Number(val)) {
        case 1:
          return '自动转单';
        case 2:
          return '手动转单';
        default:
      }
    },
    width: '20%'
  }]), [organizations, projectTransferCreateReqList]);
  return organizations.length ? (
    <EditableTable
      multipleSelect={{
        columnTitle: '默认下级承运方',
        columnWidth: '50px',
        fixed: true,
        type: 'radio',
        onChange:  (selectedRowKeys) => {
          setSelectRowKeys(selectedRowKeys);
        },
        selectedRowKeys: selectRowKeys,
      }}
      afterDeleteRow={() => setSelectRowKeys([])}
      onAdd={onChange}
      onChange={(val) => { setValue(val); }}
      rowKey="id"
      pagination={false}
      readOnly={readOnly}
      columns={bool ? schemaTable.filter(item => item.dataIndex !== 'modifyPrice' && item.dataIndex !== 'shipmentFeeType') : schemaTable}
      dataSource={projectTransferCreateReqList.map((item, index) => ({ ...item, id: index + 1 }))}
    />
  ) : null;
};

const mapDispatchToProps = (dispatch) => ({
  deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload }),
  getOrganizations: (payload) => dispatch({ type: 'deviceManageStore/getOrganizations', payload }),
});
export default connect(({ commonStore, deviceManageStore }) => ({
  ...commonStore,
  organizations: deviceManageStore.organizations,
}), mapDispatchToProps)(LogisticsInfo);
