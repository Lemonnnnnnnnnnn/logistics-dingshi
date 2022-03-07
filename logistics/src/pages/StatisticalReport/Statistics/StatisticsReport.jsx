import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../components/DebounceFormButton';
import Table from '../../../components/Table/Table';
import { pick, translatePageType, omit, routerToExportPage, getLocal } from '../../../utils/utils';
import { getUserInfo } from '../../../services/user';
import { getTransportStatus } from '../../../services/project';
import { TRANSPORT_STATUS_OPTIONS, SEPARATE_TRANSPORT_STAUTS } from '../../../constants/project/project';
import statisticsModel from '../../../models/statistics';
import { sendConsignmentreportExcelPost } from "../../../services/apiService";
import SearchForm from '../../../components/Table/SearchForm2';
import TableContainer from '../../../components/Table/TableContainer';
import '@gem-mine/antd-schema-form/lib/fields';

const { actions: { getReport } } = statisticsModel;

function mapStateToProps (state) {
  return {
    commonStore: state.commonStore,
    report: pick(state.report, ['items', 'count']),
  };
}

@connect(mapStateToProps, { getReport })
@TableContainer({})
export default class StatisticsReport extends Component{
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state={
    nowPage:1,
    pageSize:10,
    ready:false
  }

  accessToken = getUserInfo().accessToken

  organizationType = getUserInfo().organizationType

  organizationId = getUserInfo().organizationId

  schema = {
    variable: true,
    minWidth: 2400,
    minHeight: 400,
    columns: [
      {
        title: '项目名称',
        dataIndex: 'projectName',
        fixed: 'left',
        width: '202px',
        render: (text) => <div title={text} className="test-ellipsis" style={{ display:'inline-block', width: '170px' }}>{text}</div>
      },
      {
        title: '运单状态',
        dataIndex: 'transportStatus',
        width:'132px',
        render:(text, record)=>{
          if (!record.transportNo){
            return '--';
          }
          const statusArr = getTransportStatus(record);
          return (
            <>
              {statusArr.map((item, index) =>
                <span key={index} style={{ display:'inline-block', width: '100px', color: item.color }}>
                  {item.word}
                </span>
              )}
            </>
          );
        },
        fixed:'left'
      },
      {
        title: '创建日期',
        dataIndex: 'createTime',
        width: 182,
        render:date=>{
          if (date){
            return <div style={{ display:'inline-block', width: '150px' }}>{moment(date).format('YYYY/MM/DD')}</div>;
          }
          return <div style={{ display:'inline-block', width: '150px' }}>--</div>;
        }
      },
      {
        title: '预约单号',
        dataIndex: 'prebookingNo',
        width:'162px',
        render:(text) => <div style={{ display:'inline-block', width: '130px' }}>{text || '--'}</div>
      },
      {
        title: '运单号',
        dataIndex: 'transportNo',
        width:'202px',
        render:(text) => <div style={{ display:'inline-block', width: '170px' }}>{text || '--'}</div>
      },
      {
        title: '承运方',
        dataIndex: 'shipmentName',
        width: 232,
        render:(text) => <div title={text} style={{ display:'inline-block', width: '200px' }}>{text || '--'}</div>
      },
      {
        title: '货品名称',
        dataIndex: 'goodsString',
        width: 212,
        render: (text, record) => <div title={record.goodsName? `${record.categoryName}-${record.goodsName}`: ''} style={{ display:'inline-block', width: '180px' }}>{record.goodsName? `${record.categoryName}-${record.goodsName}`: '--'}</div>
      },
      {
        title: '规格型号',
        dataIndex: 'specificationType',
        width: 132,
        render: (text) => <div title={text} style={{ display:'inline-block', width: '100px' }}>{text || '--'}</div>
      },
      {
        title: '包装',
        width: 132,
        dataIndex: 'packagingMethodCN',
        render: (text) => <div title={text} style={{ display:'inline-block', width: '100px' }}>{text || '--'}</div>
      },
      {
        title: '提货点',
        dataIndex: 'deliveryName',
        width: 182,
        render: (text) => <div title={text} style={{ display:'inline-block', width: '150px' }}>{text || '--'}</div>
      },
      {
        title: '卸货点',
        dataIndex: 'receivingName',
        width: 182,
        render:(text)=> <div title={text} style={{ display:'inline-block', width: '150px' }}>{text || '--'}</div>
      },
      {
        title: '计划数量',
        dataIndex: 'goodsNum',
        width: 132,
        render:(text, record)=> <div title={text? `${text}${record.goodsUnitCN}`: ''} style={{ display:'inline-block', width: '100px' }}>{text? `${text}${record.goodsUnitCN}`: '--'}</div>,
      },
      {
        title: '提货数量',
        dataIndex: 'deliveryNum',
        width: 132,
        render:(text, record)=> <div title={text? `${text}${record.deliveryUnitCN}`: ''} style={{ display:'inline-block', width: '100px' }}>{text? `${text}${record.deliveryUnitCN}`: '--'}</div>,
      },
      {
        title: '卸货数量',
        dataIndex: 'receivingNum',
        render:(text, record)=>{
          if (text){
            return `${text}${record.receivingUnitCN}`;
          }
          return '--';
        },
      }
    ],
  }

