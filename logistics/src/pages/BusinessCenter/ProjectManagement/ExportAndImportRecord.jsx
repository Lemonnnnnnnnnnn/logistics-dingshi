import React, { Component } from 'react';
import { message, Tabs } from "antd";
import moment from "moment";
import { FORM_MODE } from "@gem-mine/antd-schema-form";
import Table from '@/components/Table/Table';
import { getUserInfo } from '@/services/user';
import { translatePageType, getOssImg, formatDuring } from "@/utils/utils";
import SearchForm from "@/components/Table/SearchForm2";
import DebounceFormButton from "@/components/DebounceFormButton";
import BindStore from "@/utils/BindStore";
import TableContainer from "@/components/Table/TableContainer";
import { RELATE_BUSINESS_TYPE, FILE_FORMAT, WAIT_STATUS, SUCCESS_STATUS, FAILED_STATUS, EXPIRE_STATUS } from '@/constants/export';

const { TabPane } = Tabs;

@BindStore('exportData')
@TableContainer()
export default class ExportAndImportRecord extends Component {

  // 传输类型：【0】导出；【1】导入
  exportTypeExport = 0

  exportTypeImport = 1


  organizationType = getUserInfo().organizationType

  tableRef = React.createRef()

  searchSchema = {}

  constructor(props) {
    super(props);
    this.state = {
      activeKey : 0,
      panes: [],
      current: 1,
      pageSize: 10
    };

    const { location:{ query: { routerParams } } } = this.props;
    if (routerParams){
      const { activeKey } = JSON.parse(routerParams);
      if (routerParams) {
        this.state.activeKey = activeKey;
      }
    }

    const panes = [
      { title: '导出记录', content: '', key: this.exportTypeExport }
    ];
    if (this.organizationType === 1) {
      panes.push({ title: '导入记录', content: '', key: this.exportTypeImport });
    }
    this.state.panes = panes;

    // 如果是导入，参数为true
    const tableSchema = this.getTableSchema(this.state.activeKey === this.exportTypeImport);
    this.tableSchema = { ...tableSchema };
  }

  getTableSchema = (visible) => ({
    variable: true,
    minWidth: 600,
    columns: [
      {
        title: '文件名',
        width: '100px',
        dataIndex: 'exportDataName'
      },
      {
        title: '表单名称',
        width: '100px',
        dataIndex: 'relatedBusinessType',
        render:(text)=> RELATE_BUSINESS_TYPE[text]|| '--'
      },
      {
        title: '格式',
        width: '40px',
        dataIndex: 'fileFormat',
        render : (text )=> FILE_FORMAT[text] || '--'
      },
      {
        title: '状态',
        width: '60px',
        dataIndex: 'exportDataStatus',
        render: (text, record) => {
          let exportDataStatus;
          const typeName = record.exportType === this.exportTypeImport ? '入' : '出';
          switch (record.exportDataStatus) {
            case WAIT_STATUS:
              exportDataStatus = `等待导${typeName}`;
              break;
            case SUCCESS_STATUS:
              exportDataStatus = `导${typeName}成功`;
              break;
            case FAILED_STATUS:
              exportDataStatus = `导${typeName}失败`;
              break;
            case EXPIRE_STATUS:
              exportDataStatus = '已过期';
              break;
            default:
              exportDataStatus = '';
              break;
          }
          return (
            <>
              <span>
                {exportDataStatus}
              </span>
            </>
          );
        }
      },
      {
        title: '失败原因',
        width: '100px',
        visible,
        dataIndex: 'exceptionReason'
      },
      {
        title :'导出时长',
        width : '100px',
        render:(text, record) =>{
          const { updateTime, createTime } = record;
          // const difference = moment(updateTime).diff(moment(createTime) ); // 毫秒
          const d1 = moment(updateTime);
          const d2 = moment(createTime);
          const difference = d1.diff(d2);

          return formatDuring(difference);
        }
      },
      {
        title: '创建时间',
        width: '100px',
        dataIndex: 'createTime',
        render: (time) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      }
    ],
    operations: (record) => {
      const download = {
        title: '下载',
        onClick: (record) => { this.downloadFile(record); }
      };
      if (record.exportDataStatus === SUCCESS_STATUS) {
        return [download];
      }
      return [];
      // return [download];
    }
  })

  getDataList = (params = {}) => {
    this.props.getExportData(params);
  }

  componentDidMount() {
    const { activeKey } = this.state;
    this.getDataList({
      exportType: activeKey,
      limit: 10,
      offset: 0
    });
  }

  searchTableList = (pageSize) => {
    const formLayOut = {
      labelCol:{
        xs: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 18 }
      }
    };
    return (
      <SearchForm mode={FORM_MODE.SEARCH} {...formLayOut} layout="inline" schema={this.searchSchema}>
        <DebounceFormButton label="刷新" type="primary" onClick={(value) => { this.handleSearchBtnClick(value, pageSize); }} />
        <div style={{ background: '#ECDDC2', padding: '0.5rem', marginTop: '8px', borderRadius: '2px' }}>
          <span>您导出的文件将在服务器上暂存三天，三天后会自动删除，请及时下载！</span>
          <span style={{ color : '#169BD5', fontWeight : 'bold' }}>操作项若未展示“下载”，请点击“刷新”按钮！</span>
        </div>
      </SearchForm>
    );
  }

  handleSearchBtnClick = (value, pageSize) => {
    this.setState({
      current: 0
    });
    const newFilter = this.props.setFilter({ ...value, exportType: this.state.activeKey, limit: pageSize.pageSize, offset: 0 });
    this.props.getExportData({ ...newFilter });
  }

  changeTabs = activeKey => {
    const newFilter = this.props.setFilter({
      exportType: activeKey,
      limit: 10,
      offset: 0
    });
    const tableSchema = this.getTableSchema(activeKey === this.exportTypeImport);
    this.tableSchema = { ...tableSchema };
    this.tableRef.current.resize();
    this.setState({
      activeKey,
      current: 0
    }, () => {
      const { getExportData } = this.props;
      getExportData({ ...newFilter });
    });
  }

  onChangeList = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ ...this.props.filter, exportType: this.state.activeKey, offset, limit });
    this.getDataList({ ...newFilter });
  }

  downloadFile = (record) => {
    if (!record.exportDataDentryid) return message.error('文件异常');
    const exportDataDentryidList = record.exportDataDentryid.split(',');
    exportDataDentryidList.forEach(item=>{
      window.open(getOssImg(item));
    });
  }

  render() {
    const { exportData, count } = this.props;
    const { current, pageSize, activeKey } = this.state;
    return (
      <Tabs type='card' defaultActiveKey={activeKey.toString()} onChange={activeKey => this.changeTabs(activeKey)}>
        {this.state.panes.map(pane => (
          <TabPane tab={pane.title} key={pane.key}>
            {pane.content}
            <Table schema={this.tableSchema} rowKey="exportDataId" renderCommonOperate={this.searchTableList} ref={this.tableRef} pagination={{ current, pageSize }} onChange={this.onChangeList} dataSource={{ items: exportData, count }} />
          </TabPane>
        ))}
      </Tabs>
    );
  }
}
