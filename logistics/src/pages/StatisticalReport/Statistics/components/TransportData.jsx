import React, { Component } from 'react';
import { Spin, DatePicker, Select, Button, message, Icon, Popover } from 'antd';
import CssModule from 'react-css-modules';
import moment from 'moment';
import router from "umi/router";
import Table from '@/components/Table/Table';
import { cloneDeep, getUrl, routerToExportPage } from '@/utils/utils';
import Histogram from '@/components/ChartsComponent/Histogram';
import {
  getTransportBoardCategory,
  getTransportBoardTransportList,
  getTransportBoardDriverActivity,
  getOwnerPayTime,
  getPlatPayTime,
  getTransportAuditRate,
  getOrganizationNameList,
  getProject,
  sendTransportBoardGetOwnerPayTimeExcelPost,
  sendTransportBoardGetPlatPayTimeExcelPost,
  sendTransportBoardDriverActivityExcelPost,
  sendTransportBoardTransportAuditRateExcelPost,
  sendTransportBoardTransportListExcelPost, sendOperationRevenueExcelPost
} from "@/services/apiService";
import styles from './BusinessData.less';
import SearchBar from './SearchBar';


const weekFormat = 'GGGG-WW周';
const { RangePicker } = DatePicker;
@CssModule(styles, { allowMultiple: true })
class TransportData extends Component {

  state = {
    data: {},
    auditRateData: {},
    ready: false
  }

  auditRateSchema = {
    variable: true,
    minWidth: 1300,
    columns: [
      {
        title: '查询日期',
        dataIndex: 'selectedDate',
        align: 'center'
      },
      {
        title: '首次审核通过率',
        dataIndex: 'firstRate',
        render: (text, record) => record.numberAll ? `${((record.numberAll - record.number) / record.numberAll * 100).toFixed(2)._toFixed(2)}%` : '0%'
      },
      {
        title: '多次审核通过率',
        dataIndex: 'secondRate',
        align: 'center',
        render: (text, record) => record.numberAll ? `${(record.number / record.numberAll * 100).toFixed(2)._toFixed(2)}%` : '0%'
      },
      {
        title: '首次通过单数',
        dataIndex: 'firstTime',
        align: 'center',
        render: (text, record) => record.numberAll - record.number
      },
      {
        title: '最后一次审核通过单数',
        dataIndex: 'secondTime',
        align: 'center',
        render: (text, record) => record.number
      },
    ]
  }

  componentDidMount () {
    Promise.all([
      getTransportBoardCategory(),
      getTransportBoardTransportList({ start: moment().startOf('day').format('YYYY-MM-DD'), end: moment().endOf('day').format('YYYY-MM-DD'), type: 1, limit: 400, offset: 0 }),
      getOwnerPayTime({ createDateStart: moment().startOf('day').format('YYYY/MM/DD HH:mm:ss'), createDateEnd: moment().endOf('day').format('YYYY/MM/DD HH:mm:ss') }),
      getPlatPayTime({ createDateStart: moment().startOf('day').format('YYYY/MM/DD HH:mm:ss'), createDateEnd: moment().endOf('day').format('YYYY/MM/DD HH:mm:ss') }),
      getTransportAuditRate({ start: moment().startOf('day').format('YYYY-MM-DD'), end: moment().endOf('day').format('YYYY-MM-DD'), type: 1, limit: 400, offset: 0 }),
      getTransportBoardDriverActivity({ start: moment().startOf('day').format('YYYY-MM-DD'), end: moment().endOf('day').format('YYYY-MM-DD'), type: 1 }),
      // getAllConsignment({ limit: 1000, offset: 0, searchKey: '' }),
      getOrganizationNameList({ limit: 1000, offset: 0, searchKey: '' }),
      getProject({ isPassShipments: true, isAvailable: true, limit: 1000, offset: 0 })
    ])
      .then(([categoryData, transportData, _ownerPayTimeData, _platPayTimeData, auditRateData, driverActivityData, _consignmentData, _projectData]) => {
        const { items: ownerPayTimeData } = _ownerPayTimeData;
        const { items: platPayTimeData } = _platPayTimeData;
        // const { items: consignmentData } = _consignmentData
        const consignmentData = _consignmentData;
        const { items: projectData } = _projectData;
        const baseColumn = [
          {
            title: '查询日期',
            dataIndex: 'selectedDate',
            align: 'center',
            // render: (text) => text? moment(text) : '--'
          }
        ];

        const categoryColumn = categoryData.map((item, index) => ({
          title: item.categoryName,
          children: [
            {
              title: '有效运单',
              dataIndex: `effective${index}`,
              align: 'center',
            },
            {
              title: '无效运单',
              dataIndex: `invalid${index}`,
              align: 'center',
            },
          ]
        }));

        this.tableSchema = {
          variable: true,
          minWidth: 2500,
          columns: [
            ...baseColumn,
            ...categoryColumn
          ]
        };
        this.setState({
          driverActivityData,
          ownerPayTimeData,
          platPayTimeData,
          auditRateData,
          data: transportData,
          consignmentData,
          projectData,
          ready: true
        });
      });
  }

