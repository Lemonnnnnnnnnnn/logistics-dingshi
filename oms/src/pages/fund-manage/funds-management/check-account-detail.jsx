import React from 'react';
import { Icon, Tag, Button, Checkbox, Row, Select } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import CssModule from 'react-css-modules';
import { Item, FORM_MODE } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import DebounceFormButton from '../../../components/debounce-form-button';
import SearchForm from '../../../components/table/search-form2';
import TableContainer from '../../../components/table/table-container';
import { ACCOUNT_TYPE, FLOWING_WATER_TYPE, ACCOUNT_TYPE_DIST } from '../../../constants/project/project';
import model from '../../../models/accountReconciliation';
import { routerToExportPage } from '../../../utils/utils';
import statementModel from '../../../models/accountStatement';
import { getUserInfo } from '../../../services/user';
import { getAbnormal, getAccountsInformation, sendAccountReconciliationExcelPost } from '../../../services/apiService';
import styles from './check-account.less';
import AccountTable from './component/account-table';
import StatementTable from './component/statement-table';

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

  componentDidMount () {
    const { location:{ query:{ type, startTime, endTime } } } = this.props;
    this.setState({ accountType : type });

    if (startTime && endTime) {
      this.originStartTime = moment(startTime, 'YYYY/MM/DD');
      this.originEndTime = moment(endTime, 'YYYY/MM/DD').hours(23).minutes(59).seconds(59);
    } else {
      // ????????????????????????????????????????????????????????????????????????
      const initStartTime = moment().subtract(1, 'days').startOf('day').format('YYYY/MM/DD');
      const initEndTime = initStartTime;

      this.originStartTime = moment(initStartTime, 'YYYY/MM/DD');
      this.originEndTime = moment(initEndTime, 'YYYY/MM/DD').hours(23).minutes(59).seconds(59);
    }

    const time = {
      startTime:this.originStartTime.format('YYYY/MM/DD HH:mm:ss'),
      endTime: this.originEndTime.format('YYYY/MM/DD HH:mm:ss')
    };

    this.searchForm = {
      time: {
        label: '????????????',
        component: 'rangePicker',
        allowClear: false,
        defaultValue: [this.originStartTime, this.originEndTime]
      }
    };

    getAccountsInformation().then(data => {
      this.logisticsVirtualAccount = data.logisticsVirtualAccountEntities;
      this.filter = JSON.parse(JSON.stringify(this.props.setFilter({ accountType : ACCOUNT_TYPE[type], ...time, limit: 5, offset: 0 })));
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
    this.filter = JSON.parse(JSON.stringify(this.props.setFilter({ accountType :ACCOUNT_TYPE[accountType], ...value, startTime, endTime, limit: 5, offset: 0 })));
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

  onSelectAccountType = (value) =>{
    // ???????????????????????????????????????????????????????????????????????????????????????accountType??????status????????????????????????????????????????????????????????????????????????
    router.replace(`detail?type=${value}`);
    this.setState({ accountType : value }, ()=>{
      const time = {
        startTime:this.originStartTime.format('YYYY/MM/DD HH:mm:ss'),
        endTime: this.originEndTime.format('YYYY/MM/DD HH:mm:ss')
      };

      getAccountsInformation().then(data => {
        this.logisticsVirtualAccount = data.logisticsVirtualAccountEntities;
        this.filter = JSON.parse(JSON.stringify(this.props.setFilter({ accountType : ACCOUNT_TYPE[value], ...time, limit: 5, offset: 0 })));
        this.initData(this.filter);
      });
    });
  }

  searchTableList = () => {
    const { accountType } = this.state;
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
        <Row type='flex' align='middle'>
          <div style={{ marginRight : '15px' }}>
            <span style={{ fontWeight :'bold' }}>???????????????</span>
            <Select onChange={this.onSelectAccountType} value={accountType} placeholder='?????????????????????'>
              {Object.entries(ACCOUNT_TYPE_DIST).map(item => (
                <Select.Option key={item[0]} value={item[0]}>{item[1]}</Select.Option>
              ))}
            </Select>
          </div>
          <Item field="time" />
          <DebounceFormButton label="??????" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
          <DebounceFormButton label="??????" onClick={this.handleResetBtnClick} />
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
    return num > 0?
      (
        <>
          <Icon styleName='red_icon' type='exclamation-circle' theme='filled' />
          <span styleName='red'>????????????</span>
        </>
      )
      :
      false;
  }

  isMatched = (flowingWaterType) => {
    const renderConfig = {
      [FLOWING_WATER_TYPE.OK]: { text: '????????????' },
      [FLOWING_WATER_TYPE.PART_ABNORMAL]: { text: '????????????' },
      [FLOWING_WATER_TYPE.ALL_ABNORMAL]: { text: '????????????' },
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
    this.props.getAccountStatement({ ...this.filter, offset, limit });
  }

  getExcel = () => {
    const { startTime, endTime, accountType } = this.filter;

    const params = {
      limit : 100000,
      offset : 0,
      startTime,
      endTime,
      accessToken : getUserInfo().accessToken,
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
    if (checked) this.filter.abnormalAccount = 1; // 1 ?????????
    if (!checked) this.filter.abnormalAccount = undefined;
    this.initData(this.filter);
  }

  render () {
    const { accountType, abnormalNumber, ready, startTime, endTime } = this.state;
    const { bankFlowingWater, flowingWaterType } = abnormalNumber;
    return (
      ready
      &&
      <>
        <Row type='flex' align='middle' onClick={()=>router.goBack()} style={{ cursor:'pointer' }}>
          <Icon style={{ color : '#1890FF', fontSize :'2em' }} type="left" />
          <div style={{ fontSize : '15px', color : '#1890FF', marginLeft : '5px' }}>??????</div>
        </Row>
        {this.searchTableList()}
        <Row type='flex' align='middle'>
          <h3 style={{ fontWeight: 'bold', margin: '25px 0' }}>{accountType !== ACCOUNT_TYPE.BALANCE? '????????????': '????????????'}<Checkbox style={{ marginLeft: '15px' }} onChange={this.onChangeAbnormalAccount}>??????????????????</Checkbox></h3>
          <span style={{ marginLeft : '2rem' }}>????????????????????????????????????????????? = ?????????????????????????????? + ??????????????????????????????????????? + ???????????? + ????????????????????????????????????</span>
        </Row>
        <Tag color="red" styleName='tag_tips'>
          <span>???????????????{startTime} ~ {endTime}</span>
          <span styleName='sep_block' />
          <span>???????????????{moment(endTime).diff(moment(startTime), 'days') + 1}???</span>
          <span styleName='sep_block' />
          {this.isExistAbnormal()}
        </Tag>
        <AccountTable ref={this.accountTable} accountType={accountType} surplusPageChange={this.surplusPageChange} />
        <div styleName='title_div'>
          <h3 style={{ fontWeight: 'bold', margin: '25px 0' }}>
            ????????????{accountType === 4 && <span style={{ color : '#A0A0A0' }}>??????????????????????????????</span>}
          </h3>
          <Button onClick={this.getExcel}>??????????????????</Button>
        </div>
        <Tag color={!flowingWaterType || flowingWaterType === FLOWING_WATER_TYPE.OK? 'green': 'red'} styleName='tag_tips'>
          <span>???????????????{startTime} ~ {endTime}</span>
          <span styleName='sep_block' />
          <span>????????????????????????{this.props.statementCount || 0}???????????????????????????{bankFlowingWater}???</span>
          <span styleName='sep_block' />
          {this.isMatched(flowingWaterType)}
        </Tag>
        <StatementTable ref={this.statementTable} accountType={accountType} statementPageChange={this.statementPageChange} />
      </>
    );
  }
}
