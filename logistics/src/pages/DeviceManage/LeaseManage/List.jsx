import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {  DEVICE_RENT_MANAGE_EXPORT } from '@/constants/authCodes';
import { getServiceLeaseExcel } from '@/services/deviceManageService';
import Table from '@/components/Table/Table';
import {  routerToExportPage, translatePageType, getLocal, isEmpty, omit } from '@/utils/utils';


const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: { leaseNo: undefined, carNo: undefined, driverNickNameOrPhone: undefined, depositStatus: undefined, refundStatus: undefined, time: undefined, newTime: undefined }
};

const List = ({ loading, projectList, history, getServiceLeases, serviceLeases, tabs, activeKey }) => {
  // 获取本地是否有初始化数据
  const currentTab = tabs.find(item => item.id === activeKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };
  // 如果有就去本地的如果没有就用自己定义的
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [searchObj, setSearchObj] = useState(localData && !isEmpty(localData.searchObj) ? localData.searchObj : initData.searchObj);
  const isLoading = loading.effects['deviceManageStore/getServiceLeases'];

  useEffect(() => {
    getData();
    return () => {
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      localStorage.removeItem(currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(currentTab.id, JSON.stringify({ searchObj, pageObj }));
      }
    };
  }, [pageObj, searchObj, translatePageType, setPageObj]);

  const onChange = (pagination) => {
    const { current, pageSize } = pagination;
    setPageObj({ current, pageSize });
  };
  const getData =  useCallback((params = {}) => {
    const data = {
      limit: params.limit || pageObj.pageSize,
      offset: params.current ? pageObj.pageSize * ( params.current - 1 ) : pageObj.pageSize * ( pageObj.current - 1 ),
      ...searchObj,
      refundStartTime: searchObj && searchObj.time && searchObj.time.length && moment(searchObj.time[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
      refundEndTime: searchObj && searchObj.time && searchObj.time.length && moment(searchObj.time[0]).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
      createStartTime: searchObj && searchObj.newTime && searchObj.newTime.length && moment(searchObj.newTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
      createEndTime: searchObj && searchObj.newTime && searchObj.newTime.length && moment(searchObj.newTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    };
    getServiceLeases(omit(data, ['newTime', 'time']));
  }, [pageObj, searchObj, translatePageType, setPageObj]);
  const searchList = useMemo(() => ([{
    label: '单据号',
    key: 'leaseNo',
    value: searchObj.leaseNo,
    placeholder: '请输入单据号',
    type: 'input',
  }, {
    label: '绑定车辆',
    key: 'carNo',
    placeholder: "可只输入车牌号后四位",
    value: searchObj.carNo,
    type: 'input',
  }, {
    label: '使用司机',
    placeholder: "可输入司机姓名或手机号后四位查询",
    key: 'driverNickNameOrPhone',
    value: searchObj.driverNickNameOrPhone,
    type: 'input',
  }, {
    label: '押金收取情况',
    placeholder: '请选择押金收取情况',
    key: 'depositStatusList',
    type: 'select',
    value: searchObj.depositStatusList,
    showSearch: true,
    options:  [
      { key: null, value: null, label: '全部' },
      { key: 0, value: '0,3,4', label: '未收取' },
      { key: 1, value: 1, label: '已收取' },
      { key: 2, value: 2, label: '已退回' },
    ],
  }, {
    label: '设备归还状态',
    key: 'refundStatus',
    placeholder: '请选择设备归还状态',
    type: 'select',
    value: searchObj.refundStatus,
    showSearch: true,
    options: [
      { key: null, value: null, label: '全部' },
      { key: 0, value: 0, label: '未归还' },
      { key: 1, value: 1, label: '已申请' },
      { key: 2, value: 2, label: '审核拒绝' },
      { key: 3, value: 3, label: '已归还' },
    ],
  }, {
    label: '归还时间',
    key: 'time',
    type: 'time',
    value: searchObj.time && searchObj.time.map(item => moment(item)),
    allowClear: true,
  }, {
    label: '创建时间',
    key: 'newTime',
    type: 'time',
    value: searchObj.newTime && searchObj.newTime.map(item => moment(item)),
    allowClear: true,
  }]), [projectList, searchObj]);

  const onExport = useCallback(
    (val) => {
      const params = {
        ...val,
        refundStartTime: val && val.time && val.time.length && moment(val.time[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
        refundEndTime: val && val.time && val.time.length && moment(val.time[0]).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
        createStartTime: val && val.newTime && val.newTime.length && moment(val.newTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
        createEndTime: val && val.newTime && val.newTime.length && moment(val.newTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
      };
      routerToExportPage(getServiceLeaseExcel, { ...params });
    }, []);

  const onSearch = useCallback((val) => {
    setSearchObj({ ...val });
    setPageObj({ current: 1, pageSize: 10 });
  }, []);
  // const onDisable = (leaseId) => (_,  __, data) => {

  // };
  const buttonList = useMemo(() => {
    const btnList = [{
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
    // 当前版本不做
    // {
    //   label: '批量规还',
    //   // authority: [DELIVERY_LIST_IMPORT],
    //   key: 'return',
    //   btnType: "primary",
    //   onClick: ConfirmModal(`请确认车辆${'请确认车辆川C58791、川C58793、川A58741已将GPS设备在厂商售后网点移除，并可二次使用？'}已将GPS设备在厂商售后网点移除，并可二次使用?`, onDisable('23')),
    // },
    {
      label: '导出EXCEL',
      authority: [DEVICE_RENT_MANAGE_EXPORT],
      key: 'export',
      btnType: "primary",
      onClick: onExport,
    }];
    return btnList;
  }, []);
  // 当前版本不做
  // const onExamine = useCallback((leaseId) => () => {
  //   Modal.confirm({
  //     title: '系统提示',
  //     icon: null,
  //     width: 600,
  //     content: (
  //       <div>
  //         <p className={styles.modalTitle}>请审核确定车辆川C58791是否已将GPS设备在厂商售后网点移除，并可二次使用？</p>
  //         <div className={styles.modalConfirm}>
  //           <span>审核意见：</span><TextArea rows={7} />
  //         </div>
  //       </div>
  //     ),
  //     okText: '确认',
  //     cancelText: '取消',
  //     onOk: () => {

  //     }
  //   });
  // }, []);
  const renderStatus = (status) => {
    switch (status) {
      case 0:
        return '未归还';
      case 1:
        return '已申请';
      case 2:
        return '审核拒绝';
      case 3:
        return '已归还';
      default:
    }
  };
  const renderMoneyStatus = (status) => {
    switch (status) {
      case 0:
        return '未收取';
      case 1:
        return '已收取';
      case 2:
        return '已退回';
      case 3:
        return '未收取';
      case 4:
        return '未收取';
      default:
    }
  };
  const schema  = useMemo(() => ({
    variable: true,
    minWidth: 2200,
    columns: [{
      title: '单据号',
      dataIndex: 'leaseNo',
      width: 60,
    }, {
      title: '设备厂家',
      dataIndex: 'providerName',
      width: 100,
    }, {
      title: '租赁车辆',
      dataIndex: 'carNo',
      render: (text) =>  text || '-',
    }, {
      title: '使用司机',
      dataIndex: 'driverNickName',
      render: (text, row) =>  text ? `${text}${row.driverPhone}` : '-',
    }, {
      title: '创建人',
      dataIndex: 'createUserName'
    }, {
      title: '创建时间',
      dataIndex: 'createTime',
      render: (text) =>   text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }, {
      title: '押金收取情况',
      // width: 175,
      dataIndex: 'depositStatus',
      render: (text) =>  renderMoneyStatus(text) || '-',
    }, {
      title: '设备归还状态',
      dataIndex: 'refundStatus',
      render: (text) =>  renderStatus(text) || '-',
    }, {
      title: '归还时间',
      dataIndex: 'refundTime',
      render: (text) =>   text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }, {
      title: '押金退回时间',
      width: 175,
      dataIndex: 'depositRefundTime',
      render: (text) =>   text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }],
    operations: record => {
      const { leaseId } = record;
      const operationList = [{
        title: '详情',
        onClick: () =>  history.push(`leaseManage/detail?pageKey=${leaseId}`),
      },
      // 当前版本不做
      // {
      //   title: '归还',
      //   // auth: [DELIVERY_LIST_UPDATE],
      //   onClick: ConfirmModal(`请确认车辆${'请确认车辆川C58791、川C58793、川A58741已将GPS设备在厂商售后网点移除，并可二次使用？'}已将GPS设备在厂商售后网点移除，并可二次使用?`, onDisable(leaseId)),
      // }, {
      //   title: '审核',
      //   // auth: [DELIVERY_LIST_UPDATE],
      //   onClick: onExamine(leaseId),
      // }, {
      //   title: '退还押金',
      //   // auth: [DELIVERY_LIST_UPDATE],
      //   onClick: ConfirmModal(`确认要退回该车辆川F22222的GPS设备租赁押金500元？`, onDisable(leaseId)),
      // }
      ];
      return operationList;
    },
  }), [serviceLeases]);
  return (
    <div className="gps">
      <Table
        rowKey="leaseId"
        searchList={searchList}
        buttonList={buttonList}
        pagination={pageObj}
        onChange={onChange}
        schema={schema}
        searchObj={searchObj}
        loading={isLoading}
        dataSource={serviceLeases}
      />
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getServiceLeases: (params) => dispatch({ type: 'deviceManageStore/getServiceLeases', payload: params  }),
});
export default connect(({ deviceManageStore, commonStore, loading }) => ({
  loading,
  ...deviceManageStore,
  ...commonStore,
}), mapDispatchToProps)(List);
