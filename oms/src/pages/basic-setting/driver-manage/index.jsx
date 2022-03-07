import React, { Component } from 'react';
import { Modal, Button, notification, Icon, Input, message } from 'antd';
import { Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import { connect } from 'dva';
import DebounceFormButton from '../../../components/debounce-form-button';
import { getDriverStatus, AUDIT_STATUS, PERFECT_STATUS } from '../../../constants/driver/driver';
import Table from '../../../components/table/table';
import { deleteDriverFromShipment } from '../../../services/apiService';
import SearchForm from '../../../components/table/search-form2';
import TableContainer from '../../../components/table/table-container';
import { pick, translatePageType, encodePassword, getLocal } from '../../../utils/utils';

const { confirm } = Modal;

function mapStateToProps (state) {
  const { dictionaries : { items }, drivers  } = state;
  const licenseType = items.filter(item=>item.dictionaryType === 'license_type');
  return {
    driverItems: pick(drivers, ['items', 'count']),
    commonStore: state.commonStore,
    licenseType
  };
}

function mapDispatchToProps (dispatch) {
  return ({
    getDrivers: (params) => dispatch({
      type: 'drivers/getDrivers',
      payload: params
    }),
    dispatch
  });
}

@connect(mapStateToProps, mapDispatchToProps)
@TableContainer({ selectType: 2, shield: true })
export default class DriverManagement extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  tableSchema = {
    columns: [
      {
        title: '状态',
        dataIndex: 'auditStatus',
        render: (text, record) => {
          const styleObj = getDriverStatus(record.auditStatus, record.perfectStatus);
          return <span style={{ color: styleObj.color }}>● {styleObj.text}</span>;
        }
      },
      {
        title: '司机姓名',
        dataIndex: 'nickName',
        render: (text, record) => {
          if (!text) return '--';
          let isVisible = true;
          if (text.indexOf('*') !== -1) isVisible = false;
          if (isVisible) return text;
          return (
            <>
              {text}
              <Icon
                onClick={this.showModal(record.userId)}
                title='点击可查看全部信息'
                style={{ cursor: 'pointer', fontSize: '16px', marginLeft: '6px', color: 'rgb(179,179,179)' }}
                type="lock"
              />
            </>
          );
        }
      },
      {
        title: '联系电话',
        dataIndex: 'phone'
      },
      {
        title: '身份证号',
        dataIndex: 'idcardNo'
      },
      {
        title: '驾驶证类型',
        dataIndex: 'licenseType',
        // filters: DRIVER_LICENSE_TYPE,
        // filterMultiple: false, // 是否多选 默认多选
        // onFilter: (value, record) => record.licenseType === value,
        render: (text) => {
          if (!text) return '--';
          const { licenseType } = this.props;

          const showText = licenseType.find(v => v.dictionaryCode === String(text));
          return showText?.dictionaryName;
        }
      },
      {
        title: '收款银行卡',
        dataIndex: 'bankAccountItems',
        render: (text) => {
          if (!text) return '--';
          const activeCard = text.find(item => item.isAvailable && item.isEffect === 1);
          if (!activeCard) return '--';
          return `${activeCard.bankName}${activeCard.bankAccount}`;
        }
      },
      {
        title: '实名认证',
        dataIndex: 'auditStatus',
        key: 'userId',
        render: (text) => {
          switch (text) {
            case AUDIT_STATUS.SUCCESS:
              return (
                <div style={{ paddingLeft: '15px' }}>
                  <Icon style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }} type="check-circle" theme="filled" />
                </div>
              );
            case AUDIT_STATUS.FAILED:
              return (
                <div style={{ paddingLeft: '15px' }}>
                  <Icon style={{ fontSize: '20px', color: 'rgb(216, 30, 6)' }} type="close-circle" theme="filled" />
                </div>
              );
            default: return (
              <div style={{ paddingLeft: '15px' }}>
                <Icon style={{ fontSize: '20px' }} type="check-circle" theme="filled" />
              </div>
            );
          }
        }
      },
      {
        title: '资格认证',
        dataIndex: 'perfectStatus',
        render: (text) => {
          switch (text) {
            case PERFECT_STATUS.SUCCESS:
              return (
                <div style={{ paddingLeft: '15px' }}>
                  <Icon style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }} type="check-circle" theme="filled" />
                </div>
              );
            case PERFECT_STATUS.FAILED:
              return (
                <div style={{ paddingLeft: '15px' }}>
                  <Icon style={{ fontSize: '20px', color: 'rgb(216, 30, 6)' }} type="close-circle" theme="filled" />
                </div>
              );
            default: return (
              <div style={{ paddingLeft: '15px' }}>
                <Icon style={{ fontSize: '20px' }} type="check-circle" theme="filled" />
              </div>
            );
          }
        }
      }
    ],
    operations: (record) => {
      const detail = {
        title: '详情',
        onClick: record => {
          this.handleJumpDriver(FORM_MODE.DETAIL, record.userId);
        },
      };
      const edit = {
        title: '修改',
        onClick: record => {
          this.handleJumpDriver(FORM_MODE.MODIFY, record.userId);
        },
      };
      const del = {
        title: '删除',
        onClick: record => {
          // TODO 删除
          confirm({
            title: '删除提示',
            content: `是否删除当前司机-${record.nickName}`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
              this.handleDetele(record);
            },
            onCancel: () => { }
          });
        }
      };
      const { auditStatus, perfectStatus } = record;
      if (!auditStatus) return [detail, edit, del];
      if (auditStatus === 0) return [detail];
      if (auditStatus === 1 && perfectStatus === 1) return [detail, del];
      if (auditStatus === 1 && perfectStatus === 2) return [detail, edit, del];
      if (auditStatus === 1 && perfectStatus === 3) return [detail];
      if (auditStatus === 1 && perfectStatus === 0) return [detail, edit, del];
      return [];
    }
  }

  state = {
    nowPage:1,
    pageSize:10,
    ready: false
  }

  stash = []

  componentDidMount () {
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      vagueSelect: localData.formData.searchKey || undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    const newFilter = this.props.setFilter({ ...params });
    this.props.getDrivers({
      ...newFilter,
      selectType: 2,
      shield: true
    }).then(() => {
      this.setState({
        nowPage: localData.nowPage || 1,
        pageSize: localData.pageSize || 10,
        ready: true
      });
    });
    this.timer = setInterval(() => {
      const { stash } = this;
      if (stash.length === 0) return;
      const { dispatch } = this.props;
      stash.forEach((stashDriver, index) => {
        if (stashDriver.endTime <= Date.parse(new Date())) {
          dispatch({
            type: 'drivers/recover',
            payload: stashDriver
          });
          this.stash.splice(index, 1);
        }
      });
    }, 1000);
  }

  componentWillUnmount () {
    clearInterval(this.timer);
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabs').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        pageSize: this.state.pageSize,
        nowPage: this.state.nowPage,
      }));
    }
  }

  handleJumpDriver = (type = FORM_MODE.ADD, userId) => {
    let url = '';
    switch (type) {
      case FORM_MODE.MODIFY:
        url = `/basic-setting/driverManagement/editDriver?userId=${userId}`;
        break;
      case FORM_MODE.DETAIL:
        url = `/basic-setting/driverManagement/detailDriver?userId=${userId}&mode=detail`;
        break;
      default:
        url = '/basic-setting/driverManagement/addDriver';
    }
    router.push(url);
  }

  handleDetele = data => {
    deleteDriverFromShipment({ orgDriverId: data.orgDriverId })
      .then(() => {
        notification.success({
          message: '删除成功！',
          description: `删除司机${data.nickName}成功!`
        });
        this.props.getDrivers(this.props.filter);
      });
  }

  showModal = (userId) => () => {
    this.userId= userId;
    this.setState({
      passwordModal: true
    });
  }

  searchSchema = {
    status:{
      label: '状态',
      component: 'select',
      placeholder: '请选择状态',
      options:[{
        label:'已实名',
        value: 1,
        key:1
      }, {
        label:'审核中',
        value: 2,
        key:2
      }, {
        label:'已认证',
        value: 3,
        key:3
      }, {
        label:'认证失败',
        value: 4,
        key:4
      }]
    },
    searchKey: {
      label: '搜索',
      placeholder: '请输入司机姓名/电话',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return { };
        }
      }),
      component: 'input'
    }
  }

  searchTable = () => {
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
      <>
        <Button type='primary' onClick={this.handleJumpDriver}>+ 添加司机</Button>
        <SearchForm layout="inline" {...layout} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
          <Item field="status" />
          <Item field="searchKey" />
          <DebounceFormButton type="primary" label="查询" onClick={this.getDrivers} />
        </SearchForm>
      </>
    );
  }

  getDrivers = value => {
    this.stash = [];
    this.setState({
      nowPage:1
    });
    let filter = {};
    if (value.status === 1) filter = { auditStatus: 1, perfectStatus: 2 };
    if (value.status === 2) filter = { auditStatus: 1, perfectStatus: 3 };
    if (value.status === 3) filter = { perfectStatus: 1 };
    if (value.status === 4) filter = { perfectStatus: 0 };
    this.props.getDrivers({ ...this.props.filter, ...filter, offset:0, vagueSelect:value.searchKey });
  }

  onChange = (pagination, filters) => {
    const { offset, limit, current } = translatePageType(pagination);
    const { licenseType, auditStatus } = filters;
    this.stash = [];
    this.setState({
      nowPage:current,
      pageSize:limit
    });
    const newFilter=this.props.setFilter({ offset, limit, licenseType, auditStatus });
    this.props.getDrivers({ ...newFilter });
  }

  closePasswordModal = () => {
    this.setState({
      passwordModal: false,
      password: undefined
    });
  }

  setPassword = e => {
    const password = e.target.value;
    this.setState({
      password
    });
  }

  detailInfo = async () => {
    const { password } = this.state;
    if (!password.trim()) {
      return message.error('请输入密码');
    }
    const { userId } = this;
    const { driverItems, dispatch } = this.props;
    const stashUser = driverItems.items.find(item => item.userId === userId);
    dispatch({
      type: 'drivers/displace',
      payload: {
        userId,
        password: encodePassword(password.trim())
      }
    })
      .then((res) => {
        if (!res) return message.error('密码错误');
        this.closePasswordModal();
        stashUser.endTime = Date.parse(new Date()) + 180000;
        this.stash.push(stashUser);
      });
  }

  render () {
    const { driverItems } = this.props;
    const { nowPage, pageSize, ready, passwordModal, password } = this.state;
    return (
      ready
      &&
      <>
        <Modal
          title='查看详情'
          width={800}
          maskClosable={false}
          destroyOnClose
          visible={passwordModal}
          onCancel={this.closePasswordModal}
          onOk={this.detailInfo}
        >
          <p style={{ display: 'block', width: '100%', textAlign: 'center', 'fontSize': '14px', color: '#999', margin: '30px auto' }}>严格遵守公司信息网络管理及<a href='/userAgreement'>《用户使用协议》</a>，不得将公司信息网络他人个人信息以任何形式向外界泄露</p>
          <div
            style={{ display: 'block', width: '50%', textAlign: 'center', margin: '40px auto 40px' }}
          >
            <Input type='password' placeholder='请输入您的登录密码' autoComplete='new-password' onChange={this.setPassword} value={password} />
          </div>
        </Modal>
        <Table
          rowKey="userId"
          dataSource={driverItems || {}}
          pagination={{ current:nowPage, pageSize }}
          schema={this.tableSchema}
          onChange={this.onChange}
          renderCommonOperate={this.searchTable}
        />
      </>
    );
  }
}
