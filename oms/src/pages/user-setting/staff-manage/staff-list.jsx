import React from 'react';
import { Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import { notification, Modal, Button } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import DebounceFormButton from '../../../components/debounce-form-button';
import BindStore from '../../../utils/BindStore';
import Table from '../../../components/table/table';
import { translatePageType, getLocal } from '../../../utils/utils';
import TableContainer from '../../../components/table/table-container';
import StaffManage from './staff-manage';
import { saveUserRoles } from '../../../services/apiService';
import auth from '../../../constants/authCodes';
import SearchForm from '../../../components/table/search-form2';
import '@gem-mine/antd-schema-form/lib/fields';

const { USER_SETTING_FORBID, USER_SETTING_ENABLE, USER_SETTING_MODIFY } = auth;
function mapStateToProps (state) {
  return {
    commonStore: state.commonStore,
  };
}
@connect(mapStateToProps)
@BindStore('normalUser', {
  mapStateToProps: state => {
    const { entity, items, count } = state;
    entity.roleItems || (entity.roleItems = []);
    return {
      entity,
      items,
      count
    };
  }
})
@TableContainer()
export default class StaffList extends React.Component {
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
      }, {
        title: '账号',
        dataIndex: 'phone',
        width: 100
      }, {
        title: '姓名',
        dataIndex: 'nickName'
      },
      // {
      //   title: '角色名称',
      //   dataIndex: 'nickName'
      // },
      // {
      //   title: '备注',
      //   dataIndex: 'remarks'
      // },
      {
        title: '创建时间',
        width: 200,
        dataIndex: 'createTime',
        render: time => moment(time).format('YYYY-MM-DD HH:mm:ss')
      },
    ],
    operations: (record) => {
      const modify = {
        title: '修改',
        auth:[USER_SETTING_MODIFY],
        onClick: this.openModifyStaffModal
      };
      const enable = {
        title: '启用',
        auth:[USER_SETTING_ENABLE],
        onClick: this.enableStaff
      };
      const disable = {
        title: '禁用',
        auth:[USER_SETTING_FORBID],
        onClick: this.disableStaff
      };

      // todo 根据状态显示【启用】|【禁用】
      return [modify, record.isAvailable ? disable : enable];
    }
  }

  constructor (props) {
    super(props);

    this.state = {
      current: 1,
      pageSize: 10,
      showStaffModal: false,
      modifyStaffId: undefined // 正在修改的用户
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
    this.getStaff({ ...params });
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabs').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        pageSize: this.state.pageSize,
        current: this.state.current,
      }));
    }
  }

  enableOrDisableStaff = (userId, isAvailable) => {
    this.props.patchUsers({ userId, isAvailable })
      .then(() => {
        notification.success({ message: '操作成功', description: isAvailable ? '启用成功' : '禁用成功' });
      });
  }

  enableStaff = ({ userId }) => this.enableOrDisableStaff(userId, true)

  disableStaff = ({ userId }) => this.enableOrDisableStaff(userId, false)

  getStaff = (params = {}) => {
    const newFilter = this.props.setFilter(params);
    this.props.getUsers(newFilter);
  }

  getStaffDetail = staffId => this.props.detailUsers({ usersId: staffId })

  openStaffModal = () => this.setState({ showStaffModal: true })

  openAddStaffModal = () => this.props.setDetail({}).then(() => {
    this.setState({
      modifyStaffId:undefined
    });
    this.openStaffModal();
  })

  openModifyStaffModal = ({ userId }) => this.getStaffDetail(userId).then(() => {
    this.setState({
      modifyStaffId:userId
    });
    this.openStaffModal();
  })

  closeModal = () => this.setState({ showStaffModal: false })

  onChangeList = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.getStaff({ ...newFilter });
  }

  onAddOrModifyStaff = (value) => {
    const { entity, postUsers, patchUsers } = this.props;
    const staff = { ...entity, ...value, portraitDentryid:'用户_KEY_1562742522570.png' };
    const submitMethod = staff.userId ? patchUsers : postUsers;
    submitMethod(staff)
      .then(({ userId }) => saveUserRoles({ userId, roleItems: staff.roleItems }))
      .then(() => {
        this.closeModal();
        notification.success({ message: '操作提示', description: staff.userId ? '修改成功' : '添加成功' });
        !staff.userId && this.getStaff(this.props.filter);
      });
  }

  searchSchema = {
    vagueSelect: {
      label: '搜索',
      placeholder: '请输入账号/姓名',
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
        <Item field='vagueSelect' />
        <DebounceFormButton label="查询" type="primary" onClick={(value) => this.handleSearchBtnClick(value, pageSize)} />
      </SearchForm>
    );
  }

  handleSearchBtnClick = (value, pageSize) => {
    const newFilter = this.props.setFilter({ ...value, limit: pageSize, offset: 0 });
    this.setState({
      current: 1,
      pageSize,
    });
    this.getStaff({ ...newFilter });
  }

  renderStaffModal = () => {
    const { showStaffModal, modifyStaffId } = this.state;
    const { entity } = this.props;
    const modalTitle = modifyStaffId ? '修改职员' : '添加职员';
    return (
      <Modal
        title={modalTitle}
        maskClosable={false}
        destroyOnClose
        onCancel={this.closeModal}
        visible={showStaffModal}
        footer={null}
      >
        <StaffManage staff={entity} mode={modifyStaffId? 'modify': 'add'} onCancel={this.closeModal} onOk={this.onAddOrModifyStaff} />
      </Modal>
    );
  }

  render () {
    const { current, pageSize } = this.state;
    const { items = [], count = 0 } = this.props;
    return (
      <>
        {this.renderStaffModal()}
        <Button type='primary' onClick={this.openAddStaffModal}>+ 添加用户</Button>
        <Table
          rowKey="userId"
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
