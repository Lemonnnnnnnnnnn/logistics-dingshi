import React, { Component } from 'react';
import { Table, Icon, Popover } from 'antd';
import CssModule from 'react-css-modules';
import { getBusinessData, sendOperationDataExcelPost } from "../../../../services/apiService";
import { routerToExportPage } from '../../../../utils/utils';
import styles from './business-data.less';
import SearchBar from './search-bar';

@CssModule(styles, { allowMultiple: true })
export default class Index extends Component {

  state = {
    dataSource: {
      items: [],
      count: 0
    },
    nowPage: 1
  }

  columns = [
    {
      title: '查询日期',
      dataIndex: 'time',
      render: (text, record) => {
        switch (record.timeDimension) {
          case 1:
            return record.dayDate;
          case 2:
            return record.weekWithStartEnd;
          case 3:
            return record.yearWithMonthCn;
          default:
            break;
        }
      }
    },
    {
      title: '司机',
      children: [
        {
          title: '注册数',
          dataIndex: 'driverLoginNumber',
        },
        {
          title: '实名认证数',
          dataIndex: 'driverCertificationNumber',
        },
        {
          title: '资格认证数',
          dataIndex: 'driverQualificationAuthenticationNumber',
        },
        {
          title: '首次接单数',
          dataIndex: 'driverFirstTimeTakeOrderNumber',
        },
        {
          title: '首次完单数',
          dataIndex: 'driverFirstTimeFinishOrderNumber',
        },
      ]
    },
    {
      title :'车辆',
      children : [
        { title : '注册数', dataIndex: 'carRegisterNumber' },
        { title : '认证数', dataIndex: 'carCertificationNumber' }
      ]
    },
    {
      title: '货主',
      children: [
        {
          title: '货主激活数',
          dataIndex: 'consignmentActivationNumber',
        }
      ]
    },
    {
      title: '项目',
      children: [
        {
          title: '项目激活数',
          dataIndex: 'projectActivationNumber',
        },
        {
          title: '首次交易数',
          dataIndex: 'projectFirstTimeTransactionNumber',
        },
        {
          title: '交易数',
          dataIndex: 'projectTransactionNumber',
        },
      ]
    },
  ]

  getRevenueData = params => {
    params.timeDimension = params.type;
    params.startDate = params.createDateStart;
    params.endDate = params.createDateEnd;
    getBusinessData({ ...params, offset: 0, limit: 370 }).then(data => {
      this.setState({
        dataSource: data
      });
    });
  }

  getExcel = params => {
    params.timeDimension = params.type;
    params.startDate = params.createDateStart;
    params.endDate = params.createDateEnd;

    const newParams = {
      ...params,
      limit : 370,
      offset : 0
    };
    // console.log(newParams)
    routerToExportPage(sendOperationDataExcelPost, newParams);
    // sendOperationDataExcelPost(newParams).then(()=>routerToExportPage())
    // window.open(getUrl(`${window.envConfig.baseUrl}/v1/operationData/excel?limit=370&offset=0`, params))
  }

  onChange = (pageInfo) => {
    const { current: nowPage } = pageInfo;
    this.setState({
      nowPage
    });
  }

  resetPage = () => {
    this.setState({
      nowPage: 1
    });
  }

  render () {
    const { dataSource, nowPage = 1 } = this.state;
    return (
      <>
        <h3 styleName='fontBold'>
          运营数据
          <Popover
            placement="rightTop"
            content={
              <div styleName='tipsBlock'>
                <p>注册数: 通过注册时间统计的司机人数</p>
                <p>实名认证数: 通过司机实名认证通过时间统计的司机人数</p>
                <p>资格认证数: 通过司机资格认证通过时间统计的司机人数</p>
                <p>首次接单司机数: 通过司机接单时间统计的司机人数</p>
                <p>首次完单司机数: 通过运单配置完单触发时间统计的司机人数</p>
                <p>货主激活数: 通过货主支付时间统计的货主数</p>
                <p>项目激活数: 通过项目首个运单的创建时间统计的项目数</p>
                <p>首次交易项目数: 通过项目首个支付单时间统计的项目数</p>
                <p>交易项目数: 通过项目支付单时间统计的项目数</p>
              </div>
            }
          >
            <Icon styleName='questionIcon' type="question-circle-o" />
          </Popover>
        </h3>
        <SearchBar getData={this.getRevenueData} resetPage={this.resetPage} getExcel={this.getExcel} />
        <div styleName='Divider' />
        <Table bordered columns={this.columns} dataSource={dataSource.items} pagination={{ current: nowPage }} onChange={this.onChange} scroll={{ x: 1500 }} />
      </>
    );
  }
}
