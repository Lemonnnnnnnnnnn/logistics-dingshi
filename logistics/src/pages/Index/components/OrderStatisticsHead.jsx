import React from 'react';
import { DatePicker, Radio } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;

const getNowTime = () => (
  moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
);

const getServeralTimeBeforTime = ( number, type ) => (
  moment(new Date()).subtract(number, type).format('YYYY/MM/DD HH:mm:ss')
);

const OrderStatisticsHead = ({ updateData })=>{
  const handleTimeTypeClick = ( event ) =>{
    const type = event.target.value;
    const createDateStart = getServeralTimeBeforTime(1, type);
    const createDateEnd = getNowTime();
    updateData( createDateStart, createDateEnd );
  };
  return (
    <div>
      <Radio.Group onChange={(event)=>{ handleTimeTypeClick(event); }}>
        <Radio.Button value="week" style={{ border:'none' }}>本周</Radio.Button>
        <Radio.Button value="month" style={{ border:'none' }}>本月</Radio.Button>
        <Radio.Button value="year" style={{ border:'none' }}>全年</Radio.Button>
      </Radio.Group>
      <RangePicker
        onChange={dates=>{
          const createDateStart = dates[0].format('YYYY/MM/DD HH:mm:ss');
          const createDateEnd = dates[1].format('YYYY/MM/DD HH:mm:ss');
          updateData(createDateStart, createDateEnd);
        }}
      />
    </div>
  );
};
export default OrderStatisticsHead;
