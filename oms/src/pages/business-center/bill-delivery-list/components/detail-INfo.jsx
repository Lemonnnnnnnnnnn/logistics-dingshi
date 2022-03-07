import React from 'react';
import { Row, Col } from 'antd';
import moment from 'moment';
import { renderStatus } from '../../../../constants/billDelivery';
import styles from '../add-list.less';

const  DetailINfo = ({ currentInfo }) => (
  <>
    <div className={styles.addListItem}><span>交接单详情</span></div>
    <div className={styles.detailInfo}>
      <Row>
        <Col span={8}>
          <div className={styles.detailInfoItem}>
            <span>项目名称</span><span>{currentInfo.projectName}</span>
          </div>
        </Col>
        <Col span={8}>
          <div className={styles.detailInfoItem}>
            <span>单据号</span><span>{currentInfo.tangibleBillNo}</span>
          </div>
        </Col>
        <Col span={8}>
          <div className={styles.detailInfoItem}>
            <span>状态</span><span>{renderStatus(currentInfo.tangibleBillStatus)}</span>
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <div className={styles.detailInfoItem}>
            <span>创建人</span><span>{currentInfo.createUserName}</span>
          </div>
        </Col>
        <Col span={8}>
          <div className={styles.detailInfoItem}>
            <span>创建时间</span><span>{currentInfo.createTime ? moment(currentInfo.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
          </div>
        </Col>
        <Col span={8}>
          <div className={styles.detailInfoItem}>
            <span>审核人</span><span>{currentInfo.auditUserName ? currentInfo.auditUserName : '-'}</span>
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <div className={styles.detailInfoItem}>
            <span>审核时间</span><span>{currentInfo.auditTime ? moment(currentInfo.auditTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
          </div>
        </Col>
        <Col span={8}>
          <div className={styles.detailInfoItem}>
            <span>签收人</span><span>{currentInfo.signerUserName ? currentInfo.signerUserName : '-'}</span>
          </div>
        </Col>
        <Col span={8}>
          <div className={styles.detailInfoItem}>
            <span>签收时间</span><span>{currentInfo.signTime ? moment(currentInfo.signTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
          </div>
        </Col>
      </Row>
    </div>
  </>
);

export default DetailINfo;
