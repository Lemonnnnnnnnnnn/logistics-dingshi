import React from 'react';
import { Button, Modal, message, notification } from 'antd';
import { connect } from 'dva';
import { FORM_MODE, Item } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import router from 'umi/router';
import DebounceFormButton from '../../../../components/debounce-form-button';
import SearchForm from '../../../../components/table/search-form2';
import Table from '../../../../components/table/table';
import { FilterContextCustom } from '../../../../components/table/filter-context';
import { getTransportList, patchGoodsAccount, detailGoodsAccount } from '../../../../services/apiService';
import { translatePageType, getOssImg, flattenDeep, omit } from '../../../../utils/utils';
import ImageDetail from '../../../../components/image-detail';
import transportModel from '../../../../models/transports';
import { IS_EFFECTIVE_STATUS, ACCOUNT_STATUS, CONSIGNMENT_TYPE } from '../../../../constants/project/project';
import '@gem-mine/antd-schema-form/lib/fields';
import styles from './bill-info.less';

const { actions: { detailTransports } } = transportModel;

function mapStateToProps (state) {
  return {
    transportDetail: state.transports.entity,
  };
}

@connect(mapStateToProps, { detailTransports })
@FilterContextCustom
// @TableContainer()
export default class Index extends React.Component{
  state = {
    nowPage: 1,
    pageSize: 10,
    ready: false,
  }

  keywords = {}

  tableRef = React.createRef()

  onSelectRow = (arr) => {
    this.checkedTransports = arr;
  }

  componentDidMount () {
    const { location: { query }, filter } = this.props;
    const { offset = 0, limit = 10 } = filter;
    this.tableSchema = {
      variable: true,
      minWidth:3000,
      columns: [
        {
          title: '运单号',
          dataIndex: 'transportNo',
          fixed: 'left',
          width: '200px'
        },
        {
          title: '合同名称',
          dataIndex: 'projectName',
        },
        {
          title: '签收单号',
          dataIndex: 'receivingNo',
          render: (text, record) => {
            if (text) return text;
            if (record.billNumber) return record.billNumber;
            return '--';
          }
        },
        {
          title: '签收时间',
          dataIndex: 'receivingTime',
          render: (text, record) => {
            const time = text||record.signTime;
            return time? moment(time).format('YYYY-MM-DD HH:mm:ss'): '--';
          },
        },
        {
          title: '提货点',
          dataIndex: 'deliveryItems',
          render: (text) => {
            const list = text.map((item, index) => <li title={`${item.deliveryName}`} className="test-ellipsis" key={index}>{item.deliveryName}</li>);
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '货品名称',
          dataIndex: 'goodsName',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => <li title={`${item.categoryName}${item.goodsName}`} className="test-ellipsis" key={index}>{`${item.categoryName}${item.goodsName}`}</li>);

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '规格型号',
          dataIndex: 'specificationType',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item.specificationType === null ? '--' : item.specificationType;
              return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '材质',
          dataIndex: 'materialQuality',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item.materialQuality === null ? '--' : item.materialQuality;
              return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '包装',
          dataIndex: 'packagingMethod',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              let word = '--';
              if (item.packagingMethod === 1) {
                word = '袋装';
              } else if (item.packagingMethod === 2) {
                word = '散装';
              }
              return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '实提量',
          dataIndex: 'deliveryNum',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item.deliveryNum === null ? '--' : `${item.deliveryNum}${item.deliveryUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '实收量',
          dataIndex: 'receivingNum',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item.receivingNum === null ? '--' : `${item.receivingNum}${item.receivingUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '单价',
          dataIndex: 'freightCost',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item?.accountModifyPriceEntities?.[0]?.freightCost?.toFixed(2)._toFixed(2) || '';
              return <li title={`${word? `${word}元`: '--'}`} className="test-ellipsis" key={index}>{`${word? `${word}元`: '--'}`}</li>;
            });
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: '卸货点',
          dataIndex: 'receivingName'
        },
        {
          title: '合计',
          dataIndex: 'totalFreight',
          render: (text, record) => `${record.accountGoodsPriceEntities?.[0]?.totalPrice?.toFixed(2)._toFixed(2) || 0} 元`,
        },
        {
          title: '司机',
          dataIndex: 'driverUserName'
        },
        {
          title: '车牌号',
          dataIndex: 'plateNumber',
          render: (text, record) => {
            if (text) return text;
            if (record.carNo) return record.carNo;
            return 'bug';
          }
        },
        {
          title: '查看',
          dataIndex: 'looking',
          render: (text, record) => (
            <>
              <a onClick={() => this.watchTransportDetail(record)} style={{ marginRight: '10px' }}>详情</a>
              <a onClick={() => this.watchReceivingSign(record)} style={{ marginRight: '10px' }}>样签</a>
              {
                record.receivingName? <a onClick={() => this.watchReceivingBills(record)} style={{ marginRight: '10px' }}>签收单</a>: false
              }
            </>
          ),
          width: '150px',
          fixed: 'right',
        }
      ],
    };
    this.searchSchema = {
      projectName: {
        label: '项目名称',
        placeholder: '请输入项目名称',
        component: 'input',
        defaultValue: query.projectName,
        disabled: true
      },
      receivingTime:{
        label: '签收日期',
        component: 'rangePicker'
      },
      transportNo: {
        label: '运单号',
        component: 'input',
        placeholder: '请输入运单号'
      },
      receivingNo :{
        label: '签收单号',
        component: 'input',
        placeholder: '请输入签收单号'
      },
      goodsName:{
        label: '货品名称',
        placeholder: '请输入货品名称',
        component: 'input'
      },
      deliveryName:{
        label: '提货点',
        placeholder: '请输入提货点',
        component: 'input'
      },
      receivingName:{
        label: '卸货点',
        placeholder: '请输入卸货点',
        component: 'input'
      },
      packagingMethod:{
        label: '包装',
        placeholder: '请选择包装方式',
        component: 'select',
        options: [{
          label: '袋装',
          key: 1,
          value: 1
        }, {
          label: '散装',
          key: 2,
          value: 2
        }]
      },
      materialQuality:{
        label: '材质',
        placeholder: '请输入材质',
        component: 'input'
      },
      specificationType:{
        label: '规格型号',
        placeholder: '请输入规格型号',
        component: 'input'
      },
      driverUserName:{
        label: '司机',
        placeholder: '请输入司机',
        component: 'input'
      },
      plateNumber:{
        label: '车牌号',
        placeholder: '请输入车牌号',
        component: 'input'
      },
    };
    this.apiField = {
      accountGoodsStatus: ACCOUNT_STATUS.DISACCOUNT,
      iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL,
      isSelectGoodsAccount:true,
      consignmentType: CONSIGNMENT_TYPE.AGENCY_DELIVERY,
      transportImmediateStatus: 4,
      isPermissonSelectAll: true
    };
    const newFilter = this.props.setFilter({
      ...this.apiField,
      projectName: query.projectName,
      projectId: query.projectId
    });

