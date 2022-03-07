import React, { Component } from 'react';
import EditableTable from '@/components/EditableTable/EditableTable';

class ShipmentTable extends Component {
  render () {
    const columns = [
      {
        title: '承运单位',
        dataIndex: 'shipmentId',
        key: 'shipmentId',
        width: '30%',
        render: (text, record) => record.shipmentName
      }, {
        title: '联系人',
        dataIndex: 'contactId',
        key: 'contactId',
        width: '25%',
        render: (text, record) => record.contactName
      }, {
        title: '联系电话',
        dataIndex: 'contactPhone',
        key: 'contactPhone',
        width: '35%'
      }
    ];
    const readOnly = true;
    return (
      <EditableTable rowKey="shipmentId" onChange={this.props.onChange} readOnly={readOnly} key="shipmentId" columns={columns} pagination={false} dataSource={this.props.value} />
    );
  }
}

export default ShipmentTable;
