import React from 'react';
import { Radio, Row, Badge, Icon, Tag, Button } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import CssModule from 'react-css-modules';
import { Item, FormButton, FORM_MODE } from '@gem-mine/antd-schema-form';
import router from "umi/router";
import DebounceFormButton from '@/components/DebounceFormButton';
import SearchForm from '@/components/Table/SearchForm2';
import TableContainer from '@/components/Table/TableContainer';
import { ACCOUNT_TYPE, FLOWING_WATER_TYPE } from '@/constants/project/project';
import model from '@/models/accountReconciliation';
import { routerToExportPage } from '@/utils/utils';
import statementModel from '@/models/accountStatement';
import { getUserInfo } from '@/services/user';
import {
  getAbnormal,
  getAccountsInformation,
  sendAccountReconciliationExcelPost,
  sendFinanceAccountsBalanceExcelPost
} from "@/services/apiService";
import styles from './CheckAccount.less';
import AccountTable from './component/AccountTable';
import StatementTable from './component/StatementTable';

const { actions: { getAccountReconciliation } } = model;

const { actions: { getAccountStatement } } = statementModel;

function mapStateToProps (state) {
  return {
    statementCount: state.accountStatement.count,
  };
}

@connect(mapStateToProps, { getAccountReconciliation, getAccountStatement })
@TableContainer()
@CssModule(styles, { allowMultiple: true })
export default class Index extends React.Component{
  state = {
    accountType: ACCOUNT_TYPE.COLLECTION,
    abnormalNumber: {
      collectionBankAbnormal: 0,
      incomeBankAbnormal: 0,
      payBankAbnormal: 0
    },
    accountStatementPageSize: 10,
  }

  defaultValue = {
    time: [
      moment().subtract(1, 'days').startOf('day'),
      moment().subtract(1, 'days').endOf('day')
    ]
  }

  searchForm = {
    time: {
      label: '起止日期',
      component: 'rangePicker',
      allowClear: false,
      defaultValue: this.defaultValue.time
    }
  }

  accountTable = React.createRef()

  statementTable = React.createRef()

  componentDidMount () {
    const time = {
      startTime: this.defaultValue.time[0].format('YYYY/MM/DD HH:mm:ss'),
      endTime: this.defaultValue.time[1].format('YYYY/MM/DD HH:mm:ss')
    };
    const { accountType } = this.state;
    getAccountsInformation().then(data => {
      this.logisticsVirtualAccount = data.logisticsVirtualAccountEntities;
      const { virtualAccountNo } = data.logisticsVirtualAccountEntities.find(item => item.virtualAccountType === 4);
      this.filter = JSON.parse(JSON.stringify(this.props.setFilter({ accountType, ...time, limit: 5, offset: 0, payeeAccount: virtualAccountNo, payerAccount: virtualAccountNo })));
      this.initData(this.filter);
    });
  }

  getVirtualAccountNo = (accountType) => {
    const virtualAccountType = {
      1: 3,
      2: 4,
      3: 5
    }[accountType];
    const { virtualAccountNo } = this.logisticsVirtualAccount.find(item => item.virtualAccountType === virtualAccountType);
    return virtualAccountNo;
  }

  initData = (filter) => {
    const { getAccountReconciliation, getAccountStatement } = this.props;
    const { accountStatementPageSize } = this.state;
    const virtualAccountNo = this.getVirtualAccountNo(filter.accountType);
    Promise.all([getAbnormal(filter), getAccountReconciliation(filter), getAccountStatement({ ...filter, limit: accountStatementPageSize, payeeAccount: virtualAccountNo, payerAccount: virtualAccountNo })]).then(res => {
      this.setState({
        abnormalNumber: res[0],
        ready: true,
        startTime: moment(filter.startTime).format('YYYY/MM/DD'),
        endTime: moment(filter.endTime).format('YYYY/MM/DD')
      });
    });
  }

