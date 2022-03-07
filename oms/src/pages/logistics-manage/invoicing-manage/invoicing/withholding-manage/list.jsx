import React from 'react';
import { Tabs } from 'antd';
import MonthlyTable from './components/monthly-table';
import ScheduleTable from './components/schedule-table';
// import styles from './List.less';
const { TabPane } = Tabs;

const List = ({ history }) => {
  return (
    <div className="gps">
      <Tabs defaultActiveKey="1">
        <TabPane tab="月度汇总表" key="1">
          <MonthlyTable history={history} />
        </TabPane>
        <TabPane tab="明细表" key="2">
          <ScheduleTable history={history} />
        </TabPane>
      </Tabs>
    </div>
  );
};
export default List;