  timeFormat = ({ createDateEnd, createDateStart, type }) => {
    let start = createDateStart;
    let end = createDateEnd;
    if (type === 2) {
      start = moment(createDateStart).format('YYYY-WW');
      end = moment(createDateEnd).format('YYYY-WW');
    } else if (type === 3) {
      start = moment(createDateStart).format('YYYY-MM');
      end = moment(createDateEnd).format('YYYY-MM');
    } else {
      start = moment(createDateStart).format('YYYY-MM-DD');
      end = moment(createDateEnd).format('YYYY-MM-DD');
    }
    return {
      start,
      end,
      type
    };
  }

  getTransportData = (params) => {
    const _params = this.timeFormat(params);
    getTransportBoardTransportList({ ..._params, projectId:params.projectId, limit: 400, offset: 0 })
      .then((data) => {
        this.setState({
          data
        });
      });
  }

  getAuditRate = (params) => {
    const _params = this.timeFormat(params);
    getTransportAuditRate({ ..._params, projectId:params.projectId, limit: 400, offset: 0 })
      .then((auditRateData) => {
        this.setState({
          auditRateData
        });
      });
  }

  getDriverActivity = (params) => {
    const _params = this.timeFormat(params);
    getTransportBoardDriverActivity({ ..._params, limit: 400, offset: 0 })
      .then((driverActivityData) => {
        this.setState({
          driverActivityData
        });
      });
  }

  getExcel = (params) => {
    const _params = this.timeFormat(params);
    const newParams = {
      ..._params,
      fileName : '统计运单数',
      limit : 400,
      offset : 0
    };
    routerToExportPage(sendTransportBoardTransportListExcelPost, newParams);
    // sendTransportBoardTransportListExcelPost(newParams).then(()=>routerToExportPage())
    // window.open(getUrl(`${window.envConfig.baseUrl}/v1/transportBoard/transportList/excel?fileName=统计运单数&limit=400&offset=0`, _params))
  }

  getAuditRateExcel = (params) => {
    const _params = this.timeFormat(params);
    const newParams = {
      ..._params,
      fileName : '回单审核通过率',
      limit : 400,
      offset : 0
    };
    routerToExportPage(sendTransportBoardTransportAuditRateExcelPost, newParams);
    // sendTransportBoardTransportAuditRateExcelPost(newParams).then(()=>routerToExportPage())
    // window.open(getUrl(`${window.envConfig.baseUrl}/v1/transportBoard/transportAuditRate/excel?fileName=回单审核通过率&limit=400&offset=0`, _params))
  }

  getDriverActivityExcel = (params) => {
    const _params = this.timeFormat(params);
    const newParams = {
      ..._params,
      fileName : '司机活跃度',
      limit : 400,
      offset : 0
    };
    routerToExportPage(sendTransportBoardDriverActivityExcelPost, newParams);
    // sendTransportBoardDriverActivityExcelPost(newParams).then(()=>routerToExportPage())
    // window.open(getUrl(`${window.envConfig.baseUrl}/v1/transportBoard/driverActivity/excel?fileName=司机活跃度&limit=400&offset=0`, _params))
  }

