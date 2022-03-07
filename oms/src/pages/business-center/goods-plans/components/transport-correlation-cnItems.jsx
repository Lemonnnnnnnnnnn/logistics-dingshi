import React, { Component } from 'react';
import { Table } from 'antd';

export default class TransportCorrelationCnItems extends Component{

  columns = [
    {
      dataIndex: 'goodsName',
      title: '货品名称',
      render:( text, record ) => `${record.categoryName}-${text}`
    },
    {
      dataIndex: 'goodTotalNum',
      title: '要货数量',
      render: ( text, record )=> `${text}${record.goodsUnitCN}`
    },
    {
      dataIndex: 'goodsNum',
      title: '已经调度',
      render: ( text, record )=> `${text}${record.goodsUnitCN}`
    },
    {
      dataIndex: 'deliveryNum',
      title: '运输中',
      render: ( text, record )=> `${text}${record.goodsUnitCN}`
    },
    {
      dataIndex: 'exception',
      title: '运单异常',
      render: ( text, record )=> `${text}${record.goodsUnitCN}`
    },
    {
      dataIndex: 'receivingNum',
      title: '已确认收货',
      render: ( text, record )=> `${text}${record.goodsUnitCN}`
    }
  ]

  render (){
    const { value } = this.props;
    if (!value) return <></>;
    return (
      <Table columns={this.columns} rowKey="goodsId" dataSource={value} pagination={false} />
    );
  }

}
