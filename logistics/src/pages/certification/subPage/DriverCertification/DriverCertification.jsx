import React from 'react';
import { Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import { Icon, Modal, Input, message, Button, Row } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import moment from 'moment';
import DebounceFormButton from '@/components/DebounceFormButton';
import Table from '@/components/Table/Table';
import { AUDIT_STATUS, getDriverStatus, PERFECT_STATUS } from '@/constants/driver/driver';
import SearchForm from '@/components/Table/SearchForm2';
import TableContainer from '@/components/Table/TableContainer';
import { getUserInfo } from '@/services/user';
import { translatePageType, encodePassword, routerToExportPage, getLocal, isEmpty } from '@/utils/utils';
import '@gem-mine/antd-schema-form/lib/fields';
import { exportDriversExcel } from '@/services/apiService';

function mapStateToProps(state) {
  const { dictionaries: { items } } = state;
  const licenseType = items.filter(item => item.dictionaryType === 'license_type');
  return {
    items: state.drivers.items,
    count: state.drivers.count,
    commonStore: state.commonStore,
    licenseType
  };
}

function mapDispatchToProps(dispatch) {
  return ({
    getDrivers: (params) => dispatch({
      type: 'drivers/getDrivers',
      payload: params
    }),
    patchDrivers: (params) => dispatch({
      type: 'drivers/patchDrivers',
      payload: params
    }),
    dispatch
  });
}

@connect(mapStateToProps, mapDispatchToProps)
@TableContainer({ shield: true })
export default class DriverCertification extends React.Component {
  organizationType = getUserInfo().organizationType

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  stash = []

  state = {
    passwordModal: false,
  }

  showModal = (userId) => () => {
    this.userId = userId;
    this.setState({
      passwordModal: true
    });
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
    const { items, dispatch } = this.props;
    const stashUser = items.find(item => item.userId === userId);
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
        stashUser.endTime = Date.parse(new Date()) + 3000;
        this.stash.push(stashUser);
      });
  }

  constructor(props) {
    super(props);

    this.tableSchema = {
      variable: true,
      minWidth:2200,
      columns: [
        {
          title: '状态',
          dataIndex: 'auditStatus',
          render: (text, record) => {
            const styleObj = getDriverStatus(record.auditStatus, record.perfectStatus, this.organizationType);
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
          render(type) {
            const { licenseType } = props;
            const record = licenseType.find(item => item.dictionaryCode === String(type));

            return record ? record.dictionaryName : '未知';
          }
        },
        {
          title: '收款银行卡',
          dataIndex: 'bankAccountItems',
          render: (text, record) => {
            if (!text || !text[0]) return '--';
            const activeCard = text.find(item => item.isAvailable && item.isEffect === 1);
            if (!activeCard) return '--';
            return `${activeCard.bankName}${activeCard.bankAccount}`;
          }
        },
        {
          title: '驾驶证有效期',
          dataIndex: 'licenseValidityDate',
          render: (text, record) => {
            const { licenseValidityType } = record;
            if (Number(licenseValidityType) === 2) return '长期';
            return (text ? moment(text).format('YYYY-MM-DD') : '--');
          }
        },
        {
          title: '是否过期',
          dataIndex: Math.random(),
          render: (text, record) => {
            const { licenseValidityDate, licenseValidityType } = record;
            if (Number(licenseValidityType) === 2) return <span style={{ color: '#25C8C8' }}>未过期</span>;
            if (!licenseValidityDate) return '--';
            return moment(licenseValidityDate).diff(moment()) < 0
              ? <span style={{ color: "red" }}>已过期</span>
              : <span style={{ color: '#25C8C8' }}>未过期</span>;
          }
        },
        {
          title: '资格证有效期',
          dataIndex: 'qualificationValidityDate',
          render: (text, record) => (text ? moment(text).format('YYYY-MM-DD') : '--')
        },
        {
          title: '是否过期',
          dataIndex: Math.random(),
          render: (text, record) => {
            const { qualificationValidityDate } = record;
            if (!qualificationValidityDate) return '--';
            return moment(qualificationValidityDate).diff(moment()) < 0
              ? <span style={{ color: "red" }}>已过期</span>
              : <span style={{ color: '#25C8C8' }}>未过期</span>;
          }
        },

        {
          title: '实名认证',
          dataIndex: 'auditStatus',
          key: 'userId',
          render: (text, record) => {
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
          render: (text, record) => {
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
        const enable = {
          title: '启用',
          onClick: this.toggleDriverAvailable
        };
        const ban = {
          title: '禁用',
          onClick: this.toggleDriverAvailable
        };
        const certificate = {
          title: '审核',
          onClick: ({ userId }) => {
            router.push(`driver/certificate?userId=${userId}`);
          }
        };
        const detail = {
          title: '详情',
          onClick: ({ userId }) => {
            router.push(`driver/detail?userId=${userId}`);
          }
        };
        const modify = {
          title: '修改',
          onClick: ({ userId }) => {
            const { auditStatus, perfectStatus } = record;
            /*
          * auditStatus === 1 && perfectStatus === 1  已认证
          * auditStatus === 1 && perfectStatus === 3  审核中
          * 这两种状态下可以修改详细信息
          * */

            const certified = auditStatus === 1 && perfectStatus === 1;
            const auditing = auditStatus === 1 && perfectStatus === 3;
            const editDetailPermission = certified || auditing;
            if (editDetailPermission) {
              router.push(`driver/edit?userId=${userId}`);
            } else {
              router.push(`driver/modifyBankCard?userId=${userId}`);
            }
          }
        };
        const { auditStatus, perfectStatus, isAvailable } = record;
        if (!auditStatus) return [detail];  // 审核认证失败 ： 详情 （未实名）
        if (auditStatus === 0) return [detail];  // 审核认证失败 ： 详情 （未实名）
        if (!auditStatus && !perfectStatus) return [detail]; // 审核认证失败，完善认证失败 ： 详情 （未实名）
        if (auditStatus === 1 && perfectStatus === 1) return [detail, isAvailable ? ban : enable, modify]; // 审核已认证，完善认证成功 ：详情、启用/禁用 （已认证）
        if (auditStatus === 1 && perfectStatus === 2) return [detail, modify]; // 审核已认证，完善认证未填写： 详情                    （已实名）
        if (auditStatus === 1 && perfectStatus === 3) return [detail, certificate, modify]; // 审核已认证： 完善认证已填写 : 详情、审核 （审核中）
        if (auditStatus === 1 && perfectStatus === 0) return [detail, isAvailable ? ban : enable, modify];  // 审核已认证， 完善认证失败 ： 详情，启用、禁用  （认证失败）
        return [{
          title: '异常状态',
        }];
      }
    };

    this.state = {
      current: 1,
      pageSize: 10,
      selectedRow: []
    };
  }

  componentDidMount() {
    const { localData = { formData: {} }, props: { setFilter } } = this;
    let filter = {};

    if(!isEmpty(localData.formData)) {
      if (localData.formData.status === 0) filter = { queryNotReal: true };  // 未实名
      if (localData.formData.status === 1) filter = { auditStatus: 1, perfectStatus: 2 }; // 已实名
      if (localData.formData.status === 2) filter = { auditStatus: 1, perfectStatus: 3 };  // 审核中
      if (localData.formData.status === 3) filter = { perfectStatus: 1 }; // 已认证
      if (localData.formData.status === 4) filter = { perfectStatus: 0 }; // 认证失败
    }
    const params = {
      ...localData.formData,
      offset: localData.nowPage ? localData.pageSize * (localData.nowPage - 1) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
      ...filter,
    };
    setFilter({ ...localData.formData });
    this.setState({
      current: this.localData.nowPage || 1,
      pageSize: this.localData.pageSize || 10
    });
    console.log(this.localData, "this.localData")
    this.getDriver(params);
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
  getDriver = (params = { limit: 10, offset: 0 }) => {
    this.props.getDrivers({ ...params, selectType: 1, shield: true });
  }

  toggleDriverAvailable = driver => this.props.patchDrivers({
    userId: driver.userId,
    isAvailable: !driver.isAvailable,
    accountType: 2 // 司机
  })

  handleDetele = ({ userId }) => this.props.patchDrivers({ userId, isEffect: 0 })

  onChange = (pagination, filters) => {
    const { limit, offset, current } = translatePageType(pagination);
    const auditStatus = filters.auditStatus ? filters.auditStatus[0] : undefined;
    let newFilter = this.props.setFilter({ offset, limit, auditStatus });

    if (newFilter.status === 0) newFilter = { ...newFilter, queryNotReal: true };
    if (newFilter.status === 1) newFilter = { ...newFilter, auditStatus: 1, perfectStatus: 2 };
    if (newFilter.status === 2) newFilter = { ...newFilter, auditStatus: 1, perfectStatus: 3 };
    if (newFilter.status === 3) newFilter = { ...newFilter, perfectStatus: 1 };
    if (newFilter.status === 4) newFilter = { ...newFilter, perfectStatus: 0 };

    this.getDriver(newFilter);
    this.setState({ current, pageSize: limit });
  }

  searchSchema = {
    status: {
      label: '状态',
      component: 'select',
      allowClear: true,
      placeholder: '请选择状态',
      options: [{
        label: '未实名',
        value: 0,
        key: 0
      }, {
        label: '已实名',
        value: 1,
        key: 1
      }, {
        label: '审核中',
        value: 2,
        key: 2
      }, {
        label: '已认证',
        value: 3,
        key: 3
      }, {
        label: '认证失败',
        value: 4,
        key: 4
      }]
    },
    vagueSelect: {
      label: '搜索',
      placeholder: '请输入姓名或电话或身份证号',
      component: 'input'
    },
    projectName: {
      label: '银行卡关联项目',
      placeholder: '请输入银行卡关联项目',
      component: 'input',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return {};
        }
      }),
    },
    licenseValidityIsAvailable: {
      label: '驾驶证是否过期',
      placeholder: '请选择驾驶证过期状态',
      component: 'select',
      options: [
        {
          label: '未过期',
          key: 0,
          value: 0
        },
        {
          label: '已过期',
          key: 1,
          value: 1
        },
      ]
    },
    qualificationValidityIsAvailable: {
      label: '资格证是否过期',
      placeholder: '请选择资格证过期状态',
      component: 'select',
      options: [
        {
          label: '未过期',
          key: 0,
          value: 0
        },
        {
          label: '已过期',
          key: 1,
          value: 1
        },
      ]
    },
  }

  handleOutputExcelBtnClick = () => {
    const { filter } = this.props;
    const { selectedRow } = this.state;
    const driverUserIdList = selectedRow.map(driver => driver.userId);
    const params = { ...filter, fileName: '司机导出', limit: 10000, offset: 0, driverUserIdList };

    routerToExportPage(exportDriversExcel, params);
  }

  searchTable = ({ pageSize }) => {
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
        xl: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
        xl: { span: 16 }
      }
    };
    return (
      <SearchForm layout="inline" {...layout} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
        <Item field='status' />
        <Item field='vagueSelect' />
        <Item field='projectName' />
        <Item field='licenseValidityIsAvailable' />
        <Item field='qualificationValidityIsAvailable' />
        <Row type='flex' justify='end'>
          <DebounceFormButton label="查询" type="primary" className="mr-10" onClick={(value) => this.handleSearchBtnClick(value, pageSize)} />
          <Button style={{ marginLeft: '10px' }} onClick={this.handleResetBtnClick}>重置</Button>
          <Button type="primary" style={{ marginLeft: '10px' }} onClick={this.handleOutputExcelBtnClick}>导出excel</Button>
        </Row>

      </SearchForm>
    );
  }

  handleSearchBtnClick = (value, pageSize) => {
    let filter = {};
    if (value.status === 0) filter = { queryNotReal: true };  // 未实名
    if (value.status === 1) filter = { auditStatus: 1, perfectStatus: 2 }; // 已实名
    if (value.status === 2) filter = { auditStatus: 1, perfectStatus: 3 };  // 审核中
    if (value.status === 3) filter = { perfectStatus: 1 }; // 已认证
    if (value.status === 4) filter = { perfectStatus: 0 }; // 认证失败
    const params = { ...value, limit: pageSize, offset: 0, ...filter };
    this.props.setFilter({ ...value, limit: pageSize, offset: 0 });

    this.getDriver(params);
    this.setState({
      current: 1
    });
  }

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({});
    this.setState({
      current: 1,
      pageSize: 10
    });
    this.getDriver(newFilter);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        pageSize: this.state.pageSize,
        nowPage: this.state.current,
      }));
    }
  }

  onSelectRow = (selectedRow) => {
    this.setState({
      selectedRow,
    });
  }

  render() {
    const { items = [], count = 0 } = this.props;
    const { current, passwordModal, password, pageSize } = this.state;

    return (
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
          pagination={{ current, pageSize }}
          multipleSelect
          onSelectRow={this.onSelectRow}
          dataSource={{ items, count }}
          schema={this.tableSchema}
          onChange={this.onChange}
          renderCommonOperate={this.searchTable}
        />
      </>
    );
  }
}
