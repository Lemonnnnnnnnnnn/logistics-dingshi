import React, { useCallback, useEffect, useMemo, useState } from "react";
import { connect } from 'dva';
import moment from "moment";
import router from 'umi/router';
import { Button } from 'antd';
import Table from "../../components/Table/Table";
import { SUPPLIER_MANAGE_CREATE, SUPPLIER_MANAGE_MODIFY } from '../../constants/authCodes';
import Authorized from '../../utils/Authorized';
import { getLocal, isEmpty } from "../../utils/utils";
import { getUserInfo } from '../../services/user';

const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: {}
};

const SupplierManage = ({ loading, organizationSupplier, getOrganizationSupplier, tabs, activeKey }) =>{
  const currentTab = tabs.find(item => item.id === activeKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };
  // 如果有就去本地的如果没有就用自己定义的
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [searchObj, setSearchObj] = useState(localData && !isEmpty(localData.searchObj) ? localData.searchObj : initData.searchObj);
  const { organizationType } = getUserInfo();
  const isLoading = loading.effects['supplierManageStore/getOrganizationSupplier'];

  useEffect(()=>{
    getData();
    return () => {
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      localStorage.removeItem(currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(currentTab.id, JSON.stringify({ searchObj, pageObj }));
      }
    };
  }, [pageObj, searchObj]);

  const getData = useCallback((params = {})=>{
    getOrganizationSupplier({
      ...searchObj,
      ...params,
      limit : pageObj.pageSize,
      offset : pageObj.pageSize * (pageObj.current - 1)
    });
  }, [pageObj, searchObj]);

  const searchList = useMemo(() => ([{
    label: '供应商简称',
    key: 'abbreviationName',
    type: 'input',
    value: searchObj.abbreviationName,
  }, {
    label: '供应商全称',
    key: 'organizationName',
    value: searchObj.organizationName,
    type: 'input',
  }, {
    label: '状态',
    key: 'isAvailable',
    value: searchObj.isAvailable,
    type: 'select',
    options : [
      {
        label : '启用',
        key : 1,
        value : true,
      },
      {
        label : '禁用',
        key : 2,
        value : false,
      }
    ]
  }]), [ searchObj]);

  const onChange = (pagination) => {
    const { current, pageSize } = pagination;
    setPageObj({ current, pageSize });
  };

  const schema  = useMemo(() => ({
    minWidth: 2200,
    variable:true,
    columns: [{
      title: '供应商简称',
      dataIndex: 'abbreviationName',
      width: 60,
    }, {
      title: '供应商全称',
      dataIndex: 'organizationName',
      width: 100,
    }, {
      title: '地址',
      dataIndex: 'organizationAddress',
      width: 100,
    }, {
      title: '联系人',
      dataIndex: 'contactName',
      visible : organizationType !== 4,
      render: (text) =>  text || '-',
    },
    {
      title: '营业执照编号',
      dataIndex: 'creditCode',
      visible : organizationType === 4,
      render: (text) =>  text || '-',
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      visible : organizationType !== 4,
      width: 175,
    }, {
      title: '状态',
      dataIndex: 'isAvailable',
      render : (text)=> text ? '启用' : '禁用'
    }, {
      title: '创建人',
      dataIndex: 'createUserName'
    }, {
      title: '创建时间',
      width: 175,
      dataIndex: 'createTime',
      render: (text) =>  moment(text).format('YYYY-MM-DD HH:mm:ss'),
    }, {
      title: '最近修改人',
      dataIndex: 'updateUserName'
    }, {
      title: '最近修改时间',
      width: 175,
      dataIndex: 'updateTime',
      render: (text) =>  moment(text).format('YYYY-MM-DD HH:mm:ss'),
    }
    ],
    operations: organizationType === 1 && (record => ([{
      title: '修改',
      auth: [SUPPLIER_MANAGE_MODIFY],
      onClick: () => modifySupplier(record.organizationId),
    }])),
  }), []);

  const modifySupplier = (organizationId) =>{
    router.push(`supplierManage/addSupplier?organizationId=${organizationId}&pageKey=${organizationId}`, { organizationType });
  };

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
    params: searchList.map(item => item.key)
  }], []);



  const addSupplier = ()=>{
    router.push(`supplierManage/addSupplier`, { organizationType });
  };

  return  (
    <>
      <Authorized authority={[SUPPLIER_MANAGE_CREATE]}>
        <Button className='mb-1' type='primary' onClick={addSupplier}>+添加供应商</Button>
      </Authorized>
      <Table
        rowKey="organizationId"
        searchList={searchList}
        buttonList={buttonList}
        pagination={pageObj}
        onChange={onChange}
        schema={schema}
        loading={isLoading}
        searchObj={searchObj}
        dataSource={organizationSupplier}
      />
    </>
  );
};

const mapDispatchToProps = (dispatch) => ({
  getOrganizationSupplier: (params) => dispatch({ type: 'supplierManageStore/getOrganizationSupplier', payload: params }),
});

export default connect(({ loading, supplierManageStore, commonStore }) =>({
  loading,
  ...commonStore,
  ...supplierManageStore
}), mapDispatchToProps)(SupplierManage);
