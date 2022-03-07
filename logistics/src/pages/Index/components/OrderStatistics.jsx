import React from 'react'
import { Tabs } from 'antd';
import PolygonalChart from './PolygonalChart'
import OrderStatisticsHead from './OrderStatisticsHead'

const { TabPane } = Tabs;

const OrderStatistics = ({ prebookingInfo, transportInfo, updateData })=>(
  <Tabs tabBarExtraContent={<OrderStatisticsHead updateData={updateData} />} style={{ padding:'20px' }}>
    <TabPane tab="预约单" key="1">
      <PolygonalChart data={prebookingInfo} />
    </TabPane>
    <TabPane tab="运单" key="2">
      <PolygonalChart data={transportInfo} />
    </TabPane>
  </Tabs>
)

export default OrderStatistics
