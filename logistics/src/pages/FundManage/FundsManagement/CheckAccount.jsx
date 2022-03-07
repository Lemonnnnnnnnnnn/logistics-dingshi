import React from 'react';
import { Row } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import CssModule from 'react-css-modules';
import { FORM_MODE, Item } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import { ACCOUNT_TYPE, ACCOUNT_TYPE_DIST } from '@/constants/project/project';
import model from '@/models/accountReconciliation';
import Table from '@/components/Table/Table';
import statementModel from '@/models/accountStatement';
import { getAccountReconciliationBankAccount, getAbnormal, getAccountStatementSpecified } from '@/services/apiService';
import SearchForm from '@/components/Table/SearchForm2';
import DebounceFormButton from '@/components/DebounceFormButton';
import { FilterContextCustom } from '@/components/Table/FilterContext';
import AccountCard from './component/AccountCard';
import styles from './CheckAccount.less';

const { actions: { getAccountReconciliation } } = model;

const { actions: { getAccountStatement } } = statementModel;

// 生成map字典
const EXPENDITURE = new Map();
for (let i = 1 ; i <= 14 ; i ++){
  const date = moment().subtract(i, 'days').format('YYYY/MM/DD');
  EXPENDITURE.set(date, 0);
}
const COLLECTION = new Map(EXPENDITURE);
const INCOME = new Map(EXPENDITURE);
const BALANCE = new Map(EXPENDITURE);
const SUBSTITUTE = new Map(EXPENDITURE);
const WECHAT = new Map(EXPENDITURE);

// 用map字典生成obj对象
function mapToObj(){
  const cardObj = {
    EXPENDITURE : [],
    COLLECTION : [],
    INCOME : [],
    BALANCE : [],
    SUBSTITUTE : [],
    WECHAT : [],
  };

  EXPENDITURE.forEach((status, date)=>{
    cardObj.EXPENDITURE.push({ status, date, height : 1 });
  });
  COLLECTION.forEach((status, date)=>{
    cardObj.COLLECTION.push({ status, date, height : 1 });
  });
  INCOME.forEach((status, date)=>{
    cardObj.INCOME.push({ status, date, height : 1 });
  });
  BALANCE.forEach((status, date)=>{
    cardObj.BALANCE.push({ status, date, height : 1 });
  });
  SUBSTITUTE.forEach((status, date)=>{
    cardObj.SUBSTITUTE.push({ status, date, height : 1 });
  });
  WECHAT.forEach((status, date)=>{
    cardObj.WECHAT.push({ status, date, height : 1 });
  });
  return cardObj;

}



function mapStateToProps(state) {
  return {
    statementCount: state.accountStatement.count,
  };
}

@connect(mapStateToProps, { getAccountReconciliation, getAccountStatement })
@FilterContextCustom
@CssModule(styles, { allowMultiple: true })
export default class Index extends React.Component {
  state = {
    cardReady : false,
    tableReady : false,
    abnormalNumber : 0,
    tableData: { items : [], count : 0 },
  }

  defaultValue = {
    time: [
      moment().subtract(1, 'days').startOf('day'),
      moment().subtract(1, 'days').endOf('day'),
    ],
    timeLastFourth: [
      moment().subtract(14, 'days').startOf('day'),
      moment().subtract(1, 'days').endOf('day'),
    ],
  }

  searchForm = {
    time: {
      label: '起止日期',
      component: 'rangePicker',
      allowClear: false,
      defaultValue: this.defaultValue.time,
    },
  }

  bankAccount = {}

  tableSchema = {
    columns: [
      {
        title: '起止日期',
        dataIndex: 'date',
        fixed: 'left',
        width: 340,
        render: (text) => text,
      },
      {
        title: '对账类型',
        dataIndex: 'type',
        fixed: 'left',
        width: 340,
      },
      {
        title: '银行账号',
        dataIndex: 'bankAccount',
        fixed: 'left',
        width: 340,
      },
      {
        title: '对账状态',
        dataIndex: 'status',
        width: 340,
        fixed: 'left',
        render: (text) => {
          if (text === '正常') return <span style={{ color: '#BCDF83' }}>匹配</span>;
          return <span style={{ color: 'red' }}>不匹配</span>;
        }
      },
    ],
    operations: (record) => ([{
      title: '查看',
      onClick: () => {
        const { filter : { time } } = this.props;
        let startTime;
        let endTime;

        if (time){
          startTime = time[0].format('YYYY/MM/DD');
          endTime= time[1].format('YYYY/MM/DD');
        } else {
          startTime = this.defaultValue.time[0].format('YYYY/MM/DD');
          endTime= this.defaultValue.time[1].format('YYYY/MM/DD');
        }

        router.push(`CheckAccount/detail?type=${record.name}&startTime=${startTime}&endTime=${endTime}`);
      },
    }]),
  }

