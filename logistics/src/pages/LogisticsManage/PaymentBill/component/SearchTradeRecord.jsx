import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { connect } from 'dva';
import { Button } from 'antd';
import { FormCard, SchemaForm } from "@gem-mine/antd-schema-form";
import model from '@/models/financeBusiness';
import Table from '@/components/Table/Table';
import { isEmpty, pick } from "@/utils/utils";
import { getUserInfo } from "@/services/user";
import organizationType from "@/constants/organization/organizationType";

const initParams = {
  limit : 10,
  offset : 0,
  queryBank : true,
  businessTypeItems:'7,12,13,15,20'
};

const SearchTradeRecord = ({ getFinanceBusiness, loading, financeBusiness, orderNo }) => {

  const [pageObj, setPageObj] = useState({ current: 1, pageSize: 10 });

  useEffect(()=>{
    getData();
  }, [pageObj]);

  const getData =  useCallback(()=> {
    const { organizationType } = getUserInfo();
    getFinanceBusiness({
      ...initParams,
      businessFunction : organizationType === 1,
      orderNo,
      limit:  pageObj.pageSize,
      offset:  pageObj.pageSize * ( pageObj.current - 1 ),
    });
  }, [pageObj]);

  const isLoading = loading.effects['financeBusiness/getFinanceBusiness'];

  const tableSchema = {
    variable: true,
    // minWidth: 2832,
    columns: [
      {
        title: '交易类型',
        dataIndex: 'businessType',
        render: (text) => ({
          7: '司机提现',
          12: '货主手续费',
          13: '司机手续费',
          15: '承运手续费',
          20: '合伙人提现',
        }[text] || '未知类型'),
      },
      {
        title: '司机',
        dataIndex: 'nickName',
      },
      {
        title: '交易金额(元)',
        dataIndex: 'transactionAmount',
        render: text => text ? text._toFixed(2) : '--',
      },
      {
        title: '对方账户名',
        dataIndex: organizationType === 1 ? 'payerName' : 'payeeName',
      },
      {
        title: '对方账号',
        dataIndex: organizationType === 1 ? 'payerAccount' : 'payeeAccount',
      },
      {
        title :'交易编号',
        dataIndex:  'transactionNo',
      },
      {
        title :'对方开户行',
        dataIndex: 'bankName'
      },
      {
        title: '交易状态',
        dataIndex: 'transactionStatus',
        // width: 130,
        fixed: 'left',
        render: (text) => {
          const config = {
            0: { word: '失败', color: 'red' },
            1: { word: '成功', color: 'green' },
            2: { word: '已关闭-已重新支付', color: 'red' },
            3: { word: '处理中', color: 'orange' },
            4: { word: '已关闭', color: 'red' },
          }[text] || { word: '状态错误', color: 'red' };
          return <div style={{ color: config.color }}>{config.word}</div>;
        },
      },
      {
        title: '异常分类',
        dataIndex: 'singularType',
        render: (text) => {
          const word = {
            1: '用户资料不完善',
            2: '系统原因',
          }[text];
          return <div style={{ color: 'red' }}>{word}</div>;
        },
      }, {
        title: '异常原因',
        dataIndex: 'singularReason',
        // width: 232,
        render: (text) =>
          <div
            className='test-ellipsis'
            style={{ display: 'inline-block', width: '200px' }}
            title={text}
          >{text}
          </div>,
      },
      {
        title: '交易时间',
        dataIndex: 'createTime',
        render: text => moment(text).format('YYYY/MM/DD HH:mm'),
      },
    ],
  };

  const onChange = (pagination) => {
    const { current, pageSize } = pagination;
    setPageObj({ current, pageSize });
  };

  return (
    <FormCard title='交易记录查询' colCount={1} extra={<Button type='primary' onClick={getData} style={{ float : 'right' }}>刷新</Button>}>
      <Table
        schema={tableSchema}
        loading={isLoading}
        rowKey='financeBusinessId'
        pagination={pageObj}
        onChange={onChange}
        dataSource={financeBusiness}
      />
    </FormCard>);
};

const { actions } = model;
export default connect(({ loading, financeBusiness }) =>({
  loading,
  financeBusiness : pick(financeBusiness, ['items', 'count']),
}), actions)(SearchTradeRecord);
