import React, { useEffect, useMemo, useState } from 'react';
import { uniq } from "../../../../utils/utils";
import { getDriverBankAccountInfo } from "../../../../services/apiService";
import Table from '../../../../components/table/table';
import styles from "./pay-form.less";

const  PayInfoTable = ({
                         orderList,
                         orderTransportListResps
                       } ) => {
  const [state, setState] = useState({
    bankInfoList: [],
    loading: false,
  });
  useEffect(() => {
    setState({
      loading: true,
    });

    const ids = orderList.reduce((r, n) => {
      n.orderDetailItems.forEach(item=>r.push(item.driverUserId));
      return r;
    },  []);

    getDriverBankAccountInfo({ driverIdList: uniq(ids).join(',') }).then(bankInfoList => {
      bankInfoList.forEach(item=>{
        const { userId } = item;

        const receivables = orderTransportListResps.reduce((sum, current) => {
          if (current.driverUserId === userId){
            sum += current.receivables;
          }
          return sum;
        }, 0);

        item.receivables = receivables._toFixed(2);
      });

      const newBankInfoList = bankInfoList.filter(item=>Number(item.receivables));

      setState({
        bankInfoList : newBankInfoList,
        loading: false,
      });
    });
  }, [orderTransportListResps]);

  const schema  = useMemo(() => ({
    minWidth: 700,
    columns: [
      {
        title: '司机名称',
        width: 170,
        dataIndex: 'userName',
        render: (text) =>  text || '-',
      },
      {
        title: '收款账户名称',
        dataIndex: 'nickName',
        render: (text) =>  text || '-',
      },
      {
        title: '银行名称',
        width: 175,
        dataIndex: 'bankName',
        render: (text) =>  text || '-',
      },
      {
        title: '账号',
        dataIndex: 'bankAccount',
        render: (text) =>  text || '-',
      },
      {
        title :'支付金额',
        dataIndex:  'receivables',
        render: (text)=> text || '-'
      }
    ],
  }), []);
  return orderTransportListResps.length ? (
    <div>
      <div style={{ textAlign: 'left' }}>收款账户信息:</div>
      <div className={styles.payInfoTable}>
        <Table
          rowKey="bankAccountId"
          schema={schema}
          loading={state.loading}
          pagination={false}
          dataSource={{ items: state.bankInfoList }}
        />
      </div>
    </div>) : null;

};

export default PayInfoTable;
