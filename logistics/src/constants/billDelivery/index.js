import moment from 'moment';
import React from "react";

export const ORDER_STATUS = {
  NEW_CREATE: 0, // 新建
  ON_WAY: 1, // 在途
  SIGNED_IN: 2, // 签收
  REVIEWD: 3, // 待审核
  REVIEWED: 4, // 已审核
  REFUSE: 5, // 审核拒绝
};

export const renderStatus = (status) => {
  switch (status) {
    case ORDER_STATUS.ON_WAY:
      return '在途';
    case ORDER_STATUS.SIGNED_IN:
      return '已签收';
    case ORDER_STATUS.NEW_CREATE:
      return '新建';
    case ORDER_STATUS.REFUSE:
      return '审核拒绝';
    case ORDER_STATUS.REVIEWD:
      return '待审核';
    case ORDER_STATUS.REVIEWED:
      return '已审核';
    default:
  }
};

export const statusOptions = [
  {
    key: null,
    value: null,
    label: '全部',
  },
  {
    key: 0,
    value: 0,
    label: '新建',
  },
  {
    key: 1,
    value: 1,
    label: '在途',
  },
  {
    key: 2,
    value: 2,
    label: '已签收',
  },
  {
    key: 3,
    value: 3,
    label: '待审核',
  },
  {
    key: 4,
    value: 4,
    label: '已审核',
  },
  {
    key: 5,
    value: 5,
    label: '审核拒绝',
  },
];

export const schema  = {
  variable: true,
  minWidth: 2200,
  columns: [
    {
      title: '运单号',
      dataIndex: 'transportNo',
      render: (text) =>  text || '-',
    },
    {
      title: '车牌号',
      dataIndex: 'carNo'
    },
    {
      title: '提货时间',
      dataIndex: 'deliveryTime',
      render: (text) =>  text || '-',
    },
    {
      title: '提货单号',
      dataIndex: 'billNumber',
      render: (text) =>  text || '-',
    },
    {
      title: '卸货点',
      dataIndex: 'receivingName',
      render: (text) =>  text || '-',
    },
    {
      title: '签收时间',
      dataIndex: 'receivingTime',
      render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '实提量',
      dataIndex: 'deliveryNum',
      render: (text) =>  text || '-',
    },
    {
      title: '签收量',
      dataIndex: 'receivingNum',
      render: (text) =>  text || '-',
    },
    {
      title: '过磅量',
      dataIndex: 'weighNum',
      render: (text) =>  text || '-',
    },
    {
      title: '单位',
      dataIndex: 'goodsUnit',
      render: (text) =>  text || '-',
    },
    {
      title: '签收单号',
      dataIndex: 'receivingNo',
      render: (text) =>  text || '-',
    },
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      render: (text) =>  text || '-',
    },
    {
      title: '司机',
      dataIndex: 'driverUserName',
      render: (text) =>  text || '-',
    },
  ],
};

export const columnsPrint = [
  {
    title: '运单号',
    dataIndex: 'transportNo',
    render: (text) => <div>{text}</div>,
  },
  {
    title: '车牌号',
    dataIndex: 'carNo',
    render: (text) => <div>{text}</div>,
  },
  {
    title: '单位',
    dataIndex: 'goodsUnit',
    render: (text) => <div>{text}</div>,
  },
  {
    title: '货品名称',
    dataIndex: 'goodsName',
    render: (text) => <div>{text}</div>,
  },
  {
    title: '提货时间',
    dataIndex: 'deliveryTime',
    render: (text) =>  text || '-',
  },
  {
    title: '签收单号',
    dataIndex: 'receivingNo',
    render: (text) => <div>{text}</div>,
  },
  {
    title: '签收时间',
    dataIndex: 'receivingTime',
    render: (text) => <div>{text ? moment(text).format('YYYY-MM-DD') : '-'}</div>,
  },
  {
    title: '实提量',
    dataIndex: 'deliveryNum',
    render: (text) => <div>{text}</div>,
  },
  {
    title: '签收量',
    dataIndex: 'receivingNum',
    render: (text) => <div>{text}</div>,
  },
  {
    title: '过磅量',
    dataIndex: 'weighNum',
    render: (text) => <div>{text}</div>,
  }
];
