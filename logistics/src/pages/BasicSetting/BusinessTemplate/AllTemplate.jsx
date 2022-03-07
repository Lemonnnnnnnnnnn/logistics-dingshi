import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Table from '../../../components/Table/Table';
import { getUserInfo } from '../../../services/user';
import { ORDER_STATUS, renderStatus } from '../../../constants/billDelivery';
import { getLocal, isEmpty } from "../../../utils/utils";
import auth from '../../../constants/authCodes';
import styles from './index.less';

const {
  DELIVERY_LIST_UPDATE, // 修改
} = auth;

const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: { projectId: undefined, transportNo: undefined, carNo: undefined, tangibleBillStatuses: undefined, tangibleBillNo: undefined }
};

const AllTemplate = ({ loading, projectList, history, getTrackRecordList, trackRecordList, tabs, activeKey }) => {
  const currentTab = tabs.find(item => item.id === activeKey);
  // 获取本地是否有初始化数据
  const localData = getLocal(currentTab.id);

  // 如果有就去本地的如果没有就用自己定义的
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [searchObj, setSearchObj] = useState(localData && !isEmpty(localData.searchObj) ? localData.searchObj : initData.searchObj);
  const { organizationType } = getUserInfo();
  const isLoading = loading.effects['trackRecordSheetStore/getTrackRecordList'];

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

  const onChange = (pagination) => {
    const { current, pageSize } = pagination;
    setPageObj({ current, pageSize });
  };
  const getData =  useCallback((params = {}) => {
    const data = {
      limit: params.limit || pageObj.pageSize,
      offset: params.current ? pageObj.pageSize * ( params.current - 1 ) : pageObj.pageSize * ( pageObj.current - 1 ),
      ...searchObj};
    getTrackRecordList(data);
  }, [pageObj, searchObj]);
  const searchList = useMemo(() => ([{
    label: '业务类别',
    placeholder: '请输入业务类别名称',
    key: 'transportNo',
    value: searchObj.transportNo,
    type: 'input',
  },  {
    label: '业务模版名称',
    placeholder: '请输入业务模板名称',
    key: 'transportNo',
    value: searchObj.transportNo,
    type: 'input',
  }, {
    label: '业务模版描述',
    placeholder: '请输入业务模板描述关键字',
    key: 'carNo',
    value: searchObj.carNo,
    type: 'input',
  }, {
    label: '状态',
    placeholder: '请选择',
    key: 'tangibleBillStatuses',
    value: searchObj.tangibleBillStatuses,
    type: 'select',
    options:  [
      { key: 1, value: 1, label: '启用' },
      { key: 3, value: 3, label: '禁用' },
    ],
  }, {
    label: '所属客户',
    placeholder: '请输入客户名称',
    key: 'carNo',
    value: searchObj.carNo,
    type: 'input',
  }, {
    label: '使用项目',
    placeholder: '请输入项目名称',
    key: 'carNo',
    value: searchObj.carNo,
    type: 'input',
  },]), [projectList, searchObj]);

  const onSearch = useCallback((val) => {
    setSearchObj({ ...val });
    setPageObj({ current: 1, pageSize: 10 });
  }, []);

  const buttonList = useMemo(() => {
    return [{
      label: '查询',
      btnType: "primary",
      key: 'search',
      type: "search",
      onClick: onSearch,
    }, {
      label: '重置',
      key: 'reset',
      onClick: onSearch,
      params : searchList.map(item => item.key)
    }
    ];
  }, []);


  const schema  = useMemo(() => ({
    variable: true,
    minWidth: 2200,
    columns: [{
      title: '所属客户',
      dataIndex: 'tangibleBillStatus',
      width: 60,
      render: (text) => (<span>{renderStatus(text)}</span>)
    }, {
      title: '模版编号',
      dataIndex: 'tangibleBillNo',
      width: 100,
    }, {
      title: '业务类别',
      // width: 175,
      dataIndex: 'projectName'
    }, {
      title: '业务模版名称',
      dataIndex: 'signerUserName',
      render: (text) =>  text || '-',
    }, {
      title: '业务模版描述',
      dataIndex: 'signTime',
      width: 175
    }, {
      title: '最近更新人',
      dataIndex: 'transportNum'
    }, {
      title: '更新时间',
      dataIndex: 'createUserName',
      render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }, {
      title: '当前版本号',
      dataIndex: 'transportNum'
    }, {
      title: '使用项目',
      dataIndex: 'createUserName'
    }],
    operations: record => {
      const { tangibleBillStatus, tangibleBillId, tangibleBillNo } = record;
      return [{
        title: '详情',
        onClick: () => history.push(`billDelivery/billDeliveryDetail?pageKey=${tangibleBillNo}&tangibleBillId=${tangibleBillId}&type=details`, { organizationType }),
      }, tangibleBillStatus !== ORDER_STATUS.SIGNED_IN && {
        title: '修改',
        auth: [DELIVERY_LIST_UPDATE],
        onClick: () => history.push(`billDelivery/billDeliveryUpdate?pageKey=${tangibleBillNo}&tangibleBillId=${tangibleBillId}&type=update`, { organizationType }),
      }];
    },
  }), []);
  return (
    <div className={styles.billBeliveryList}>
      <div className={styles.billBeliveryTable} style={organizationType === 5  ? {} : { marginTop: 0 }}>
        <Table
          rowKey="tangibleBillId"
          searchList={searchList}
          buttonList={buttonList}
          pagination={pageObj}
          onChange={onChange}
          schema={schema}
          loading={isLoading}
          searchObj={searchObj}
          dataSource={trackRecordList}
        />
      </div>
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
}), mapDispatchToProps)(AllTemplate);
