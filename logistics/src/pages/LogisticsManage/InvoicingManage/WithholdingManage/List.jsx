import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import MonthlyTable from './components/MonthlyTable';
import ScheduleTable from './components/ScheduleTable';
import { getAuthority } from '../../../../utils/authority';
import {
  WITHHOLDING_MANAGE_LIST,
  WITHHOLDING_MANAGE_MONTH,
} from "../../../../constants/authCodes";

const { TabPane } = Tabs;

const List = ({ history, location }) => {
  const authority = getAuthority();
  const list = authority.some(item => item === WITHHOLDING_MANAGE_LIST);
  const month = authority.some(item => item === WITHHOLDING_MANAGE_MONTH);
  // const initTab = month || route.name === '代扣代缴管理'  ? 'withholdingManage/withholdingManage' :' withholdingManagewithholdingManage/details';
  const [tabKey] = useState(history.location.pathname.indexOf('withholdingManage/details') === -1  ? 'withholdingManage/withholdingManage' :'withholdingManage/withholdingManage/details');
  return (
    <div className="gps">
      <Tabs
        activeKey={tabKey}
        onChange={(val) => {
          history.push(`/invoicing-manage/${val}`, { vagueSelect: location.state && location.state.vagueSelect });
        }}
      >
        {
          month && (
            <TabPane tab="月度汇总表" key="withholdingManage/withholdingManage">
              <MonthlyTable history={history} />
            </TabPane>
          )
        }
        {
          list && !month && (
            <TabPane tab="明细表" key="withholdingManage/withholdingManage">
              <ScheduleTable history={history} location={location} />
            </TabPane>
          )
        }
        {
          list && month && (
            <TabPane tab="明细表" key="withholdingManage/withholdingManage/details">
              <ScheduleTable history={history} location={location} />
            </TabPane>
          )
        }
      </Tabs>
    </div>
  );
};
export default List;
