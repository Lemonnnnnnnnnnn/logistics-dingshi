import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Button, Table, Row, Col, Spin  } from "antd";
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactToPrint from "react-to-print";
import { connect } from "dva";
import moment from "moment";
import { columnsPrint } from '@/constants/billDelivery';
import {  tangibleBillDetail } from '@/services/billDeliveryService';
import styles from './Print.less';


const Print = ({  location, getTransportList, transportList, loading }) => {
  const tangibleBillId = location.state && location.state.tangibleBillId;
  const [currentInfo, setCurrentInfo] = useState({});
  const pageObj = useMemo(()=>({ pageSize : 100000, current : 0, }));
  const isLoading = loading.effects['billDeliveryStore/getTransportList'];

  useEffect(() => {
    if (tangibleBillId) {
      tangibleBillDetail(tangibleBillId).then((res) => {
        setCurrentInfo({ ...res });
      });
    }
  }, [location]);

  useEffect(() => {
    getData();
  }, [currentInfo]);

  const getData =  useCallback(() => {
    getTransportList({
      tangibleBillId,
      limit: pageObj.pageSize,
      offset: pageObj.current,
    });
  }, [currentInfo]);

  let refs;

  return (
    <div>
      <ReactToPrint
        trigger={() => <Button type="primary">打印</Button>}
        content={() => refs}
      />
      <div className='m-2' style={{ textAlign : 'center' }} ref={(el) => refs = el}>
        <h1 className='mb-2' style={{ fontWeight : 'bold' }}>实体单据交接单</h1>

        <div className={styles.header}>
          <Row type='flex'>
            <Col className={styles.title} span={4}>单号：</Col>
            <Col className={styles.content} span={8}>{currentInfo.tangibleBillNo}</Col>
            <Col className={styles.title} span={4}>项目名称：</Col>
            <Col className={styles.content} span={8}>{currentInfo.projectName}</Col>
          </Row>
          <Row type='flex'>
            <Col className={styles.title} span={4}>创建人：</Col>
            <Col className={styles.content} span={8}>{currentInfo.createUserName}</Col>
            <Col className={styles.title} span={4}>创建时间：</Col>
            <Col className={styles.content} span={8}>{currentInfo.createTime ? moment(currentInfo.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</Col>
          </Row>
          <Row type='flex'>
            <Col className={styles.title} span={4}>运单数量：</Col>
            <Col className={styles.content} span={8}>{currentInfo.transportNum}</Col>
            <Col className={styles.title} span={4}>交接对象：</Col>
            <Col className={styles.content} span={8}>{currentInfo.handoverOrganizationName || '-'}</Col>
          </Row>
        </div>

        {isLoading ? <Spin /> : <Table pagination={false} rowClassName={styles.rowClass} tableLayout="fixed" dataSource={transportList.items} columns={columnsPrint} />}

        <Row style={{ fontWeight :'bold' }} type='flex' justify="space-around" className='mt-2 mb-2'>
          <Col>签收时间：{currentInfo.signTime ? moment(currentInfo.signTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</Col>
          <Col>签收人：{currentInfo.signerUserName || '-'}</Col>
        </Row>
        <div>*单据信息为公司隐私，请注意保护。意外获得此单据，敬请销毁。</div>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  getTransportList: (data) => dispatch({ type: 'billDeliveryStore/getTransportList', payload: { ...data, shortTime : true } })
});

export default connect(({ billDeliveryStore, loading }) => ({
  loading,
  ...billDeliveryStore,
}), mapDispatchToProps)(Print);
