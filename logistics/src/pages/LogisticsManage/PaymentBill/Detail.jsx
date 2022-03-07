import React, { Component } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Button, Select, Col, Row, Descriptions, Modal, Divider } from 'antd';
import { Item, SchemaForm, FORM_MODE, FormCard } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import '@gem-mine/antd-schema-form/lib/fields';
import Authorized from '../../../utils/Authorized';
import auth from '../../../constants/authCodes';
import Table from '../../../components/Table/Table';
import ImageDetail from '../../../components/ImageDetail';
import {
  detailOrders,
  getTransportList,
  sendTransportExcelPost,
  sendOrdersDetailExcelPost
} from "../../../services/apiService";
import {
  NETWORK_ORDER_STATE,
  ORDER_INVOICE_STATUS,
  INVOICES_LIST_STATE,
} from '../../../constants/project/project';
import { classifyGoodsWeight, flattenDeep, getOssImg, translatePageType, routerToExportPage, formatMoney } from '../../../utils/utils';
import transportModel from '../../../models/transports';
import { getUserInfo } from '../../../services/user';
import WithholdingDetails from './component/withholdingDetails';
import SearchTradeRecord from './component/SearchTradeRecord';
import styles from '@/pages/BillAccount/GoodsAccount/subPage/billInfo.less';
import { accountCost, getNeedPay, getServiceCharge } from "@/utils/account";
import {
  accountTransportCost,
  getServiceCharge as getTransportServiceCharge,
  getNeedPay as getTransportNeedPay
} from "@/utils/account/transport";
import { TRANSPORT_DETAIL_ROUTER } from '@/constants/transport';

const { Option } = Select;

const {
  PAY_BILL_EXPORT_DETAIL,
} = auth;

const { actions: { detailTransports } } = transportModel;

function mapStateToProps(state) {
  const goodsAccount = state.goodsAccount.entity;
  goodsAccount.responsiblerName = goodsAccount.responsibleItems && goodsAccount.responsibleItems.map(item => item.responsibleName).join('、');
  return {
    goodsAccount,
    transportDetail: state.transports.entity,
  };
}

@connect(mapStateToProps, { detailTransports })
export default class Detail extends Component {
  state = {
    detail: null,
    more: false,
    nowPage: 1,
    pageSize: 10,
    totalFreightSum : 0,
    damageCompensationSum : 0,
    serviceChargeSum : 0,
    payedFreight: 0,
  };

  organizationType = getUserInfo().organizationType;

  organizationId = getUserInfo().organizationId;

  accessToken = getUserInfo().accessToken;



  schema = {
    orderState: {
      label: '付款单状态',
      component: 'radio',
      options: [{
        label: '部分已完成',
        key: NETWORK_ORDER_STATE.PARTIALLY_COMPLETED,
        value: NETWORK_ORDER_STATE.PARTIALLY_COMPLETED,
      }, {
        label: '处理中',
        key: NETWORK_ORDER_STATE.PROCESSING,
        value: NETWORK_ORDER_STATE.PROCESSING,
      }, {
        label: '已完成',
        key: NETWORK_ORDER_STATE.COMPLETED,
        value: NETWORK_ORDER_STATE.COMPLETED,
      }, {
        label: '已作废',
        key: NETWORK_ORDER_STATE.CANCEL,
        value: NETWORK_ORDER_STATE.CANCEL,
      }, {
        label: '未支付',
        key: NETWORK_ORDER_STATE.UNPAID,
        value: NETWORK_ORDER_STATE.UNPAID,
      }, {
        label: '支付失败',
        key: NETWORK_ORDER_STATE.FAIL,
        value: NETWORK_ORDER_STATE.FAIL,
      }],
    },
    isCreateInvoice: {
      label: '开票状态',
      component: 'radio',
      options: [{
        label: '未开票',
        value: ORDER_INVOICE_STATUS.UNCOMPLETE,
        key: ORDER_INVOICE_STATUS.UNCOMPLETE,
      }, {
        label: '已开票',
        value: ORDER_INVOICE_STATUS.COMPLETE,
        key: ORDER_INVOICE_STATUS.COMPLETE,
      }, {
        label: '开票中',
        value: ORDER_INVOICE_STATUS.PENDING,
        key: ORDER_INVOICE_STATUS.PENDING,
      }],
    },
    projectName: {
      label: '项目名称',
      component: 'input',

    },
    orderNo: {
      label: '付款单号',
      component: 'input',
    },
  };

