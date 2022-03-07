import React, { Component } from 'react';
import { Row, Col } from 'antd';
import moment from 'moment';
import router from 'umi/router';
import { connect } from 'dva';
import { Item, FormButton, FORM_MODE } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import model from '@/models/financeAccountTransaction';
import Table from '@/components/Table/Table';
import { translatePageType, pick, isNumber, getUrl, routerToExportPage } from '@/utils/utils';
import SearchForm from '@/components/Table/SearchForm2';
import { getUserInfo } from '@/services/user';
import TableContainer from '@/components/Table/TableContainer';
import { sendBankFlowingsExcelPost, sendFinanceAccountsBalanceExcelPost } from "@/services/apiService";
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from '@/constants/project/project';
import style from './style.less';

const config = {
  1:'托运方',
  2:'承运方',
  3:'司机'
};

const { actions } = model;

function mapStateToProps (state) {
  return {
    financeBusiness: pick(state.financeAccountTransaction, ['items', 'count']),
  };
}

@connect(mapStateToProps, actions )
@TableContainer()
class CustomerBalanceDetail extends Component {

  accessToken = getUserInfo().accessToken

  state = {
    pageSize:10,
    nowPage:0
  }

  searchSchema = {
    createTime: {
      label: '交易时间',
      component: 'rangePicker'
    },
    transactionType: {
      label: '交易类型',
      placeholder: '请选择交易类型',
      component: 'select',
      options: ()=>{
        const { location:{ query: { accountType } } } = this.props;
        const options = [{
          label: '充值',
          value: 1,
          key: 1,
        }, {
          label: '支付付款单',
          value: 2,
          key: 2,
        }, {
          label: '服务费',
          value: 3,
          key: 3,
        }, {
          label: '支付司机运单',
          value: 4,
          key: 4,
        }, {
          label: '退款',
          value: 5,
          key: 5,
        }, {
          label: '合伙人提现',
          value: 6,
          key: 6,
        }, {
          label: '平台代充值',
          value: 7,
          key: 7,
        }, {
          label : '代扣税费',
          value : 34,
          key : 34
        },
        {
          label :'承运服务费（价差）',
          value : 37,
          key : 37
        }
        ];
        // 1托运 2承运 3司机
        if (Number(accountType) === 1 || Number(accountType) === 2){
          options.push({ label : '平台手工上账', value : 9, key : 9 });
        }
        if (Number(accountType) === 3){
          options.push({ label : '司机提现(微信)', value : 8, key : 8 });
        }
        return options;
      }
    },
    projectName: {
      label: '项目名称',
      placeholder: '请填写项目名称',
      component: 'input'
    },
    orderNo: {
      label: '付款单号',
      placeholder: '请填写付款单号',
      component: 'input'
    },
  }

  constructor (props) {
    super(props);
    this.tableSchema = {
      variable:true,
      minWidth:2000,
      columns: [
        {
          title: '单据号',
          dataIndex: 'transactionNo',
          width:200,
          fixed:'left'
        }, {
          title: '项目名称',
          dataIndex: 'projectName',
          render: (text, record) => <a onClick={()=> this.toProject(record.projectId)}>{text}</a>
        }, {
          title: '付款单号',
          dataIndex: 'orderNo',
          render: text => text
        }, {
          title: '付款账户',
          dataIndex: 'payerAccount',
          render: (text, record) => `${record.payerName}${text}`
        }, {
          title: '收款账户',
          dataIndex: 'payeeAccount',
          render: (text, record) => `${record.payeeName}${text || ''}`
        }, {
          title: '交易类型',
          dataIndex: 'transactionTypeDes',
          // render: (text, record) => {
          //   const word = TRANSACTION_TYPE[text]
          //   if (word === '充值') {
          //     if (record.transactionStatus === TRANSACTION_STATUS.PENDING) return '充值（未确认）'
          //     if (record.transactionStatus === TRANSACTION_STATUS.SUCCESS) return '充值（已确认）'
          //     if (record.transactionStatus === TRANSACTION_STATUS.OVERTIME) return '充值（已超时）'
          //   }
          //   return word
          // }
        }, {
          title: '交易金额(元)',
          dataIndex: 'transactionAmount',
          render: text => text? text._toFixed(2) : '--'
        }, {
          title: '服务费(元)',
          dataIndex: 'platformService',
          render: text => text? text._toFixed(2) : '--'
        }, {
          title: '余额(元)',
          dataIndex: 'accountBalance',
          render: text => isNumber(text)? text._toFixed(2) : '--'
        }, {
          title: '交易时间',
          dataIndex: 'createTime',
          render:text => moment(text).format('YYYY/MM/DD HH:mm')
        }
      ]
    };
  }