  componentDidMount() {
    getAccountReconciliationBankAccount().then(data => {
      data.forEach(i=>{
        switch (i.bankName) {
          case '中信银行-支付账户' :
            this.bankAccount['1'] = i.bankAccount;
            break;
          case '中信银行-收款账户' :
            this.bankAccount['2'] = i.bankAccount;
            break;
          case '中信银行-收入账户' :
            this.bankAccount['3'] = i.bankAccount;
            break;
          case '中信银行-代收账户' :
            this.bankAccount['5'] = i.bankAccount;
            break;
          case '财付通—备付金账户' :
            this.bankAccount['6'] = i.bankAccount;
            break;
          default :
            this.bankAccount['4'] = '';
            break;
        }
      });

    });
    this.getLastFourteenDay();
    this.getFilterDay();
  }


  getLastFourteenDay = () => {
    const time = {
      startTime: this.defaultValue.timeLastFourth[0].format('YYYY/MM/DD HH:mm:ss'),
      endTime: this.defaultValue.timeLastFourth[1].format('YYYY/MM/DD HH:mm:ss'),
    };
    let filter = {
      ...time,
      limit: 10000,
      offset: 0,
    };

    const { getAccountReconciliation } = this.props;
    /*
    * 1. getAccountReconciliation的的请求
    * 2. type为4的请求要单独进行 ，
    * 3. getAccountStatement的请求（6）
    * 4. 调用map生成对象
    * */
    /*
    * 关于正常异常的判断，都是读 abnormalAccount 字段，但规则相反
    * getAccountReconciliation      1是异常 0是正常
    * getAccountStatementSpecified  0是异常 1是正常
    * */
    getAccountReconciliation({ ...filter, accountTypeItems : '1,2,3,5,6' })
      .then(({ items })=> {
        items.forEach(item =>{
          if (item.abnormalAccount){
            const date = moment(item.reconciliationTime).format('YYYY/MM/DD');
            switch (item.accountType){
              case 1 : {
                EXPENDITURE.set(date, 1);
                break;
              }
              case 2 :{
                COLLECTION.set(date, 1);
                break;
              }
              case 3 : {
                INCOME.set(date, 1);
                break;
              }
              case 4 : {
                BALANCE.set(date, 1);
                break;
              }
              case 5 : {
                SUBSTITUTE.set(date, 1);
                break;
              }
              case 6 : {
                WECHAT.set(date, 1);
                break;
              }
              default : break;
            }
          }
        });
        return getAccountReconciliation({ ...filter, accountType : 4 });
      })
      .then(({ items })=>{
        items.forEach(item =>{
          if (item.abnormalAccount){
            const date = moment(item.createTime).format('YYYY/MM/DD');
            BALANCE.set(date, 1);
          }
        });
      })
      .then(()=>{
        let completeNum = 0;

        Object.entries(ACCOUNT_TYPE).forEach(item => { // 6组请求
          filter = { ...filter, accountType: item[1] };

          getAccountStatementSpecified(filter).then(res => {

            res.items.forEach(i => {
              if (i.abnormalAccount === 0) {
                const date = moment(i.reconciliationTime).format('YYYY/MM/DD');

                switch (item[1]){
                  case 1 : {
                    EXPENDITURE.set(date, 1);
                    break;
                  }
                  case 2 :{
                    COLLECTION.set(date, 1);
                    break;
                  }
                  case 3 : {
                    INCOME.set(date, 1);
                    break;
                  }
                  case 4 : {
                    BALANCE.set(date, 1);
                    break;
                  }
                  case 5 : {
                    SUBSTITUTE.set(date, 1);
                    break;
                  }
                  case 6 : {
                    WECHAT.set(date, 1);
                    break;
                  }
                  default : break;
                }
              }
            });

            completeNum++;
            if (completeNum === 6) {
              this.accountStatus = mapToObj();
              this.setState({ cardReady: true });
            }
          });
        });
      });
  }

