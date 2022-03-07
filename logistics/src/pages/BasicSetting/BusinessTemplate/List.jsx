import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { message, Tabs, Tooltip } from 'antd';
import { getUserInfo } from '../../../services/user';
import AllTemplate from './AllTemplate';
import GeneralTemplate from './GeneralTemplate';
import { getLocal, isEmpty } from "../../../utils/utils";
import styles from './index.less';
const { TabPane } = Tabs;

const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: { projectId: undefined, transportNo: undefined, carNo: undefined, tangibleBillStatuses: undefined, tangibleBillNo: undefined }
};

const List = ({ getTrackRecordList,tabs, activeKey, history }) => {
  const currentTab = tabs.find(item => item.id === activeKey);
  // 获取本地是否有初始化数据
  const localData = getLocal(currentTab.id);

  // 如果有就去本地的如果没有就用自己定义的
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [searchObj, setSearchObj] = useState(localData && !isEmpty(localData.searchObj) ? localData.searchObj : initData.searchObj);

  useEffect(() => {
    getData();
    return () => {
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      localStorage.removeItem(currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(currentTab.id, JSON.stringify({ searchObj, pageObj }));
      }
    };
  }, [pageObj, searchObj]);

  const getData =  useCallback((params = {}) => {
    const data = {
      limit: params.limit || pageObj.pageSize,
      offset: params.current ? pageObj.pageSize * ( params.current - 1 ) : pageObj.pageSize * ( pageObj.current - 1 ),
      ...searchObj,
    };
    getTrackRecordList(data);
  }, [pageObj, searchObj]);
  return (
    <div className={styles.billBeliveryList}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="通用模版" key="1">
          <GeneralTemplate history={history} />
        </TabPane>
        <TabPane tab="全部模版" key="2">
          <AllTemplate />
        </TabPane>
      </Tabs>
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getTrackRecordList: (params) => dispatch({ type: 'trackRecordSheetStore/getTrackRecordList', payload: params }),
});

export default connect(({ trackRecordSheetStore, commonStore, loading }) => ({
  loading,
  ...trackRecordSheetStore,
  ...commonStore,
}), mapDispatchToProps)(List);