    detailGoodsAccount(query.accountGoodsId).then((data) => this.detail = data);
    getTransportList(newFilter).then(data => {
      this.setState({
        ready: true,
        nowPage: offset / limit + 1,
        pageSize: limit,
        data
      });
    });
  }

  handleSearchBtnClick = (formData) => {
    const { location: { query: { projectId, projectName } } } = this.props;
    const { pageSize } = this.state;
    this.tableRef.current.resetSelectedRows();
    this.checkedTransports = [];
    const receivingStartTime = formData.receivingTime?.[0]?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss');
    const receivingEndTime = formData.receivingTime?.[1]?.set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss');
    this.keywords = omit(receivingStartTime && receivingEndTime?{ ...this.props.filter, limit: pageSize, offset: 0, ...this.apiField, receivingStartTime, receivingEndTime }: { ...this.props.filter, limit: pageSize, offset: 0, ...this.apiField }, ['receivingTime']);
    getTransportList({ ...this.keywords, projectId, projectName }).then(data => {
      this.setState({
        nowPage: 1,
        data
      });
    });
  }

  handleResetBtnClick = () => {
    const { location: { query: { projectId, projectName } } } = this.props;
    this.tableRef.current.resetSelectedRows();
    this.checkedTransports = [];
    this.keywords = {};
    this.props.resetFilter();
    getTransportList({
      limit: 10,
      offset: 0,
      ...this.apiField,
      projectName,
      projectId
    }).then(data => {
      this.setState({
        nowPage: 1,
        pageSize: 10,
        data,
      });
    });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    const { location: { query: { projectId, projectName } } } = this.props;
    this.setState({
      nowPage:current,
      pageSize:limit
    });
    getTransportList({ ...this.apiField, ...this.keywords, offset, limit, projectId, projectName }).then(data => {
      this.setState({ data });
    });
  }

  watchTransportDetail = record => {
    if (this.props.location.pathname.indexOf('cargo') !== -1) {
      router.push(`/bill-account/cargoGoodsAccount/cargoGoodsAccountList/transportDetail?transportId=${record.transportId}`);
    } else {
      router.push(`/bill-account/consignmentGoodsAccountList/transportDetail?transportId=${record.transportId}`);
    }
  }

  watchReceivingSign = async record => {
    if (this.props.transportDetail.transportId !== record.transportId) {
      await this.props.detailTransports({ transportId: record.transportId });
    }
    this.setState({
      ReceivingSignModal: true
    });
  }

  watchReceivingBills = async record => {
    const { accountDetailId } = record;
    if (!accountDetailId && this.props.transportDetail.transportId !== record.transportId) {
      await this.props.detailTransports({ transportId: record.transportId });
    }
    this.setState({
      receivingModal: true,
      accountDetailId
    });
  }

  renderImageDetail = imageType => {
    let imageData;
    if (imageType === 'signDentry') {
      const { transportDetail: { signDentryid } } = this.props;
      imageData = [getOssImg(signDentryid)];
    } else if (imageType === 'receiving') {
      const { accountDetailId } = this.state; // 不存在
      if (!accountDetailId){
        const { transportDetail: { signItems = [] } } = this.props;
        imageData = flattenDeep(signItems.map(item=>(item.billDentryid || '').split(','))).map(item=>getOssImg(item));
      } else {
        const { accountDetailItems=[] } = this.props.goodsAccount; // goodsAccount为undefined
        const accountDetailItem = accountDetailItems.find(item=>item.accountDetailId===accountDetailId);
        imageData = (accountDetailItem.billDentryid || '').split(',').map(billDentry=>getOssImg(billDentry));
      }
    }
    return (
      imageType === 'receiving'?
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ marginTop:20 }}>
            <ImageDetail width='320' imageData={imageData} />
          </div>
          <div style={{ width: '400px' }}>
            <p className={styles.infoItem}>
              <span>签收单号:</span>
              <span>{this.props.transportDetail.signItems?.map(item => item.billNumber || '').join(',')}</span>
            </p>
            <p className={styles.infoItem}>
              <span>过磅单号:</span>
              <span>{this.props.transportDetail.signItems?.map(item => item.weighNumber || '').join(',')}</span>
            </p>
            <p className={styles.infoItem}>
              <span>签收数量:</span>
              <span>
                {this.props.transportDetail.deliveryItems?.map(item => <li key={item.goodsId}>{`${item.categoryName}-${item.goodsName} ${item.receivingNum}${item.receivingUnitCN} `}</li>)}
              </span>
            </p>
          </div>
        </div>
        :
        <ImageDetail width='424' imageData={imageData} />
    );
  }

  searchList = () => {
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
      <SearchForm layout="inline" {...layout} mode={FORM_MODE.SEARCH} schema={this.searchSchema}>
        <Item field="projectName" />
        <Item field="transportNo" />
        <Item field="receivingNo" />
        <Item field="receivingTime" />
        <Item field="goodsName" />
        <Item field="deliveryName" />
        <Item field="receivingName" />
        <Item field="packagingMethod" />
        <Item field="specificationType" />
        <Item field="materialQuality" />
        <Item field="driverUserName" />
        <Item field="plateNumber" />
        <DebounceFormButton debounce label="查询" type="primary" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="重置" style={{ marginLeft: '10px' }} onClick={this.handleResetBtnClick} />
      </SearchForm>
    );
  }

  showAddModal = () => {
    if (!this.checkedTransports || this.checkedTransports.length === 0) return message.error('请至少选择一条运单');
    const { location: { query: { projectId, accountGoodsId } } } = this.props;
    const flag = this.checkedTransports?.every(item => Number(item.projectId) === Number(projectId));
    if (!flag) return message.error('只能选择同一项目的运单');
    const hadTransports = this.detail.accountDetailItems.map(item => item.transportId);
    Modal.confirm({
      title: '是否添加运单',
      content: `您已选择${this.checkedTransports && this.checkedTransports.length}条运单，是否添加进对账单内？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        patchGoodsAccount(accountGoodsId, { transportIdList: [...hadTransports, ...this.checkedTransports.map(item => item.transportId)] }).then(() => {
          notification.success({
            message: '运单添加成功',
            description: `对账单添加运单成功`,
          });
          router.goBack();
        });
      }
    });
  }

  render () {
    const { nowPage, pageSize, ready, data, ReceivingSignModal, receivingModal } = this.state;
    return (
      ready
      &&
      <>
        <Modal
          title='样签'
          footer={null}
          width={648}
          destroyOnClose
          maskClosable={false}
          visible={ReceivingSignModal}
          onCancel={() => this.setState({ ReceivingSignModal: false })}
        >
          {ReceivingSignModal&&this.renderImageDetail('signDentry')}
        </Modal>
        <Modal
          title='签收单'
          footer={null}
          width={648}
          maskClosable={false}
          destroyOnClose
          visible={receivingModal}
          onCancel={() => this.setState({ receivingModal: false })}
        >
          {receivingModal&&this.renderImageDetail('receiving')}
        </Modal>
        <Table rowKey='transportId' multipleSelect onSelectRow={this.onSelectRow} ref={this.tableRef} dataSource={data} schema={this.tableSchema} renderCommonOperate={this.searchList} pagination={{ current :nowPage, pageSize }} onChange={this.onChange} />
        <Button size='large' style={{ marginTop: '10px', float: 'right' }} onClick={this.showAddModal} type='primary'>确认添加运单</Button>
      </>
    );
  }
}
