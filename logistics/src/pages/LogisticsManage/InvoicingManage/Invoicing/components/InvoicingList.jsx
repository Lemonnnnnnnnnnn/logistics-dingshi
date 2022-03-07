import React, { Component } from 'react';
import { Button, Modal, notification, Popover } from 'antd';
import CSSModules from 'react-css-modules';
import moment from 'moment';
import router from 'umi/router';
import { connect } from 'dva';
import { SchemaForm, Item, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../../../components/DebounceFormButton';
import SearchForm from '../../../../../components/Table/SearchForm2';
import { FilterContextCustom } from '../../../../../components/Table/FilterContext';
import Table from '../../../../../components/Table/Table';
import '@gem-mine/antd-schema-form/lib/fields';
import { INVOICES_LIST_STATE } from '../../../../../constants/project/project';
import model from '../../../../../models/invoices';
import { getUserInfo } from '../../../../../services/user';
import auth from '../../../../../constants/authCodes';
import { getInvoicesStatus, getInvoicesPaidStatus } from '../../../../../services/project';
import {
  patchInvoice,
  detailInvoice,
  sendInvoiceDetailExcelPost,
  sendInvoicesExcelPost,
  exportInvoicesTransport
} from "@/services/apiService";
import { pick, getOssImg, translatePageType, routerToExportPage, getLocal } from '../../../../../utils/utils';
import ImageDetail from "../../../../../components/ImageDetail";
import InvoiceTable from "./InvoiceTable";
import UpdateInvoice from "./UpdateInvoice";
import styles from './InvoicingList.less';

const {
  INVOICE_MODIFY,
  INVOICE_CANCEL,
  INVOICE_HANDEL,
  INVOICE_EXPORT_DETAIL: GET_PDF,
  INVOICE_VISIT: DETAIL,
} = auth;

const { actions: { getInvoices } } = model;

function mapStateToProps(state) {
  return {
    lists: pick(state.invoices, ['items', 'count']),
    detail: pick(state.invoices, ['entity']),
    commonStore: state.commonStore,
  };
}

@connect(mapStateToProps, { getInvoices })
@CSSModules(styles, { allowMultiple: true })
@FilterContextCustom
export default class InvoicingList extends Component {

  organizationType = getUserInfo().organizationType// 3为货权 4为托运  5为承运

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state = {
    cancelVisible: false,
    expressVisible: false,
    verifyVisible: false,
    modalType: 'add',
    company: '',
    pageSize: 10,
    nowPage: 1,
    ready: false,
    invoiceDentryidIndex : 0,
    invoiceCorrelationEntityList : [],
    currentInvoiceCorrelationEntityList : [],
    showInvoiceDentryidModal : false,
    selectedRow: [],
  }

  invoiceStateInit = this.props.invoiceStateInit

  constructor(props) {
    super(props);
    this.tableSchema = {
      variable: true,
      minWidth: this.organizationType === 1 ? 2920 : 2200,
      columns: [
        {
          title: '开票状态',
          dataIndex: 'invoiceState',
          width: '100px',
          fixed: 'left',
          render: (text) => {
            if (this.organizationType === 1 && Number(text) === INVOICES_LIST_STATE.REFUSE) {
              return (
                <span style={{ color: 'red' }}>
                  已拒绝
                </span>
              );
            }
            const status = getInvoicesStatus(text);
            return (
              <span style={{ color: status.color }}>
                {status.word}
              </span>
            );
          },
        },
        {
          title: '支付状态',
          dataIndex: 'orderPaidState',
          width: '100px',
          fixed: 'left',
          render: (text) => {
            const status = getInvoicesPaidStatus(text);
            return (
              <span style={{ color: status.color }}>
                {status.word}
              </span>
            );
          },
          visible: this.organizationType === 1,
        },
        {
          title: '开票类别',
          dataIndex: 'organizationType',
          width: '120px',
          fixed: 'left',
          render: (text) => (
            text === 4 ? '托运开票' : '承运开票'
          ),
          visible: this.organizationType === 1,
        },
        {
          title: '发票抬头',
          dataIndex: 'invoiceTitle',
          fixed: 'left',
          width: '250px',
          render: (text) => (
            <div style={{
              display: 'inline-block',
              width: '220px',
              whiteSpace: 'normal',
              breakWord: 'break-all',
            }}
            >{text}
            </div>
          ),
        },
        {
          title: '申请时间',
          dataIndex: 'applyTime',
          render: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm') : '--',
        },
        {
          title: '开票时间',
          dataIndex: 'EntityListInvoiceTime',
          render: (text, record) => {
            if (!record.invoiceCorrelationEntityList) return '--';
            const li = record.invoiceCorrelationEntityList.map(item =>
              <li
                key={item.invoiceCorrelationId}
              >{moment(item.invoiceTime).format('YYYY-MM-DD HH:mm')}
              </li>);
            return <ul style={{ padding: 0, margin: 0 }}>{li}</ul>;
          },
          visible: this.organizationType === 1,
        },
        {
          title: '发票号码',
          dataIndex: 'EntityListInvoiceNo',
          width: '200px',
          render: (text, record) => {
            if (!record.invoiceCorrelationEntityList) return '--';
            const li = record.invoiceCorrelationEntityList.map((item, key) =>
              <li key={item.invoiceCorrelationId}>
                <span
                  className='test-ellipsis'
                  onClick={() => this.setState({ showInvoiceDentryidModal : true, invoiceDentryidIndex : key, invoiceCorrelationEntityList : record.invoiceCorrelationEntityList })}
                  style={{ color: '#027DB4', textDecoration: 'underline', cursor: 'pointer', display: 'inline-block', maxWidth: '165px', }}
                >
                  {item.invoiceNo}
                </span>
              </li>);
            return <ul style={{ padding: 0, margin: 0 }}>{li}</ul>;
          },
        }, {
          title: '快递单号',
          dataIndex: 'EntityListExpressNo',
          render: (text, record) => {
            if (!record.invoiceCorrelationEntityList) return '--';
            const li = record.invoiceCorrelationEntityList.map(item =>
              <li
                key={item.invoiceCorrelationId}
              >{item.expressCompany + item.expressNo}
              </li>);
            return <ul style={{ padding: 0, margin: 0 }}>{li}</ul>;
          },
        }, {
          title: '发票税点',
          dataIndex: 'invoiceTax',
          render: (text) => `${text * 100}%`,
        }, {
          title: '总金额（元）',
          key: 'totalMoney',
          render: (text, record) => {
            if (!record.totalFreight) return '--';
            return (Number(record.totalFreight) + Number(record.serviceCharge) - Number(record.damageCompensation)).toFixed(2)._toFixed(2);
          },
        }, {
          title: '货损赔付（元）',
          dataIndex: 'damageCompensation',
          render: text => Number(text)._toFixed(2),
        }, {
          title: '应开票金额（元）',
          dataIndex: 'shouldInvoiceAmount',
          visible: this.organizationType === 1,
          render: text => Number(text)._toFixed(2),
        }, {
          title: '实际开票金额（元）',
          dataIndex: 'invoiceCorrelationEntityList',
          render: (text, record) => {
            if (!record.invoiceCorrelationEntityList) return '--';
            const sum = record.invoiceCorrelationEntityList.reduce((total, current) => total + Number(current.actualInvoiceAmount), 0);
            return Number(sum)._toFixed(2);
          },
        }, {
          title: '实际付款金额（元）',
          dataIndex: 'actualAmountPaid',
          render: (text) => (Number(text) || 0)._toFixed(2),
        }, {
          title: '运单数',
          dataIndex: 'orderTransportNum',
          render: (text, record) => {
            const { invoiceDetailEntityList } = record;
            const orderIdlist = (invoiceDetailEntityList || []).map(item => item.orderId).join(',');
            return (
              <a onClick={() => {
                this.toTransports(orderIdlist);
              }}
              >{text}
              </a>
            );
          },
        },
        {
          title : '运费',
          dataIndex: 'totalFreight',
          visible : this.organizationType === 1,
        },
        {
          title : '货主服务费',
          dataIndex: 'serviceCharge',
          visible : this.organizationType === 1,
        },
        {
          title : '司机手续费',
          dataIndex: 'driverServiceCharge',
          visible : this.organizationType === 1,
        },
        {
          title: '作废原因',
          dataIndex: 'invalidReason',
          visible: this.organizationType === 5 || this.organizationType === 4,
          render: (text) => (
            text ?
              <Popover content={this.cancelDom(text)} placement='topLeft'>
                <span className='test-ellipsis' style={{ display: 'inline-block', maxWidth: '165px' }}>{text}</span>
              </Popover>
              :
              '--'
          ),
        }, {
          title: '拒绝原因',
          dataIndex: 'logisticsVerifyRespList',
          width: '200px',
          render: (text, record) => (
            record.logisticsVerifyRespList ?
              <Popover content={this.cancelDom(record.logisticsVerifyRespList[0].verifyReason)} placement='topLeft'>
                <span
                  className='test-ellipsis'
                  style={{
                    display: 'inline-block',
                    maxWidth: '165px',
                  }}
                >{record.logisticsVerifyRespList[0].verifyReason}
                </span>
              </Popover>
              :
              '--'
          ),
        }, {
          title: '发票邮寄地址',
          dataIndex: 'mailingAddress',
          render: (text, record) => (
            text ?
              <Popover
                content={this.cancelDom((`${text} ${record.recipientName}${record.recipientPhone}`))}
                placement='topLeft'
              >
                <span
                  className='test-ellipsis'
                  style={{
                    display: 'inline-block',
                    maxWidth: '165px',
                  }}
                >{`${text} ${record.recipientName}${record.recipientPhone}`}
                </span>
              </Popover>
              :
              '--'
          ),
          visible: this.organizationType === 1,
        },
      ],
      operations: (record) => {
        const thisAuth = {};
        if (props.authArr) {
          thisAuth.INVOICE_JUDGE = props.authArr.INVOICE_JUDGE;
          thisAuth.HAD_SENDED = props.authArr.HAD_SENDED;
          thisAuth.GET_PDF = props.authArr.GET_PDF;
          thisAuth.DETAIL = props.authArr.DETAIL;
          thisAuth.INVOICE_MODIFY = props.authArr.INVOICE_MODIFY;
        } else {
          thisAuth.INVOICE_MODIFY = INVOICE_MODIFY;
          thisAuth.INVOICE_CANCEL = INVOICE_CANCEL;
          thisAuth.INVOICE_HANDEL = INVOICE_HANDEL;
          thisAuth.GET_PDF = GET_PDF;
          thisAuth.DETAIL = DETAIL;
        }
        const detail = [
          {
            title: '详情',
            onClick: (record) => {
              const orderIdList = (record.invoiceDetailEntityList || []).map(item => item.orderId).join(',');
              if (this.organizationType === 4) {
                router.push(`/logistics-management/paymentBillWrap/paymentBill?orderIdlist=${orderIdList}`);
              } else if (this.organizationType === 5) {
                router.push(`/net-transport/paymentBillWrap/paymentBill?orderIdlist=${orderIdList}`);
              } else {
                router.push(`/bill-account/paymentBillWrap/paymentBill?orderIdlist=${orderIdList}`);
              }
            },
            display: [1, 4, 5],
            auth: [thisAuth.DETAIL],
          },
          {
            title: '导出明细',
            onClick: (record) => {
              const params = { invoiceId : record.invoiceId };
              routerToExportPage(sendInvoiceDetailExcelPost, params);
            },
            display: [1, 4, 5],
            auth: [thisAuth.GET_PDF],
          },
        ];
        const operations = {
          [INVOICES_LIST_STATE.DRAFT]: [
            {
              title: '修改',
              onClick: (record) => {
                if (this.organizationType === 5) {
                  this.props.history.push(`history/modify?pageKey=${record.invoiceId}`, {
                    invoiceId: record.invoiceId,
                    orderIdList: (record.invoiceDetailEntityList || []).map(item => item.orderId),
                  });
                } else if (this.organizationType === 4) {
                  this.props.history.push(`history/modify?pageKey=${record.invoiceId}`, {
                    invoiceId: record.invoiceId,
                    orderIdList: (record.invoiceDetailEntityList || []).map(item => item.orderId),
                  });
                }
              },
              display: [4, 5],
              auth: [thisAuth.INVOICE_MODIFY],
            },
            {
              title: '提交申请',
              onClick: (record) => {
                patchInvoice(record.invoiceId, { invoiceState: INVOICES_LIST_STATE.PENDING }).then(() => {
                  notification.success({
                    message: '提交成功',
                    description: '已成功提交该草稿,等待审核中',
                  });
                  this.refresh();
                });
              },
              display: [4, 5],
              confirmMessage: () => `确定提交申请吗？`,
              auth: [thisAuth.INVOICE_HANDEL],
            },
            {
              title: '作废',
              onClick: (record) => {
                this.patchInvoiceId = record.invoiceId;
                this.setState({
                  cancelVisible: true,
                });
              },
              display: [4, 5],
              auth: [thisAuth.INVOICE_CANCEL],
            },
          ],
          [INVOICES_LIST_STATE.PENDING]: [
            {
              title: '审核',
              onClick: (record) => {
                detailInvoice(record.invoiceId).then(data => {
                  this.setState({
                    detail: data,
                  });
                });
                this.patchInvoiceId = record.invoiceId;
                this.setState({
                  verifyVisible: true,
                });
              },
              display: [1],
              auth: [thisAuth.INVOICE_JUDGE],
            },
          ],
          [INVOICES_LIST_STATE.PROCESSING]: [
            {
              title: '已开出',
              onClick: (record) => {
                this.patchInvoiceId = record.invoiceId;
                this.expressFormData = {
                  shouldInvoiceAmount: record.shouldInvoiceAmount || 0,
                  hadSended: (record.invoiceCorrelationEntityList && record.invoiceCorrelationEntityList.reduce((total, current) => total + Number(current.actualInvoiceAmount), 0).toFixed(2)) || 0,
                };
                this.setState({
                  expressVisible: true,
                  modalType: 'add',
                  company: '',
                });
              },
              display: [1],
              auth: [thisAuth.HAD_SENDED],
            }
          ],
          [INVOICES_LIST_STATE.PARTIALLY_DONE]: [
            {
              title: '已开出',
              onClick: (record) => {
                this.patchInvoiceId = record.invoiceId;
                this.expressFormData = {
                  shouldInvoiceAmount: record.shouldInvoiceAmount || 0,
                  hadSended: (record.invoiceCorrelationEntityList && record.invoiceCorrelationEntityList.reduce((total, current) => total + Number(current.actualInvoiceAmount), 0).toFixed(2)) || 0,
                };
                this.setState({
                  expressVisible: true,
                  modalType: 'add',
                  company: '',
                });
              },
              display: [1],
              auth: [thisAuth.HAD_SENDED],
            },
            {
              title: '修改',
              onClick: (record) => {
                this.patchInvoiceId = record.invoiceId;
                this.expressFormData = {
                  shouldInvoiceAmount: record.shouldInvoiceAmount || 0,
                  hadSended: (record.invoiceCorrelationEntityList && record.invoiceCorrelationEntityList.reduce((total, current) => total + Number(current.actualInvoiceAmount), 0).toFixed(2)) || 0,
                };
                this.setState({
                  expressVisible: true,
                  modalType: 'update',
                  company: '',
                  currentInvoiceCorrelationEntityList: record.invoiceCorrelationEntityList,
                });
              },
              display: [1],
              auth: thisAuth.INVOICE_MODIFY,
            },
          ],
          [INVOICES_LIST_STATE.DONE]: [
            {
              title: '修改',
              onClick: (record) => {
                this.patchInvoiceId = record.invoiceId;
                this.expressFormData = {
                  shouldInvoiceAmount: record.shouldInvoiceAmount || 0,
                  hadSended: (record.invoiceCorrelationEntityList && record.invoiceCorrelationEntityList.reduce((total, current) => total + Number(current.actualInvoiceAmount), 0).toFixed(2)) || 0,
                };
                this.setState({
                  expressVisible: true,
                  modalType: 'update',
                  company: '',
                  currentInvoiceCorrelationEntityList: record.invoiceCorrelationEntityList,
                });
              },
              display: [1],
              auth: thisAuth.INVOICE_MODIFY,
            },
          ]
        }[record.invoiceState];
        const filterOperations = operations || [];
        return [...detail, ...filterOperations].filter(item => item.display.findIndex(current => current === this.organizationType) !== -1);
      },
    };
  }

  componentWillUnmount() {
    const { filter } = this.props;
    delete filter.createTime;
    window.sessionStorage.setItem('invoicingFilter', JSON.stringify(filter));
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        pageSize: this.state.pageSize,
        nowPage: this.state.nowPage,
      }));
    }
  }

  componentDidMount() {
    const { filter, getInvoices } = this.props;
    const { offset = 0, limit = 10 } = filter;
    const { localData = { formData: {} } } = this;
    const cacheFilter = {
      ...localData.formData,
      applyDateStart: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      applyDateEnd: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      invoiceTimeStart: localData.formData.EntityListInvoiceTime && localData.formData.EntityListInvoiceTime.length ? moment(localData.formData.EntityListInvoiceTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      invoiceTimeEnd: localData.formData.EntityListInvoiceTime && localData.formData.EntityListInvoiceTime.length ? moment(localData.formData.EntityListInvoiceTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
    });

    let cacheApplyDateStart = '';
    let cacheApplyDateEnd = '';
    if (cacheFilter){
      cacheApplyDateStart = cacheFilter.applyDateStart;
      cacheApplyDateEnd = cacheFilter.applyDateEnd;
    }

    let createTime;
    let newOffset;
    let newFilter;

    // 处理日期格式
    if (cacheApplyDateStart && cacheApplyDateEnd) createTime = [moment(cacheApplyDateStart), moment(cacheApplyDateEnd)];

    // 如果有缓存页码取缓存页码，否则取默认值
    if (cacheFilter && cacheFilter.offset){
      newOffset = cacheFilter.offset;
    } else {
      newOffset = offset;
    }

    if (this.invoiceStateInit){
      // 审核开票
      newFilter = this.props.setFilter({ ...cacheFilter, createTime });
      newFilter = { ...newFilter, invoiceState : this.invoiceStateInit, ...cacheFilter };
    } else {
      // 开票历史
      newFilter= this.props.setFilter({ ...cacheFilter, createTime });

    }

    getInvoices(newFilter).then(() => {
      this.setState({
        ready: true,
        nowPage: newOffset / limit + 1,
        pageSize: limit,
      });
    });

  }

  refresh = () => {
    const { filter, getInvoices } = this.props;
    const invoiceState = filter.invoiceState || (this.organizationType === 1 ? this.invoiceStateInit : undefined);
    getInvoices(invoiceState ? { ...filter, invoiceState } : {
      ...filter,
    });
  }

  cancelForm = () => {
    const formSchema = {
      invalidReason: {
        label: '作废原因',
        component: 'input.textArea',
        rules: {
          required: [true, '请输入作废原因'],
          max: 100,
          validator: ({ value }) => {
            if (!value.toString().trim()) {
              return '作废原因不能为空格';
            }
          },
        },
        placeholder: '请输入作废原因(最多100个字)',
      },
    };
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    return (
      <>
        <SchemaForm className='invoicingList_reject_form' layout='vertical' schema={formSchema}>
          <Item field='invalidReason' {...formItemLayout} />
          <div styleName='button_box'>
            <Button style={{ marginRight: '20px' }} onClick={this.handleCancel}>取消</Button>
            <DebounceFormButton label='确定' type='primary' onClick={this.cancelInvoice} />
          </div>
        </SchemaForm>
      </>
    );
  }

  cancelInvoice = (value) => {
    patchInvoice(this.patchInvoiceId, { invoiceState: INVOICES_LIST_STATE.CANCEL, ...value }).then(() => {
      notification.success({
        message: '作废成功',
        description: '已成功作废该开票申请',
      });
      this.refresh();
      this.handleCancel();
    });
  }

  handleCancel = () => {
    this.setState({
      cancelVisible: false,
    });
  }

  searchSchema = {
    invoiceNo: {
      label: '发票号码:',
      placeholder: '请输入发票号码',
      component: 'input',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return { };
        }
      }),
    },
    invoiceState: {
      label: '开票状态:',
      placeholder: '请选择开票状态',
      component: 'select',
      mode: 'multiple',
      options: this.organizationType === 1 ?
        [{
          label: '待审核',
          value: INVOICES_LIST_STATE.PENDING,
          key: INVOICES_LIST_STATE.PENDING,
        }, {
          label: '开票中',
          value: INVOICES_LIST_STATE.PROCESSING,
          key: INVOICES_LIST_STATE.PROCESSING,
        }, {
          label: '部分已开票',
          value: INVOICES_LIST_STATE.PARTIALLY_DONE,
          key: INVOICES_LIST_STATE.PARTIALLY_DONE,
        }, {
          label: '已开票',
          value: INVOICES_LIST_STATE.DONE,
          key: INVOICES_LIST_STATE.DONE,
        }, {
          label: '已拒绝',
          value: INVOICES_LIST_STATE.REFUSE,
          key: INVOICES_LIST_STATE.REFUSE,
        }]
        :
        [{
          label: '草稿',
          value: INVOICES_LIST_STATE.DRAFT,
          key: INVOICES_LIST_STATE.DRAFT,
        }, {
          label: '待审核',
          value: INVOICES_LIST_STATE.PENDING,
          key: INVOICES_LIST_STATE.PENDING,
        }, {
          label: '开票中',
          value: INVOICES_LIST_STATE.PROCESSING,
          key: INVOICES_LIST_STATE.PROCESSING,
        }, {
          label: '部分已开票',
          value: INVOICES_LIST_STATE.PARTIALLY_DONE,
          key: INVOICES_LIST_STATE.PARTIALLY_DONE,
        }, {
          label: '已开票',
          value: INVOICES_LIST_STATE.DONE,
          key: INVOICES_LIST_STATE.DONE,
        }, {
          label: '被拒绝',
          value: INVOICES_LIST_STATE.REFUSE,
          key: INVOICES_LIST_STATE.REFUSE,
        }, {
          label: '已作废',
          value: INVOICES_LIST_STATE.CANCEL,
          key: INVOICES_LIST_STATE.CANCEL,
        }],
    },
    createTime: {
      label: '申请日期:',
      component: 'rangePicker',
    },
    organizationType: {
      label: '开票类别',
      component: 'select',
      placeholder: '请选择机构类型',
      options: [
        { label: '托运开票', value: '4' },
        { label: '承运开票', value: '5' }],
    },
    invoiceTitle: {
      label: '发票抬头',
      component: 'input',
      placeholder: '请输入发票抬头',
    },
    EntityListInvoiceTime :{
      label : '开票时间',
      component: 'rangePicker',
      format:{
        input: (value) => {
          if (Array.isArray(value)) {
            return value.map(item => moment(item));
          }
          return value;
        },
        output: (value) => value
      },
    },
    orderNo : {
      label : '收款单号',
      component : 'input',
      placeholder :'请输入收款单号',
    },
    accountTransportNo : {
      label :'对账单号',
      component : 'input',
      placeholder :'请输入对账单号',
    },
    orderPaidStateList : {
      label : '支付状态',
      component: 'select',
      mode: 'multiple',
      placeholder: '请选择支付状态',
      options: [
        { label: '未支付', value: 1, key : 1 },
        { label: '部分支付', value: 2, key : 2 },
        { label: '已支付', value: 3, key : 3 },
      ],
    }
  }

  searchForm = () => {
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        xl: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        xl: { span: 18 },
      },
    };
    return (
      <>
        <SearchForm schema={this.searchSchema} layout='inline' {...layout}>
          <Item field='invoiceNo' />
          <Item field='invoiceState' />
          <Item field='createTime' />
          <Item field='organizationType' />
          <Item field='invoiceTitle' />
          <Item field='EntityListInvoiceTime' />
          <Item field='orderNo' />
          <Item field='accountTransportNo' />
          <Item field='orderPaidStateList' />
          <div style={{ marginTop : '1rem' }}>
            <DebounceFormButton debounce label='查询' type='primary' onClick={this.handleSearch} />
            <DebounceFormButton label='重置' style={{ marginLeft: '10px' }} onClick={this.handleResetClick} />
            <Button style={{ marginLeft: '10px' }} type='primary' onClick={this.handleExportExcelBtnClick}>导出excel</Button>
            <Button style={{ marginLeft: '10px' }} type='primary' onClick={this.handleExportTransportDetail}>导出运单明细</Button>
          </div>
        </SearchForm>
      </>
    );
  }

  handleExportExcelBtnClick = () =>{
    const { filter } = this.props;
    const { createTime, EntityListInvoiceTime } = filter;
    const applyDateStart =  createTime && createTime.length ? moment(createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const applyDateEnd = createTime && createTime.length ? moment(createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const invoiceTimeStart =  EntityListInvoiceTime && EntityListInvoiceTime.length ? moment(EntityListInvoiceTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const invoiceTimeEnd = EntityListInvoiceTime && EntityListInvoiceTime.length ? moment(EntityListInvoiceTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;

    const params = {
      ...filter,
      applyDateStart,
      applyDateEnd,
      invoiceTimeStart,
      invoiceTimeEnd,
      limit: 100000,
      offset: 0,
    };

    if (params.invoiceState === undefined){
      params.invoiceState = this.organizationType === 1 ? this.invoiceStateInit : undefined;
    }

    routerToExportPage(sendInvoicesExcelPost, params);
  }

  handleExportTransportDetail = () => {
    const { filter } = this.props;
    const { createTime, EntityListInvoiceTime } = filter;
    const applyDateStart =  createTime && createTime.length ? moment(createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const applyDateEnd = createTime && createTime.length ? moment(createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const invoiceTimeStart =  EntityListInvoiceTime && EntityListInvoiceTime.length ? moment(EntityListInvoiceTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const invoiceTimeEnd = EntityListInvoiceTime && EntityListInvoiceTime.length ? moment(EntityListInvoiceTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;

    let params = {
      ...filter,
      applyDateStart,
      applyDateEnd,
      invoiceTimeStart,
      invoiceTimeEnd,
      limit: 100000,
      offset: 0,
    };

    if (params.invoiceState === undefined){
      params.invoiceState = this.organizationType === 1 ? this.invoiceStateInit : undefined;
    }

    const { selectedRow } = this.state;
    if (selectedRow){
      const invoiceIdList = selectedRow.map(item=>item.invoiceId).join(',');
      params = { ...params, invoiceIdList };
    }
    routerToExportPage(exportInvoicesTransport, params);
  }


  handleSearch = (value) => {
    const applyDateStart =  value.createTime && value.createTime.length ? moment(value.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const applyDateEnd = value.createTime && value.createTime.length ? moment(value.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const invoiceTimeStart =  value.EntityListInvoiceTime && value.EntityListInvoiceTime.length ? moment(value.EntityListInvoiceTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const invoiceTimeEnd = value.EntityListInvoiceTime && value.EntityListInvoiceTime.length ? moment(value.EntityListInvoiceTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const newFilter = this.props.setFilter({
      ...this.props.filter,
      invoiceTimeStart,
      invoiceTimeEnd,
      applyDateStart, applyDateEnd,
      limit: 10,
      offset: 0,
    });
    this.setState({
      nowPage: 1,
    });
    let invoiceStateNew;
    if (newFilter.invoiceState !== undefined){
      invoiceStateNew = newFilter.invoiceState;
    } else {
      invoiceStateNew = this.organizationType === 1 ? this.invoiceStateInit : undefined;
    }
    this.props.getInvoices({ ...newFilter, invoiceState : invoiceStateNew });
  }

  handleResetClick = () => {
    this.setState({
      nowPage: 1,
      pageSize: 10,
    });
    const newFilter = this.props.resetFilter();
    const invoiceState = newFilter.invoiceState || (this.organizationType === 1 ? this.invoiceStateInit : undefined);
    this.props.getInvoices(invoiceState ? {
      ...newFilter,
      invoiceState,
    } : { ...newFilter });
  }

  cancelDom = (text) => (
    <div style={{ display: 'inline-block', width: '200px', whiteSpace: 'normal', breakWord: 'break-all' }}>{text}</div>
  )

  toTransports = (orderId) => {
    router.push(`/buiness-center/transportList/transport?orderIdlist=${orderId}`);
  }


  expressFormHandleCancel = () => {
    this.setState({
      expressVisible: false,
      company: '',
    });
  }

  writeExpressCompany = (val) => {
    this.setState({
      company: val,
    });
  }

  verifyFormHandleCancel = () => {
    this.setState({
      verifyVisible: false,
    });
  }

  egisInvoice = () => {
    patchInvoice(this.patchInvoiceId, { invoiceState: INVOICES_LIST_STATE.PROCESSING }).then(() => {
      notification.success({
        message: '审核通过',
        description: '已审核通过该开票申请',
      });
      this.verifyFormHandleCancel();
      this.handleVisibleHide();
      this.refresh();
    });
  }

  handleVisibleChange = rejectVisible => {
    this.setState({ rejectVisible });
  }

  handleVisibleHide = () => {
    this.setState({ rejectVisible: false });
  }

  rejectThisInvoice = (value) => {
    const params = { ...value, invoiceState: INVOICES_LIST_STATE.REFUSE };
    patchInvoice(this.patchInvoiceId, params).then(() => {
      notification.success({
        message: '拒绝成功',
        description: '已拒绝该开票申请',
      });
      this.verifyFormHandleCancel();
      this.handleVisibleHide();
      this.refresh();
    });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit,
    });
    const newFilter = this.props.setFilter({ offset, limit });
    const invoiceState = newFilter.invoiceState || (this.organizationType === 1 ? this.invoiceStateInit : undefined);
    this.props.getInvoices(invoiceState ? {
      ...newFilter,
      invoiceState,
    } : { ...newFilter });
  }

  onSelectRow = (selectedRow) => {
    this.setState({
      selectedRow,
    });
  }

  render() {
    const { modalType, nowPage, pageSize, cancelVisible, expressVisible, verifyVisible, rejectVisible, ready, showInvoiceDentryidModal, invoiceDentryidIndex, invoiceCorrelationEntityList, detail, company, currentInvoiceCorrelationEntityList } = this.state;
    const { lists } = this.props;

    return (
      ready &&
      <>
        <Table
          rowKey='invoiceId'
          dataSource={lists}
          schema={this.tableSchema}
          renderCommonOperate={this.searchForm}
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          onSelectRow={this.onSelectRow}
          multipleSelect
        />
        <Modal
          visible={cancelVisible}
          destroyOnClose
          maskClosable={false}
          title='作废原因'
          onCancel={this.handleCancel}
          footer={null}
        >
          {this.cancelForm()}
        </Modal>

        {/* <InvoiceModal
          company={company}
          expressVisible={expressVisible}
          expressFormHandleCancel={this.expressFormHandleCancel}
          writeExpressCompany={this.writeExpressCompany}
          expressFormData={this.expressFormData}
          refresh={this.refresh}
          patchInvoiceId={this.patchInvoiceId}
        /> */}
          {
            detail &&
            <InvoiceTable
              detail={detail}
              verifyVisible={verifyVisible}
              rejectVisible={rejectVisible}
              verifyFormHandleCancel={this.verifyFormHandleCancel}
              handleVisibleChange={this.handleVisibleChange}
              egisInvoice={this.egisInvoice}
              rejectThisInvoice={this.rejectThisInvoice}
              handleVisibleHide={this.handleVisibleHide}
            />
          }
        {expressVisible && <UpdateInvoice
          company={company}
          expressVisible={expressVisible}
          expressFormHandleCancel={this.expressFormHandleCancel}
          writeExpressCompany={this.writeExpressCompany}
          expressFormData={this.expressFormData}
          refresh={this.refresh}
          patchInvoiceId={this.patchInvoiceId}
          modalType={modalType}
          invoiceCorrelationEntityList={currentInvoiceCorrelationEntityList}
        />}
        <Modal
          title='发票号码'
          footer={null}
          width={648}
          maskClosable={false}
          destroyOnClose
          visible={showInvoiceDentryidModal}
          onCancel={() => this.setState({ showInvoiceDentryidModal: false, invoiceDentryidIndex:0, invoiceCorrelationEntityList:[] })}
        >
          <div style={{ textAlign : 'center' }}>票号：{invoiceCorrelationEntityList[invoiceDentryidIndex]?.invoiceNo}</div>
          <ImageDetail onImgChange={(invoiceDentryidIndex)=>this.setState({ invoiceDentryidIndex })} index={invoiceDentryidIndex} imageData={invoiceCorrelationEntityList.map(item=>getOssImg(item.invoiceDentryid))} />
        </Modal>
      </>
    );
  }
}
