import React, { useState, useMemo, useEffect } from 'react';
import moment from 'moment';
import { Button, Row, Col } from 'antd';
import { connect } from 'dva';
import { getServiceCarDetail } from '@/services/deviceManageService';
import Table from '../../../components/Table/Table';
import styles from './Detail.less';


const Details = ({ history, location, deleteTab, commonStore, tabs, activeKey } ) => {
  const [currentInfo, setCurrentInfo] = useState({});
  const serviceCarId = location.query && location.query.pageKey;
  useEffect(() => {
    getServiceCarDetail(serviceCarId).then(res => {
      setCurrentInfo({ ...res });
    });
  }, [serviceCarId]);
  const schemaTable = useMemo(() => ({
    columns: [{
      title: '排查时间',
      dataIndex: 'createTime',
      render: (text) =>  moment(text).format('YYYY-MM-DD HH:mm:ss'),
    }, {
      title: '异常事件',
      dataIndex: 'serviceEventId',
      render: (text) =>  text === 1 ? '查询不到轨迹一天内（星软，网阔）' : '查询不到租赁单（星软）',
    }],
  }), []);
  return (
    <div className={styles.detailList}>
      <div className={styles.detailInfo}>
        <Row>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>设备名称</span><span>{currentInfo.deviceName || '-'}</span>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>设备SN</span><span>{currentInfo.soid || '-'}</span>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>设备厂家</span><span>{currentInfo.providerName || '-'}</span>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>设备所属公司</span><span>{currentInfo.organizationName || '-'}</span>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>租赁车辆</span><span>{currentInfo.carBrand || '-'}</span>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>使用司机</span><span>{currentInfo.driverUserName || '-'}</span>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>GPS查询账号</span><span>{currentInfo.userName || '-'}</span>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>状态</span><span>{currentInfo.isAvailable ? '启用' : '禁用'}</span>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>创建时间</span><span>{currentInfo.createTime ? moment(currentInfo.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>设备运行情况</span><span>{currentInfo.equipmentOperation ? '在线' : '离线'}</span>
            </div>
          </Col>
        </Row>
      </div>
      <div className={styles.addListItem}><span>异常信息</span></div>
      <Table
        rowKey="serviceEventId"
        schema={schemaTable}
        dataSource={{ items: currentInfo.serviceEventList || [] }}
      />
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <Button
          onClick={() => {
            history.push('/deviceManage/GPSManage');
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
