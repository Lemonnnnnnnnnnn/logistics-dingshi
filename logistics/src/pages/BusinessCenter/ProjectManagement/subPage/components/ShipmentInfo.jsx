import React, { Component } from 'react';
import { connect } from 'dva';
import { Select } from 'antd';
import router from 'umi/router';
import { FORM_MODE } from '@gem-mine/antd-schema-form';
import EditableTable from '../../../../../components/EditableTable/EditableTable';
import { isFunction } from '../../../../../utils/utils';
import { SHIPMENT_AUDIT_STATUS } from '../../../../../constants/project/project';
import organizationModel from '../../../../../models/shipments';

const { getOrganizations } = organizationModel.actions;

const mapStateToProps = state => ({
  shipmentType:state.project.entity.shipmentType,
  shipment: state.shipments.items,
});

@connect(mapStateToProps, { getOrganizations })
export default class ShipmentInfo extends Component {

  state={
    firstTime:true
  }

  componentDidMount (){
    this.props.getOrganizations({ selectType:2, organizationType:5, limit:1000, offset:0, isAvailable:true });
  }

  componentWillReceiveProps (nextProps){
    const { shipmentType:_shipmentType, onChange } = nextProps;
    const { shipmentType } = nextProps.formData;
    if (_shipmentType===0&&shipmentType===1&&this.state.firstTime===true){
      this.setState({
        firstTime:false
      });
      onChange([]);
    }
  }

  customOperations = record =>{
    const operations = {
      [SHIPMENT_AUDIT_STATUS.REFUSE]:[],
      [SHIPMENT_AUDIT_STATUS.ACCEPT]:[
        { title:'禁用', onClick:this.toggleOperation, renderTitle:this.renderOperationTitle }
      ],
      [SHIPMENT_AUDIT_STATUS.UNAUDITED]:[]
    }[record.auditStatus];
    return operations||[];
  }

  toggleOperation = record =>{
    record.isAvailable = !record.isAvailable;
    isFunction(this.props.onChange) && this.props.onChange(this.props.value);
  }

  renderOperationTitle = record =>{
    let word;
    if (record.isAvailable){
      word = '禁用';
    } else {
      word = '启用';
    }
    return word;
  }

  selectShipment = shipmentId => {
    // const shipmentOrganizationId = parseInt(shipmentId)
    const { onChange, value: addedShipment = [] } = this.props;
    const entity = this.props.options && this.props.options.length !== 0 ? this.props.options : this.props.shipment;
    const selectedShipment = entity.find(item => item.organizationId === (+shipmentId));
    const { organizationId, organizationName, contactName, contactPhone } = selectedShipment;
    const newShipment = { shipmentOrganizationId:organizationId, shipmentOrganizationName:organizationName, contactName, contactPhone, isAvailable:true, auditStatus:SHIPMENT_AUDIT_STATUS.UNAUDITED };
    const nextAddedShipment = [...addedShipment, newShipment];
    isFunction(onChange) && onChange(nextAddedShipment);
  }

  renderShipment = (record, form) => {
    const shipment = this.props.options && this.props.options.length !== 0 ? this.props.options : this.props.shipment;
    const data = (this.props.form.getFieldValue('shipmentItems') || []).map(item => item.shipmentOrganizationId);
    const options = shipment.filter(item => {
      const check = data.indexOf(item.organizationId);
      return check < 0;
    });
    return form.getFieldDecorator('shipmentOrganizationName', {
      rules: [{ required: true, message: '请选择承运单位', }],
      preserve: true
    })(
      <div>
        <Select
          onSelect={this.selectShipment}
          optionFilterProp="children"
          showSearch
          placeholder="请选择承运单位"
          style={{ width: '100%' }}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {options.map(item => <Select.Option key={item.organizationId} value={item.organizationId}>{item.organizationName}</Select.Option>)}
        </Select>
      </div>
    );
  }

  // 审核拒绝与待审的承运方才能被删除
  isAbleToDelete = record =>{
    let check = false;
    if (record.auditStatus === 0||record.auditStatus===undefined||record.auditStatus===2){
      check = true;
    }
    return check;
  }

  render () {
    const columns = [{
      title: '序号',
      dataIndex: 'orderNum',
      render: (text, record, index) => index + 1,
      width: '10%'
    }, {
      title: '状态',
      dataIndex: 'auditStatus',
      render: (text, record) =>{
        const statusConfig = {
          [SHIPMENT_AUDIT_STATUS.REFUSE]:{ text:'已拒绝', color:'red' },
          [SHIPMENT_AUDIT_STATUS.ACCEPT]:{ text:'已接受', color:'green' },
          [SHIPMENT_AUDIT_STATUS.UNAUDITED]:{ text:'待审核', color:'gray' }
        }[text]||{ text:'待审核', color:'gray' };
        return <span style={{ color:record.isAvailable===false?'gray':statusConfig.color }}>{record.isAvailable===false?'禁用':statusConfig.text}</span>;
      },
      width: '10%'
    }, {
      title: '承运单位',
      dataIndex: 'shipmentOrganizationName',
      editingRender: this.renderShipment,
      render: (value, record) => record.shipmentOrganizationName,
      width: '35%',
    }, {
      title: '联系人',
      dataIndex: 'contactName',
      width: '15%'
    }, {
      title: '联系电话',
      dataIndex: 'contactPhone',
      width: '20%'
    }, {
      title: '操作',
      visible: this.props.organizationType === 1,
      dataIndex: 'contactPhone',
      width: '20%',
      render: (value, record) => <span
        style={{ color: '#1890FF', cursor: 'pointer' }}
        onClick={() =>
          router.push(`/buiness-center/project/acceptance?pageKey=${record.projectId}`,
            {
              shipmentType: this.props.shipmentType,
              pageType: 'look',
              back: record.projectId,
              projectCorrelationId: record.projectCorrelationId
            })}
      >
        查看承运配置
                                 </span>,
    }];

    const { value = [], onChange, mode } = this.props;
    const readOnly = mode === FORM_MODE.DETAIL;

    return (
      <EditableTable isAbleToDelete={this.isAbleToDelete} customOperations={this.customOperations} readOnly={readOnly} onChange={onChange} rowKey="shipmentOrganizationId" pagination={false} columns={columns} dataSource={value} />
    );
  }
}
