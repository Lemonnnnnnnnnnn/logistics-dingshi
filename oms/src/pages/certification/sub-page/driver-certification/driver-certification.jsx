import React from 'react';
import { Item, FORM_MODE } from '@gem-mine/antd-schema-form';
import { Icon, Modal, Input, message } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import DebounceFormButton from '../../../../components/debounce-form-button';
import Table from '../../../../components/table/table';
import { AUDIT_STATUS, getDriverStatus, PERFECT_STATUS } from '../../../../constants/driver/driver';
import SearchForm from '../../../../components/table/search-form2';
import TableContainer from '../../../../components/table/table-container';
import { getUserInfo } from '../../../../services/user';
import { translatePageType, encodePassword } from '../../../../utils/utils';
import '@gem-mine/antd-schema-form/lib/fields';

function mapStateToProps (state) {
  const { dictionaries : { items } } = state;
  const licenseType = items.filter(item=>item.dictionaryType === 'license_type');
  return {
    items: state.drivers.items,
    count: state.drivers.count,
    licenseType
  };
}

function mapDispatchToProps (dispatch) {
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

  stash = []

  state = {
    passwordModal: false
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

  constructor (props) {
    super(props);

    this.tableSchema = {
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
          render (type) {
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
          title : '修改',
          onClick: ({ userId }) => {
            router.push(`driver/modify?userId=${userId}`);
          }
        };
        const { auditStatus, perfectStatus, isAvailable } = record;
        if (!auditStatus) return [detail];  // 审核认证失败 ： 详情 （未实名）
        if (auditStatus === 0) return [detail];  // 审核认证失败 ： 详情 （未实名）
        if (!auditStatus && !perfectStatus) return [detail]; // 审核认证失败，完善认证失败 ： 详情 （未实名）
        if (auditStatus === 1 && perfectStatus === 1) return [detail, isAvailable? ban: enable, modify]; // 审核已认证，完善认证成功 ：详情、启用/禁用 （已认证）
        if (auditStatus === 1 && perfectStatus === 2) return [detail, modify]; // 审核已认证，完善认证未填写： 详情                    （已实名）
        if (auditStatus === 1 && perfectStatus === 3) return [detail, certificate, modify]; // 审核已认证： 完善认证已填写 : 详情、审核 （审核中）
        if (auditStatus === 1 && perfectStatus === 0) return [detail, isAvailable? ban: enable, modify];  // 审核已认证， 完善认证失败 ： 详情，启用、禁用  （认证失败）
        return [{
          title: '异常状态',
          onClick: ({ userId }) => {
          }
        }];
      }
    };

    this.state = {
      current: 1
    };
  }

  componentDidMount () {
    this.getDriver();
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

    if (newFilter.status === 0) newFilter = { ...newFilter, queryNotReal : true };
    if (newFilter.status === 1) newFilter = { ...newFilter, auditStatus: 1, perfectStatus: 2 };
    if (newFilter.status === 2) newFilter = { ...newFilter, auditStatus: 1, perfectStatus: 3 };
    if (newFilter.status === 3) newFilter = { ...newFilter, perfectStatus: 1 };
    if (newFilter.status === 4) newFilter = { ...newFilter, perfectStatus: 0 };

    this.getDriver(newFilter);
    this.setState({ current });
  }

  searchSchema = {
    status:{
      label: '状态',
      component: 'select',
      allowClear: true,
      placeholder: '请选择状态',
      options:[{
        label:'未实名',
        value: 0,
        key: 0
      }, {
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
    vagueSelect: {
      label: '搜索',
      placeholder: '请输入姓名或电话或身份证号',
      component: 'input'
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
        <Item field='status' />
        <Item field='vagueSelect' />
        <DebounceFormButton label="查询" type="primary" className="mr-10" onClick={(value)=>this.handleSearchBtnClick(value, pageSize)} />
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

  componentWillUnmount () {
    clearInterval(this.timer);
  }

  render () {
    const { items = [], count = 0 } = this.props;
    const { current, passwordModal, password } = this.state;

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
          pagination={{ current }}
          dataSource={{ items, count }}
          schema={this.tableSchema}
          onChange={this.onChange}
          renderCommonOperate={this.searchTable}
        />
      </>
    );
  }
}
