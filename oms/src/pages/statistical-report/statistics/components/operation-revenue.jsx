import React from 'react';
import { Tabs, Popover, Icon } from 'antd';
import CssModule from 'react-css-modules';
import moment from 'moment';
import { groupBy, sumBy, routerToExportPage } from '../../../../utils/utils';
import { getRevenueData, sendOperationRevenueExcelPost } from "../../../../services/apiService";
import Histogram from '../../../../components/charts-component/histogram';

import SearchBar from './search-bar';

import styles from './business-data.less';

const { TabPane } = Tabs;
@CssModule(styles, { allowMultiple: true })
export default class Index extends React.Component {

  state = {
    activeKey: 1
  }

  SearchBarRef = React.createRef()

  callback = (activeKey) => {
    this.setState({
      activeKey: +activeKey
    }, () => {
      const { sendRequest } = this.SearchBarRef.current;
      sendRequest();
    });
  }

  getData = async (params) => {
    const { activeKey } = this.state;
    const data = await getRevenueData({ ...params, revenueType: activeKey });
    const { tabs } = this.SearchBarRef.current.state;
    const renderType = tabs.findIndex(item => item.checked === true);
    this.formatData(data.items, renderType);
  }

  getExcel = (params) => {
    const { activeKey } = this.state;
    params.timeDimension = params.type;
    const newParams = {
      ...params,
      revenueType : activeKey,
      fileName : '营收数据'
    };
    routerToExportPage(sendOperationRevenueExcelPost, newParams);
    // sendOperationRevenueExcelPost(newParams).then(()=>routerToExportPage())
    // window.open(getUrl(`${window.envConfig.baseUrl}/v1/operationRevenue/excel?revenueType=${activeKey}&fileName=营收数据`, params))
  }

  formatData = (data, renderType) => {
    if (!data) return [];
    let chartsData;
    let byMonths;
    let byWeeks;
    switch (renderType) {
      case 0:
        chartsData = data.map(current => {
          current.formatDate = moment(current.dayDate).format('YY/MM/DD');
          return current;
        });
        break;
      case 1:
        byWeeks = groupBy(data, item => `${item.weekWithStartEnd.substring(0, 4)}/${this.addZero(item.weekNo)}周`);
        chartsData = this.calculate(byWeeks);
        break;
      case 2:
        byMonths = groupBy(data, item => `${item.yearWithMonth.substring(0, 4)}/${this.addZero(item.shortMonth)}`);
        chartsData = this.calculate(byMonths);
        break;
      default:
        break;
    }
    this.setState({
      chartsData
    }, () => {
      this.setState({
        ready: true
      });
    });
  }

  calculate = (sourceData) => {
    let orderNum;
    let orderTransportNum;
    let orderMoneyNum;
    const chartsData = [];
    Reflect.ownKeys(sourceData).forEach(key => {
      orderNum = sumBy(sourceData[key], 'orderNum').toFixed(0);
      orderTransportNum = sumBy(sourceData[key], 'orderTransportNum').toFixed(0);
      orderMoneyNum = sumBy(sourceData[key], 'orderMoneyNum').toFixed(2);
      chartsData.push({
        formatDate: key,
        orderNum,
        orderTransportNum,
        orderMoneyNum
      });
    });
    return chartsData;
  }

  addZero = (num) => num < 10 ? `0${num}` : num

  render () {
    const { chartsData = [], ready } = this.state;
    return (
      <>
        <Tabs defaultActiveKey="1" onChange={this.callback}>
          <TabPane tab="货主营收数据" key="1" />
          <TabPane tab="平台营收数据" key="2" />
        </Tabs>
        <SearchBar ref={this.SearchBarRef} getData={this.getData} getExcel={this.getExcel} />
        {
          ready
          &&
          <>
            <h3 style={{ marginTop: '25px', fontSize: '18px', fontWeight: 'bold' }}>
              支付单数
              <Popover
                placement="rightTop"
                content="指在一定周期内，货主支付的付款单数量"
              >
                <Icon styleName='questionIcon' type="question-circle-o" />
              </Popover>
            </h3>
            <Histogram data={chartsData} xAxisName='日期' yAxisName='支付单数(单)' xAxisKey='formatDate' yAxisKey='orderNum' />
            <h3 style={{ marginTop: '25px', fontSize: '18px', fontWeight: 'bold' }}>
              支付运单数
              <Popover
                placement="rightTop"
                content="指在一定周期内，货主支付的付款单里面相对应的运单数量"
              >
                <Icon styleName='questionIcon' type="question-circle-o" />
              </Popover>
            </h3>
            <Histogram data={chartsData} xAxisName='日期' yAxisName='支付运单数(单)' xAxisKey='formatDate' yAxisKey='orderTransportNum' />
            <h3 style={{ marginTop: '25px', fontSize: '18px', fontWeight: 'bold' }}>
              支付金额
              <Popover
                placement="rightTop"
                content="指在一定周期内，货主支付的付款总金额"
              >
                <Icon styleName='questionIcon' type="question-circle-o" />
              </Popover>
            </h3>
            <Histogram data={chartsData} yAxisScale={{ type: 'log', base: 10 }} xAxisName='日期' yAxisName='支付金额(元)' xAxisKey='formatDate' yAxisKey='orderMoneyNum' />
          </>
        }
      </>
    );
  }
}