  handleSearchBtnClick = value => {
    const startTime = value.time[0].format('YYYY/MM/DD HH:mm:ss');
    const endTime = value.time[1].format('YYYY/MM/DD HH:mm:ss');
    const { accountType } = this.state;
    this.filter = JSON.parse(JSON.stringify(this.props.setFilter({ accountType, ...value, startTime, endTime, limit: 5, offset: 0 })));
    delete this.filter.time;
    this.accountTable.current.wrappedInstance.setState({
      nowPage: 1,
    });
    this.statementTable.current.wrappedInstance.setState({
      nowPage: 1,
    });
    this.initData(this.filter);
  }

  handleResetBtnClick = () => {
    const startTime = this.defaultValue.time[0].format('YYYY/MM/DD HH:mm:ss');
    const endTime = this.defaultValue.time[1].format('YYYY/MM/DD HH:mm:ss');
    this.filter = JSON.parse(JSON.stringify(this.props.resetFilter({ accountType: ACCOUNT_TYPE.COLLECTION, time: this.defaultValue.time, startTime, endTime, limit: 5, offset: 0 })));
    delete this.filter.time;
    this.accountTable.current.wrappedInstance.setState({
      nowPage: 1,
      pageSize: 5
    });
    this.statementTable.current.wrappedInstance.setState({
      nowPage: 1,
      pageSize: 10
    });
    this.setState({
      accountType: ACCOUNT_TYPE.COLLECTION,
      accountStatementPageSize: 10
    });
    this.initData(this.filter);
  }

