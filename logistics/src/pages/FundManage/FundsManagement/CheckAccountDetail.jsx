import React from 'react';
import { Icon, Tag, Button, Checkbox, Row, Select } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import CssModule from 'react-css-modules';
import { Item, FORM_MODE } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import DebounceFormButton from '@/components/DebounceFormButton';
import SearchForm from '@/components/Table/SearchForm2';
import TableContainer from '@/components/Table/TableContainer';
import { ACCOUNT_TYPE, FLOWING_WATER_TYPE, ACCOUNT_TYPE_DIST } from '@/constants/project/project';
import model from '@/models/accountReconciliation';
import { routerToExportPage } from '@/utils/utils';
import statementModel from '@/models/accountStatement';
import { getUserInfo } from '@/services/user';
import { getAbnormal, getAccountsInformation, sendAccountReconciliationExcelPost } from '@/services/apiService';
import styles from './CheckAccount.less';
import AccountTable from './component/AccountTable';
import StatementTable from './component/StatementTable';

const { actions: { getAccountReconciliation } } = model;

const { actions: { getAccountStatement } } = statementModel;

function mapStateToProps(state) {
  return {
    statementCount: state.accountStatement.count,
  };
}

@connect(mapStateToProps, { getAccountReconciliation, getAccountStatement })
@TableContainer()
@CssModule(styles, { allowMultiple: true })
export default class Index extends React.Component {
  state = {
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
      moment().subtract(1, 'days').endOf('day'),
    ],
  }

  accountTable = React.createRef()

  statementTable = React.createRef()

  componentDidMount() {
    const { location: { query: { type, startTime, endTime } } } = this.props;
    this.setState({ accountType: type });

    if (startTime && endTime) {
      this.originStartTime = moment(startTime, 'YYYY/MM/DD');
      this.originEndTime = moment(endTime, 'YYYY/MM/DD').hours(23).minutes(59).seconds(59);
    } else {
      // 如果没有传入起止时间，则默认认为筛选日期选择昨天
      const initStartTime = moment().subtract(1, 'days').startOf('day').format('YYYY/MM/DD');
      const initEndTime = initStartTime;

      this.originStartTime = moment(initStartTime, 'YYYY/MM/DD');
      this.originEndTime = moment(initEndTime, 'YYYY/MM/DD').hours(23).minutes(59).seconds(59);
    }

    const time = {
      startTime: this.originStartTime.format('YYYY/MM/DD HH:mm:ss'),
      endTime: this.originEndTime.format('YYYY/MM/DD HH:mm:ss')
    };

    this.searchForm = {
      time: {
        label: '对账起止',
        component: 'rangePicker',
        allowClear: false,
        defaultValue: [this.originStartTime, this.originEndTime]
      }
    };

    getAccountsInformation().then(data => {
      this.logisticsVirtualAccount = data.logisticsVirtualAccountEntities;
      this.filter = JSON.parse(JSON.stringify(this.props.setFilter({ accountType: ACCOUNT_TYPE[type], ...time, limit: 5, offset: 0 })));
      this.initData(this.filter);
    });
  }

  componentWillUnmount() {
    this.props.resetFilter();
  }

  initData = (filter) => {
    const { getAccountReconciliation, getAccountStatement } = this.props;
    const { accountStatementPageSize } = this.state;
    Promise.all([getAbnormal(filter), getAccountReconciliation(filter), getAccountStatement({ ...filter, limit: accountStatementPageSize })]).then(res => {
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
    this.filter = JSON.parse(JSON.stringify(this.props.setFilter({ accountType: ACCOUNT_TYPE[accountType], ...value, startTime, endTime, limit: 5, offset: 0 })));
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
    const { accountType } = this.state;

    this.filter = JSON.parse(JSON.stringify(this.props.resetFilter({ accountType: ACCOUNT_TYPE[accountType], time: this.defaultValue.time, startTime, endTime, limit: 5, offset: 0 })));
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
      accountStatementPageSize: 10
    });
    this.initData(this.filter);
  }

  onSelectAccountType = (value) => {
    // 这里直接获取数据无法读取到路由上的参数，有延迟，所以还是把accountType放到status里管理，这里修改路由参数无实际意义，只是为了好看
    router.replace(`detail?type=${value}`);
    this.setState({ accountType: value }, () => {
      const time = {
        startTime: this.originStartTime.format('YYYY/MM/DD HH:mm:ss'),
        endTime: this.originEndTime.format('YYYY/MM/DD HH:mm:ss')
      };

      getAccountsInformation().then(data => {
        this.logisticsVirtualAccount = data.logisticsVirtualAccountEntities;
        this.filter = JSON.parse(JSON.stringify(this.props.setFilter({ accountType: ACCOUNT_TYPE[value], ...time, limit: 5, offset: 0 })));
        this.initData(this.filter);
      });
    });
  }

  searchTableList = () => {
    const { accountType } = this.state;
    const formLayOut = {
      labelCol: {
        xs: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 18 }
      }
    };
    return (
      <SearchForm style={{ paddingTop: '24px' }} layout="inline" {...formLayOut} schema={this.searchForm} data={this.defaultValue} mode={FORM_MODE.SEARCH}>
        <Row type='flex' align='middle'>
          <div style={{ marginRight: '15px' }}>
            <span style={{ fontWeight: 'bold' }}>对账类型：</span>
            <Select onChange={this.onSelectAccountType} value={accountType} placeholder='请选择对账类型'>
              {Object.entries(ACCOUNT_TYPE_DIST).map(item => (
                <Select.Option key={item[0]} value={item[0]}>{item[1]}</Select.Option>
              ))}
            </Select>
          </div>
          <Item field="time" />
          <DebounceFormButton label="查询" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
          <DebounceFormButton label="重置" onClick={this.handleResetBtnClick} />
        </Row>
      </SearchForm>
    );
  }

  isExistAbnormal = () => {
    const { abnormalNumber, accountType } = this.state;
    let num;
    if (ACCOUNT_TYPE[accountType] === ACCOUNT_TYPE.COLLECTION) num = abnormalNumber.collectionBankAbnormal;
    if (ACCOUNT_TYPE[accountType] === ACCOUNT_TYPE.EXPENDITURE) num = abnormalNumber.payBankAbnormal;
    if (ACCOUNT_TYPE[accountType] === ACCOUNT_TYPE.INCOME) num = abnormalNumber.incomeBankAbnormal;
    if (ACCOUNT_TYPE[accountType] === ACCOUNT_TYPE.BALANCE) num = abnormalNumber.breakEven;
    return num > 0 ?
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
    return renderConfig ?
      (
        <>
          <Icon styleName={flowingWaterType === FLOWING_WATER_TYPE.OK ? 'green_icon' : 'red_icon'} type={flowingWaterType === FLOWING_WATER_TYPE.OK ? 'check-circle' : 'close-circle'} theme='filled' />
          <span styleName={flowingWaterType === FLOWING_WATER_TYPE.OK ? 'green' : 'red'}>{renderConfig.text}</span>
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
    this.props.getAccountStatement({ ...this.filter, offset, limit });
  }

  getExcel = () => {
    const { startTime, endTime, accountType } = this.filter;

    const params = {
      limit: 100000,
      offset: 0,
      startTime,
      endTime,
      accessToken: getUserInfo().accessToken,
      accountType
    };
    routerToExportPage(sendAccountReconciliationExcelPost, params);
  }

  onChangeAbnormalAccount = (e) => {
    const { checked } = e.target;
    this.accountTable.current.wrappedInstance.setState({
      nowPage: 1
    });
    this.statementTable.current.wrappedInstance.setState({
      nowPage: 1,
    });
    if (checked) this.filter.abnormalAccount = 1; // 1 为异常
    if (!checked) this.filter.abnormalAccount = undefined;
    this.initData(this.filter);
  }

  render() {
    const { accountType, abnormalNumber, ready, startTime, endTime } = this.state;
    const { bankFlowingWater, flowingWaterType } = abnormalNumber;

    return (
      ready
      &&
      <>
        <Row type='flex' align='middle' onClick={() => router.goBack()} style={{ cursor: 'pointer' }}>
          <Icon style={{ color: '#1890FF', fontSize: '2em' }} type="left" />
          <div style={{ fontSize: '15px', color: '#1890FF', marginLeft: '5px' }}>返回</div>
        </Row>
        {this.searchTableList()}
        <Row type='flex' align='middle'>
          <h3 style={{ fontWeight: 'bold', margin: '25px 0' }}>{accountType !== ACCOUNT_TYPE.BALANCE ? '余额对账' : '收支平衡'}<Checkbox style={{ marginLeft: '15px' }} onChange={this.onChangeAbnormalAccount}>只显示不匹配</Checkbox></h3>
          {accountType === 'BALANCE' && <span style={{ marginLeft: '2rem' }}>平衡公式：收款金额（平台记录） = 司机金额（银行流水） + 外部服务费支出（业务往来） + 税费合计 + 平台收入金额（银行流水）</span> || null}
        </Row>
        <Tag color="red" styleName='tag_tips'>
          <span>对账日期：{startTime} ~ {endTime}</span>
          <span styleName='sep_block' />
          <span>对账天数：{moment(endTime).diff(moment(startTime), 'days') + 1}天</span>
          <span styleName='sep_block' />
          {this.isExistAbnormal()}
        </Tag>
        <AccountTable ref={this.accountTable} accountType={accountType} surplusPageChange={this.surplusPageChange} />
        <div styleName='title_div'>
          <h3 style={{ fontWeight: 'bold', margin: '25px 0' }}>
            流水记录{accountType === 4 && <span style={{ color: '#A0A0A0' }}>（不匹配付款单流水）</span>}
          </h3>
          <Button onClick={this.getExcel}>导出对账明细</Button>
        </div>
        <Tag color={!flowingWaterType || flowingWaterType === FLOWING_WATER_TYPE.OK ? 'green' : 'red'} styleName='tag_tips'>
          <span>对账日期：{startTime} ~ {endTime}</span>
          <span styleName='sep_block' />
          <span>平台交易记录数：{this.props.statementCount || 0}条，银行流水记录：{bankFlowingWater}条</span>
          <span styleName='sep_block' />
          {this.isMatched(flowingWaterType)}
        </Tag>
        <StatementTable ref={this.statementTable} accountType={accountType} statementPageChange={this.statementPageChange} />
      </>
    );
  }
}
