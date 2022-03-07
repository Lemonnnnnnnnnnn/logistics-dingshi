import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, message } from 'antd';
import moment from 'moment';
import ConfirmModal from '../../../components/Common/ConfirmModal';
import Table from '../../../components/Table/Table';
import { getAllUser, updatePlatFormUsers } from '../../../services/apiService';
import { translatePageType, getLocal, isEmpty, encodePassword } from '../../../utils/utils';


const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: { phoneLike: undefined, nickName: undefined, organizationType: undefined, accountType: undefined, organizationName: undefined }
};

const List = ({ projectList, form, serviceLeases, tabs, activeKey }) => {
  // 获取本地是否有初始化数据
  const currentTab = tabs.find(item => item.id === activeKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };
  // 如果有就去本地的如果没有就用自己定义的
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [searchObj, setSearchObj] = useState(localData && !isEmpty(localData.searchObj) ? localData.searchObj : initData.searchObj);
  const [usersObj, setUsersObj] = useState({ items: [], count: 0 });
  const [state, setState] = useState({ showModal: false, current: null, modalType: 1, nickName: '', organizationType: 0 });

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
  const getData =  useCallback(async (params = {}) => {
    const data = {
      limit: params.limit || pageObj.pageSize,
      offset: params.current ? pageObj.pageSize * ( params.current - 1 ) : pageObj.pageSize * ( pageObj.current - 1 ),
      ...searchObj,
      accountType: searchObj.organizationType === 9 ? 2 :searchObj.accountType,
    };
    if (data.organizationType === 9) {
      delete data.organizationType;
    }
    const { items, count } = await getAllUser({ ...data });
    setUsersObj({ items, count });
  }, [pageObj, searchObj, translatePageType, setPageObj]);
  const searchList = useMemo(() => ([{
    label: '注册手机号',
    key: 'phoneLike',
    value: searchObj.phoneLike,
    placeholder: '请输入注册手机号',
    type: 'input',
  }, {
    label: '昵称',
    key: 'nickName',
    placeholder: "请输入昵称",
    value: searchObj.nickName,
    type: 'input',
  }, {
    label: '公司名称',
    placeholder: "请输入公司名称",
    key: 'organizationName',
    value: searchObj.organizationName,
    type: 'input',
  }, {
    label: '端口',
    placeholder: '请选择端口',
    key: 'organizationType',
    type: 'select',
    value: searchObj.organizationType,
    showSearch: true,
    options:  [
      { key: 1, value: 1, label: '平台' },
      { key: 3, value: 3, label: '货权方' },
      { key: 4, value: 4, label: '托运商' },
      { key: 5, value: 5, label: '承运商' },
      { key: 9, value: 9, label: '司机' },
      { key: 8, value: 8, label: '客户' },
    ],
  }, {
    label: '主账号',
    key: 'accountType',
    placeholder: '请选择主账号',
    type: 'select',
    value: searchObj.accountType,
    showSearch: true,
    options: [
      { key: null, value: null, label: '全部' },
      { key: 1, value: 1, label: '主账号' },
      { key: 2, value: 2, label: '司机账号' },
      { key: 3, value: 3, label: '机构下普通账户' },
    ],
  }]), [projectList, searchObj]);

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
    }];
    return btnList;
  }, []);

  const renderOrganizationType = (status, accountType) => {
    if (accountType === 2) {
      return  '司机';
    }
    switch (status) {
      case 1:
        return '平台';
      case 3:
        return '货权方';
      case 4:
        return '托运商';
      case 5:
        return '承运商';
      case 7:
        return '客户';
      default:
    }
  };

  const renderAccountType = (status) => {
    switch (status) {
      case 1:
        return '主账号';
      case 2:
        return '司机账号';
      case 3:
        return '机构下普通账户';
      default:
        return '-';
    }
  };
  const schema  = useMemo(() => ({
    columns: [{
      title: '注册手机号',
      dataIndex: 'phone',
      width: 60,
    }, {
      title: '登录用户名',
      dataIndex: 'userName',
      width: 100,
      render: (text) =>  text || '-',
    }, {
      title: '昵称',
      dataIndex: 'nickName',
      width: 100,
    }, {
      title: '所属公司全称',
      dataIndex: 'organizationNameOrg',
      render: (text) =>  text || '-',
    }, {
      title: '账号类型',
      dataIndex: 'accountType',
      render: (text) =>   text ? renderAccountType(text) : '-',
    }, {
      title: '端口',
      dataIndex: 'organizationType',
      render: (text, row) =>  renderOrganizationType(text, row.accountType),
    }, {
      title: '状态',
      dataIndex: 'isAvailable',
      render: (text) =>   text ? '启用' : '禁用',
    },  {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 175,
      render: (text) =>   text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }],
    operations: record => {
      const { userId, nickName, organizationType, accountType } = record;
      const operationList = [{
        title: '修改信息',
        onClick: () =>  setState({ showModal: true, current: userId, modalType:  1, nickName, organizationType }),
      },
      {
        title: '修改密码',
        onClick: () =>  setState({ showModal: true, current: userId, modalType: 0, nickName, organizationType }),
      }, accountType !== 1 && {
        title: '删除',
        onClick: (_, __, state, page) =>  ConfirmModal(`删除${nickName},  此操作不可逆！`, onDelete(userId, state, page))(),
      }
      ];
      return operationList;
    },
  }), [serviceLeases]);
  const onDelete = (userId, state, data) => () => {
    updatePlatFormUsers(userId, { isEffect: true }).then(res => {
      message.success('删除成功！');
      setPageObj({ current: state.current || 1, pageSize: state.limit || state.pageSize });
      setSearchObj({ ...data });
    });
  };
  const onOk = () => {
    form.validateFields((err, values) => {
      if (err) {
        return message.error('请把信息填写完整！');
      }
      updatePlatFormUsers(state.current, { ...values, password: state.modalType ? undefined : encodePassword(values.password) }).then(res => {
        message.success('修改成功！');
        getData();
        setState({ showModal: false });
      });
    });
  };
  const checkPasswordSecurity = (password) => {
    let level = 0;
    if (password.trim() === '' || password.trim().length < 8 || password.trim().length > 16) {
      return level > 1;
    }
    // 密码中是否有数字
    if (/[0-9]/.test(password)) {
      level++;
    }
    // 判断密码中有没有小写字母
    if (/[a-z]/.test(password)) {
      level++;
    }
    // 判断密码中有没有大写字母
    if (/[A-Z]/.test(password)) {
      level++;
    }
    // 判断密码中有没有特殊符号
    if (/[^0-9a-zA-Z]/.test(password)) {
      level++;
    }
    return level > 1;
  };

  return (
    <div className="gps">
      <Table
        rowKey="userId"
        searchList={searchList}
        buttonList={buttonList}
        pagination={pageObj}
        onChange={onChange}
        schema={schema}
        searchObj={searchObj}
        dataSource={usersObj}
      />
      <Modal
        title={`修改${state.modalType ? '信息': '密码'}`}
        centered
        visible={state.showModal}
        onOk={onOk}
        onCancel={() => {
          setState({ showModal: false });
          form.setFieldsValue({ password: '' });
        }}
        width={500}
        okText="确定"
      >
        <div style={{ display: 'flex' }}><span style={{ width: '88px', fontWeight: '700', textAlign: 'right', color: 'rgba(0, 0, 0, 0.85)', marginRight: '8px' }}>登录用户名:</span> <span>{state && state.nickName}</span></div>
        <Form>
          {
            state.modalType ? (
              <Form.Item label="注册手机号" style={{ display: 'flex' }}>
                {form.getFieldDecorator(`phone`, {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: "请输入手机号！",
                    validator: (rule, value, callback) => {
                      const phone = /^1\d{10}$/;
                      if (!phone.test(value)) {
                        callback('手机号格式错误') ;
                      }
                      callback();
                    },
                  }],
                })(<Input placeholder="请输入手机号" />)}
              </Form.Item>
            ) : (
              <Form.Item label="请输入新密码" style={{ display: 'flex' }}>
                {form.getFieldDecorator(`password`, {
                  rules: [{
                    required: true,
                    whitespace: true,
                    validator: (rule, value, callback) => {
                      if (state.organizationType === 6) {
                        if (value.trim() === '' || value.trim().length < 6 || value.trim().length > 16) {
                          callback('密码长度为6-16位');
                        }
                      } else {
                        const check = checkPasswordSecurity(value);
                        if (!check) {
                          callback('6-16位，数字、大小写字母、字符至少包含两种');
                        }
                      }
                      callback();
                    },
                    message: "请输入新密码！"
                  }],
                })(<Input.Password placeholder="请输入新密码" />)}
                {/* */}
              </Form.Item>
            )
          }
        </Form>
        {!state.modalType && <p style={{ color: 'red' }}>{state.organizationType === 6  ? '提示：密码长度为6-16位' : '提示：密码长度为8-16位，数字、大小写字母、字符至少包含两种'}</p>}
      </Modal>
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
}), mapDispatchToProps)(Form.create()(List));