  searchTableList = () => (
    <SearchBar autoRequest={false} projectData={this.state.projectData} getData={this.getTransportData} resetPage={() => { this.setState({ nowPage1:1 }); }} getExcel={this.getExcel} />
  )

  _searchTableList = () => (
    <SearchBar autoRequest={false} projectData={this.state.projectData} getData={this.getAuditRate} resetPage={() => { this.setState({ nowPage2:1 }); }} getExcel={this.getAuditRateExcel} />
  )

  handleChange = (_value) => {
    if (!_value || !_value[0]) {
      this.setState({
        consignmentDate: undefined
      });
      return;
    }
    const value = cloneDeep(_value);
    const [a, b] = value;
    const long = b.diff(a, 'years', true);
    if (long > 1) {
      this.setState({
        consignmentDate: undefined
      });
      return message.error('选择时间跨度不得超过1年');
    }
    value[0] = value[0].startOf('week');
    value[1] = value[1].endOf('week');
    this.setState({
      consignmentDate: value
    });
  }

  _handleChange = (_value) => {
    if (!_value || !_value[0]) {
      this.setState({
        platDate: undefined
      });
      return;
    }
    const value = cloneDeep(_value);
    const [a, b] = value;
    const long = b.diff(a, 'years', true);
    if (long > 1) {
      this.setState({
        platDate: undefined
      });
      return message.error('选择时间跨度不得超过1年');
    }
    value[0] = value[0].startOf('week');
    value[1] = value[1].endOf('week');
    this.setState({
      platDate: value
    });
  }

  onSelectConsignment = (value) => {
    this.setState({
      organizationId: value
    });
  }

  onSelectProject2 = (value) => {
    this.setState({
      projectId2: value
    });
  }

  onSelectProject = (value) => {
    this.setState({
      projectId: value
    });
  }

  searchOwnerPayTimeData = () => {
    const { consignmentDate, organizationId, projectId2 } = this.state;
    const createDateStart = consignmentDate && consignmentDate.length
      ? consignmentDate[0].format('YYYY/MM/DD HH:mm:ss')
      : moment().startOf('day').format('YYYY/MM/DD HH:mm:ss');
    const createDateEnd = consignmentDate && consignmentDate.length
      ? consignmentDate[1].format('YYYY/MM/DD HH:mm:ss')
      : moment().endOf('day').format('YYYY/MM/DD HH:mm:ss');
    getOwnerPayTime({
      projectId:projectId2,
      organizationId,
      createDateStart,
      createDateEnd
    })
      .then((_ownerPayTimeData) => {
        const { items: ownerPayTimeData } = _ownerPayTimeData;
        this.setState({
          ownerPayTimeData
        });
      });
  }

  searchPlatPayTimeData = () => {
    const { platDate, projectId } = this.state;
    const createDateStart = platDate && platDate.length
      ? platDate[0].format('YYYY/MM/DD HH:mm:ss')
      : moment().startOf('day').format('YYYY/MM/DD HH:mm:ss');
    const createDateEnd = platDate && platDate.length
      ? platDate[1].format('YYYY/MM/DD HH:mm:ss')
      : moment().endOf('day').format('YYYY/MM/DD HH:mm:ss');
    getPlatPayTime({
      projectId,
      createDateStart,
      createDateEnd
    })
      .then((_platPayTimeData) => {
        const { items: platPayTimeData } = _platPayTimeData;
        this.setState({
          platPayTimeData
        });
      });
  }

  renderTooltip = (title, timeWord) => ({
    title: '',
    name: title,
    value: timeWord
  })

  _renderTooltip = (number) => ({
    name: '司机活跃度',
    value: number
  })

