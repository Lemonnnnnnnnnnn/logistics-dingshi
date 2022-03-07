import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Input, Icon, Modal, message, Checkbox } from 'antd';
import { getPasswordCheck } from '@/services/deviceManageService';
import Table from '@/components/Table/Table';
import { getLocal, isEmpty, encodePassword } from '@/utils/utils';
import {
  GPS_ACCOUNT_MANAGE_CREATE,
  GPS_ACCOUNT_MANAGE_MODIFY,
} from "@/constants/authCodes";
import styles from './List.less';

const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: { accountName: undefined, providerId: undefined, organizationName: undefined }
};

const List = ({ loading, history, getServiceUsers, serviceUsers, dictionarys, tabs, activeKey, getDictionarys, deviceManageStore, saveServiceUser }) => {
  const currentTab = tabs.find(item => item.id === activeKey);

  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };

  // 如果有就去本地的如果没有就用自己定义的
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [searchObj, setSearchObj] = useState(localData && !isEmpty(localData.searchObj) ? localData.searchObj : initData.searchObj);
  const [state, setState] = useState({ password: '', remember: false });
  const [filterVisible, setFilterVisible] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const isLoading = loading.effects['deviceManageStore/getServiceUsers'];

  useEffect(() => {
    if (!dictionarys.length) {
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
    getServiceUsers({
      limit: params.limit || pageObj.pageSize,
      offset: params.current ? pageObj.pageSize * ( params.current - 1 ) : pageObj.pageSize * ( pageObj.current - 1 ),
      ...searchObj,
    });
  }, [pageObj, searchObj]);
  const searchList = useMemo(() => ([{
    label: '账号名称',
    key: 'accountName',
    placeholder: '请输入账号名称',
    value: searchObj.accountName,
    type: 'input',
  }, {
    label: '账号所属公司',
    placeholder: '请输入账号所属公司',
    key: 'organizationName',
    value: searchObj.carNo,
    type: 'input',
  }, {
    label: '设备厂家',
    key: 'providerId',
    placeholder: '请选择设备厂家',
    type: 'select',
    value: searchObj.providerId,
    showSearch: true,
    options: dictionarys || [],
  }]), [dictionarys, searchObj]);

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
      label: '添加账号',
      key: 'export',
      btnType: "primary",
      authority: [GPS_ACCOUNT_MANAGE_CREATE],
      onClick: () => history.push(`accountManage/add`),
    }];
    return btnList;
  }, []);
  const onChangePassWord = useCallback((row) => () => {
    const time = getLocal('local_expiration') || 0;
    if (row.password) {
      saveServiceUser(deviceManageStore, { serviceUserId: row.serviceUserId, password: '' });
    } else if (moment().valueOf() < time) {
      getPasswordCheck(row.serviceUserId, { password: encodePassword('1233') }).then(res => {
        saveServiceUser(deviceManageStore, { serviceUserId: row.serviceUserId, password: res.password });
        setCurrentId(row.serviceUserId);
      });
    } else {
      setState({ remember: false, password: '' });
      setFilterVisible(true);
      setCurrentId(row.serviceUserId);
    }
  }, [serviceUsers]);
  const onOk = useCallback(() => {
    localStorage.removeItem('local_expiration');
    getPasswordCheck(currentId, { password: encodePassword(state.password.trim()), remember: state.remember }).then(res => {
      if (!res) {
        return message.error('登录密码错误！');
      }
      saveServiceUser(deviceManageStore, { serviceUserId: currentId, password: res.password });
      setFilterVisible(false);
      if (state.remember) {
        localStorage.setItem('local_expiration', moment().add(5, 'minutes').valueOf() - 12000);
      }
    });
  }, [state, serviceUsers]);

  const schema  = useMemo(() => ({
    variable: true,
    minWidth: 2200,
    columns: [{
      title: 'ID',
      dataIndex: 'serviceUserId',
      render: (text) =>  text || '-',
      width: 60,
    }, {
      title: '账号所属公司',
      dataIndex: 'organizationName',
      render: (text) =>  text || '-',
    }, {
      title: '厂家',
      dataIndex: 'providerName',
      render: (text) =>  text || '-',
    }, {
      title: '账号名称',
      dataIndex: 'accountName',
      render: (text) =>  text || '-',
      width: 175,
    }, {
      title: '用户名',
      dataIndex: 'userName',
      render: (text) =>  text || '-',
    }, {
      title: '密码',
      dataIndex: 'password',
      render: (text, row) => (
        <Input
          value={text || '******'}
          className={styles.password}
          suffix={<Icon
            type={text ? "eye" : "eye-invisible"}
            onClick={onChangePassWord(row)}
          />}
        />),
    }, {
      title: '备注',
      dataIndex: 'remark',
      render: (text) =>  text || '-',
    }, {
      title: '状态',
      dataIndex: 'isAvailable',
      render: (text) =>  text ? '启用' : '禁用',
    }, {
      title: '创建人',
      dataIndex: 'createUserName',
      render: (text) =>  text || '-',
    }, {
      title: '创建时间',
      width: 175,
      dataIndex: 'createTime',
      render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }, {
      title: '最近修改人',
      dataIndex: 'updateUserName',
      render: (text) =>  text || '-',
    }, {
      title: '最近修改时间',
      dataIndex: 'updateTime',
      width: 175,
      render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }],
    operations: record => {
      const { serviceUserId } = record;
      const operationList = [{
        title: '修改',
        auth: [GPS_ACCOUNT_MANAGE_MODIFY],
        onClick:  () => history.push(`accountManage/update?pageKey=${serviceUserId}`),
      }];
      return operationList;
    },
  }), [serviceUsers]);
  return (
    <div className="gps">
      <Table
        rowKey="serviceUserId"
        searchList={searchList}
        buttonList={buttonList}
        pagination={pageObj}
        onChange={onChange}
        schema={schema}
        loading={isLoading}
        dataSource={serviceUsers}
      />
      <Modal
        title="系统提示"
        centered
        visible={filterVisible}
        onOk={onOk}
        onCancel={() => setFilterVisible(false)}
        width={600}
        okText="确定"
      >
        <div className={styles.modalConfirm}>
          <span>登录密码：</span>
          <Input type="password" placeholder="输入系统密码" value={state.password} onChange={(e) => setState({ ...state, password: e.target.value })} />
        </div>
        <div className={styles.modalConfirm}>
          <Checkbox onChange={() => setState({ ...state, remember: !state.remember })} value={state.remember}>密码五分钟内有效</Checkbox>
        </div>
      </Modal>
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getServiceUsers: (params) => dispatch({ type: 'deviceManageStore/getServiceUsers', payload: params  }),
  getDictionarys: () => dispatch({ type: 'deviceManageStore/getDictionarys' }),
  saveServiceUser: (store, payload) => dispatch({ type: 'deviceManageStore/saveServiceUser', store, payload }),
});

export default connect(({ deviceManageStore, commonStore, loading }) => ({
  loading,
  deviceManageStore,
  ...deviceManageStore,
  ...commonStore,
}), mapDispatchToProps)(List);
