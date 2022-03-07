import React, { useState, useMemo, useEffect } from 'react';
import { connect } from "dva";
import { uniq, formatMoney, pick } from "../../../../utils/utils";
import { getDriverBankAccountInfo } from '../../../../services/apiService';
import Table from '../../../../components/Table/Table';
import styles from './PayForm.less';
import accountModel from "@/models/transportAccount";
import { ORDER_INTERNAL_STATUS } from "@/constants/project/project";
import { getNeedPay } from "@/utils/account";

const { actions: { getTransportAccount } } = accountModel;

const  OrderInfoTable = ({
  orderList,
  getTransportAccount
} ) => {
  const [state, setState] = useState({
    accountTransportList: [],
    loading: false,
  });
  useEffect(() => {
    setState({
      loading: true,
    });

    const orderIdList = orderList.map(item=>item.orderId).join(',');
    getTransportAccount({ offset : 0, limit : 10000, orderIdList  }).then(({ items })=>setState({
      loading: false,
      accountTransportList: items
    }));

  }, []);
  const schema  = useMemo(() => ({
    minWidth: 1100,
    variable: true,
    columns: [
      {
        title: '对账单号',
        width: 250,
        dataIndex: 'accountTransportNo',
        render: (text) =>  text || '-',
      },
      {
        title: '运单数',
        width: 150,
        dataIndex: 'transportNumber',
        render: (text) =>  text || '-',
      },
      {
        title: '总运费（元）',
        width: 175,
        dataIndex: 'totalFreight',
        render: (text) =>  (text || 0)._toFixed(2),
      },
      {
        title: '货损赔付（元）',
        dataIndex: 'damageCompensation',
        width: 175,

        render: (text) =>  (text || 0)._toFixed(2),
      },
      {
        title: '货主服务费（元）',
        width: 175,
        dataIndex: 'serviceCharge',
        render: (text) =>  (text || 0)._toFixed(2),
      },
      {
        title: '对账单金额',
        render: (text, record) => formatMoney((getNeedPay(record)._toFixed(2)))
      },
    ],
  }), []);
  return (
    <div>
      <div className={styles.payInfoTable}>
        <Table
          rowKey="bankAccountId"
          schema={schema}
          loading={state.loading}
          pagination={false}
          dataSource={{ items: state.accountTransportList }}
        />
      </div>

    </div>
  );
};

const mapStateToProps = (state) => ({
  transportAccount: pick(state.transportAccount, ["items", "count"])
});

export default connect(mapStateToProps, { getTransportAccount })(OrderInfoTable);