  searchTableList = () => {
    const formLayOut = {
      labelCol:{
        xs: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 18 }
      }
    };
    return (
      <SearchForm style={{ paddingTop: '24px' }} layout="inline" {...formLayOut} schema={this.searchForm} data={this.defaultValue} mode={FORM_MODE.SEARCH}>
        <Item field="time" />
        <DebounceFormButton label="查询" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="重置" onClick={this.handleResetBtnClick} />
      </SearchForm>
    );
  }

  onChangeRadio = e => {
    this.setState({
      accountType: e.target.value
    });
    this.accountTable.current.wrappedInstance.setState({
      nowPage: 1
    });
    this.statementTable.current.wrappedInstance.setState({
      nowPage: 1,
    });
    this.filter.accountType = e.target.value;
    this.initData(this.filter);
  }

  isExistAbnormal = () => {
    const { accountType, abnormalNumber } = this.state;
    let num;
    if (accountType === ACCOUNT_TYPE.COLLECTION) num = abnormalNumber.collectionBankAbnormal;
    if (accountType === ACCOUNT_TYPE.EXPENDITURE) num = abnormalNumber.payBankAbnormal;
    if (accountType === ACCOUNT_TYPE.INCOME) num = abnormalNumber.incomeBankAbnormal;
    return num > 0?
      (
        <>
          <Icon styleName='red_icon' type='exclamation-circle' theme='filled' />
          <span styleName='red'>存在异常</span>
        </>
      )
      :
      false;
  }

  isMatched = (flowingWaterType) => {
    const renderConfig = {
      [FLOWING_WATER_TYPE.OK]: { text: '完全匹配' },
      [FLOWING_WATER_TYPE.PART_ABNORMAL]: { text: '部分匹配' },
      [FLOWING_WATER_TYPE.ALL_ABNORMAL]: { text: '全部异常' },
    }[flowingWaterType];
    return renderConfig?
      (
        <>
          <Icon styleName={flowingWaterType === FLOWING_WATER_TYPE.OK? 'green_icon': 'red_icon'} type={flowingWaterType === FLOWING_WATER_TYPE.OK? 'check-circle': 'close-circle'} theme='filled' />
          <span styleName={flowingWaterType === FLOWING_WATER_TYPE.OK? 'green': 'red'}>{renderConfig.text}</span>
        </>
      )
      :
      false;
  }

  surplusPageChange = (pagination) => {
    const { offset, limit } = pagination;
    this.props.getAccountReconciliation({ ...this.filter, offset, limit });
  }

  statementPageChange = (pagination) => {
    const { offset, limit } = pagination;
    this.setState({
      accountStatementPageSize: limit
    });
    const virtualAccountNo = this.getVirtualAccountNo(this.filter.accountType);
    this.props.getAccountStatement({ ...this.filter, offset, limit, payeeAccount: virtualAccountNo, payerAccount: virtualAccountNo });
  }

  getExcel = () => {
    const { startTime, endTime, accountType } = this.filter;
    const virtualAccountNo = this.getVirtualAccountNo(accountType);
    const params = {
      limit : 100000,
      offset : 0,
      startTime,
      endTime,
      accessToken : getUserInfo().accessToken,
      payeeAccount : virtualAccountNo,
      payerAccount : virtualAccountNo,
      accountType
    };
    routerToExportPage(sendAccountReconciliationExcelPost, params);
    // sendAccountReconciliationExcelPost(params).then(()=>routerToExportPage())
    // window.open(`${window.envConfig.baseUrl}/v1/accountReconciliation/createExcel?limit=100000&offset=0&startTime=${startTime}&endTime=${endTime}&accessToken=${getUserInfo().accessToken}&payeeAccount=${virtualAccountNo}&payerAccount=${virtualAccountNo}&accountType=${this.filter.accountType}`)
  }

  render () {
    const { accountType, abnormalNumber, ready, startTime, endTime } = this.state;
    const { collectionBankAbnormal, incomeBankAbnormal, payBankAbnormal, bankFlowingWater, flowingWaterType } = abnormalNumber;
    return (
      ready
      &&
      <>
        <div styleName='head_container'>
          <div>
            <h3 styleName='red'>{collectionBankAbnormal + incomeBankAbnormal + payBankAbnormal}</h3>
            <span>对账异常数</span>
          </div>
          <div>
            <h3>
              {
                new Date().getFullYear() === 2021 && new Date().getMonth() === 0
                  ?
                  moment(endTime).diff(moment('2021/01/11'), 'days') + 1
                  :
                  new Date().getDate() - 1
              }
            </h3>
            <span>本月对账天数</span>
          </div>
          <div>
            <h3>{moment(endTime).diff(moment('2021/01/11'), 'days') + 1}</h3>
            <span>总计对账天数</span>
          </div>
        </div>
        <div styleName='division' />
        {this.searchTableList()}
        <Row styleName='type'>
          <Radio.Group value={accountType} onChange={this.onChangeRadio}>
            <Radio.Button value={ACCOUNT_TYPE.COLLECTION}>
              <Badge count={collectionBankAbnormal}>
                <span styleName='title'>收款账号</span>
              </Badge>
            </Radio.Button>
            <Radio.Button value={ACCOUNT_TYPE.EXPENDITURE}>
              <Badge count={payBankAbnormal}>
                <span styleName='title'>支出账号</span>
              </Badge>
            </Radio.Button>
            <Radio.Button value={ACCOUNT_TYPE.INCOME}>
              <Badge count={incomeBankAbnormal}>
                <span styleName='title'>收入账号</span>
              </Badge>
            </Radio.Button>
          </Radio.Group>
        </Row>
        <h3 style={{ fontWeight: 'bold', margin: '25px 0' }}>余额对账</h3>
        <Tag color="red" styleName='tag_tips'>
          <span>对账日期：{startTime} ~ {endTime}</span>
          <span styleName='sep_block' />
          <span>对账天数：{moment(endTime).diff(moment(startTime), 'days') + 1}天</span>
          <span styleName='sep_block' />
          {this.isExistAbnormal()}
        </Tag>
        <AccountTable ref={this.accountTable} surplusPageChange={this.surplusPageChange} />
        <div styleName='title_div'>
          <h3 style={{ fontWeight: 'bold', margin: '25px 0' }}>流水记录</h3>
          <Button onClick={this.getExcel}>导出对账明细</Button>
        </div>
        <Tag color={!flowingWaterType || flowingWaterType === FLOWING_WATER_TYPE.OK? 'green': 'red'} styleName='tag_tips'>
          <span>对账日期：{startTime} ~ {endTime}</span>
          <span styleName='sep_block' />
          <span>平台交易记录数：{this.props.statementCount || 0}条，银行流水记录：{bankFlowingWater}条</span>
          <span styleName='sep_block' />
          {this.isMatched(flowingWaterType)}
        </Tag>
        <StatementTable ref={this.statementTable} statementPageChange={this.statementPageChange} />
      </>
    );
  }
}