  getOwnerPayTimeExcel = () => {
    const { consignmentDate, organizationId } = this.state;
    const createDateStart = consignmentDate && consignmentDate.length
      ? consignmentDate[0].format('YYYY/MM/DD HH:mm:ss')
      : moment().startOf('day').format('YYYY/MM/DD HH:mm:ss');
    const createDateEnd = consignmentDate && consignmentDate.length
      ? consignmentDate[1].format('YYYY/MM/DD HH:mm:ss')
      : moment().endOf('day').format('YYYY/MM/DD HH:mm:ss');

    const params = {
      organizationId,
      createDateStart,
      createDateEnd,
      fileName : '货主贷款时效'
    };

    routerToExportPage(sendTransportBoardGetOwnerPayTimeExcelPost, params);
    // sendTransportBoardGetOwnerPayTimeExcelPost(params).then(()=>routerToExportPage())
    // window.open(getUrl(`${window.envConfig.baseUrl}/v1/transportBoard/getOwnerPayTime/excel?fileName=货主付款时效`, { organizationId, createDateStart, createDateEnd }))
  }

  getPlatPayTimeExcel = () => {
    const { platDate, projectId } = this.state;
    const createDateStart = platDate && platDate.length
      ? platDate[0].format('YYYY/MM/DD HH:mm:ss')
      : moment().startOf('day').format('YYYY/MM/DD HH:mm:ss');
    const createDateEnd = platDate && platDate.length
      ? platDate[1].format('YYYY/MM/DD HH:mm:ss')
      : moment().endOf('day').format('YYYY/MM/DD HH:mm:ss');

    const params = {
      projectId,
      createDateStart,
      createDateEnd,
      fileName : '平台付款时效'
    };
    routerToExportPage(sendTransportBoardGetPlatPayTimeExcelPost, params);
    // sendTransportBoardGetPlatPayTimeExcelPost(params).then(()=>routerToExportPage())
    // window.open(getUrl(`${window.envConfig.baseUrl}/v1/transportBoard/getPlatPayTime/excel?fileName=平台付款时效`, { projectId, createDateStart, createDateEnd }))
  }

  onChange = (pagination) => {
    const { pageSize, current } = pagination;
    this.setState({
      nowPage1:current,
      pageSize1:pageSize
    });
  }

  _onChange = (pagination) => {
    const { pageSize, current } = pagination;
    this.setState({
      nowPage2:current,
      pageSize2:pageSize
    });
  }

