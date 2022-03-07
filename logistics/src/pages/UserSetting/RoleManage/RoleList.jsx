import React, { Component } from 'react';
import { Button, Modal } from 'antd';
import { connect } from 'dva';
import { Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import moment from 'moment';
import DebounceFormButton from '@/components/DebounceFormButton';
import Table from '@/components/Table/Table';
import BindStore from '@/utils/BindStore';
import { translatePageType, getLocal } from '@/utils/utils';
import TableContainer from '@/components/Table/TableContainer';
import SearchForm from '@/components/Table/SearchForm2';
import '@gem-mine/antd-schema-form/lib/fields';

const { confirm } = Modal;
function mapStateToProps (state) {
  return {
    commonStore: state.commonStore,
  };
}
@connect(mapStateToProps)
@BindStore('roles')
@TableContainer()
export default class RoleList extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  tableSchema = {
    columns: [
      {
        title: '状态',
        dataIndex: 'isAvailable',
        width: 100,
        render: isAvailable => {
          const { color, text } = isAvailable ? { color: 'green', text: '启用' } : { color: 'gray', text: '禁用' };
          return <span style={{ color }}>● {text}</span>;
        }
      },
      {
        title: '角色名称',
        dataIndex: 'roleName',
        width: 200
      },
      {
        title: '备注',
        // width:300,
        dataIndex: 'remarks'
      },
      {
        title: '创建时间',
        width: 200,
        dataIndex: 'createTime',
        render: time => moment(time).format('YYYY.MM.DD HH:mm')
      },
    ],
    operations: (record) => {
      const modify = {
        title: '修改',
        onClick: this.modifyRole
      };
      const enable = {
        title: '启用',
        onClick: this.enableRole
      };
      const disable = {
        title: '禁用',
        onClick: this.disableRole
      };

      // todo 根据状态显示【启用】|【禁用】
      return [modify, record.isAvailable ? disable : enable];
    }
  }

  constructor (props) {
    super(props);

    this.state = {
      current: 1,
      pageSize: 10
    };
  }

  componentDidMount () {
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      offset: localData.current ? localData.pageSize * ( localData.current - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    this.setState({
      current: localData.current || 1,
      pageSize: localData.pageSize || 10,
    });
    this.props.setFilter(params);
    this.getRoles({ ...params });
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        pageSize: this.state.pageSize,
        current: this.state.current,
      }));
    }
  }

  getRoles = (params = {}) => {
    this.props.getRoles(params);
  }

  addRole = () => router.push('role-manage/add')

  modifyRole = ({ roleId }) => router.push(`role-manage/modify?pageKey=${roleId}&roleId=${roleId}`)

  enableRole = ({ roleId }) => {
    const { patchRoles } = this.props;

    patchRoles({
      roleId,
      isAvailable: true
    });
  }

  disableRole = ({ roleId }) => {
    const { patchRoles } = this.props;

    patchRoles({
      roleId,
      isAvailable: false
    });
  }

  onChangeList = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.getRoles({ ...newFilter });
  }

  searchSchema = {
    roleName: {
      label: '角色名称',
      placeholder: '请输入角色名称',
      component: 'input',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return { };
        }
      }),
    }
  }

  searchTable = ({ pageSize }) => {
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        xl: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        xl: { span: 18 }
      }
    };
    return (
      <SearchForm layout="inline" {...layout} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
        <Item field='roleName' />
        <DebounceFormButton type="primary" onClick={(value) => { this.handleSearchBtnClick(value, pageSize); }} />
      </SearchForm>
    );
  }

  handleSearchBtnClick = (value, pageSize) => {
    const newFilter = this.props.setFilter({ ...value, limit: pageSize, offset: 0 });
    this.setState({
      current: 1,
      pageSize,
    });
    this.getRoles({ ...newFilter });
  }

  render () {
    const { items = [], count = 0 } = this.props;
    const { current, pageSize } = this.state;
    return (
      <>
        <Button type='primary' onClick={this.addRole}>+ 添加角色</Button>
        <Table
          rowKey="roleId"
          dataSource={{ items, count }}
          schema={this.tableSchema}
          onChange={this.onChangeList}
          pagination={{ current, pageSize }}
          renderCommonOperate={this.searchTable}
        />
      </>
    );
  }
}
