import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Modal } from 'antd';
import { isEmpty, getLocal } from '@/utils/utils';
import Table from '@/components/table/table';

const  WithholdingDetails = ({
  transports,
  loading,
} ) => {
  const isLoading = loading.effects['billDeliveryStore/screenOutTransport'];
  useEffect(() => {
  }, []);
  const schema  = useMemo(() => ({
    variable: true,
    minWidth: 2400,
    columns: [
      {
        title: '司机名称',
        width: 170,
        dataIndex: 'transportNo',
        render: (text) =>  text || '-',
      },
      {
        title: '司机联系方式',
        dataIndex: 'carNo',
        render: (text) =>  text || '-',
      },
      {
        title: '司机身份证号',
        width: 175,
        dataIndex: 'receivingTime',
        render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
      {
        title: '收入',
        dataIndex: 'receivingNo',
        render: (text) =>  text || '-',
      },
      {
        title: '所得税',
        width: 170,
        dataIndex: 'k',
        render: (text) =>  text || '-',
      },
      {
        title: '印花税',
        dataIndex: 'l',
        render: (text) =>  text || '-',
      },
      {
        title: '地方教育费附加',
        width: 175,
        dataIndex: 'm',
        render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
      {
        title: '教育费附加',
        dataIndex: 'n',
        render: (text) =>  text || '-',
      },
      {
        title: '城建税',
        dataIndex: 'b',
        render: (text) =>  text || '-',
      },
      {
        title: '增值税',
        width: 170,
        dataIndex: 'v',
        render: (text) =>  text || '-',
      },
      {
        title: '税费合计',
        dataIndex: 'c',
        render: (text) =>  text || '-',
      },
      {
        title: '状态',
        width: 175,
        dataIndex: 'x',
      },
      {
        title: '代扣时间',
        dataIndex: 'z',
        render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
    ],
  }), []);
  const onExamine = useCallback(() => {
    Modal.confirm({
      title: '系统提示',
      icon: null,
      width: 1000,
      content: (
        <div>
          <img src="" alt="" />
          <div>
            备注：1、销售额15万/月以下免征增值税；2、个体户个人所得税减半征收；3、目前增值税优惠政策税率为1%。
          </div>
        </div>
      ),
      okText: '',
      cancelText: '关闭',
      onOk: () => {

      }
    });
  }, []);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>(注：现仅计算司机提现收入代扣金额）</span>
        <span style={{ color: '#1890FF' }} onClick={onExamine}>查看纳税税率</span>
      </div>
      <Table
        rowKey="transportId"
        schema={schema}
        loading={isLoading}
        dataSource={transports}
      />
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  screenOutTransport: (payload) => dispatch({ type: 'billDeliveryStore/screenOutTransport', payload }),
  getDetailByTransportNo: (payload) => dispatch({ type: 'billDeliveryStore/getDetailByTransportNo', payload }),
  getByTransportNo: (payload) => dispatch({ type: 'billDeliveryStore/getByTransportNo', payload }),
});

export default connect(({ billDeliveryStore, loading }) => ({
  loading,
  ...billDeliveryStore,
}), mapDispatchToProps)(WithholdingDetails);;