  searchSchema = {
    projectName: {
      label: '项目名称',
      placeholder: '请输入项目名称',
      component: 'input'
    },
    transportNo: {
      label: '运单号',
      placeholder: '请输入运单号',
      component: 'input'
    },
    shipmentOrganizationName:{
      label: '承运方',
      placeholder: '请输入承运方',
      component: 'input'
    },
    createTime: {
      label: '发布日期',
      component: 'rangePicker',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return { };
        }
      }),
      format: {
        input: (value) => {
          if (Array.isArray(value)) {
            return value.map(item => moment(item));
          }
          return value;
        },
        output: (value) => value
      },
    },
    status: {
      label: '状态',
      placeholder: '请选择运单状态',
      component: 'select',
      mode:'multiple',
      options: TRANSPORT_STATUS_OPTIONS.map(item => ({
        key: item.key,
        value: item.value,
        label: item.title
      }))
    },
  }

  searchTableList = () =>{
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        xl: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        xl: { span: 18 }
      }
    };
    return (
      <SearchForm layout="inline" {...layout} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
        <Item field="status" />
        <Item field="projectName" />
        <Item field='transportNo' />
        <Item field='shipmentOrganizationName' />
        <Item field="createTime" />
        <DebounceFormButton label="查询" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="重置" className="mr-10" onClick={this.handleResetBtnClick} />
        <DebounceFormButton label="导出excel" type="primary" onClick={this.handleExportExcelBtnClick} />
      </SearchForm>
    );
  }

  handleSearchBtnClick = value => {
    this.setState({
      nowPage: 1
    });
    const { projectName, createTime, status } = value;
    const createDateStart =  createTime && createTime.length ? moment(createTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd =  createTime && createTime.length ? moment(createTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;

    let _status;
    if (status){
      if (status.length){
        _status =  { transportImmediateStatus : status.join(',') };
      } else {
        _status =  { transportImmediateStatus : undefined };
      }
    }

    const resetStatus={
      transportStatus:undefined,
      processStatus:undefined,
      exceptionStatus:undefined,
      shipmentReceiptStatus:undefined,
      consignmentReceiptStatus:undefined,
      iseffectiveStatus:undefined,
      consignmentRejectStatus:undefined,
      // status : undefined
    };
    const newFilter = this.props.setFilter({ ...this.props.filter, createDateStart, createDateEnd, offset: 0, projectName, ...resetStatus, ..._status });
    this.props.getReport(omit(newFilter, 'createTime'));
  }

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({});
    this.setState({
      nowPage:1,
      pageSize:10
    });
    this.props.getReport(newFilter);
  }

  handleExportExcelBtnClick = () => {
    const { projectName, createTime, status } = this.props.filter;
    let _status;
    if (status){
      if (status.length){
        _status =  { transportImmediateStatus : status.join(',') };
      } else {
        _status =  { transportImmediateStatus : undefined };
      }
    }

    const createDateStart =  createTime && createTime.length ? moment(createTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd =  createTime && createTime.length ? moment(createTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const params = { ..._status, projectName, createDateStart, createDateEnd, fileName : '发货统计', accessToken : this.accessToken, organizationType : this.organizationType, organizationId : this.organizationId };

    routerToExportPage(sendConsignmentreportExcelPost, params);
  }

  componentDidMount (){
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      createDateStart: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      createDateEnd: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: localData.tab1NowPage ? localData.tab1PageSize * ( localData.tab1NowPage - 1 ) : 0,
      limit: localData.tab1PageSize ? localData.tab1PageSize : 10,
    };
    const newFilter = this.props.setFilter({ ...params });
    this.props.getReport({ ...newFilter })
      .then(()=>{
        this.setState({
          nowPage: localData.nowPage || 1,
          pageSize: localData.pageSize || 10,
          ready:true
        });
      });
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.props.setFilter();
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        pageSize: this.state.pageSize,
        nowPage: this.state.nowPage,
      }));
    }
  }

  onChange = (pagination) =>{
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getReport({ ...newFilter });
  }

  render (){
    const { nowPage, ready, pageSize } = this.state;
    const { report } = this.props;
    return (
      <>
        {ready&&
        <Table
          schema={this.schema}
          rowKey={({ projectId, prebookingId, transportId, goodsId }) => `${projectId}-${prebookingId}-${transportId}-${goodsId}`}
          renderCommonOperate={this.searchTableList}
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          dataSource={report}
        />}
      </>
    );
  }
}
