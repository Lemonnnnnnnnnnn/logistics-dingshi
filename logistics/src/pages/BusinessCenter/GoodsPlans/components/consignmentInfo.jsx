import { Table } from 'antd'
import React, { Component } from 'react';

class consignmentInfo extends Component {

  columns=[
    {
      dataIndex:'consignmentName',
      title: '托运单位'
    },
    {
      dataIndex: 'responsibleName',
      title: '联系人'
    },
    {
      dataIndex: 'responsiblePhone',
      title: '联系电话'
    }
  ]

  render () {
    const { value={} } = this.props
    return (
      <Table columns={this.columns} dataSource={[value]} pagination={false} />
    );
  }
}

export default consignmentInfo;
