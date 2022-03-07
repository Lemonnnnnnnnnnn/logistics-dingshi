import React, { Component } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Button, Col, Row, Descriptions, Modal } from 'antd';
import { Item, SchemaForm, FORM_MODE, FormCard } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import '@gem-mine/antd-schema-form/lib/fields';
import Authorized from '../../../utils/Authorized';
import auth from '../../../constants/authCodes';
import Table from '../../../components/table/table';
import ImageDetail from '../../../components/image-detail';
import {
  detailOrders,
  getTransportList,
  sendTransportExcelPost,
  sendOrdersDetailExcelPost,
  sendOrderPdfPost,
} from "../../../services/apiService";
import {
  INVOICES_LIST_STATE,
  ORDER_INTERNAL_STATUS,
} from '../../../constants/project/project';
import { classifyGoodsWeight, flattenDeep, getOssImg, translatePageType, routerToExportPage, formatMoney } from '../../../utils/utils';
import transportModel from '../../../models/transports';
import { getUserInfo } from '../../../services/user';
import styles from '../../bill-account/goods-account/sub-page/bill-info.less';

import { accountCost, getNeedPay, getServiceCharge } from "@/utils/account";
import {
  accountTransportCost,
  getNeedPay as getTransportNeedPay,
  getServiceCharge as getTransportServiceCharge
} from "@/utils/account/transport";
import { ACCOUNT_MANAGE_ROUTER, SHIPMENT_TO_CONSIGNMENT } from '@/constants/account';

const {
  PAY_BILL_EXPORT_DETAIL
} = auth;

const { actions: { detailTransports } } = transportModel;

function mapStateToProps (state) {
  const goodsAccount = state.goodsAccount.entity;
  goodsAccount.responsiblerName = goodsAccount.responsibleItems && goodsAccount.responsibleItems.map(item => item.responsibleName).join('、');
  return {
    goodsAccount,
    transportDetail: state.transports.entity
  };
}


@connect(mapStateToProps, { detailTransports })
export default class Detail extends Component {
  state = {
    detail: null,
    more: false,
    nowPage: 1,
    pageSize: 10
  }

  organizationType = getUserInfo().organizationType

  organizationId = getUserInfo().organizationId

  accessToken = getUserInfo().accessToken

  schema = {
    projectName: {
      label: '项目名称',
      component: 'input',
    },
    orderNo: {
      label: '付款单号',
      component: 'input',
    },
    payTime: {
      label: '付款时间',
      component: 'input',
    }
  }

  toProjectDetail = (id) => {
    router.push(`/buiness-center/project/projectManagement/projectDetail?projectId=${id}`);
  }

  handleBackBtnClick = () => {
    router.goBack();
  }