  toProjectDetail = (id) => {
    router.push(`/buiness-center/project/projectManagement/projectDetail?projectId=${id}`);
  };

  handleBackBtnClick = () => {
    router.goBack();
  };

  componentDidMount() {
    const { location: { query: { orderId } }  } = this.props;

    detailOrders(orderId).then(detail => {
      const {  orderCreateType } = detail; // 1.承运和托运，2.承运和平台，3.平台和托运
      this.setState({
        payedFreight: detail.payedFreight,
      });
      getTransportList({
        orderId,
        limit: 10,
        offset: 0,
        selectAccountTransportNo: true,
        // transportPriceType: accountOrgType,
      }).then(res => {
        this.setState({
          transportsLists: res,
        });
      });
      this.tableSchema = {
        variable: true,
        minWidth: 2400,
        columns: [
          {
            title: '对账单号',
            dataIndex: 'accountTransportNo',
          },
          {
            title: '货品',
            dataIndex: 'accountDetailItems',
            render: (text) => {
              const tempArr = [];
              const totalGoods = flattenDeep((text || []).map(item => item.accountCorrelationCnItems));
              totalGoods?.forEach(current => {
                const index = tempArr.findIndex(item => item.goodsId === current.goodsId);
                if (index === -1) tempArr.push(current);
              });
              return (
                <ul style={{ padding: 0, margin: 0 }}>
                  {
                    tempArr.map(item => <li key={item.goodsId}>{item.categoryName || ''}-{item.goodsName || ''}</li>)
                  }
                </ul>
              );
            },
          },
          {
            title: '装车总量',
            dataIndex: 'loadingNetWeight',
            render: (text) => <div style={{ whiteSpace: 'normal', width: '400px' }}>{text || '--'}</div>,
          },
          {
            title: '卸车总量',
            dataIndex: 'unloadNetWeight',
            render: (text) => <div style={{ whiteSpace: 'normal', width: '400px' }}>{text || '--'}</div>,
          },
          {
            title: '账期',
            dataIndex: 'paymentDays',
            render: (text, record) => `${moment(record.paymentDaysStart).format('YYYY-MM-DD')}~${moment(record.paymentDaysEnd).format('YYYY-MM-DD')}`,
          },
          {
            title: '运单数',
            dataIndex: 'transportNumber',
          },
          {
            title: '总运费(元)',
            render: (text, record) => formatMoney((accountCost(record)._toFixed(2)))
          },
          {
            title: '货损赔付(元)',
            dataIndex: "damageCompensation",
            render: text => formatMoney((text || 0)._toFixed(2))
          },
          {
            title: '货主服务费（元）',
            render: (text, record) => formatMoney((getServiceCharge(record)._toFixed(2)))
          },
          {
            title: '对账单金额',
            render: (text, record) => formatMoney((getNeedPay(record)._toFixed(2)))
          },
        ],
      };

      this.transportTableSchema = {
        variable: true,
        minWidth: 2800,
        columns: [
          {
            title: '运单号',
            dataIndex: 'transportNo',
          },
          {
            title: '合同名称',
            dataIndex: 'projectName',
            width: '300px',
            render: (text, record) => (
              <div style={{ display: 'inline-block', width: '250px', whiteSpace: 'normal', breakWord: 'break-all' }}>
                <a onClick={() => this.toProjectDetail(record.projectId)}>{text}</a>
              </div>
            ),
          },
          {
            title :'支付状态',
            dataIndex: 'payStatus',
            render: (text)=> {
              const dist = {
                1 : '未支付',
                2:'部分支付',
                3 : '已支付'
              };
              return <div>{dist[text]}</div>;
            }
          },
          {
            title: '总运费（元）',
            dataIndex: 'transportCost',
            render: (text, record) => {
              const {  transportPriceEntities, accountInitiateType } = record;
              const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
              const {  driverTransportCost } = transportPriceEntity;
              if (`${orderCreateType}` === `2`) {
                return `${(driverTransportCost || 0)._toFixed(2)}元`;
              }
              return `${accountTransportCost({ ...record, transportPriceEntity })._toFixed(2)}元`;
            }
          },
          {
            title: '货主服务费（元）',
            dataIndex: 'serviceCharge',
            render: (text, record) => {
              const { accountInitiateType, transportPriceEntities, transportType } = record;
              const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};

              if (`${orderCreateType}` === `2`) return '--';
              if (transportType === 1) return '--';

              return `${getTransportServiceCharge(transportPriceEntity)._toFixed(2)}元`;

            },
          },
          {
            title: '货损赔付（元）',
            dataIndex: 'damageCompensation',
            render: (text, record) => {
              const { accountInitiateType, transportPriceEntities } = record;
              const transportConfig = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
              const { damageCompensation } = transportConfig;
              if (`${orderCreateType}` === `2`) {
                return '--';
              }
              return `${(damageCompensation || 0)._toFixed(2)}元`;
            },
          },
          {
            title: '应付账款（元）',
            dataIndex: 'receivables',
            render: (text, record) => {

              const { accountInitiateType, transportPriceEntities } = record;
              const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
              const { driverTransportCost, } = transportPriceEntity;
              const { accountInternalStatus } = detail.tranAccountItems[0];
              if (`${orderCreateType}` === `2`) return `${(driverTransportCost|| 0)._toFixed(2)}元`;

              return `${getTransportNeedPay({ transportPriceEntity, accountInternalStatus }, record)._toFixed(2)}元`;
            },
          },
          {
            title: '签收单号',
            dataIndex: 'receivingNo',
            render: (text) => text || '--',
          },
          {
            title: '提货时间',
            dataIndex: 'deliveryTime',
            render: text => text ? moment(text).format('YYYY-MM-DD HH:mm') : '--',
          },
          {
            title: '签收时间',
            dataIndex: 'receivingTime',
            render: text => text ? moment(text).format('YYYY-MM-DD HH:mm') : '--',
          },
          {
            title: '提货点',
            dataIndex: 'deliveryName',
            render: (text, record) => {
              const { deliveryItems } = record;
              const list = (deliveryItems || []).map(item => (
                <li
                  key={item.goodsId}
                  className='test-ellipsis'
                  title={`${item.deliveryName}`}
                >{`${item.deliveryName}`}
                </li>));
              return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
            },
          },
          {
            title: '卸货点',
            dataIndex: 'receivingName',
            render: (text) => text || '--',
          },
          {
            title: '货品名称',
            dataIndex: 'goodsName',
            render: (text, record) => {
              const { deliveryItems } = record;
              const list = (deliveryItems || []).map(item => (
                <li
                  key={item.goodsId}
                  className='test-ellipsis'
                  title={`${item.categoryName}-${item.goodsName}`}
                >{`${item.categoryName}-${item.goodsName}`}
                </li>));
              return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
            },
          },
          {
            title: '提货量',
            dataIndex: 'deliveryNum',
            render: (text, record) => {
              const plannedweight = classifyGoodsWeight((record.deliveryItems || []), 'goodsUnit', ['goodsId', 'goodsUnitCN', 'deliveryNum'], (summary, current) => summary.deliveryNum += current.deliveryNum);
              const renderItem = ({ goodsId, deliveryNum, goodsUnitCN }) => (
                <li
                  className='test-ellipsis'
                  key={goodsId}
                >{(deliveryNum || 0).toFixed(3)}{goodsUnitCN}
                </li>);
              return <ul style={{ width: '100px', padding: 0, margin: 0 }}>{plannedweight.map(renderItem)}</ul>;
            },
          },
          {
            title: '卸货量',
            dataIndex: 'receivingNum',
            render: (text, record) => {
              const plannedweight = classifyGoodsWeight((record.deliveryItems || []), 'goodsUnit', ['goodsId', 'goodsUnitCN', 'receivingNum'], (summary, current) => summary.receivingNum += current.receivingNum);
              const renderItem = ({ goodsId, receivingNum, goodsUnitCN }) => (
                <li
                  className='test-ellipsis'
                  key={goodsId}
                >{(receivingNum || 0).toFixed(3)}{goodsUnitCN}
                </li>);
              return <ul style={{ width: '100px', padding: 0, margin: 0 }}>{plannedweight.map(renderItem)}</ul>;
            },
          },
          {
            title: '司机',
            dataIndex: 'driverUserName',
          },
          {
            title: '车牌号',
            dataIndex: 'plateNumber',
            render: (text, record) => {
              if (text) return text;
              if (record.carNo) return record.carNo;
              return 'bug';
            },
          },
          {
            title: '发票号码',
            dataIndex: 'invoiceNo',
            render: () => detail.invoiceCorrelationEntities?.map(item => (
              <p key={item.invoiceCorrelationId} style={{ margin: 0 }}>{item.invoiceNo}</p>)) || '--',
          },
          {
            title: '付款单号',
            dataIndex: 'paymentBillNo',
            render: () => detail.orderNo,
          },
          {
            title: '对账单号',
            dataIndex: 'accountTransportNo',
            render: text => this.state.accountTransportNo || text,
          },
          {
            title: '调度姓名',
            dataIndex: 'createUserName',
          },
          {
            title: '查看',
            dataIndex: 'looking',
            render: (text, record) => (
              <>
                <a onClick={() => this.watchTransportDetail(record)} style={{ marginRight: '10px' }}>详情</a>
                <a onClick={() => this.watchReceivingSign(record)} style={{ marginRight: '10px' }}>样签</a>
                {
                  record.receivingName ?
                    <a onClick={() => this.watchReceivingBills(record)} style={{ marginRight: '10px' }}>签收单</a> : false
                }
              </>
            ),
            width: '150px',
            fixed: 'right',
          },
        ],
      };
      if (this.organizationType === 1) {
        this.transportTableSchema.columns.splice(4, 0, {
          title: '司机服务费（元）',
          dataIndex: 'driverServiceCharge',
          render: (text, record) => {
            const { transportPriceEntities } = record;
            const transportConfig = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${record.accountOrgType}`) || {};
            const { driverServiceCharge } = transportConfig;
            if (`${orderCreateType}` === `2`) {
              return '--';
            }
            return record.transportType === 1 ? '--' : `${(driverServiceCharge || 0)._toFixed(2)}元`;
          },
        });
        this.tableSchema.columns.splice(9, 0, {
          title: '司机服务费（元）',
          dataIndex: 'driverServiceCharge',
          render: text => `${orderCreateType}` === `1` ? (text || 0)._toFixed(2) : '--',
        });
      }

      // 统计费用明细金额
      const { tranAccountItems } = detail;
      let totalFreightSum = 0;
      let damageCompensationSum = 0;
      let serviceChargeSum = 0;
      tranAccountItems.forEach(item=>{
        totalFreightSum += Number(accountCost(item));
        damageCompensationSum += Number(item.damageCompensation);
        serviceChargeSum += Number(getServiceCharge(item));
      });

      this.setState({
        detail,
        totalFreightSum : totalFreightSum.toFixed(2),
        damageCompensationSum: damageCompensationSum.toFixed(2),
        serviceChargeSum: serviceChargeSum.toFixed(2),
      });
    });
  }

  // 查看签收提货
  watchReceivingSign = async record => {
    if (this.props.transportDetail.transportId !== record.transportId) {
      await this.props.detailTransports({ transportId: record.transportId });
    }
    this.setState({
      ReceivingSignModal: true,
    });
  };

  watchReceivingBills = async record => {
    const { accountDetailId } = record;
    if (this.props.transportDetail.transportId !== record.transportId) {
      await this.props.detailTransports({ transportId: record.transportId });
    }
    this.setState({
      receivingModal: true,
      accountDetailId,
    });
  };

  watchTransportDetail = record => {
    const { transportId } = record;
    router.push({
      pathname : TRANSPORT_DETAIL_ROUTER,
      query : { transportId }
    });
  };

  renderImageDetail = imageType => {
    let imageData;
    if (imageType === 'signDentry') {
      const { transportDetail: { signDentryid } } = this.props;
      imageData = [getOssImg(signDentryid)];
    } else if (imageType === 'receiving') {
      const { accountDetailId } = this.state; // 不存在
      if (!accountDetailId) {
        const { transportDetail: { signItems = [] } } = this.props;
        imageData = flattenDeep(signItems.map(item => (item.billDentryid || '').split(','))).map(item => getOssImg(item));
      } else {
        const { accountDetailItems = [] } = this.props.goodsAccount; // goodsAccount为undefined
        const accountDetailItem = accountDetailItems.find(item => item.accountDetailId === accountDetailId);
        imageData = (accountDetailItem.billDentryid || '').split(',').map(billDentry => getOssImg(billDentry));
      }
    }
    if (imageType === 'receiving') {
      return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ marginTop: 20 }}>
            <ImageDetail width='320' imageData={imageData} />
          </div>
          <div style={{ width: '400px' }}>
            <p className={styles.infoItem}>
              <span>签收单号:</span>
              <span>{this.props.transportDetail?.signItems?.map(item => item.billNumber || '').join(',')}</span>
            </p>
            <p className={styles.infoItem}>
              <span>过磅单号:</span>
              <span>{this.props.transportDetail?.signItems?.map(item => item.weighNumber || '').join(',')}</span>
            </p>
            <p className={styles.infoItem}>
              <span>签收数量:</span>
              <span>
                {this.props.transportDetail?.deliveryItems?.map(item => (
                  <li
                    key={item.goodsId}
                  >{`${item.categoryName}-${item.goodsName} ${item.receivingNum}${item.receivingUnitCN} `}
                  </li>))}
              </span>
            </p>
          </div>
        </div>
      );
    }
    if (imageType === 'signDentry') {
      return <ImageDetail width='320' imageData={imageData} />;
    }
  };

  handleExportBillDetailBtnClick = () => {
    const { location: { query: { orderId } } } = this.props;
    const params = {
      orderId,
      fileName : `${orderId}付款单详情`,
    };
    routerToExportPage(sendOrdersDetailExcelPost, params);
  };

  selectOnChange = (selectedValue) => {
    const { detail, pageSize } = this.state;
    this.accountTransportNo = selectedValue;
    this.setState({
      accountTransportNo: selectedValue,
    });
    const { transportPriceType } = detail;
    getTransportList({
      accountTransportNo: selectedValue,
      limit: pageSize,
      offset: 0,
      isSelectAccount: true,
      transportPriceType,
    }).then(res => {
      this.setState({
        transportsLists: res,
        nowPage: 1,
      });
    });
  };

  getInvoiceState = (code) => ({
    [INVOICES_LIST_STATE.DRAFT]: '草稿',
    [INVOICES_LIST_STATE.PENDING]: '待审核',
    [INVOICES_LIST_STATE.PROCESSING]: '开票中',
    [INVOICES_LIST_STATE.PARTIALLY_DONE]: '部分已开票',
    [INVOICES_LIST_STATE.DONE]: '已开票',
    [INVOICES_LIST_STATE.REFUSE]: '被拒绝',
    [INVOICES_LIST_STATE.CANCEL]: '已作废',
  }[code]);

  seeMore = () => {
    this.setState({
      more: !this.state.more,
    });
  };

  handleOutputTransportEventsBtnClick = () => {
    const { detail } = this.state;
    const { accountOrgType } = detail.tranAccountItems[0]; // 1.承运和托运，2.承运和平台，3.平台和托运
    let params = {
      accessToken : this.accessToken,
      organizationType : this.organizationType,
      organizationId : this.organizationId,
      fileName : '运单列表',
      transportPriceType : accountOrgType
    };
    if (this.accountTransportNo){
      params = { ...params, isSelectAccount : true, selectAccountTransportNo : true, orderId : detail.orderId, accountTransportNo : this.accountTransportNo };
    } else {
      params ={ ...params, selectAccountTransportNo : true, orderId : detail.orderId };
    }

    routerToExportPage(sendTransportExcelPost, params);
  };

  pageChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    const { detail } = this.state;
    this.setState({
      nowPage: current,
      pageSize: limit,
    });
    const { transportPriceType } = detail;
    let params;
    if (!this.accountTransportNo) {
      params = { orderId: detail.orderId, limit, offset, selectAccountTransportNo: true, transportPriceType };
    } else {
      params = {
        accountTransportNo: this.accountTransportNo,
        limit,
        offset,
        isSelectAccount: true,
        transportPriceType,
      };
    }
    getTransportList(params).then(res => {
      this.setState({
        transportsLists: res,
      });
    });
  };

  renderPayEvent = () =>{
    const { detail } = this.state;
    const eventItems = detail?.eventItems;
    const eventDist = {
      1 : '生成付款单',
      2 : '作废付款单',
      3 : '',
      4 : '修改付款单',
      5 : '重新支付',
      6 : ''
    };
    return eventItems ? (
      <div>
        <h3 style={{ marginLeft : '2rem' }}>支付事件</h3>
        <Divider />
        {
          eventItems.map(item => ({ ...item, createTime: moment(item.createTime).valueOf() })).sort((a, b) => b.createTime - a.createTime).map(item=>
            <div style={{ margin : '0.5rem 2rem' }}>
              <div>
                <span>{moment(item.createTime).format('YYYY/MM/DD HH:mm:ss')}</span>
                <span style={{ marginLeft : '0.5rem' }}>{`${item.nickName} (${item.organizationName})`}</span>
                <span>{`${eventDist[item.eventStatus]}${item.orderDetail}` }</span>
              </div>
            </div>
          )
        }
      </div>) :
      null;
  }

  render() {
    const {
      detail,
      more,
      transportsLists = [],
      ReceivingSignModal,
      receivingModal,
      nowPage,
      pageSize,
      totalFreightSum,
      damageCompensationSum,
      serviceChargeSum,
      payedFreight
    } = this.state;
    const layout = {
      labelCol: {
        xs: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
      },
    };
    const invoice = detail?.invoiceEntities?.find(item => item.isEffect === 1 && item.invoiceState !== 0 && item.invoiceState !== 6);
    const invoiceDetail = detail && detail.invoiceCorrelationEntities && detail.invoiceCorrelationEntities.length !== 0 ? detail.invoiceCorrelationEntities : undefined;
    return (
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
          {ReceivingSignModal && this.renderImageDetail('signDentry')}
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
          {receivingModal && this.renderImageDetail('receiving')}
        </Modal>
        {!detail ?
          ''
          :
          <SchemaForm layout='vertical' mode={FORM_MODE.DETAIL} data={detail} schema={this.schema}>
            <FormCard colCount={4} title='付款单信息'>
              <Item {...layout} field='orderState' />
              <Item {...layout} field='isCreateInvoice' />
              <Item {...layout} field='projectName' onClick={() => this.toProjectDetail(detail.projectId)} style={{ color: 'rgb(24, 144, 255)', cursor: 'pointer' }} />
              <Item {...layout} field='orderNo' />
            </FormCard>
            <FormCard
              title='费用明细'
              colCount={1}
              extra={(
                <Authorized authority={[PAY_BILL_EXPORT_DETAIL]}>
                  <Button style={{ float : 'right' }} className='mr-10' onClick={this.handleExportBillDetailBtnClick}>导出账单明细</Button>
                </Authorized>)
              }
            >
              <Table
                rowKey='accountTransportId'
                pagination={false}
                dataSource={{ items: detail.tranAccountItems }}
                schema={this.tableSchema}
              />
              <div style={{ float :'right', marginTop : '1rem' }}>
                <span>总费用小计￥{totalFreightSum}</span>
                <span> - 货损赔付小计￥{damageCompensationSum}</span>
                <span> + 货主服务费小计￥{serviceChargeSum}</span>
                <span> = 付款单总金额 <span style={{ fontWeight : 'bold' }}>￥{Number((totalFreightSum - damageCompensationSum + serviceChargeSum))._toFixed(2)}</span> </span>
              </div>
              <div style={{ float :'right', marginTop : '1rem' }}>
                <span> - 已付金额￥{payedFreight}</span>
                <span> = 应付总金额 <span style={{ fontWeight : 'bold' }}>￥{ Number((totalFreightSum - damageCompensationSum + serviceChargeSum) - payedFreight)._toFixed(2)}</span> </span>
              </div>

            </FormCard>
            <FormCard title='代扣明细' colCount={1}>
              <WithholdingDetails orderId={detail.orderId} />
            </FormCard>
            {this.organizationType === 1 ?
              <>
                {
                  invoice ?
                    <FormCard title='发票信息' colCount={1}>
                      {
                        more ?
                          <Descriptions bordered size='small'>
                            <Descriptions.Item label='发票抬头'>{invoice.invoiceTitle}</Descriptions.Item>
                            <Descriptions.Item label='发票税点'>{Number(invoice.invoiceTax) * 100}%</Descriptions.Item>
                            <Descriptions.Item
                              label='申请时间'
                            >{moment(invoice.applyTime).format('YYYY/MM/DD HH:mm:ss')}
                            </Descriptions.Item>
                            <Descriptions.Item label='发票号码'>
                              {invoiceDetail?.map(item => (
                                <p key={item.invoiceCorrelationId} style={{ margin: '0' }}>{item.invoiceNo}</p>
                              )) || '--'}
                            </Descriptions.Item>
                            <Descriptions.Item label='开票时间'>
                              {invoiceDetail?.map(item => (
                                <p
                                  key={item.invoiceCorrelationId}
                                  style={{ margin: '0' }}
                                >{moment(item.invoiceTime).format('YYYY/MM/DD HH:mm:ss')}
                                </p>
                              )) || '--'}
                            </Descriptions.Item>
                            <Descriptions.Item label='支付状态'>已支付</Descriptions.Item>
                            <Descriptions.Item
                              label='实付金额(元)'
                            >{(detail.invoicePayedFreight || 0).toFixed(2)._toFixed(2)}
                            </Descriptions.Item>
                            <Descriptions.Item label='应开票金额(元)'>{invoice.shouldInvoiceAmount}</Descriptions.Item>
                            <Descriptions.Item label='实开票金额(元)'>
                              {
                                invoiceDetail?.reduce((total, current) => total + current.actualInvoiceAmount, 0) || 0.00
                              }
                            </Descriptions.Item>
                            <Descriptions.Item label='运单数'>{invoice.orderTransportNum}</Descriptions.Item>
                            <Descriptions.Item label='总运费(元)'>{invoice.totalFreight}</Descriptions.Item>
                            <Descriptions.Item label='收件人名称'>{invoice.recipientName}</Descriptions.Item>
                            <Descriptions.Item label='收件人电话'>{invoice.recipientPhone}</Descriptions.Item>
                            <Descriptions.Item label='收件人地址'>{invoice.mailingAddress}</Descriptions.Item>
                            {
                              invoice.state === INVOICES_LIST_STATE.REFUSE ?
                                <Descriptions.Item label='拒绝原因'>{invoice.remarks || ''}</Descriptions.Item>
                                :
                                null
                            }
                          </Descriptions>
                          :
                          <Descriptions bordered size='small'>
                            <Descriptions.Item label='发票抬头'>{invoice.invoiceTitle}</Descriptions.Item>
                            <Descriptions.Item label='发票税点'>{Number(invoice.invoiceTax) * 100}%</Descriptions.Item>
                            <Descriptions.Item
                              label='申请时间'
                            >{moment(invoice.applyTime).format('YYYY/MM/DD HH:mm:ss')}
                            </Descriptions.Item>
                            <Descriptions.Item label='发票号码'>
                              {invoiceDetail?.map(item => (
                                <p key={item.invoiceCorrelationId} style={{ margin: '0' }}>{item.invoiceNo}</p>
                              )) || '--'}
                            </Descriptions.Item>
                            <Descriptions.Item label='开票时间'>
                              {invoiceDetail?.map(item => (
                                <p
                                  key={item.invoiceCorrelationId}
                                  style={{ margin: '0' }}
                                >{moment(item.invoiceTime).format('YYYY/MM/DD HH:mm:ss')}
                                </p>
                              )) || '--'}
                            </Descriptions.Item>
                            <Descriptions.Item label='支付状态'>已支付</Descriptions.Item>
                            <Descriptions.Item
                              label='实付金额(元)'
                            >{(detail.invoicePayedFreight || 0).toFixed(2)._toFixed(2)}
                            </Descriptions.Item>
                            <Descriptions.Item
                              label='应开票金额(元)'
                            >{invoice.shouldInvoiceAmount.toFixed(2)._toFixed(2)}
                            </Descriptions.Item>
                            <Descriptions.Item label='实开票金额(元)'>
                              {(invoiceDetail?.reduce((total, current) => Number((total + current.actualInvoiceAmount)), 0) || 0.00).toFixed(2)._toFixed(2)}
                            </Descriptions.Item>
                            {
                              invoice.state === INVOICES_LIST_STATE.REFUSE ?
                                <Descriptions.Item label='拒绝原因'>{invoice.remarks || ''}</Descriptions.Item>
                                :
                                null
                            }
                          </Descriptions>
                      }
                    </FormCard>
                    :
                    null
                }
                {
                  this.organizationType === 1 && invoice ?
                    <div style={{ paddingRight: '20px', textAlign: 'right' }}>
                      {
                        more ?
                          <Button className='mr-10' type='primary' onClick={this.seeMore}>收起</Button>
                          :
                          <Button className='mr-10' type='primary' onClick={this.seeMore}>查看更多</Button>
                      }
                    </div>
                    :
                    null
                }
              </>
              :
              null
            }
            <FormCard title='运单列表' colCount={1}>
              <Row>
                <Col span={12}>
                  <span>对账单号：</span>
                  <Select
                    showSearch
                    style={{ width: 200 }}
                    onChange={this.selectOnChange}
                    placeholder='请选择对账单号'
                  >
                    {
                      detail?.tranAccountItems.map(item => (
                        <Option
                          key={item.accountTransportId}
                          value={item.accountTransportNo}
                        >{item.accountTransportNo}
                        </Option>
                      )) || []
                    }
                  </Select>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Button onClick={this.handleOutputTransportEventsBtnClick}>导出运单</Button>
                </Col>
              </Row>
              <Table
                rowKey='transportId'
                pagination={{ current: nowPage, pageSize }}
                onChange={this.pageChange}
                dataSource={transportsLists}
                schema={this.transportTableSchema}
              />
            </FormCard>

            <SearchTradeRecord orderNo={detail.orderNo} />
            {this.renderPayEvent()}


            <div style={{ paddingRight: '20px', textAlign: 'right' }}>
              <Button className='mr-10' type='primary' onClick={this.handleBackBtnClick}>返回</Button>
            </div>
          </SchemaForm>
        }
      </>
    );
  }
}
