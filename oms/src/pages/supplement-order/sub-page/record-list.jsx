import React, { Component } from 'react';
import { Icon, Badge } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import router from 'umi/router';
import CSSModules from 'react-css-modules';
import { Item } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../components/debounce-form-button';
import SearchForm from '../../../components/table/search-form2';
import Table from '../../../components/table/table';
import { sendTransportExcelPost } from '../../../services/apiService';
import TableContainer from '../../../components/table/table-container';
import { SUPPLEMENT_ORDER_STATUS, GOOD_UNIT_CN } from '../../../constants/project/project';
import { getSupplementOrderStatus } from '../../../services/project';
import { pick, forOwn, translatePageType, routerToExportPage } from '../../../utils/utils';
import model from '../../../models/supplementOrder';
import { getUserInfo } from '../../../services/user';
import chao from '@/assets/method-draw-image.svg';
import yiIcon from '@/assets/yi_icon.svg';
import styles from './record-list.less';
import '@gem-mine/antd-schema-form/lib/fields';

const { actions: { getSupplementOrder } } = model;

function mapStateToProps (state) {
  return {
    lists: pick(state.supplementOrder, ['items', 'count'])
  };
}

@TableContainer({ supplementDetailStatus: '1, 4' })
@connect(mapStateToProps, { getSupplementOrder })
@CSSModules(styles, { allowMultiple: true })
export default class RecordList extends Component{
  state = {
    nowPage: 1,
    pageSize: 10,
    toggle: false
  }

  organizationType= getUserInfo().organizationType

  organizationId= getUserInfo().organizationId

  accessToken = getUserInfo().accessToken

  checkedTransports = []

  onSelectRow = (arr) => {
    this.checkedTransports = arr;
  }

  tableRef = React.createRef()

