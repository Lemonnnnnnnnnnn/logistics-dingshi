import React from 'react';
import { Row, Col } from 'antd';
import Media from 'react-media';
import OrderAddInfoCard from './order-aadd-info-card';
import { OWNER } from '../../../constants/organization/organization-type';

const OrderAddInfoList = (props)=>{
  const { organizationType, preYesIncrease, preTodayIncrease, tranYesIncrease, tranTodayIncrease, tranYesAbnormalIncrease, tranTodayAbnormalIncrease, projectYesIncrease, projectTodayIncrease } =props;

  return (
    <Row>
      <Media query="(max-width: 1300px)">
        { matches => matches ?
          <>
            <Col span={12}>
              <OrderAddInfoCard title={organizationType === OWNER ? '预约单' : '派车单'} yesterdayAdd={preYesIncrease} todayAdd={preTodayIncrease} />
            </Col>
            <Col span={12}>
              <OrderAddInfoCard title='运单' yesterdayAdd={tranYesIncrease} todayAdd={tranTodayIncrease} />
            </Col>
            <Col span={12}>
              <OrderAddInfoCard title='运单异常' yesterdayAdd={tranYesAbnormalIncrease} todayAdd={tranTodayAbnormalIncrease} />
            </Col>
            <Col span={12}>
              <OrderAddInfoCard title='项目' yesterdayAdd={projectYesIncrease} todayAdd={projectTodayIncrease} />
            </Col>
          </>
          :
          <>
            <Col span={6}>
              <OrderAddInfoCard title={organizationType === OWNER ? '预约单' : '派车单'} yesterdayAdd={preYesIncrease} todayAdd={preTodayIncrease} />
            </Col>
            <Col span={6}>
              <OrderAddInfoCard title='运单' yesterdayAdd={tranYesIncrease} todayAdd={tranTodayIncrease} />
            </Col>
            <Col span={6}>
              <OrderAddInfoCard title='运单异常' yesterdayAdd={tranYesAbnormalIncrease} todayAdd={tranTodayAbnormalIncrease} />
            </Col>
            <Col span={6}>
              <OrderAddInfoCard title='项目' yesterdayAdd={projectYesIncrease} todayAdd={projectTodayIncrease} />
            </Col>
          </>
        }
      </Media>

    </Row>
  );
};

export default OrderAddInfoList;
