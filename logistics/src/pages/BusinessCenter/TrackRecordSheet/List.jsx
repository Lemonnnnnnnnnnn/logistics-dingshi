import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Table from '../../../components/Table/Table';
import { getUserInfo } from '../../../services/user';
import { getLocal, isEmpty, omit } from "../../../utils/utils";
import auth from '../../../constants/authCodes';
import { recordDict,  } from '@/constants/trackRecordSheet';
import { patchTrackRecord, exportTrackRecord } from '@/services/trackRecordSheet';
import ConfirmModal from '../../../components/Common/ConfirmModal';
import { routerToExportPage } from "@/utils/utils";
import styles from './index.less';

const {
  TRACK_RECORD_SHEET_EXPORT, // 导出
  TRACK_RECORD_SHEET_CANCEL, // 作废
  TRACK_RECORD_SHEET_RESTORE, // 恢复
} = auth;

const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: { trajectoryNo: undefined, carNo: undefined, driverUserName: undefined, deliveryName: undefined, receivingName: undefined, trajectoryStatus: undefined, deliveryTime: undefined, receivingTime: undefined }
};

const List = ({ loading, projectList, history, getTrackRecordList, trackRecordList, tabs, activeKey }) => {
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
      ...searchObj,
      ...params,
      deliveryStartTime: searchObj && searchObj.deliveryTime && searchObj.deliveryTime.length && moment(searchObj.deliveryTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
      deliveryEndTime: searchObj && searchObj.deliveryTime && searchObj.deliveryTime.length && moment(searchObj.deliveryTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
      receivingStartTime: searchObj && searchObj.receivingTime && searchObj.receivingTime.length && moment(searchObj.receivingTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
      receivingEndTime: searchObj && searchObj.receivingTime && searchObj.receivingTime.length && moment(searchObj.receivingTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    };
    getTrackRecordList(omit(data,  ["deliveryTime", "receivingTime"]));
  }, [pageObj, searchObj]);
  const searchList = useMemo(() => {
    let list = [{
      label: '记录单号',
      key: 'trajectoryNo',
      value: searchObj.trajectoryNo,
      type: 'input',
    },  {
      label: '车辆',
      key: 'carNo',
      value: searchObj.carNo,
      type: 'input',
    }, {
      label: '司机',
      key: 'driverUserName',
      value: searchObj.driverUserName,
      type: 'input',
    }, {
      label: '提货点',
      key: 'deliveryName',
      value: searchObj.deliveryName,
      type: 'input',
    }, {
      label: '卸货点',
      key: 'receivingName',
      value: searchObj.receivingName,
      type: 'input',
    }, {
      label: '状态',
      key: 'trajectoryStatus',
      value: searchObj.trajectoryStatus,
      type: 'select',
      options:  [
        { key: 1, value: 1, label: '运输中' },
        { key: 2, value: 2, label: '已完成' },
        { key: 3, value: 3, label: '已作废' },
        { key: 4, value: 4, label: '无效' },
      ],
    }];
    if (organizationType === 5) {
      list = list.concat([{
        label: '提货起止时间',
        key: 'deliveryTime',
        type: 'time',
        value: searchObj.deliveryTime && searchObj.deliveryTime.map(item => moment(item)),
        allowClear: true,
      }, {
        label: '卸货起止时间',
        key: 'receivingTime',
        type: 'time',
        value: searchObj.receivingTime && searchObj.receivingTime.map(item => moment(item)),
        allowClear: true,
      }]);
    }
    return list;
  }, [projectList, searchObj, organizationType]);

  const onExport = useCallback(
    (val) => {
      const params = {
        ...omit(val,  ["deliveryTime", "receivingTime"]),
        deliveryStartTime: val && val.deliveryTime && val.deliveryTime.length && moment(val.deliveryTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
        deliveryEndTime: val && val.deliveryTime && val.deliveryTime.length && moment(val.deliveryTime[0]).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
        receivingStartTime: val && val.receivingTime && val.receivingTime.length && moment(val.receivingTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
        receivingEndTime: val && val.receivingTime && val.receivingTime.length && moment(val.receivingTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
      };
      routerToExportPage(exportTrackRecord, { ...params });
    }, []);

  const onSearch = useCallback((val) => {
    setSearchObj({ ...val });
    setPageObj({ current: 1, pageSize: 10 });
  }, []);

  const buttonList = useMemo(() => [{
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
  },
  {
    label: '导出Excel',
    authority: [TRACK_RECORD_SHEET_EXPORT],
    key: 'export',
    btnType: "primary",
    onClick: onExport,
  }
  ], []);


  const schema  = useMemo(() => ({
    variable: true,
    minWidth: 2200,
    columns: [{
      title: '状态',
      dataIndex: 'trajectoryStatus',
      width: 60,
      render: (text) => (<span>{recordDict[text]}</span>)
    }, {
      title: '记录单单号',
      dataIndex: 'trajectoryNo',
      width: 100,
    }, {
      title: '项目编号',
      // width: 175,
      dataIndex: 'projectNo'
    }, {
      title: '项目',
      dataIndex: 'projectName',
      render: (text) =>  text || '-',
    }, {
      title: '车牌号',
      dataIndex: 'carNo',
    }, {
      title: '司机',
      dataIndex: 'driverUserName'
    }, {
      title: '联系电话',
      dataIndex: 'driverPhone'
    }, {
      title: '提货点',
      dataIndex: 'deliveryName'
    }, {
      title: '提货地址',
      dataIndex: 'deliveryAddress'
    }, {
      title: '进入提货点时间',
      width: 175,
      dataIndex: 'deliveryTime',
      render: (text) =>  moment(text).format('YYYY-MM-DD HH:mm:ss'),
    }, {
      title: '卸货点',
      dataIndex: 'receivingName'
    }, {
      title: '卸货地址',
      dataIndex: 'receivingAddress'
    }, {
      title: '离开卸货点时间',
      dataIndex: 'receivingTime',
      render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : "-",
    }, {
      title: '预约单',
      dataIndex: 'prebookingNo'
    }, {
      title: '运单',
      width: 175,
      dataIndex: 'transportNo',
    }],
    operations: record => {
      const { trajectoryStatus, trajectoryId } = record;
      const operation = [{
        title: '详情',
        onClick: () => history.push(`trackRecordSheet/detail?pageKey=${trajectoryId}&trajectoryId=${trajectoryId}`),
      }];

      if (trajectoryStatus !== 3 && trajectoryStatus !== 4) {
        operation.push({
          title: '作废',
          confirmMessage: () => `确定要作废该条轨迹记录单？`,
          auth: [TRACK_RECORD_SHEET_CANCEL],
          onClick: (_,  __, data, res) => updateTrackRecord({ isAvailable: false, trajectoryId }, data, res),
          // onClick: (_,  __, data, res) => ConfirmModal('亲，确认要删除该交接单？删除后不可恢复！', updateTrackRecord({ isAvailable: false, trajectoryId }, data, res))()
        });
      } else if (trajectoryStatus === 3) {
        operation.push({
          title: '恢复',
          confirmMessage: () => `确定要恢复该条轨迹记录单？`,
          auth: [TRACK_RECORD_SHEET_RESTORE],
          onClick: (_,  __, data, res) => updateTrackRecord({ isAvailable: true, trajectoryId }, data, res),
        });
      }
      return operation;
    },
  }), []);
  const updateTrackRecord = (params, data, res) => {
    patchTrackRecord(params).then(() => {
      getData({ current: data.current, ...res });
    });
  };
  return (
    <div className={styles.billBeliveryList}>
      <div className={styles.billBeliveryTable} style={organizationType === 5  ? {} : { marginTop: 0 }}>
        <Table
          rowKey="trajectoryId"
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
}), mapDispatchToProps)(List);
