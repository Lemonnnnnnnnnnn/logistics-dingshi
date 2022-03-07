import React from 'react'
import { Card } from 'antd';
import PrograssBar from './PrograssBar'

const OrderAddInforCard = ({ title, todayAdd, yesterdayAdd })=>(
  <div style={{ padding:'20px' }}>
    <Card style={{ width: '100%' }}>
      <h2 style={{ opacity: '0.8', fontWeight: '550' }}>{ title }</h2>
      <div style={{ marginBottom:'10px' }}>
        <span>
          <span>昨日新增</span>
          <span style={{ marginLeft:'5px', color: 'rgba(250, 211, 55, 1)', fontWeight: '450', fontSize: '16px' }}>{ yesterdayAdd }</span>
        </span>
        <span style={{ float:'right' }}>
          <span>今日新增</span>
          <span style={{ marginLeft:'5px', color: 'rgba(78, 203, 116, 1)', fontWeight: '450', fontSize: '16px' }}>{ todayAdd }</span>
        </span>
      </div>
      <PrograssBar yesterdayAdd={yesterdayAdd} todayAdd={todayAdd} />
    </Card>
  </div>
)

export default OrderAddInforCard
