import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import { message, Modal } from 'antd';
import moment from 'moment';
import { exportRemitUsersExcel, patchRemitUsers } from '../../../../services/withholdingManage';
import { WITHHOLDING_MANAGE_PERSONNEL_NEW, WITHHOLDING_MANAGE_PERSONNEL_EXPORT, WITHHOLDING_MANAGE_PERSONNEL_DISABLE, WITHHOLDING_MANAGE_PERSONNEL_OPEN } from "../../../../constants/authCodes";
import Table from '../../../../components/Table/Table';
import {  routerToExportPage, getLocal, isEmpty, omit } from '../../../../utils/utils';
import AddPersonnel from './components/AddPersonnel';


const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: { vagueSelect: undefined, newTime: undefined, isAvailable: undefined, idcardNo: undefined }
};

const PersonnelManage = ({ loading, projectList, getRemitUsersList, remitDrivers, tabs, activeKey }) => {
  // 获取本地是否有初始化数据
  const currentTab = tabs.find(item => item.id === activeKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [searchObj, setSearchObj] = useState(localData && !isEmpty(localData.searchObj) ? localData.searchObj : initData.searchObj);
  const [addVisible, setAddVisible] = useState(false);
  const isLoading = loading.effects['withholdingManageStore/getRemitUsersList'];

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
      createDateStart: searchObj && searchObj.newTime && searchObj.newTime.length && moment(searchObj.newTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
      createDateEnd: searchObj && searchObj.newTime && searchObj.newTime.length && moment(searchObj.newTime[0]).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    };
    getRemitUsersList(omit(data, ['newTime']));
  }, [pageObj, searchObj]);

  const searchList = useMemo(() => ([{
    label: '纳税人',
    key: 'vagueSelect',
    placeholder: "纳税人名称/手机号",
    value: searchObj.vagueSelect,
    type: 'input',
  }, {
    label: '添加日期',
    key: 'newTime',
    type: 'time',
    value: searchObj.newTime && searchObj.newTime.map(item => moment(item)),
    allowClear: true,
  }, {
    label: '状态',
    key: 'isAvailable',
    placeholder: "请选择状态",
    type: 'select',
    value: searchObj.refundStatus,
    showSearch: true,
    options: [
      { key: null, value: null, label: '全部' },
      { key: 0, value: 0, label: '禁用' },
      { key: 1, value: 1, label: '启用' },
    ],
  },  {
    label: '身份证号',
    key: 'idcardNo',
    placeholder: "可输入后六位",
    value: searchObj.idcardNo,
    type: 'input',
  }]), [projectList, searchObj]);

  const onExport = useCallback(
    (val) => {
      const data = {
        ...val,
        createDateStart: val && val.newTime && val.newTime.length && moment(val.newTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
        createDateEnd: val && val.newTime && val.newTime.length && moment(val.newTime[0]).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
      };
      routerToExportPage(exportRemitUsersExcel, { ...data, fileName: '代扣代缴人员管理' });
    }, [pageObj]);

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
    },
    {
      label: '导出EXCEL',
      authority: [WITHHOLDING_MANAGE_PERSONNEL_EXPORT],
      key: 'export',
      btnType: "primary",
      onClick: onExport,
    },
    {
      label: '添加代缴人员',
      authority: [WITHHOLDING_MANAGE_PERSONNEL_NEW],
      key: 'personnelManage',
      btnType: "primary",
      onClick: () => setAddVisible(true),
    }];
    return btnList;
  }, []);
  const onChangeIsAvailable = useCallback((remitUserId, isAvailable) => (_, __, state, data) => {
    const params = {
      limit: state.limit || state.pageSize,
      offset: state.current ? state.pageSize * ( state.current - 1 ) : pageObj.pageSize * ( pageObj.current - 1 ),
      ...data,
      createDateStart: data.newTime && data.newTime.length && data.newTime[0].format('YYYY-MM-DD HH:mm:ss'),
      createDateEnd: data.newTime && data.newTime.length && data.newTime[1].format('YYYY-MM-DD HH:mm:ss'),
    };
    patchRemitUsers(remitUserId, { isAvailable: isAvailable ? 0 : 1 }).then(res => {
      message.success('操作成功！');
      getRemitUsersList(omit(params, ['newTime']));
    });
  }, [pageObj, searchObj]);
  const schema  = useMemo(() => ({
    columns: [{
      title: '纳税人',
      dataIndex: 'nickName',
      width: 100,
    }, {
      title: '联系方式',
      dataIndex: 'phone',
      render: (text) =>  text || '-',
    }, {
      title: '身份证号',
      dataIndex: 'idcardNo',
    }, {
      title: '状态',
      dataIndex: 'isAvailable',
      render: (text) =>  text ? '启用' : '禁用',
    }, {
      title: '添加人员',
      dataIndex: 'createUserName'
    },  {
      title: '添加时间',
      width: 175,
      dataIndex: 'createTime',
      render: (text) =>   text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }],
    operations: record => {
      const { remitUserId, isAvailable } = record;
      const operationList = [{
        title: isAvailable ? '暂停' : '启用',
        auth: isAvailable ? [WITHHOLDING_MANAGE_PERSONNEL_DISABLE] : [WITHHOLDING_MANAGE_PERSONNEL_OPEN],
        onClick:  onChangeIsAvailable(remitUserId, isAvailable),
      }];
      return operationList;
    },
  }), [remitDrivers]);
  const onExamine = useCallback(() => {
    Modal.confirm({
      title: '系统提示',
      icon: null,
      width: 1000,
      content: (
        <div>
          <img src="https://production-environmentn-web-hangzhou.oss-cn-hangzhou.aliyuncs.com/business/tax/tax.png" alt="" />
          <div>
            备注：1、销售额15万/月以下免征增值税；2、个体户个人所得税减半征收；3、目前增值税优惠政策税率为1%。
          </div>
        </div>
      ),
      okText: '',
      cancelText: '关闭',
      onOk: () => {

      }
    });
  }, []);
  const TabTitle = useMemo(() => <div style={{ color: '#1890FF', textAlign: 'right', marginBottom: '15px' }}><span onClick={onExamine}>查看纳税税率</span></div>, []);
  return (
    <div className="gps">
      <Table
        rowKey="remitUserId"
        searchList={searchList}
        buttonList={buttonList}
        pagination={pageObj}
        onChange={onChange}
        schema={schema}
        searchObj={searchObj}
        loading={isLoading}
        dataSource={remitDrivers}
        TabTitle={TabTitle}
      />
      {addVisible &&
      <AddPersonnel
        setAddVisible={setAddVisible}
        addVisible={addVisible}
        getList={getData}
      />}
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getRemitUsersList: (params) => dispatch({ type: 'withholdingManageStore/getRemitUsersList', payload: params  }),
});
export default connect(({ withholdingManageStore, commonStore, loading }) => ({
  loading,
  ...withholdingManageStore,
  ...commonStore,
}), mapDispatchToProps)(PersonnelManage);