  getFilterDay = () =>{
    const { filter : { time } } = this.props;
    let timeList;

    if (time){
      timeList = time;
    } else {
      timeList = this.defaultValue.time;
    }

    let params = {
      startTime: timeList[0].format('YYYY/MM/DD HH:mm:ss'),
      endTime: timeList[1].format('YYYY/MM/DD HH:mm:ss'),
      limit: 10000,
      offset: 0,
    };

    this.getAbnormalNumber(params);
    const tableItems = [[], [], [], [], [], []];
    const statusArr = [0, 0, 0, 0, 0, 0];

    const { getAccountReconciliation } = this.props;

    getAccountReconciliation({ ...params, accountTypeItems : '1,2,3,5,6' })
      .then(({ items })=> {
        // 通过一轮遍历，构造状态数组
        items.forEach(item =>{
          if (!statusArr[item.accountType - 1] && item.abnormalAccount){
            statusArr[item.accountType - 1] = 1;
          }
        });
        return getAccountReconciliation({ ...params, accountType : 4 });
      })
      .then(({ items })=>{
        items.forEach(item =>{
          if (!statusArr[3] && item.abnormalAccount){
            statusArr[3] = 1;
          }
        });
      })
      .then(()=>{
        let requestNum = statusArr.filter(item=> item === 0).length;

        if (!requestNum){
          Object.entries(ACCOUNT_TYPE).forEach(item=>{
            tableItems[item[1] - 1] = { name : item[0], date : `${timeList[0].format('YYYY/MM/DD')} - ${timeList[1].format('YYYY/MM/DD')}`, type : ACCOUNT_TYPE_DIST[item[0]], bankAccount : this.bankAccount[item[1]], status : statusArr[item[1] - 1] ? '异常' : '正常' };
          });
          this.setState({
            tableData: { items : tableItems, count: 6 },
            tableReady: true,
          });
        } else {
          Object.entries(ACCOUNT_TYPE).forEach(item => {
            // 如果已经异常了就不要发请求了
            if (!statusArr[item[1] - 1]){
              params = { ...params, accountType: item[1] };
              getAccountStatementSpecified(params)
                .then(res => {
                  const accountStatement = res.items;

                  for (let i = 0 ; i < accountStatement.length ; i ++){
                    if (!statusArr[item[1] - 1] && accountStatement[i].abnormalAccount === 0){
                      statusArr[item[1] - 1] = 1;
                      break;
                    }
                  }

                  requestNum --;
                  if (requestNum <= 0){
                    Object.entries(ACCOUNT_TYPE).forEach(item=>{
                      tableItems[item[1] - 1] = { name : item[0], date : `${timeList[0].format('YYYY/MM/DD')} - ${timeList[1].format('YYYY/MM/DD')}`, type : ACCOUNT_TYPE_DIST[item[0]], bankAccount : this.bankAccount[item[1]], status : statusArr[item[1] - 1] ? '异常' : '正常' };
                    });

                    this.setState({
                      tableData: { items : tableItems, count: 6 },
                      tableReady: true,
                    });
                  }
                });
            }
          });
        }
      });
  }


  getAbnormalNumber = (params) =>{
    getAbnormal(params).then(({ payBankAbnormal, collectionBankAbnormal, incomeBankAbnormal, breakEven, agentBankAbnormal, tenPayBankAbnormal })=>{
      const abnormalNumber = Number(payBankAbnormal) + Number(collectionBankAbnormal) + Number(incomeBankAbnormal) + Number(breakEven) + Number(agentBankAbnormal) + Number(tenPayBankAbnormal);
      this.setState({ abnormalNumber });
    });
  }

  handleSearchBtnClick = () => {
    this.getFilterDay();
  }

  handleResetBtnClick = () => {
    this.props.resetFilter();
    this.getFilterDay();
  }

  searchTableList = () => {
    const formLayOut = {
      labelCol: {
        xs: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 18 },
      },
    };
    return (
      <SearchForm
        style={{ paddingTop: '24px' }}
        layout='inline'
        {...formLayOut}
        schema={this.searchForm}
        data={this.defaultValue}
        mode={FORM_MODE.SEARCH}
      >
        <Item field='time' />
        <DebounceFormButton label='查询' type='primary' className='mr-10' onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label='重置' onClick={this.handleResetBtnClick} />
      </SearchForm>
    );
  }

  render() {
    const { abnormalNumber, tableReady, cardReady, endTime, tableData } = this.state;
    return (
      tableReady && cardReady
      &&
      <>
        <div styleName='head_container'>
          <div>
            <h3 styleName='red'>{abnormalNumber}</h3>
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
        <Row type='flex' justify='space-around' style={{ marginTop : '30px' }}>
          {
            Object.entries(this.accountStatus).map(item => <AccountCard key={item[0]} name={item[0]} data={item[1]} />)
          }
          {this.searchTableList()}
          <Table rowKey="name" schema={this.tableSchema} dataSource={tableData} />
        </Row>

      </>
    );
  }
}
