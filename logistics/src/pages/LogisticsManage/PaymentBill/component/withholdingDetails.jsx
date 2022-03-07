import React, { useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Modal } from 'antd';
import Table from '@/components/Table/Table';

const initParams = {
  limit : 10,
  offset : 0,
};

const  WithholdingDetails = ({
  remitDetails,
  loading,
  getRemitDetailsList,
  orderId
} ) => {
  const isLoading = loading.effects['withholdingManageStore/getRemitDetailsList'];
  useEffect(() => {
    getData();
  }, []);
  const getData =  useCallback((params = {}) => {
    getRemitDetailsList({ ...initParams, orderId });
  }, []);
  const schema  = useMemo(() => ({
    variable: true,
    minWidth: 2200,
    columns: [{
      title: '支付单号',
      dataIndex: 'orderNo',
      width: 60,
    }, {
      title: '名称',
      dataIndex: 'nickName',
      width: 100,
    }, {
      title: '联系方式',
      dataIndex: 'phone',
      render: (text) =>  text || '-',
    }, {
      title: '身份证号',
      dataIndex: 'idcardNo',
    }, {
      title: '收入（司机提现）',
      dataIndex: 'totalIncome'
    }, {
      title: '个人所得税',
      dataIndex: 'personalIncomeTax',
    }, {
      title: '印花税',
      // width: 175,
      dataIndex: 'stampTax',
    }, {
      title: '地方教育费附加',
      dataIndex: 'localEducationTax',
    }, {
      title: '教费育附加',
      dataIndex: 'educationTax',
    }, {
      title: '城建税',
      width: 175,
      dataIndex: 'cityTax',
    }, {
      title: '增值税',
      width: 175,
      dataIndex: 'valueAddedTax',
    }, {
      title: '税费合计',
      width: 175,
      dataIndex: 'totalTaxes',
    }, {
      title: '状态',
      dataIndex: 'remitDetailStatus',
      render: (text) =>  text ? '已缴' : '待缴',
    }, {
      title: '代扣时间',
      width: 175,
      dataIndex: 'createTime',
      render: (text) =>   text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }],
  }), [remitDetails]);
  const onExamine = useCallback(() => {
    Modal.confirm({
      title: '系统提示',
      icon: null,
      width: 1000,
      content: (
        <div>
          <img src="https://production-environmentn-web-hangzhou.oss-cn-hangzhou.aliyuncs.com/business/tax/tax.png" alt="" />
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
        dataSource={remitDetails}
      />
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  getRemitDetailsList: (payload) => dispatch({ type: 'withholdingManageStore/getRemitDetailsList', payload }),
});

export default connect(({ withholdingManageStore, loading }) => ({
  loading,
  ...withholdingManageStore,
}), mapDispatchToProps)(WithholdingDetails);;
