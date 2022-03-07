import React, { Component } from 'react';
import { Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import { connect } from 'dva';
import DebounceFormButton from '../../components/DebounceFormButton';
import model from '../../models/bankFlowings';
import auth from '../../constants/authCodes';
import Authorized from '../../utils/Authorized';
import { translatePageType, pick, routerToExportPage, getLocal } from '../../utils/utils';
import Table from '../../components/Table/Table';
import SearchForm from '../../components/Table/SearchForm2';
import {  sendBankFlowingsExcelPost } from "../../services/apiService";
import TableContainer from '../../components/Table/TableContainer';
import { getUserInfo } from '../../services/user';

const { actions } = model;

const {
  FUNDS_BUSINESS_DEALINGS_EXPORT_DETAIL
} = auth;

function mapStateToProps (state) {
  return {
    commonStore: state.commonStore,
    bankFlowing: pick(state.bankFlowing, ['items', 'count']),
  };
}

@connect(mapStateToProps, actions )
@TableContainer()
class BankFlowings extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  tableSchema = {
    variable:true,
    minWidth:2000,
    columns: [
      {
        title: '交易状态',
        dataIndex: 'transactionStatus',
        width:120,
        fixed:'left',
        render: (text) => {
          const config = {
            1:{ word:'正常', color:'green' },
            2:{ word:'异常', color:'red' },
            3:{ word:'退款', color:'orange' },
          }[text] || { word:'异常', color:'red' };
          return <div style={{ color:config.color }}>{config.word}</div>;
        }
      },
      {
        title : '交易渠道',
        dataIndex: 'bankFlowingChannel',
        render : text => (
          <>
            {text === 1&& <div>中信银行</div>}
            {text === 2&& <div>微信</div>}
          </>)
      },
      {
        title: '交易时间',
        dataIndex: 'transactionTime',
        render: (text) => moment(text).format('YYYY/MM/DD HH:mm')
      }, {
        title: '交易流水号',
        dataIndex: 'transactionNo',
      }, {
        title: '交易类型',
        dataIndex: 'creditDebiFlag',
        render: (text) => ({
          1:'支出',
          2:'收入',
        }[text] || 'bug')
      }, {
        title: '交易金额',
        dataIndex: 'transactionAmount',
        render: (text, record) => `${record.creditDebiFlag === 1? '-':'+'}${(text || 0)._toFixed(2)}`
      }, {
        title: '账户余额',
        dataIndex: 'accountBalance',
        render: text => text? text._toFixed(2) : '--'
      }, {
        title: '对方账户名',
        dataIndex: 'oppositeAccountName',
      }, {
        title: '对方账号',
        dataIndex: 'oppositeAccountNo',
      }, {
        title: '对方开户行',
        dataIndex: 'oppositeOpenBankName',
      }, {
        title: '交易账户名',
        dataIndex: 'bankName',
      }, {
        title: '交易账号',
        dataIndex: 'bankAccount',
      }, {
        title: '备注',
        dataIndex: 'payRemarks',
      }, {
        title :'客户付款单号',
        dataIndex: 'orderNo'
      }
    ]
  }

  searchSchema = {
    createTime: {
      label: '交易时间',
      format: {
        input: (value) => {
          if (Array.isArray(value)) {
            return value.map(item => moment(item));
          }
          return value;
        },
        output: (value) => value
      },
      component: 'rangePicker'
    },
    transactionNo: {
      label: '银行流水号',
      placeholder: '请填写银行流水号',
      component: 'input'
    },
    transactionStatus: {
      label: '交易状态',
      placeholder: '请选择交易状态',
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
      options: [{
        label: '正常',
        value: 1,
        key: 1,
      }, {
        label: '异常',
        value: 2,
        key: 2,
      }, {
        label: '退款',
        value: 3,
        key: 3,
      }]
    },
    oppositeAccountName: {
      label: '对方账户名',
      placeholder: '请填写对方账户名',
      component: 'input'
    },
    oppositeAccountNo: {
      label: '对方账号',
      placeholder: '请填写对方账号',
      component: 'input'
    },
    bankName: {
      label: '交易账户名',
      placeholder: '请选择交易账户名',
      component: 'select',
      options: [{
        label: '中信银行-支付账户',
        value: '中信银行-支付账户',
        key: 1,
      }, {
        label: '中信银行-收款账户',
        value: '中信银行-收款账户',
        key: 2,
      }, {
        label: '中信银行-收入账户',
        value: '中信银行-收入账户',
        key: 3,
      }]
    },
    bankAccount: {
      label: '交易账号',
      placeholder: '请填写交易账号',
      component: 'input'
    },
    creditDebiFlag : {
      label : '交易类型',
      component : 'select',
      placeholder : '请选择交易类型',
      options : [
        {
          label : '支出',
          value : 1,
          key : 1,
        },
        {
          label : '收入',
          value : 2,
          key : 2,
        },
      ]
    },
    bankFlowingChannel : {
      label : '交易渠道',
      component : 'select',
      placeholder : '请选择交易渠道',
      options : [
        {
          label :'中信银行',
          value : 1,
          key : 1
        },
        {
          label :'微信',
          value : 2,
          key :2
        },
      ]
    },
    orderNo:{
      label :'客户付款单号',
      component :'input',
      placeholder :'请输入客户付款单号'
    }
  }

  constructor (props){
    super(props);
    this.state = {
      pageSize:10,
      nowPage:1,
      ready:false
    };
  }

  componentDidMount (){
    const { getBankFlowing } = this.props;
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      transactionTimeStart: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      transactionTimeEnd: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    this.props.setFilter({ ...params });
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
    });
    getBankFlowing(params)
      .then(()=>{
        this.setState({
          ready:true
        });
      });
  }

  componentWillUnmount() {
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.setItem(this.currentTab.id, JSON.stringify({
      formData: { ...formData },
      pageSize: this.state.pageSize,
      nowPage: this.state.nowPage,
    }));
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage:current,
      pageSize:limit
    });
    const newFilter=this.props.setFilter({ offset, limit });
    this.props.getBankFlowing(newFilter);
  }

  searchTableList = () => {
    const formLayOut = {
      labelCol:{
        xs: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 16 }
      }
    };
    return (
      <SearchForm layout="inline" {...formLayOut} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
        <Item field="transactionStatus" />
        <Item field="transactionNo" />
        <Item field="oppositeAccountName" />
        <Item field="oppositeAccountNo" />
        <Item field="bankName" />
        <Item field="bankAccount" />
        <Item field="createTime" />
        <Item field='creditDebiFlag' />
        <Item field='bankFlowingChannel' />
        <Item field='orderNo' />
        <DebounceFormButton label="查询" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="重置" className="mr-10" onClick={this.handleResetBtnClick} />
        <Authorized authority={[FUNDS_BUSINESS_DEALINGS_EXPORT_DETAIL]}>
          <DebounceFormButton label="导出明细" onClick={this.getExcel} />
        </Authorized>
      </SearchForm>
    );
  }

  getExcel = () => {
    const { filter } = this.props;
    const transactionTimeStart = filter.createTime && filter.createTime.length ? moment(filter.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : '';
    const transactionTimeEnd = filter.createTime && filter.createTime.length ? moment(filter.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : '';
    const options = { transactionTimeStart, transactionTimeEnd, ...this.props.filter, organizationId : getUserInfo().organizationId, limit : 100000 };

    routerToExportPage(sendBankFlowingsExcelPost, options);
  }

  handleSearchBtnClick = value => {
    this.setState({
      nowPage:1
    });
    const transactionTimeStart = value.createTime && value.createTime.length ? moment(value.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const transactionTimeEnd = value.createTime && value.createTime.length ? moment(value.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const newFilter = this.props.setFilter({ ...this.props.filter, transactionTimeStart, transactionTimeEnd, offset: 0 });
    this.props.getBankFlowing(newFilter);
  }

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({});
    this.setState({
      nowPage:1,
      pageSize:10
    });
    this.props.getBankFlowing(newFilter);
  }

  render () {
    const { nowPage, pageSize, ready } = this.state;
    const { bankFlowing } = this.props;
    return (
      ready&&
      <Table schema={this.tableSchema} rowKey="financeBusinessId" renderCommonOperate={this.searchTableList} pagination={{ current:nowPage, pageSize }} onChange={this.onChange} dataSource={bankFlowing} />
    );
  }
}

export default BankFlowings;
