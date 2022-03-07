import React, { Component } from 'react';
import { Row, Col, Icon, Button, notification, Spin } from 'antd';
import moment from 'moment';
import router from 'umi/router';
import { SchemaForm, Item } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../components/debounce-form-button';
import Table from '../../../components/table/table';
import { GOOD_UNIT_CN } from '../../../constants/project/project';
import { getSupplementOrderStatus } from '../../../services/project';
import {
  updateSupDetailList,
  getSupplementDetails,
  sendTransportExcelPost,
} from "../../../services/apiService";
import UploadBox from '../../../components/upload-box/upload-box';
import imagePicture from '../../../assets/image.png';
import UploadFile from '../../../components/upload/upload-file';
import TableContainer from '../../../components/table/table-container';
import { forOwn, translatePageType, reverse, routerToExportPage } from '../../../utils/utils';
import '@gem-mine/antd-schema-form/lib/fields';
import style from '../styles.less';

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

@TableContainer({ supplementDetailStatus: '4' })
class BatchAddPicture extends Component {

  state = {
    imageList: [],
    nowPage: 1,
    pageSize: 10,
    toggle: false,
    ready:false,
    listData:{}
  }

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
        width:'100px'
      },
      {
        title: '运单号',
        dataIndex: 'transportNo',
        width: '220px',
        render:(text) =>{
          if (!text) return '--';
          return text;
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
            <UploadFile renderMode='wordImg' saveIntoBusiness onChange={(dentryid) =>this.upLoadOnchange(dentryid, record.supplementDetailId, 'arriveDentryid')} value={text || undefined} labelUpload='上传到站图片' />
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
          const { transportBill='' } = businessTypeEntity || {};
          const needPictures = transportBill.split(',');
          const check = needPictures.indexOf('1') > -1;
          if (!check) return '';
          return (
            <UploadFile renderMode='wordImg' saveIntoBusiness onChange={(dentryid) =>this.upLoadOnchange(dentryid, record.supplementDetailId, 'deliveryDentryid')} value={text || undefined} labelUpload='上传提货图片' />
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
          const { transportBill='' } = businessTypeEntity || {};
          const needPictures = transportBill.split(',');
          const check = needPictures.indexOf('2') > -1;
          if (!check) return '';
          return (
            <UploadFile renderMode='wordImg' saveIntoBusiness onChange={(dentryid) =>this.upLoadOnchange(dentryid, record.supplementDetailId, 'weighDentryid')} value={text || undefined} labelUpload='上传过磅图片' />
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
          const { transportBill='' } = businessTypeEntity || {};
          const needPictures = transportBill.split(',');
          const check = needPictures.indexOf('3') > -1;
          if (!check) return '';
          return (
            <UploadFile renderMode='wordImg' saveIntoBusiness onChange={(dentryid) =>this.upLoadOnchange(dentryid, record.supplementDetailId, 'receivingDentryid')} value={text || undefined} labelUpload='上传签收图片' />
          );
        },
        fixed: 'right'
      }
    ],
    operations: () => {
      const detail = {
        title: '详情',
        onClick: (record) => { router.push(`detail?transportId=${record.transportId}`); }
      };
      return [detail];
    }
  }

  searchSchema = {
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

  componentDidMount () {
    const { filter } = this.props;
    getSupplementDetails({ ...filter, limit:undefined, offset:undefined })
      .then((data) => {
        this.alldata = data.items;
        this.setState({
          listData: {
            items:data.items.slice(0, 10),
            count:data.count
          },
          ready:true
        });
      });
  }

  onImageChange = ({ fileList }) => {
    const _fileList = fileList.map(item => item.originFileObj || item);
    this.setState({
      imageList:_fileList,
    });
  }

  changeToggle = () => {
    const { toggle } = this.state;
    this.setState({
      toggle: !toggle
    });
  }

  pickUpListData = (data) => {
    const idList = data.items.map(item => item.supplementDetailId);
    const items = this.alldata.reduce((list, item) => {
      const check = idList.indexOf(item.supplementDetailId) > -1;
      if (check) {
        return [...list, item];
      }
      return list;
    }, []);
    return {
      count:data.count,
      items
    };
  }

  handleSearchButtonClick = (value) => {
    const params = this.formatSearchKey(value);
    const newParams = {};
    forOwn(params, (value, key) => {
      if (value || value === 0) newParams[key] = value;
    });
    const { pageSize } = this.state;
    const filter = this.props.setFilter({ limit:pageSize, offset: 0 });
    this.searchKey = newParams;
    getSupplementDetails({ ...filter, ...newParams })
      .then((data) => {
        const listData = this.pickUpListData(data);
        this.setState({
          nowPage: 1,
          listData
        });
      });
  }



  handleResetButtonClick = () => {
    this.setState({
      nowPage: 1,
      pageSize: 10
    });
    this.searchKey = undefined;
    this.checkedTransports = [];
    this.props.resetFilter();
    this.setState({
      listData:this.alldata
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
    // if (idListL) {
    //   url = getUrl(`${window.envConfig.baseUrl}/v1/transports/excel?fileName=运单列表&accessToken=${this.accessToken}&organizationType=${this.organizationType}&organizationId=${this.organizationId}&idList=${idListL}&isSupplement=true`, params)
    // }

    // sendTransportExcelPost()
    // url = getUrl(`${window.envConfig.baseUrl}/v1/transports/excel?fileName=运单列表&accessToken=${this.accessToken}&organizationType=${this.organizationType}&organizationId=${this.organizationId}&isSupplement=true`, params)
    // window.open(url)
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

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    const newParams = this.searchKey? { ...newFilter, ...this.searchKey }: newFilter;
    getSupplementDetails(newParams)
      .then((data) => {
        const listData = this.pickUpListData(data);
        this.setState({
          listData
        });
      });
  }

  upLoadOnchange = (dentryid, supplementDetailId, type) => {
    if (!dentryid || !dentryid?.length) return;
    const { listData:{ items, count } } = this.state;
    const _items = items.map(item => {
      if (item.supplementDetailId === supplementDetailId) {
        return {
          ...item,
          [type]:dentryid[0]
        };
      }
      return item;
    });
    this.alldata.forEach(item => {
      if (item.supplementDetailId === supplementDetailId) {
        item[type] = dentryid[0];
        item.dirty = true;
      }
    });
    this.setState({
      listData: {
        items:_items,
        count
      }
    });
  }

  formatImageToTransport = (transports=[]) => {
    const { imageList } = this.state;
    const imageKeyList = reverse(imageList.map(item => item._name));
    const _transports = transports.map(item => {
      const { transportNo, dirty, businessTypeEntity } = item;
      const { transportBill='' } = businessTypeEntity || {};
      const needPictures = transportBill.split(',');
      // 列表内 _KEY_后的时间戳
      const key1 = imageKeyList.find(_item => _item.indexOf(`TH${transportNo}`) > -1);
      const indexDelivery1 = (key1 || '').substring((key1 || '').lastIndexOf('_') + 1).split('.')[0] || 0;
      // item内 _KEY_后的时间戳
      const indexDelivery2 = (item.deliveryDentryid || '').substring((item.deliveryDentryid || '').lastIndexOf('_') + 1).split('.')[0] || 0;
      const deliveryDentryid = indexDelivery1 < indexDelivery2 ? item.deliveryDentryid : key1;
      const key2 = imageKeyList.find(_item => _item.indexOf(`GB${transportNo}`) > -1);
      const indexWeigh1 = (key2 || '').substring((key2 || '').lastIndexOf('_') + 1).split('.')[0] || 0;
      // item内 _KEY_后的时间戳
      const indexWeigh2 = (item.weighDentryid || '').substring((item.weighDentryid || '').lastIndexOf('_') + 1).split('.')[0] || 0;
      const weighDentryid = indexWeigh1 < indexWeigh2 ? item.weighDentryid : key2;
      // 列表内 _KEY_后的时间戳
      const key3 = imageKeyList.find(_item => _item.indexOf(`QS${transportNo}`) > -1);
      const indexReceiving1 = (key3 || '').substring((key3 || '').lastIndexOf('_') + 1).split('.')[0] || 0;
      // item内 _KEY_后的时间戳
      const indexReceiving2 = (item.receivingDentryid || '').substring((item.receivingDentryid || '').lastIndexOf('_') + 1).split('.')[0] || 0;
      const receivingDentryid = indexReceiving1 < indexReceiving2 ? item.receivingDentryid : key3;
      // 到站图片
      const key4 = imageKeyList.find(_item => _item.indexOf(`DZ${transportNo}`) > -1);
      const indexArrive1 = (key4 || '').substring((key4 || '').lastIndexOf('_') + 1).split('.')[0] || 0;
      const indexArrive2 = (item.arriveDentryid || '').substring((item.arriveDentryid || '').lastIndexOf('_') + 1).split('.')[0] || 0;
      const arriveDentryid = indexArrive1 < indexArrive2 ? item.arriveDentryid : key4;
      return {
        ...item,
        deliveryDentryid:needPictures.indexOf('1') > -1? deliveryDentryid : undefined,
        weighDentryid:needPictures.indexOf('2') > -1? weighDentryid: undefined,
        receivingDentryid:needPictures.indexOf('3') > -1? receivingDentryid: undefined,
        arriveDentryid:needPictures.indexOf('4') > -1? arriveDentryid: undefined,
        dirty:dirty || (key1 && needPictures.indexOf('1') > -1) || (key2 && needPictures.indexOf('2') > -1) || (key3 && needPictures.indexOf('3') > -1) || (key4 && needPictures.indexOf('4') > -1)
      };
    });
    return _transports;
  }

  refreshTransport = () => {
    console.time();
    const transports = this.formatImageToTransport(this.alldata);
    this.alldata = transports;
    const { listData } = this.state;
    const newListData = this.pickUpListData(listData);
    console.timeEnd();
    this.setState({
      listData: newListData
    });
  }

  submitImage = () => {
    const data = this.alldata.filter(item => item.dirty);
    const supplementDetailReqs = data.map(item => ({
      supplementDetailId:item.supplementDetailId,
      deliveryDentryid:item.deliveryDentryid,
      weighDentryid:item.weighDentryid,
      receivingDentryid:item.receivingDentryid,
      arriveDentryid:item.arriveDentryid
    }));
    updateSupDetailList({ supplementDetailReqs, commitStatus:1 })
      .then(() => {
        notification.success({
          message: '补单成功',
          description: '提交补单成功'
        });
        router.goBack();
      });
  }

  render () {
    const { toggle, listData, nowPage, pageSize, ready } = this.state;
    return (
      <>
        <Spin tip='补单数据加载中...' delay={500} size='large' spinning={!ready}>
          <SchemaForm
            className='bdRecordListSearchList'
            layout="inline"
            {...layout}
            schema={this.searchSchema}
          >
            <div className={!toggle? 'searchList': 'searchList auto'}>
              <Item field="projectName" />
              <Item field="receivingName" />
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
            </div>
          </SchemaForm>
          <Row>
            <Col push={6} span={12}>
              <UploadBox accept='image/*' onChange={this.onImageChange} className={style.box_body}>
                <div style={{ width:'30%' }}>
                  <img src={imagePicture} alt='' height={60} />
                  <div>点击或拖入文件</div>
                </div>
                <div style={{ width:'70%', textAlign:'left', display:'flex', flexDirection:'column' }}>
                  <p style={{ lineHeight:'25px' }}>说明：拖拽或批量选择单据图片上传</p>
                  <p style={{ lineHeight:'25px' }}>单据图片的命名格式为：</p>
                  <p style={{ lineHeight:'25px' }}>到站单：DZ+运单号，如DZ20191013000018-1</p>
                  <p style={{ lineHeight:'25px' }}>提货单：TH+运单号，如TH20191013000018-1</p>
                  <p style={{ lineHeight:'25px' }}>过磅单：GB+运单号，如GB20191013000018-1</p>
                  <p style={{ lineHeight:'25px' }}>签收单：QS+运单号，如QS20191013000018-1</p>
                </div>
              </UploadBox>
            </Col>
          </Row>
          <div style={{ textAlign:'right' }}>
            <Button style={{ marginTop:'15px', marginLeft:'10px' }} onClick={this.refreshTransport}>更新图片</Button>
          </div>
          <Table rowKey="supplementDetailId" pagination={{ current :nowPage, pageSize }} onChange={this.onChange} schema={this.schema} dataSource={listData} />
          <div style={{ textAlign:'right' }}>
            <Button style={{ marginTop:'15px', marginLeft:'10px' }} type='primary' onClick={this.submitImage}>提交补单</Button>
          </div>
        </Spin>
      </>
    );
  }
}

export default BatchAddPicture;