  componentDidMount () {
    const { location: { query: { orderId } } } = this.props;

    detailOrders(orderId).then(detail => {
      const payTime = (detail?.eventItems.find(item => item.eventStatus === 3))?.createTime;
      detail.payTime = '--';
      if (payTime) detail.payTime = moment(payTime).format('YYYY-MM-DD HH:mm:ss');
      const { orderCreateType } = detail; // 1.承运和托运，2.承运和平台，3.平台和托运
      getTransportList({ orderId, limit: 10, offset: 0, selectAccountTransportNo: true }).then(res => {
        this.setState({
          transportsLists: res
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
            title: '项目名称',
            dataIndex: 'projectName',
            width: '300px',
            render: (text, record) => (
              <div style={{ display: 'inline-block', width: '250px', whiteSpace: 'normal', breakWord: 'break-all' }}><a onClick={() => this.toProjectDetail(record.projectId)}>{text}</a></div>
            )
          },
          {
            title: '创建时间',
            dataIndex: 'createTime',
            render: (time) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
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
            }
          },
          {
            title: '规格',
            dataIndex: 'specificationType',
            render: (text, record) => {
              const tempArr = [];
              const totalGoods = flattenDeep((record.accountDetailItems || []).map(item => item.accountCorrelationCnItems));
              totalGoods?.forEach(current => {
                const index = tempArr.findIndex(item => item.goodsId === current.goodsId);
                if (index === -1) tempArr.push(current);
              });
              return (
                <ul style={{ padding: 0, margin: 0 }}>
                  {
                    tempArr?.map(item => <li key={item.goodsId}>{item.specificationType || '--'}</li>) || '--'
                  }
                </ul>
              );
            }
          },
          {
            title: '运单数',
            dataIndex: 'transportNumber'
          },
          {
            title: '总运费(元)',
            render: (text, record) => formatMoney((accountCost(record)._toFixed(2)))
          },
          {
            title: '货损赔付(元)',
            dataIndex: 'damageCompensation',
            render: text => `${orderCreateType}` === `1` ? formatMoney((text || 0)._toFixed(2)) : '--'
          },
          {
            title: '服务费（元）',
            render: (text, record) => {
              if (`${orderCreateType}` !== `1`) return '--';
              return formatMoney((getServiceCharge(record)._toFixed(2)));
            }
          },
          {
            title: '应付账款(元)',
            render: (text, record) => formatMoney((getNeedPay(record)._toFixed(2)))
          },
          {
            title: '装车总量',
            dataIndex: 'loadingNetWeight',
            render: (text) => <div style={{ whiteSpace: 'normal', width: '400px' }}>{text || '--'}</div>
          },
          {
            title: '卸车总量',
            dataIndex: 'unloadNetWeight',
            render: (text) => <div style={{ whiteSpace: 'normal', width: '400px' }}>{text || '--'}</div>
          },
          {
            title: '账期',
            dataIndex: 'paymentDays',
            render: (text, record) => `${moment(record.paymentDaysStart).format('YYYY-MM-DD')}~${moment(record.paymentDaysEnd).format('YYYY-MM-DD')}`
          },
          {
            title: '申请人',
            dataIndex: 'createName'
          },
          {
            title: '审核人',
            dataIndex: 'auditorName',
            render: text => {
              if (text === null) return '--';
              return text;
            }
          },
          {
            title: '审核时间',
            dataIndex: 'auditTime',
            render: time => {
              if (time === null) return '--';
              return moment(time).format('YYYY-MM-DD HH:mm:ss');
            }
          },
          {
            title: '审核意见',
            dataIndex: 'verifyReason',
            render: text => {
              if (text === null) return '--';
              return text;
            }
          }
        ],
        operations: () => {
          const detail = {
            title: '详情',
            onClick: (record) => {
              const { accountTransportId, accountOrgType } = record;
              router.push({
                pathname : `${ACCOUNT_MANAGE_ROUTER[this.organizationType]}`,
                query : { accountTransportId, accountOrgType }
              });
            }
          };
          return [detail];
        }
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
              <div style={{ display: 'inline-block', width: '250px', whiteSpace: 'normal', breakWord: 'break-all' }}><a onClick={() => this.toProjectDetail(record.projectId)}>{text}</a></div>
            )
          },
          {
            title: '总运费（元）',
            render: (text, record) => {
              const { transportPriceEntities, accountInitiateType } = record;
              const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
              const {  driverTransportCost } = transportPriceEntity;
              if (`${orderCreateType}` === `2`) {
                return `${(driverTransportCost || 0)._toFixed(2)}元`;
              }

              return `${accountTransportCost({ ...record, transportPriceEntity })._toFixed(2)}元`;
            }
          },
          {
            title: '服务费（元）',
            render: (text, record) => {
              const { transportPriceEntities, accountInitiateType, transportType } = record;
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
              const { transportPriceEntities, accountInitiateType } = record;
              const transportConfig = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
              const { damageCompensation } = transportConfig;
              if (`${orderCreateType}` === `2`) {
                return '--';
              }
              return `${(damageCompensation || 0)._toFixed(2)}元`;
            }
          },
          {
            title: '应付账款（元）',
            render: (text, record) => {
              const { accountInitiateType, transportPriceEntities } = record;
              const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
              const { accountInternalStatus } = detail.tranAccountItems[0];
              const { driverTransportCost, } = transportPriceEntity;
              if (`${orderCreateType}` === `2`) return `${(driverTransportCost|| 0)._toFixed(2)}元`;

              return `${getTransportNeedPay({ transportPriceEntity, accountInternalStatus }, record)._toFixed(2)}元`;
            },
          },
          {
            title: '签收单号',
            dataIndex: 'receivingNo',
            render: (text) => text || '--'
          },
          {
            title: '提货时间',
            dataIndex: 'deliveryTime',
            render: text => text ? moment(text).format('YYYY-MM-DD HH:mm') : '--'
          },
          {
            title: '签收时间',
            dataIndex: 'receivingTime',
            render: text => text ? moment(text).format('YYYY-MM-DD HH:mm') : '--'
          },
          {
            title: '提货点',
            dataIndex: 'deliveryName',
            render: (text, record) => {
              const { deliveryItems } = record;
              const list = (deliveryItems || []).map(item => <li key={item.goodsId} className="test-ellipsis" title={`${item.deliveryName}`}>{`${item.deliveryName}`}</li>);
              return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
            }
          },
          {
            title: '卸货点',
            dataIndex: 'receivingName',
            render: (text) => text || '--'
          },
          {
            title: '货品名称',
            dataIndex: 'goodsName',
            render: (text, record) => {
              const { deliveryItems } = record;
              const list = (deliveryItems || []).map(item => <li key={item.goodsId} className="test-ellipsis" title={`${item.categoryName}-${item.goodsName}`}>{`${item.categoryName}-${item.goodsName}`}</li>);
              return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
            }
          },
          {
            title: '提货量',
            dataIndex: 'deliveryNum',
            render: (text, record) => {
              const plannedweight = classifyGoodsWeight((record.deliveryItems || []), 'goodsUnit', ['goodsId', 'goodsUnitCN', 'deliveryNum'], (summary, current) => summary.deliveryNum += current.deliveryNum);
              const renderItem = ({ goodsId, deliveryNum, goodsUnitCN }) => <li className="test-ellipsis" key={goodsId}>{(deliveryNum || 0).toFixed(3)}{goodsUnitCN}</li>;
              return <ul style={{ width: '100px', padding: 0, margin: 0 }}>{plannedweight.map(renderItem)}</ul>;
            }
          },
          {
            title: '卸货量',
            dataIndex: 'receivingNum',
            render: (text, record) => {
              const plannedweight = classifyGoodsWeight((record.deliveryItems || []), 'goodsUnit', ['goodsId', 'goodsUnitCN', 'receivingNum'], (summary, current) => summary.receivingNum += current.receivingNum);
              const renderItem = ({ goodsId, receivingNum, goodsUnitCN }) => <li className="test-ellipsis" key={goodsId}>{(receivingNum || 0).toFixed(3)}{goodsUnitCN}</li>;
              return <ul style={{ width: '100px', padding: 0, margin: 0 }}>{plannedweight.map(renderItem)}</ul>;
            }
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
            title: '对账单号',
            dataIndex: 'accountTransportNo',
            render: text => this.state.accountTransportNo || text
          },
          {
            title: '调度单位',
            dataIndex: 'shipmentOrganizationName'
          },
          {
            title: '查看',
            dataIndex: 'looking',
            render: (text, record) => (
              <>
                <a onClick={() => this.watchTransportDetail(record)} style={{ marginRight: '10px' }}>详情</a>
                <a onClick={() => this.watchReceivingSign(record)} style={{ marginRight: '10px' }}>样签</a>
                {
                  record.receivingName ? <a onClick={() => this.watchReceivingBills(record)} style={{ marginRight: '10px' }}>签收单</a> : false
                }
              </>
            ),
            width: '150px',
            fixed: 'right',
          }
        ]
      };
      this.setState({
        detail
      });
    });
  }

  // 查看签收提货
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
    if (this.props.transportDetail.transportId !== record.transportId) {
      await this.props.detailTransports({ transportId: record.transportId });
    }
    this.setState({
      receivingModal: true,
      accountDetailId
    });
  }

  watchTransportDetail = record => {
    const { route : { path } } = this.props;
    router.push(`${path}transportDetail?transportId=${record.transportId}`);
  }

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
                {this.props.transportDetail?.deliveryItems?.map(item => <li key={item.goodsId}>{`${item.categoryName}-${item.goodsName} ${item.receivingNum}${item.receivingUnitCN} `}</li>)}
              </span>
            </p>
          </div>
        </div>
      );
    }
    if (imageType === 'signDentry') {
      return <ImageDetail width='320' imageData={imageData} />;
    }
  }

  handleExportBillDetailBtnClick = () => {
    const { location: { query: { orderId } } } = this.props;
    const params = {
      orderId,
      fileName : `${orderId}付款单详情`
    };
    routerToExportPage(sendOrdersDetailExcelPost, params);
  }

  getInvoiceState = (code) => ({
    [INVOICES_LIST_STATE.DRAFT]: '草稿',
    [INVOICES_LIST_STATE.PENDING]: '待审核',
    [INVOICES_LIST_STATE.PROCESSING]: '开票中',
    [INVOICES_LIST_STATE.PARTIALLY_DONE]: '部分已开票',
    [INVOICES_LIST_STATE.DONE]: '已开票',
    [INVOICES_LIST_STATE.REFUSE]: '被拒绝',
    [INVOICES_LIST_STATE.CANCEL]: '已作废',
  }[code])

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
    if (!this.accountTransportNo) params = { ...params, selectAccountTransportNo : true, orderId : detail.orderId };

    routerToExportPage(sendTransportExcelPost, params);
  }

  pageChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    const { detail } = this.state;
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const { transportPriceType } = detail;
    const params = { orderId: detail.orderId, limit, offset, selectAccountTransportNo: true, transportPriceType };
    getTransportList(params).then(res => {
      this.setState({
        transportsLists: res
      });
    });
  }

  downloadPDF = () => {
    const params = {
      orderId : this.state.detail.orderId
    };
    routerToExportPage(sendOrderPdfPost, params);
  }

  render () {
    const { detail, transportsLists = [], ReceivingSignModal, receivingModal, nowPage, pageSize, total } = this.state;
    const layout = {
      labelCol: {
        xs: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
      }
    };
    const invoice = detail?.invoiceEntities?.find(item => item.isEffect === 1 && item.invoiceState !== 0 && item.invoiceState !== 6);
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
          <>
            <div className={styles.title_header}>
              <Button className={styles.download} onClick={this.downloadPDF}>下载PDF</Button>
              付款凭证
            </div>
            <SchemaForm layout="vertical" mode={FORM_MODE.DETAIL} data={detail} schema={this.schema}>
              <FormCard colCount={4} title="付款单信息">
                <Item {...layout} field='orderNo' />
                <Item {...layout} field='projectName' />
                <Item {...layout} field='payTime' />
              </FormCard>
              <FormCard title="对账单信息" colCount={1}>
                <Table rowKey="accountTransportId" pagination={false} dataSource={{ items: detail.tranAccountItems }} schema={this.tableSchema} />
              </FormCard>
              {
                invoice ?
                  <FormCard title="发票信息" colCount={1}>
                    <Descriptions bordered size='small'>
                      <Descriptions.Item label="发票抬头">{invoice.invoiceTitle}</Descriptions.Item>
                      <Descriptions.Item label="发票税号">{invoice.userInvoiceEntity.invoiceNo}</Descriptions.Item>
                      <Descriptions.Item label="发票税点">{Number(invoice.invoiceTax) * 100}%</Descriptions.Item>
                      <Descriptions.Item label="开户行">{invoice.userInvoiceEntity.openingBank}</Descriptions.Item>
                      <Descriptions.Item label="银行账号">{invoice.userInvoiceEntity.bankAccount}</Descriptions.Item>
                      <Descriptions.Item label="运单数">{invoice.orderTransportNum}</Descriptions.Item>
                      <Descriptions.Item label="实付金额(元)">{(detail.invoicePayedFreight || 0).toFixed(2)._toFixed(2)}</Descriptions.Item>
                      <Descriptions.Item label="应开票金额(元)">{invoice.shouldInvoiceAmount}</Descriptions.Item>
                      <Descriptions.Item label="收件人名称">{invoice.recipientName}</Descriptions.Item>
                      <Descriptions.Item label="收件人电话">{invoice.recipientPhone}</Descriptions.Item>
                      <Descriptions.Item label="收件人地址">{invoice.mailingAddress}</Descriptions.Item>
                    </Descriptions>
                  </FormCard>
                  :
                  null
              }
              <FormCard title="运单列表" colCount={1}>
                <Row>
                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Button onClick={this.handleOutputTransportEventsBtnClick}>导出运单</Button>
                  </Col>
                </Row>
                <Table rowKey="transportId" pagination={{ current: nowPage, pageSize }} onChange={this.pageChange} dataSource={transportsLists} schema={this.transportTableSchema} />
              </FormCard>
              <div style={{ paddingRight: '20px', textAlign: 'right' }}>
                <Authorized authority={[PAY_BILL_EXPORT_DETAIL]}>
                  <Button className="mr-10" onClick={this.handleExportBillDetailBtnClick}>导出账单明细</Button>
                </Authorized>
                <Button className="mr-10" type='primary' onClick={this.handleBackBtnClick}>返回</Button>
              </div>
            </SchemaForm>
          </>
        }
      </>
    );
  }
}
