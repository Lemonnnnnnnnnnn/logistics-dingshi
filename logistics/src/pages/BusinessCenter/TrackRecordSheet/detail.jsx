
import React, { useEffect, useCallback } from 'react';
import { Row, Col, Divider, Tabs } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { recordDict } from '@/constants/trackRecordSheet';
import Event from './component/event';
import TrackMap from '@/components/TrackMap/TrackMap';

const { TabPane } = Tabs;

const Detail = ({ getTrackRecordDetail, trackRecordDetail, location }) => {
  useEffect(() => {
    getTrackRecordDetail(location.query.trajectoryId);
  }, []);

  const getTrackEndTime = useCallback(() => {
    const { receivingTime, deliveryTime } = trackRecordDetail;
    if (receivingTime) return moment(receivingTime);
    if (deliveryTime) {
      if (moment(deliveryTime).isSame(moment(), 'day')) {
        return moment().endOf();
      }
      return moment(deliveryTime).add(1, 'days');
    }
    return moment(deliveryTime).add(1, 'days');
  }, [trackRecordDetail]);

  console.log(getTrackEndTime().format('YYYY-MM-DD'));

  return (
    <div>
      {/* <h1>车辆轨迹记录单详情</h1> */}
      <div style={{ fontWeight: 'bold', fontSize: "1.2rem" }}>车辆轨迹记录单详情</div>
      <Divider />
      <div className='ml-1'>
        <Row className='mt-2 mb-2'>
          <Col span={6}>
            <span className='fw-bold'>轨迹记录单单号：</span>
            <span className='fw-bold ml-2'>{trackRecordDetail.trajectoryNo}</span>
          </Col>
          <Col span={6}>
            <span className='fw-bold'>状态：</span>
            <span className='ml-2 color-gray fw-bold'>{recordDict[trackRecordDetail.trajectoryStatus]}</span>
          </Col>
        </Row>

        <div className='mt-2 mb-2'>
          <div>项目：</div>
          <div className='ml-1 mt-1 color-gray'>{trackRecordDetail.projectName || "-"}</div>
        </div>

        <div className='mt-2 mb-2'>
          <div>车辆：</div>
          <div className='ml-1 mt-1 color-gray'>{trackRecordDetail.carNo || "-"}</div>
        </div>

        <div className='mt-2 mb-2'>
          <div>司机：</div>
          <div className='ml-1 mt-1 color-gray'>{trackRecordDetail.driverUserName || "-"}</div>
        </div>

        <div className='fw-bold' style={{ fontSize: "1rem" }}>起点信息</div>
        <Divider />
        <div className='mt-2 mb-2'>
          <span>提货点：</span>
          <span className='ml-1 mt-1 color-gray'>{trackRecordDetail.deliveryName || "-"}</span>
        </div>

        <div className='mt-2 mb-2'>
          <span>提货地址：</span>
          <span className='ml-1 mt-1 color-gray'>{trackRecordDetail.deliveryAddress || "-"}</span>
        </div>

        <div className='mt-2 mb-2'>
          <span>进入提货点时间：</span>
          <span className='ml-1 mt-1 color-gray'>{trackRecordDetail.deliveryTime ? moment(trackRecordDetail.deliveryTime).format('YYYY-MM-DD HH:mm:ss') : "-"}</span>
        </div>

        <div className='fw-bold' style={{ fontSize: "1rem" }}>终点信息</div>
        <Divider />
        <div className='mt-2 mb-2'>
          <span>卸货点：</span>
          <span className='ml-1 mt-1 color-gray'>{trackRecordDetail.receivingName || "-"}</span>
        </div>

        <div className='mt-2 mb-2'>
          <span>卸货地址：</span>
          <span className='ml-1 mt-1 color-gray'>{trackRecordDetail.receivingAddress || "-"}</span>
        </div>

        <div className='mt-2 mb-2'>
          <span>离开卸货点时间：</span>
          <span className='ml-1 mt-1 color-gray'>{trackRecordDetail.receivingTime ? moment(trackRecordDetail.receivingTime).format('YYYY-MM-DD HH:mm:ss') : "-"}</span>
        </div>

        <Tabs defaultActiveKey="1">
          <TabPane tab="轨迹记录单事件" key="1">
            <Event data={trackRecordDetail.trajectoryEventRespList || []} />
          </TabPane>
          <TabPane tab="车辆轨迹" key="2">
            <TrackMap
              {...trackRecordDetail}
              startDate={trackRecordDetail.deliveryTime ? moment(trackRecordDetail.deliveryTime) : undefined}
              endDate={getTrackEndTime()}
              plateNumber={trackRecordDetail.carNo}
              type='zhongjiao'
            />
          </TabPane>
        </Tabs>

      </div>
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getTrackRecordDetail: (trajectoryId) => dispatch({ type: 'trackRecordSheetStore/getTrackRecordDetail', payload: { trajectoryId } }),
});

export default connect(({ trackRecordSheetStore, commonStore, loading }) => ({
  loading,
  ...trackRecordSheetStore,
  ...commonStore,
}), mapDispatchToProps)(Detail);
