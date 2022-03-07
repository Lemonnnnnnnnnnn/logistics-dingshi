import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { message } from 'antd';
import Table from '../../../components/Table/Table';
import { getServiceCarExcel, putServiceCar } from '../../../services/deviceManageService';
import {  routerToExportPage, omit, getLocal, isEmpty } from '../../../utils/utils';
import ConfirmModal from '../../../components/Common/ConfirmModal';
import { GPS_DEVICE_MANAGE_DISABLE, GPS_DEVICE_MANAGE_ENABLE, GPS_DEVICE_MANAGE_EXPORT } from '../../../constants/authCodes';

const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: {
    equipmentOperation: undefined,
    soid: undefined,
    arNo: undefined,
    driverNickNameOrPhone: undefined,
    organizationName: undefined,
    newTime: undefined,
    serviceEventType: undefined,
    isAvailable: undefined,
    providerId: undefined,
  }
};

const List = ({ loading, projectList, history, getServiceCars, serviceCars, tabs, activeKey, dictionarys, getDictionarys }) => {
  const currentTab = tabs.find(item => item.id === activeKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };
  // 如果有就去本地的如果没有就用自己定义的
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [searchObj, setSearchObj] = useState(localData && !isEmpty(localData.searchObj) ? localData.searchObj : initData.searchObj);
  const isLoading = loading.effects['deviceManageStore/getServiceCars'];

  useEffect(() => {
    if (!dictionarys.legth) {
      getDictionarys();
    }
  }, []);

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
      isAvailable: searchObj.isAvailable !== undefined && searchObj.isAvailable !== null ? !!searchObj.isAvailable : undefined,
      createStartTime: searchObj.newTime && searchObj.newTime.length && moment(searchObj.newTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
      createEndTime: searchObj.newTime && searchObj.newTime.length && moment(searchObj.newTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    };
    getServiceCars(omit(data, 'newTime', 'current'));
  }, [pageObj, searchObj]);

  const searchList = useMemo(() => ([{
    label: '设备运行情况',
    key: 'equipmentOperation',
    placeholder: '请选择设备运行情况',
    type: 'select',
    value: searchObj.equipmentOperation,
    showSearch: true,
    options: [
      { key: null, value: null, label: '全部' },
      { key: 0, value: 0, label: '离线' },
      { key: 1, value: 1, label: '在线' },
    ],
  }, {
    label: '设备SN',
    key: 'soid',
    placeholder: '请输入设备SN',
    value: searchObj.soid,
    type: 'input',
  }, {
    label: '租赁车辆',
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
  },  {
    label: '设备所属公司',
    placeholder: '请输入设备所属公司',
    key: 'organizationName',
    value: searchObj.organizationName,
    type: 'input',
  }, {
    label: '创建时间',
    key: 'newTime',
    type: 'time',
    value: searchObj.newTime && searchObj.newTime.map(item => moment(item)),
    allowClear: true,
  }, {
    label: '异常信息',
    key: 'serviceEventType',
    placeholder: '请选择异常信息',
    value: searchObj.serviceEventType,
    type: 'select',
    options: [
      { key: null, value: null, label: '全部' },
      { key: 1, value: 1, label: '查询不到轨迹一天内（星软，网阔）' },
      { key: 2, value: 2, label: '查询不到租赁单（星软）' },
    ]
  }, {
    label: '状态',
    key: 'isAvailable',
    placeholder: '请选择状态',
    value: searchObj.isAvailable,
    type: 'select',
    options: [
      { key: null, value: null, label: '全部' },
      { key: 1, value: 1, label: '启用' },
      { key: 0, value: 0, label: '禁用' },
    ],
  }, {
    label: '设备厂家',
    key: 'providerId',
    placeholder: '请选择设备厂家',
    value: searchObj.providerId,
    type: 'select',
    options: dictionarys,
  }]), [projectList, searchObj, dictionarys]);

  const onExport = useCallback((val) => {
    const params = {
      ...val,
      isAvailable: val.isAvailable !== undefined && val.isAvailable !== null ? !!val.isAvailable : undefined,
      createStartTime: val.newTime && val.newTime.length && moment(val.newTime[0]).format('YYYY/MM/DD HH:mm:ss'),
      createEndTime: val.newTime && val.newTime.length && moment(val.newTime[1]).format('YYYY/MM/DD HH:mm:ss'),
    };
    routerToExportPage(getServiceCarExcel, { ...params });
  }, []);

  const onSearch = useCallback((val) => {
    setSearchObj({ ...val });
    setPageObj({ current: 1, pageSize: 10 });
  }, []);
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
    },  {
      label: '导出Excel',
      authority: [GPS_DEVICE_MANAGE_EXPORT],
      key: 'export',
      btnType: "primary",
      onClick: onExport,
    }];
    return btnList;
  }, []);

  const onDisable = useCallback((isAvailable, serviceCarId) => (_, __, state, data) => {
    const params = {
      limit: state.limit || state.pageSize,
      offset: state.current ? state.pageSize * ( state.current - 1 ) : pageObj.pageSize * ( pageObj.current - 1 ),
      ...data,
      isAvailable: data.isAvailable !== undefined && data.isAvailable !== null ? !!data.isAvailable : undefined,
      createStartTime: data.newTime && data.newTime.length && moment(data.newTime[0]).format('YYYY-MM-DD HH:mm:ss'),
      createEndTime: data.newTime && data.newTime.length && moment(data.newTime[1]).format('YYYY-MM-DD HH:mm:ss'),
    };
    if (isAvailable) {
      ConfirmModal(`亲，确认要将该条信息设置为禁用状态？一旦禁用系统将不再去查询该车辆的轨迹及相关信息！`, () => {
        putServiceCar(serviceCarId, { isAvailable: false }).then(() => {
          message.success('禁用成功！');
          getServiceCars(omit(params, 'newTime', 'current'));
        });
      })();
    } else {
      putServiceCar(serviceCarId, { isAvailable: true }).then(() => {
        message.success('启用成功！');
        getServiceCars(omit(params, 'newTime', 'current'));
      });
    }
  }, [pageObj, searchObj]);

  const schema  = useMemo(() => ({
    variable: true,
    minWidth: 2200,
    columns: [{
      title: 'ID',
      dataIndex: 'serviceCarId',
      width: 60,
      render: (text) =>  text || '-',
    }, {
      title: '设备名称',
      dataIndex: 'deviceName',
      render: (text) =>  text || '-',
    }, {
      title: '设备SN',
      dataIndex: 'soid',
      render: (text) =>  text || '-',
    }, {
      title: '设备运行情况',
      dataIndex: 'equipmentOperation',
      render: (equipmentOperation) =>  equipmentOperation ? '在线' : '离线',
    }, {
      title: '最近查询时间',
      dataIndex: 'lastQueryTime',
      width: 175,
      render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }, {
      title: '设备厂家',
      dataIndex: 'providerName',
      render: (text) =>  text || '-',
    }, {
      title: '设备所属公司',
      dataIndex: 'organizationName',
      render: (text) =>  text || '-',
    }, {
      title: '租赁车辆',
      dataIndex: 'carBrand',
      render: (text) =>  text || '-',
    }, {
      title: '使用司机',
      dataIndex: 'driverUserName',
      render: (text, row) =>  text ? `${text}${row.driverPhone}` : '-',
    }, {
      title: '最近异常信息',
      dataIndex: 'exceptionMessage',
      render: (text) =>  text || '-',
    }, {
      title: '状态',
      dataIndex: 'isAvailable',
      render: (text) =>  (text && text !== null ? '启用' : '禁用'),
    }, {
      title: '创建时间',
      width: 175,
      dataIndex: 'createTime',
      render: (text) =>   text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }],
    operations: record => {
      const { serviceCarId, isAvailable } = record;
      const operationList = [
        {
          title: '详情',
          onClick: () => history.push(`GPSManage/detail?pageKey=${serviceCarId}`),
        },
        // organizationType === 1 && {
        //   title: '编辑',
        //   auth: [DELIVERY_LIST_UPDATE],
        //   onClick:  () => history.push(`GPSManage/edit?pageKey=${serviceCarId}`),
        // },
        {
          title: isAvailable && '禁用',
          auth: [GPS_DEVICE_MANAGE_DISABLE],
          onClick: onDisable(isAvailable, serviceCarId),
        },
        {
          title: !isAvailable && '启用',
          auth: [GPS_DEVICE_MANAGE_ENABLE],
          onClick: onDisable(isAvailable, serviceCarId),
        },
      ];
      return operationList;
    },
  }), []);
  return (
    <div className="gps">
      <Table
        rowKey="serviceCarId"
        searchList={searchList}
        buttonList={buttonList}
        pagination={pageObj}
        onChange={onChange}
        schema={schema}
        loading={isLoading}
        searchObj={searchObj}
        dataSource={serviceCars}
      />
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getServiceCars: (params) => dispatch({ type: 'deviceManageStore/getServiceCars', payload: params  }),
  getDictionarys: () => dispatch({ type: 'deviceManageStore/getDictionarys' }),
});
export default connect(({ deviceManageStore, commonStore, loading }) => ({
  loading,
  ...deviceManageStore,
  ...commonStore,
}), mapDispatchToProps)(List);