  render () {
    const { data, driverActivityData, ownerPayTimeData, platPayTimeData, auditRateData, consignmentData = [], projectData = [], ready, platDate, consignmentDate, nowPage1, pageSize1, nowPage2, pageSize2 } = this.state;
    return (
      <Spin tip='数据加载中...' delay={500} size='large' spinning={!ready}>
        <h3 style={{ marginTop: '25px', fontSize: '18px', fontWeight: 'bold' }}>
          统计运单数
          <Popover
            placement="rightTop"
            content={
              <div styleName='tipsBlock'>
                <p>有效运单节点：已接单、已完成、待提货、运输中、已到站、托运待审、承运待审、运单异常、提货待审、托运审核已拒绝、承运审核已拒绝</p>
                <p>无效运单节点：未接单、司机拒绝、已取消、接单待确认、提货已拒绝</p>
              </div>
            }
          >
            <Icon styleName='questionIcon' type="question-circle-o" />
          </Popover>
        </h3>
        {ready && <Table bordered rowKey="selectedDate" pagination={{ current: nowPage1, pageSize: pageSize1 }} onChange={this.onChange} renderCommonOperate={this.searchTableList} schema={this.tableSchema} dataSource={data} />}
        <h3 style={{ marginTop: '25px', fontSize: '18px', fontWeight: 'bold' }}>
          货主付款时效
          <Popover
            placement="rightTop"
            content="指在一定周期内，某货主从运单审核完成到支付运费的平均时间"
          >
            <Icon styleName='questionIcon' type="question-circle-o" />
          </Popover>
        </h3>
        <span style={{ marginRight: '15px' }}>查询日期:</span>
        <RangePicker
          placeholder={['起始周', '结束周']}
          format={weekFormat}
          mode={['date', 'date']}
          onChange={this.handleChange}
          // value={consignmentDate}
        />
        <span style={{ margin: '0 15px' }}>货主:</span>
        <Select
          style={{ width: 200 }}
          placeholder="选择货主"
          onChange={this.onSelectConsignment}
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {consignmentData.map(item => <Select.Option key={item.organizationId} value={item.organizationId}>{item.organizationName}</Select.Option>)}
        </Select>
        <span style={{ margin: '0 15px' }}>项目:</span>
        <Select
          style={{ width: 200 }}
          placeholder="选择项目"
          onChange={this.onSelectProject2}
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {projectData.map(item => <Select.Option key={item.projectId} value={item.projectId}>{item.projectName}</Select.Option>)}
        </Select>
        <Button type='primary' style={{ marginLeft: '10px' }} onClick={this.searchOwnerPayTimeData}>查询</Button>
        <Button style={{ marginLeft: '10px' }} onClick={this.getOwnerPayTimeExcel}>导出Excel</Button>
        <Histogram data={ownerPayTimeData} xAxisName='货主' yAxisName='平均时效(h)' xAxisKey='organizationName' yAxisKey='hours' tooltip={['organizationName*timeWord', this.renderTooltip]} showTitle={false} />
        <h3 style={{ marginTop: '25px', fontSize: '18px', fontWeight: 'bold' }}>
          平台付款时效
          <Popover
            placement="rightTop"
            content="指在一定周期内，某项目从运单审核完成到司机收到运费的平均时间"
          >
            <Icon styleName='questionIcon' type="question-circle-o" />
          </Popover>
        </h3>
        <span style={{ marginRight: '15px' }}>查询日期:</span>
        <RangePicker
          placeholder={['起始周', '结束周']}
          format={weekFormat}
          mode={['date', 'date']}
          onChange={this._handleChange}
          // value={platDate}
        />
        <span style={{ margin: '0 15px' }}>项目:</span>
        <Select
          style={{ width: 200 }}
          placeholder="选择项目"
          onChange={this.onSelectProject}
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {projectData.map(item => <Select.Option key={item.projectId} value={item.projectId}>{item.projectName}</Select.Option>)}
        </Select>
        <Button type='primary' style={{ marginLeft: '10px' }} onClick={this.searchPlatPayTimeData}>查询</Button>
        <Button style={{ marginLeft: '10px' }} onClick={this.getPlatPayTimeExcel}>导出Excel</Button>
        <Histogram data={platPayTimeData} xAxisName='项目' yAxisName='平均时效(h)' xAxisKey='projectName' yAxisKey='hours' tooltip={['projectName*timeWord', this.renderTooltip]} showTitle={false} />
        <h3 style={{ marginTop: '25px', fontSize: '18px', fontWeight: 'bold' }}>
          回单审核通过率
          <Popover
            placement="rightTop"
            content={
              <div styleName='tipsBlock'>
                <p>指在一定周期内，手动审核的回单通过率。</p>
                <p>首次审核通过率=首次通过数/周期内通过审核运单总数*100%</p>
                <p>多次审核通过率=(周期内通过审核运单总数-首次通过数)/周期内通过审核运单总数*100%</p>
              </div>
            }
          >
            <Icon styleName='questionIcon' type="question-circle-o" />
          </Popover>
        </h3>
        <Table bordered rowKey="selectedDate" pagination={{ current: nowPage2, pageSize: pageSize2 }} onChange={this._onChange} renderCommonOperate={this._searchTableList} schema={this.auditRateSchema} dataSource={auditRateData} />
        <h3 style={{ marginTop: '25px', fontSize: '18px', fontWeight: 'bold' }}>
          司机活跃度
          <Popover
            placement="rightTop"
            content="指在一定周期内，通过司机接单时间节点统计的去重司机人数。(去重: 相同司机只计算一次)"
          >
            <Icon styleName='questionIcon' type="question-circle-o" />
          </Popover>
        </h3>
        <SearchBar autoRequest={false} getData={this.getDriverActivity} getExcel={this.getDriverActivityExcel} />
        <Histogram data={driverActivityData} xAxisName='日期' yAxisName='司机人数' xAxisKey='formatDate' yAxisKey='number' tooltip={['number', this._renderTooltip]} />
      </Spin>
    );
  }
}

export default TransportData;
