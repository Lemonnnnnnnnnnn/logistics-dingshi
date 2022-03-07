import React, { Component } from 'react';
import { Modal, notification, Button } from 'antd';
import { SchemaForm, Item, FormCard, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import router from 'umi/router';
import { connect } from 'dva';
import BindStore from '@/utils/BindStore';
import { getUserInfo } from '@/services/user';
import { isArray, getLocal } from '@/utils/utils';
import organizationType from '@/constants/organization/organizationType';
import AuthList from './components/AuthList';
import '@gem-mine/antd-schema-form/lib/fields';

const { PLATFORM, OPERATOR, CARGOES, OWNER, SHIPMENT, SUPPLIER, CUSTOMER } = organizationType;

const transformAuth = (selectedAuth, authList) => {
  // 为每个auth添加父级code和id
  selectedAuth = selectedAuth.reduce((list, item) => {
    const parentCode = item.permissionCode.substr(0, item.permissionCode.length - 2);
    const parentAuth = authList.find(item => item.permissionCode === parentCode);
    if (parentAuth){
      return [
        ...list,
        {
          ...item,
          parentCode,
          parentId: parentAuth.permissionId
        }
      ];
    }
    return list;
  }, []);

  const result = selectedAuth.reduce((result, auth) => {
    const authInResult = result.find(item => item.permissionCode === auth.parentCode);
    if (!authInResult) {
      const moduleCode = auth.parentCode.substr(0, auth.parentCode.length - 2);
      const rootAuth = result.find(item => item.permissionCode === moduleCode);

      if (!rootAuth) {
        // 添加祖先auth
        const moduleAuth = authList.find(item => item.permissionCode === moduleCode);
        result.push({
          permissionCode: moduleAuth.permissionCode,
          permissionId: moduleAuth.permissionId,
          buttonRelation: ''
        });
      }

      // 添加父级auth
      result.push({
        permissionCode: auth.parentCode,
        permissionId: auth.parentId,
        buttonRelation: [auth.permissionCode]
      });
    } else {
      authInResult.buttonRelation.push(auth.permissionCode);
    }
    return result;
  }, []);
  result.forEach(item => isArray(item.buttonRelation) && (item.buttonRelation = item.buttonRelation.join(',')));
  return result;
};

const { confirm } = Modal;
const formLayout = {
  labelCol: {
    span: 24
  },
  wrapperCol: {
    span: 24
  }
};
@connect(state => ({
  authList: state.auth.auth,
  commonStore: state.commonStore,
}), dispatch => ({
  saveRoleAuth: params => dispatch({ type: 'auth/saveRoleAuth', payload: params }),
  getAllAuth: params => dispatch({ type: 'auth/getAllAuth', payload: params }),
  deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload })
}))
@BindStore('roles')
export default class AddRole extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  handleCancelBtnClick = () => {
    confirm({
      title: '提示',
      content: this.mode===FORM_MODE.ADD?'确认放弃添加角色吗？':'确认放弃修改角色吗？',
      okText: '确定',
      cancelText: '取消',
      onCancel: () => { },
      onOk: () => {
        router.replace('/user-manage/role-manage');
        this.props.deleteTab(this.props.commonStore, { id: this.currentTab.id });
      }
    });
  };

  handleSaveBtnClick = value => this.addOrModifyRole(value);

  schema = {
    roleName:{
      label: '角色名称',
      component: Observer({
        watch: '*mode',
        action: mode => (
          mode === FORM_MODE.ADD ? 'input' : 'input.text'
        )
      }),
      placeholder: '请输入角色名称',
      rules: {
        required: [true, '请输入角色名称']
      },
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return { };
        }
      }),
    },
    isAvailable: {
      label: '是否启用',
      component: 'radio',
      defaultValue: true,
      options: [{
        key: 'true',
        label: '是',
        value: true
      }, {
        key: 'false',
        label: '否',
        value: false
      }],
      rules:{
        required: [true, '请选择是否启用']
      }
    },
    remarks:{
      label: '备注（可选）',
      component: 'input.textArea',
      maxLength: 200,
      placeholder: '请输入备注'
    },
    auth:{
      component: AuthList,
      rules: {
        required:[true, '请勾选权限']
      }
    }
  }

  componentDidMount () {
    this.props.getAllAuth();
    this.mode = this.getMode();
    if (this.mode !== FORM_MODE.ADD) {
      const { location: { query: { roleId } }, detailRoles, getPermissions } = this.props;
      detailRoles({ rolesId: roleId })
        .then(() => {
          getPermissions(roleId);
        });
    }
  }

  componentDidUpdate(p) {
    const { commonStore,  location: { query: { roleId } }, detailRoles, getPermissions } = this.props;
    if ('roleId' in this.props.location.query && p.location.query.roleId !== roleId) {
      this.currentTab = commonStore.tabs.find(item => item.id === commonStore.activeKey);
      this.localData = getLocal(this.currentTab.id) || { formData: {} };
      detailRoles({ rolesId: roleId })
        .then(() => {
          getPermissions(roleId);
        });
    }
  }

  componentWillReceiveProps(p) {
    if (p.commonStore.activeKey !== this.props.commonStore.activeKey){ // 相同路由参数不同的时候存一次本地
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      const formData = this.form ? this.form.getFieldsValue() : null;
      localStorage.removeItem(this.currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(this.currentTab.id, JSON.stringify({
          formData,
        }));
      }
    }
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
      }));
    }
  }

  addOrModifyRole = (value) => {
    const { location: { query: { roleId } }, authList, postRoles, patchRoles, saveRoleAuth, deleteTab, commonStore } = this.props;
    const { isAvailable, remarks, roleName } = value;
    const { organizationType } = getUserInfo();
    const roleMethod = this.mode === FORM_MODE.ADD ? postRoles : patchRoles;
    const baseRoleId = {
      [PLATFORM]: '10001',
      [OPERATOR]: '10006',
      [CARGOES]: '10005',
      [OWNER]: '10002',
      [SHIPMENT]: '10003',
      [SUPPLIER]: '10007',
      [CUSTOMER]: '10008'
    }[organizationType];
    roleMethod({
      roleId,
      isAvailable,
      remarks,
      roleName,
      baseRoleId
    })
      .then(({ roleId }) => {
        const buttonPermissionCodeLength = 6;
        const buttonAuths = value.auth.filter(item => item.permissionCode.length === buttonPermissionCodeLength);
        saveRoleAuth({
          roleId,
          permissionItems: transformAuth(buttonAuths, authList)
        });
      })
      .then(() => {
        notification.success({
          message: '操作成功',
          description: this.mode === FORM_MODE.ADD ? '添加角色成功' : '修改角色成功'
        });
        router.replace('/user-manage/role-manage');
        deleteTab(commonStore, { id: this.currentTab.id });
      });
  }

  getMode = () => {
    const { location: { query: { roleId } } } = this.props;

    if (!roleId) return FORM_MODE.ADD;

    return FORM_MODE.MODIFY;
  }

  render () {
    const { entity } = this.props;
    const { mode } = this;
    const _entity = mode === FORM_MODE.MODIFY ? entity : {};
    const data = Object.assign(_entity,  this.localData && this.localData.formData || {});
    return (
      <SchemaForm
        data={data}
        schema={this.schema}
        layout="vertical"
        mode={mode}
        {...formLayout}
      >
        <FormCard title="角色信息" colCount="3">
          <Item field="roleName" />
          <Item field='isAvailable' />
          <Item field='remarks' />
        </FormCard>
        <FormCard title="权限设置" colCount="1">
          <Item field="auth" />
        </FormCard>
        <div style={{ textAlign:'right', paddingRight:'20px' }}>
          <Button className="mr-10" onClick={this.handleCancelBtnClick}>取消</Button>
          <DebounceFormButton label="保存" type="primary" onClick={this.handleSaveBtnClick} />
        </div>
      </SchemaForm>
    );
  }
}