  schema = {
    variable:true,
    minWidth: 4000,
    columns: [
      {
        title: '补单状态',
        dataIndex: 'supplementDetailStatus',
        render: (text, record) => {
          const status = getSupplementOrderStatus(record.supplementDetailStatus);
          return (
            <>
              <span style={{ color: status.color }}>
                {status.word}
              </span>
            </>
          );
        },
        width:'100px',
        fixed: 'left',
      },
      {
        title: '运单号',
        dataIndex: 'transportNo',
        fixed: 'left',
        width: '220px',
        render:(text, record) =>{
          if (!text) return '--';
          let word = <div>{text}</div>;
          if (`${record.overDue}`=== '1' ){
            word = (
              <Badge offset={[6, -5]} count={<img alt='超时' width='22' height='22' src={chao} />}>
                <div>{text}<span style={{ display: 'block', width:'50px' }} /></div>
              </Badge>
            );
          }
          if ((record.isMileageException || record.isTrailException || record.isSeriesOperate || record.modifyReceiving) && (this.organizationType === 4 || this.organizationType === 5) ){
            word = <Badge offset={[30, -5]} count={<img alt='异常' width='22' height='22' src={yiIcon} />}>{word}</Badge>;
          }
          return word;
        }
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
      },
      {
        title: '发布日期',
        dataIndex: 'releaseTime',
        render: (time) => moment(time).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '车牌号',
        dataIndex: 'carNo'
      },
      {
        title: '装车时间',
        dataIndex: 'deliveryTime',
        render:text => text?moment(text).format('YYYY-MM-DD HH:mm'):'--'
      },
      {
        title: '签收时间',
        dataIndex: 'receivingTime',
        render:text => text?moment(text).format('YYYY-MM-DD HH:mm'):'--'
      },
      {
        title: '计划量',
        dataIndex: 'goodsNum',
        render: (text, record) => <span className="test-ellipsis" key={record.goodsId}>{(record.goodsNum || 0).toFixed(3)}{GOOD_UNIT_CN[record.goodsUnit]}</span>
      },
      {
        title: '实提量',
        dataIndex: 'deliveryNum',
        render: (text, record) => <span className="test-ellipsis" key={record.goodsId}>{(record.deliveryNum || 0).toFixed(3)}{GOOD_UNIT_CN[record.goodsUnit]}</span>
      },
      {
        title: '实收量',
        dataIndex: 'receivingNum',
        render: (text, record) => <span className="test-ellipsis" key={record.goodsId}>{(record.receivingNum || 0).toFixed(3)}{GOOD_UNIT_CN[record.goodsUnit]}</span>
      },
      {
        title: '运输时长',
        dataIndex: 'transportTime',
        render:text => text || '--'
      },
      {
        title: '预计到达时间',
        dataIndex: 'predictArriveTime',
        render:text => text?moment(text).format('YYYY-MM-DD HH:mm'):'--'
      },
      {
        title: '托运方',
        dataIndex: 'consignmentOrganizationName',
      },
      {
        title: '承运方',
        dataIndex: 'shipmentName'
      },
      {
        title: '货品名称',
        dataIndex: 'goodsName',
        render: (text, record) => (<span key={record.goodsId} className="test-ellipsis" title={`${record.categoryName}-${record.goodsName}`}>{`${record.categoryName}-${record.goodsName}`}</span>)
      },
      {
        title: '提货点',
        dataIndex: 'deliveryName',
        render: (text, record) => <li key={text} className="test-ellipsis" title={`${record.deliveryName}`}>{`${record.deliveryName}`}</li>
      },
      {
        title: '卸货点',
        dataIndex: 'receivingName'
      },
      {
        title: '签收单号',
        dataIndex: 'receivingNumber',
        render:(text) => {
          if (text === null) return '--';
          return text;
        }
      },
      {
        title: '司机',
        dataIndex: 'driverUserName'
      },
      {
        title: '联系电话',
        dataIndex: 'driverPhone'
      },
      {
        title: '调度姓名',
        dataIndex: 'dispatchUserName'
      },
      {
        title: '到站图片',
        dataIndex: 'arriveDentryid',
        width: 100,
        render:(text, record) => {
          const { businessTypeEntity } = record;
          const { transportBill='' } = businessTypeEntity || {};
          const needPictures = transportBill.split(',');
          const check = needPictures.indexOf('4') > -1;
          if (!check) return '';
          return (
            <div style={{ paddingLeft: '15px' }}>
              {text ?
                <Icon style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }} type="check-circle" theme="filled" />
                :
                <Icon style={{ fontSize: '20px' }} type="check-circle" theme="filled" />
              }
            </div>
          );
        },
        fixed: 'right'
      },
      {
        title: '提货图片',
        dataIndex: 'deliveryDentryid',
        width: 100,
        render:(text, record) => {
          const { businessTypeEntity } = record;
          const { transportBill='', billPictureType = '' } = businessTypeEntity || {};
          const havePictures = (billPictureType && billPictureType.indexOf('1') > -1) || text;
          const needPictures = transportBill.split(',');
          const check = needPictures.indexOf('1') > -1;
          if (!check) return '';
          return (
            <div style={{ paddingLeft: '15px' }}>
              {havePictures ?
                <Icon style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }} type="check-circle" theme="filled" />
                :
                <Icon style={{ fontSize: '20px' }} type="check-circle" theme="filled" />
              }
            </div>
          );
        },
        fixed: 'right'
      },
      {
        title: '过磅图片',
        dataIndex: 'weighDentryid',
        width: 100,
        render:(text, record) => {
          const { businessTypeEntity } = record;
          const { transportBill='', billPictureType= '' } = businessTypeEntity || {};
          const havePictures = (billPictureType && billPictureType.indexOf('2') > -1) || text;
          const needPictures = transportBill.split(',');
          const check = needPictures.indexOf('2') > -1;
          if (!check) return '';
          return (
            <div style={{ paddingLeft: '15px' }}>
              {havePictures ?
                <Icon style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }} type="check-circle" theme="filled" />
                :
                <Icon style={{ fontSize: '20px' }} type="check-circle" theme="filled" />
              }
            </div>
          );
        },
        fixed: 'right'
      },
      {
        title: '签收图片',
        dataIndex: 'receivingDentryid',
        width: 100,
        render:(text, record) => {
          const { businessTypeEntity } = record;
          const { transportBill='', billPictureType='' } = businessTypeEntity || {};
          const havePictures = (billPictureType && billPictureType.indexOf('3') > -1) || text;
          const needPictures = transportBill.split(',');

          const check = needPictures.indexOf('3') > -1;
          if (!check) return '';
          return (
            <div style={{ paddingLeft: '15px' }}>
              {havePictures ?
                <Icon style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }} type="check-circle" theme="filled" />
                :
                <Icon style={{ fontSize: '20px' }} type="check-circle" theme="filled" />
              }
            </div>
          );
        },
        fixed: 'right'
      }
    ],
    operations: (record) => {
      const detail = {
        title: '详情',
        onClick: (record) => { router.push(`bdRecord/detail?transportId=${record.transportId}`); }
      };
      return record.supplementDetailStatus === SUPPLEMENT_ORDER_STATUS.SUCCESS? [detail]: [];
    } // 看article.jsx的事例
  }

  componentDidMount () {
    const { filter } = this.props;
    this.props.getSupplementOrder({ ...filter });
    // this.props.getSupplementOrder(filter) 测试用参数
  }

  searchSchema = {
    supplementStatus: {
      label: '补单状态',
      component: 'select',
      placeholder: '请选择补单状态',
      options:[{
        label: '补单成功',
        key: SUPPLEMENT_ORDER_STATUS.SUCCESS,
        value: SUPPLEMENT_ORDER_STATUS.SUCCESS
      }, {
        label: '图片缺失',
        key: SUPPLEMENT_ORDER_STATUS.MISSING_PICTURE,
        value: SUPPLEMENT_ORDER_STATUS.MISSING_PICTURE
      }]
    },
    transportNo: {
      label: '运单号',
      placeholder: '请输入运单号',
      component: 'input'
    },
    receivingNumber: {
      label: '签收单号',
      placeholder: '请输入签收单号',
      component: 'input'
    },
    projectName: {
      label: '项目名称',
      placeholder: '请输入项目名称',
      component: 'input'
    },
    // status: {
    //   label: '状态',
    //   placeholder: '请选择运单状态',
    //   component: 'select',
    //   options: [{
    //     key: TRANSPORT_FINAL_STATUS.COMPLETE,
    //     value: TRANSPORT_FINAL_STATUS.COMPLETE,
    //     label: '已完成'
    //   }]
    // },
    deliveryName: {
      label: '提货点',
      placeholder: '请输入提货点',
      component: 'input'
    },
    receivingName: {
      label: '卸货点',
      placeholder: '请输入卸货点',
      component: 'input'
    },
    shipmentName: {
      label: '承运方',
      placeholder: '请输入承运方',
      component: 'input'
    },
    createTime: {
      label: '发布日期',
      component: 'rangePicker'
    },
    driverUserName: {
      label: '司机姓名',
      placeholder: '请输入司机姓名',
      component: 'input'
    },
    driverPhone: {
      label: '司机电话',
      placeholder: '请输入司机电话',
      component: 'input'
    },
    carNo: {
      label: '车牌号',
      placeholder: '请输入车牌号',
      component: 'input'
    },
    deliveryTimeRange: {
      label: '装车时间',
      component: 'rangePicker'
    },
    receivingTimeRange: {
      label: '签收时间',
      component: 'rangePicker'
    },
  }

  changeToggle = () => {
    const { toggle } = this.state;
    this.setState({
      toggle: !toggle
    });
  }

  searchTableList = () => {
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

    const { toggle } = this.state;

    return (
      <SearchForm className='bdRecordListSearchList' layout="inline" {...layout} schema={this.searchSchema}>
        <div className={!toggle? 'searchList': 'searchList auto'}>
          <Item field="projectName" />
          <Item field="receivingName" />
          <Item field="supplementStatus" />
          <Item field="shipmentName" />
          <Item field="transportNo" />
          <Item field="receivingNumber" />
          {/* <Item field="status" /> */}
          <Item field="deliveryName" />
          <Item field="createTime" />
          <Item field="driverUserName" />
          <Item field="driverPhone" />
          <Item field="carNo" />
          <Item field="deliveryTimeRange" />
          <Item field="receivingTimeRange" />
        </div>
        <div onClick={this.changeToggle} className='toggle'>
          {
            !toggle?
              <span>展开 <Icon type="down" /></span>
              :
              <span>缩起 <Icon type="up" /></span>
          }
        </div>
        <div>
          <DebounceFormButton label="查询" type="primary" className="mr-10" onClick={this.handleSearchButtonClick} />
          <DebounceFormButton label="重置" className="mr-10" onClick={this.handleResetButtonClick} />
          <DebounceFormButton label="导出Excel" type="default" className="mr-10 fr" onClick={this.getTransportExcel} />
          <DebounceFormButton label="批量补图片" type="default" className="mr-10 fr" onClick={this.batchToAddPicture} />
        </div>
      </SearchForm>
    );
  }

  batchToAddPicture = () => {
    router.push('bdRecord/addPicture');
  }

  formatSearchKey = (value) => {
    const releaseStartTime = value.createTime && value.createTime.length ? value.createTime[0].set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const releaseEndTime = value.createTime && value.createTime.length ? value.createTime[1].set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const receivingStartTime = value.receivingTimeRange && value.receivingTimeRange.length ? value.receivingTimeRange[0].set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const receivingEndTime = value.receivingTimeRange && value.receivingTimeRange.length ? value.receivingTimeRange[1].set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const deliveryStartTime = value.deliveryTimeRange && value.deliveryTimeRange.length ? value.deliveryTimeRange[0].set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const deliveryEndTime = value.deliveryTimeRange && value.deliveryTimeRange.length ? value.deliveryTimeRange[1].set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const { projectName, deliveryName, receivingName, supplementStatus, transportNo, status, shipmentName, receivingNumber, driverPhone, carNo, driverUserName } = value;
    const params = {
      releaseStartTime,
      releaseEndTime,
      receivingStartTime,
      receivingEndTime,
      deliveryStartTime,
      deliveryEndTime,
      projectName,
      deliveryName,
      receivingName,
      supplementDetailStatus: supplementStatus,
      transportNo,
      status,
      shipmentName,
      receivingNumber,
      driverPhone,
      carNo,
      driverUserName
    };
    return params;
  }

  handleSearchButtonClick = (value) => {
    const params = this.formatSearchKey(value);
    const newParams = {};
    forOwn(params, (value, key) => {
      if (value || value === 0) newParams[key] = value;
    });
    const { pageSize } = this.state;
    const filter = this.props.setFilter({ nowPage: 1, offset: 0, pageSize });
    if (!newParams.supplementDetailStatus && newParams.supplementDetailStatus !== 0) newParams.supplementDetailStatus = '1';
    this.searchKey = newParams;
    this.props.getSupplementOrder({ ...filter, ...newParams }).then(() => {
      this.setState({
        nowPage: 1
      });
    });
  }

  getTransportExcel = (value) => {
    const idList = this.checkedTransports?.map(item => item.transportId).join(',') || '';
    let params = this.formatSearchKey(value);
    params.startDistributTime = params.releaseStartTime;
    params.endDistributTime = params.releaseEndTime;
    params.plateNumber = params.carNo;
    delete params.releaseStartTime;
    delete params.releaseEndTime;
    delete params.carNo;

    params = { ...params, fileName : '运单列表', accessToken : this.accessToken, organizationType :this.organizationType, organizationId :this.organizationId, isSupplement : true };

    if (idList){
      params = { ...params, idList };
    }
    routerToExportPage(sendTransportExcelPost, params);
    // sendTransportExcelPost(params).then(()=>routerToExportPage())

    // let url
    //
    // if (idListL) {
    //   url = getUrl(`${window.envConfig.baseUrl}/v1/transports/excel?fileName=运单列表&accessToken=${this.accessToken}&organizationType=${this.organizationType}&organizationId=${this.organizationId}&idList=${idListL}&isSupplement=true`, params)
    // }
    // url = getUrl(`${window.envConfig.baseUrl}/v1/transports/excel?fileName=运单列表&accessToken=${this.accessToken}&organizationType=${this.organizationType}&organizationId=${this.organizationId}&isSupplement=true`, params)
    // window.open(url)
  }

  handleResetButtonClick = () => {
    this.setState({
      nowPage: 1,
      pageSize: 10
    });
    this.searchKey = undefined;
    this.tableRef.current.resetSelectedRows();
    this.checkedTransports = [];
    const newFilter = this.props.resetFilter();
    this.props.getSupplementOrder({ ...newFilter });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    const newParams = this.searchKey? { ...newFilter, ...this.searchKey }: newFilter;
    this.props.getSupplementOrder(newParams);
  }

  getCheckboxProps = record => {
    if (record.supplementDetailStatus !== SUPPLEMENT_ORDER_STATUS.SUCCESS) return { disabled: true, style:{ display:'none' } };
  }

  render () {
    const { nowPage, pageSize } = this.state;
    const { lists } = this.props;
    return (
      <>
        <Table rowKey="supplementDetailId" ref={this.tableRef} onSelectRow={this.onSelectRow} getCheckboxProps={this.getCheckboxProps} renderCommonOperate={this.searchTableList} multipleSelect pagination={{ current :nowPage, pageSize }} onChange={this.onChange} schema={this.schema} dataSource={lists} />
      </>
    );
  }
}