  componentDidMount () {
    const { location:{ query: { driverUserId, organizationId } }, filter, getFinanceAccountTransaction, setDefaultFilter } = this.props;
    setDefaultFilter({ driverUserId, organizationId });
    getFinanceAccountTransaction({ ...filter, driverUserId, organizationId })
      .then(()=>{
        this.setState({
          ready:true
        });
      });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage:current,
      pageSize:limit
    });
    const newFilter=this.props.setFilter({ offset, limit });
    this.props.getFinanceAccountTransaction(newFilter);
  }

  handleExportExcelBtnClick = () => {
    const { filter, location:{ query } } = this.props;
    const urlParams = pick(query, ['driverUserId', 'organizationId']);
    const { createTime, transactionType, projectName, orderNo } = filter;
    const createDateStart = createTime && createTime.length ? createTime[0].set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd = createTime && createTime.length ? createTime[1].set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const params = {
      createDateStart,
      createDateEnd,
      transactionType,
      projectName,
      orderNo,
      bankNo:query.bankAccount,
      ...urlParams,
      accessToken : this.accessToken,
      limit : 10000,
      offset : 0
    };
    routerToExportPage(sendFinanceAccountsBalanceExcelPost, params);
    // sendFinanceAccountsBalanceExcelPost(params).then(()=>routerToExportPage())
    // window.open(getUrl(`${window.envConfig.baseUrl}/v1/financeAccounts/balance/createExcel?accessToken=${this.accessToken}&offset=0&limit=10000`, params))
  }

  searchTable = () => {
    const formLayOut = {
      labelCol:{
        xs: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 18 }
      }
    };
    return (
      <SearchForm layout="inline" {...formLayOut} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
        <Item field="createTime" />
        <Item field="transactionType" />
        <Item field="projectName" />
        <Item field="orderNo" />
        <DebounceFormButton label="查询" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="重置" className="mr-10" onClick={this.handleResetBtnClick} />
        <DebounceFormButton className="mr-10" type="primary" label="导出excel" onClick={this.handleExportExcelBtnClick} />
      </SearchForm>
    );
  }

  handleSearchBtnClick = value => {
    this.setState({
      nowPage:1
    });
    const createDateStart = value.createTime && value.createTime.length ? value.createTime[0].set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd = value.createTime && value.createTime.length ? value.createTime[1].set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const newFilter = this.props.setFilter({ ...this.props.filter, createDateStart, createDateEnd, offset: 0 });
    this.props.getFinanceAccountTransaction(newFilter);
  }

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({});
    this.setState({
      nowPage:1,
      pageSize:10
    });
    this.props.getFinanceAccountTransaction(newFilter);
  }

  toFundRecord = () => {
    const { location:{ query } } = this.props;
    const paramsStr = Object.entries(pick(query, ['driverUserId', 'organizationId']))
      .filter(([key, value]) => value)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    router.push(`fundRecord?${paramsStr}`);
  }

  render () {
    const { location:{ query: { accountType, accountName, nickName, virtualAccountNo, bankAccount, virtualAccountBalance } }, financeBusiness } = this.props;
    const { nowPage, pageSize, ready } = this.state;
    return (
      <>
        <Row>
          <Col span={8}>
            <div>客户类型</div>
            <div className={style.field_value}>{config[accountType]}</div>
          </Col>
          <Col span={8}>
            <div>客户名称</div>
            <div className={style.field_value}>{accountName || '--'}</div>
          </Col>
          <Col span={8}>
            <div>项目负责人</div>
            <div className={style.field_value}>{nickName || '--'}</div>
          </Col>
        </Row>
        <Row style={{ marginTop:'10px' }}>
          <Col span={8}>
            <div>客户平台账号</div>
            <div className={style.field_value}>{virtualAccountNo}</div>
          </Col>
          <Col span={8}>
            <div>银行账户</div>
            <div className={style.field_value}>{bankAccount}</div>
          </Col>
          <Col span={8}>
            <div>客户余额</div>
            <div className={style.field_value}>{(+virtualAccountBalance).toFixed(2)._toFixed(2)}元</div>
          </Col>
        </Row>
        <div className={style.blank} />
        {
          ready &&
          <Table
            rowKey="transactionId"
            dataSource={financeBusiness}
            schema={this.tableSchema}
            pagination={{ current:nowPage, pageSize }}
            onChange={this.onChange}
            renderCommonOperate={this.searchTable}
          />
        }
      </>
    );
  }
}

export default CustomerBalanceDetail;
