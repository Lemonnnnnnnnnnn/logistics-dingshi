import React, { useState, useMemo, useEffect } from 'react';
import moment from 'moment';
import { Button, Row, Col } from 'antd';
import { connect } from 'dva';
import { getServiceLeaseDetail, } from '@/services/deviceManageService';
import Table from '../../../components/Table/Table';
import styles from './Detail.less';


const Details = ({ history, location, deleteTab, commonStore, tabs, activeKey  } ) => {
  const [currentInfo, setCurrentInfo] = useState({});
  const leaseId = location.query && location.query.pageKey;

  useEffect(() => {
    getServiceLeaseDetail(leaseId).then(res => {
      const { logisticsServiceLeaseEntity: {
        leaseNo,
        providerName,
        createUserName,
        createTime,
        organizationName,
        carNo,
        driverNickName,
        depositStatus,
        depositPayTime,
        depositTransactionNo,
        refundStatus,
        refundApplyTime,
        refundPetitionerName,
        refundAuditorName,
        refundAuditReason,
        refundTime,
        refundTransactionNo,
      } } = res;

      const leaseDetail = [
        {
          carNo,
          driverNickName,
          depositStatus,
          depositPayTime,
          depositTransactionNo,
        },
      ];
      const returnDetail = [
        {
          refundStatus,
          refundApplyTime,
          refundPetitionerName,
          refundAuditorName,
          refundAuditReason,
          refundTime,
          refundTransactionNo
        }
      ];
      setCurrentInfo({ leaseNo, providerName, createUserName, createTime, organizationName, leaseDetail, returnDetail });
    });
  }, [location]);

  const renderStatus = (status) => {
    switch (status) {
      case 0:
        return '未归还';
      case 1:
        return '已申请';
      case 2:
        return '审核拒绝';
      case 3:
        return '已归还';
      default:
    }
  };
  const renderMoneyStatus = (status) => {
    switch (status) {
      case 0:
        return '未收取';
      case 1:
        return '已收取';
      case 2:
        return '已退回';
      default:
    }
  };
  const schemaTable = useMemo(() => ({
    columns: [{
      title: '租赁车辆',
      dataIndex: 'carNo',
      render: (text) =>  text || '-',
    }, {
      title: '使用司机',
      dataIndex: 'driverNickName',
      render: (text) =>  text || '-',
    }, {
      title: '押金收取情况',
      dataIndex: 'depositStatus',
      render: (text) =>  renderMoneyStatus(text) || '-',
    }, {
      title: '押金支付时间',
      dataIndex: 'depositPayTime',
      render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }, {
      title: '关联交易编号',
      dataIndex: 'depositTransactionNo',
      render: (text) =>  text || '-',
    }],
  }), []);
  const schemaTable2 = useMemo(() => ({
    columns: [{
      title: '归还状态',
      dataIndex: 'refundStatus',
      render: (text) =>  renderStatus(text) || '-',
    }, {
      title: '归还时间',
      dataIndex: 'refundApplyTime',
      render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }, {
      title: '申请人',
      dataIndex: 'refundPetitionerName',
      render: (text) =>  text || '-',
    }, {
      title: '审核人',
      dataIndex: 'refundAuditorName',
      render: (text) =>  text || '-',
    }, {
      title: '审核意见',
      dataIndex: 'refundAuditReason',
      render: (text) =>  text || '-',
    }, {
      title: '押金退回时间',
      dataIndex: 'refundTime',
      render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }, {
      title: '关联交易编号',
      dataIndex: 'refundTransactionNo',
      render: (text) =>  text || '-',
    }],
  }), []);
  return (
    <div className={styles.detailList}>
      <div className={styles.detailInfo}>
        <Row>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>单据号</span><span>{currentInfo.leaseNo || '-'}</span>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>设备厂家</span><span>{currentInfo.providerName || '-'}</span>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>创建人</span><span>{currentInfo.createUserName || '-'}</span>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>创建时间</span><span>{currentInfo.createTime ? moment(currentInfo.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>设备所属公司</span><span>{currentInfo.organizationName || '-'}</span>
            </div>
          </Col>
        </Row>
      </div>
      <div className={styles.addListItem}><span>设备租赁详情</span></div>
      <Table
        rowKey="carNo"
        schema={schemaTable}
        dataSource={{ items: currentInfo.leaseDetail || [] }}
      />
      <div className={styles.addListItem}><span>设备归还详情</span></div>
      <Table
        rowKey="refundApplyTime"
        schema={schemaTable2}
        dataSource={{ items: currentInfo.returnDetail || [] }}
      />
      <div style={{ textAlign: 'center' }}>
        <Button
          onClick={() => {
            history.push('/deviceManage/leaseManage');
            const dele = tabs.find(item => item.id === activeKey);
            deleteTab(commonStore, { id: dele.id });
          }}
        >
          返回
        </Button>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload }),
});
export default connect(({ commonStore }) => ({
  ...commonStore,
}), mapDispatchToProps)(Details);
