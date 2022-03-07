import React, { Component } from 'react';
import { connect } from 'dva';
import { Icon, Modal, message, Input, Button } from 'antd';
import { Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import router from 'umi/router';
import DebounceFormButton from '../../components/DebounceFormButton';
import Table from '../../components/Table/Table';
import { translatePageType, pick, encodePassword, routerToExportPage, getLocal } from "../../utils/utils";
import {
  getLogisticsVirtualAccount,
  detailCustomerBalance,
  exportVirtualAccountExcel,
} from "../../services/apiService";
import SearchForm from '../../components/Table/SearchForm2';
import TableContainer from '../../components/Table/TableContainer';


function mapStateToProps (state) {
  return {
    commonStore: state.commonStore,
  };
}

@connect(mapStateToProps )
@TableContainer()
class CustomerBalance extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state = {
    ready: false,
    data: {
      items: [],
      count: 0
    },
    pageSize: 10,
    nowPage: 1,
    passwordModal: false,
    password: ''
  }

  stash = []

  searchSchema = {
    accountType: {
      label: '客户类型',
      component: 'select',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return { };
        }
      }),
      placeholder: '请选择客户类型',
      options: [{
        label: '托运',
        value: 1,
        key: 1
      }, {
        label: '承运',
        value: 2,
        key: 2
      }, {
        label: '司机',
        value: 3,
        key: 3
      }]
    },
    phone: {
      label: '手机号',
      placeholder: '请填写手机号',
      component: 'input'
    },
    accountName: {
      label: '客户名称',
      placeholder: '请输入客户名称',
      component: 'input'
    },
    virtualAccountNo: {
      label: '客户平台账号',
      placeholder: '请输入客户平台账号',
      component: 'input'
    },
    balanceSpan : {
      label : '客户余额',
      placeholder : '请选择客户余额',
      component : 'select',
      options : [
        {
          label :'大于0',
          key : 1,
          value : 1,
        },
        {
          label :'0-10000元',
          key : 2,
          value : 2,
        },
        {
          label :'10000元以上',
          key : 3,
          value : 3,
        },
      ]
    }
  }

  constructor (props) {
    super(props);
    const nowDate = moment().format('YYYY/MM/DD HH:mm');
    this.tableSchema = {
      variable: true,
      minWidth: 1500,
      columns: [
        {
          title: '日期',
          dataIndex: 'nowDate',
          render: () => nowDate
        },
        {
          title: '客户类型',
          dataIndex: 'accountType',
          render: (text, record) => {
            const config = {
              1: '托运方',
              2: '承运方',
              3: '司机'
            };
            return (
              <>
                {config[text]}
                {
                  record?.phone && record?.phone?.indexOf('*') !== -1 ?
                    <Icon
                      onClick={this.showModal(record.virtualAccountId)}
                      title='点击可查看全部信息'
                      style={{ cursor: 'pointer', fontSize: '16px', marginLeft: '6px', color: 'rgb(179,179,179)' }}
                      type="lock"
                    />
                    :
                    null
                }
              </>
            )
              ||
              '数据异常';
          }
        },
        {
          title: '手机号',
          dataIndex: 'phone',
          render: text => text
        },
        {
          title: '客户名称',
          dataIndex: 'accountName'
        },
        {
          title: '客户平台账号',
          dataIndex: 'virtualAccountNo'
        },
        {
          title: '客户余额',
          dataIndex: 'virtualAccountBalance',
          render: (text) => (text || 0).toFixed(2)._toFixed(2)
        }
      ],
      operations: [{
        title: '详情',
        onClick: record => {
          let paramsStr = '';
          if (record.accountType === 3) {
            paramsStr = `driverUserId=${record.userId}`;
          } else {
            paramsStr = `organizationId=${record.organizationId}`;
          }
          router.push(`customerBalance/detail?${paramsStr}&accountType=${record.accountType}&accountName=${record.accountName || '--'}&nickName=${record.nickName || '--'}&virtualAccountNo=${record.virtualAccountNo || '--'}&bankAccount=${record.bankAccount || '未绑定银行卡'}&virtualAccountBalance=${record.virtualAccountBalance}`);
        },
      }]
    };
  }

  componentDidMount () {
    this.timer = setInterval(() => {
      const { stash } = this;
      if (stash.length === 0) return;
      stash.forEach((stashInfo, currentIndex) => {
        if (stashInfo.endTime <= Date.parse(new Date())) {
          const { data } = this.state;
          const index = data.items.findIndex(item => item.virtualAccountId === stashInfo.virtualAccountId);
          data.items.splice(index, 1, stashInfo);
          this.setState({
            data
          });
          this.stash.splice(currentIndex, 1);
        }
      });
    }, 1000);
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    const maxValue = 1e15;
    switch (params.balanceSpan){
      case 1 : {
        params.startBalance = 0;
        params.endBalance = maxValue;
        break;
      }
      case 2 : {
        params.startBalance = 0;
        params.endBalance = 1e4;
        break;
      }
      case 3 : {
        params.startBalance = 1e4;
        params.endBalance = maxValue;
        break;
      }
      default : { break; }
    }
    this.props.setFilter({ ...params });
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
    });
    getLogisticsVirtualAccount({ limit: 10, offset: 0, ...params})
      .then((data) => {
        this.setState({
          ready: true,
          data
        });
      });
  }

  componentWillUnmount () {
    clearInterval(this.timer);
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.setItem(this.currentTab.id, JSON.stringify({
      formData: { ...formData },
      pageSize: this.state.pageSize,
      nowPage: this.state.nowPage,
    }));
  }

  showModal = (virtualAccountId) => () => {
    this.virtualAccountId = virtualAccountId;
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
    const { virtualAccountId } = this;
    const { data: { items } } = this.state;
    const stashInfo = items.find(item => item.virtualAccountId === virtualAccountId);
    detailCustomerBalance({
      virtualAccountId,
      password: encodePassword(password.trim())
    })
      .then((res) => {
        if (!res) return message.error('密码错误');
        this.closePasswordModal();
        const { data } = this.state;
        const index = data.items.findIndex(item => item.virtualAccountId === virtualAccountId);
        data.items.splice(index, 1, res);
        this.setState({
          data
        });
        stashInfo.endTime = Date.parse(new Date()) + 180000;
        this.stash.push(stashInfo);
      });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    getLogisticsVirtualAccount({ ...newFilter })
      .then((data) => {
        this.setState({
          data
        });
      });
  }



  searchTable = () => {
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
      <>
        <SearchForm layout="inline" {...layout} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
          <Item field="accountType" />
          <Item field="accountName" />
          <Item field="virtualAccountNo" />
          <Item field="phone" />
          <Item field='balanceSpan' />
          <DebounceFormButton type="primary" label="查询" onClick={this.handleSearchBtnClick} />
          <Button style={{ marginLeft: '10px' }} onClick={this.handleResetBtnClick}>重置</Button>
          <DebounceFormButton type="primary" style={{ marginLeft: '10px' }} onClick={this.handleExportExcelBtnClick}>导出EXCEL</DebounceFormButton>

          {/* <DebounceFormButton style={{ float:'right' }} label="历史余额" onClick={this.toFundRecord} /> */}
        </SearchForm>
      </>
    );
  }

  handleSearchBtnClick = value => {
    const { accountName, accountType, virtualAccountNo, balanceSpan } = value;
    this.setState({
      nowPage: 1
    });
    let startBalance;
    let endBalance;
    const maxValue = 1e15;
    switch (balanceSpan){
      case 1 : {
        startBalance = 0;
        endBalance = maxValue;
        break;
      }
      case 2 : {
        startBalance = 0;
        endBalance = 1e4;
        break;
      }
      case 3 : {
        startBalance = 1e4;
        endBalance = maxValue;
        break;
      }
      default : { break; }
    }
    const newFilter = this.props.setFilter({ accountName, accountType, virtualAccountNo, startBalance, endBalance, offset: 0 });
    getLogisticsVirtualAccount({ ...newFilter })
      .then((data) => {
        this.setState({
          data
        });
      });
  }

  handleExportExcelBtnClick = (value)=>{
    const { accountName, accountType, virtualAccountNo, balanceSpan } = value;
    this.setState({
      nowPage: 1
    });
    let startBalance;
    let endBalance;
    const maxValue = 1e15;
    switch (balanceSpan){
      case 1 : {
        startBalance = 0;
        endBalance = maxValue;
        break;
      }
      case 2 : {
        startBalance = 0;
        endBalance = 1e4;
        break;
      }
      case 3 : {
        startBalance = 1e4;
        endBalance = maxValue;
        break;
      }
      default : { break; }
    }
    const params = { accountName, accountType, virtualAccountNo, startBalance, endBalance };
    routerToExportPage(exportVirtualAccountExcel, params);
  }

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({});
    this.setState({
      nowPage: 1,
      pageSize: 10
    });
    getLogisticsVirtualAccount({ ...newFilter })
      .then((data) => {
        this.setState({
          data
        });
      });
  }

  toFundRecord = () => {
    const { filter } = this.props;
    const paramsStr = Object.entries(pick(filter, ['accountType', 'accountName', 'virtualAccountNo']))
      .filter(([key, value]) => value)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    router.push(`customerBalance/fundRecord?${paramsStr}`);
  }

  render () {
    const { ready, data, nowPage, pageSize, passwordModal, password } = this.state;
    return (
      ready &&
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
          rowKey="virtualAccountId"
          dataSource={data}
          schema={this.tableSchema}
          pagination={{ current:nowPage, pageSize }}
          onChange={this.onChange}
          renderCommonOperate={this.searchTable}
        />
      </>
    );
  }
}

export default CustomerBalance;
