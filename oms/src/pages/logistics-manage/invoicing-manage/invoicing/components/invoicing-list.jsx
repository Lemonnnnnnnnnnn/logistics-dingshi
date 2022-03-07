import React, { Component } from 'react';
import { Button, Modal, notification, Icon, Popover } from 'antd';
import CSSModules from 'react-css-modules';
import moment from 'moment';
import router from 'umi/router';
import { connect } from 'dva';
import { SchemaForm, Observer, Item } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../../../components/debounce-form-button';
import SearchForm from '../../../../../components/table/search-form2';
import { FilterContextCustom } from '../../../../../components/table/filter-context';
import Table from '../../../../../components/table/table';
import '@gem-mine/antd-schema-form/lib/fields';
import { INVOICES_LIST_STATE } from '../../../../../constants/project/project';
import model from '../../../../../models/invoices';
import { getUserInfo } from '../../../../../services/user';
import UploadFile from '../../../../../components/upload/upload-file';
import auth from '../../../../../constants/authCodes';
import { getInvoicesStatus, getInvoicesPaidStatus } from '../../../../../services/project';
import {
  patchInvoice,
  detailInvoice,
  sendInvoiceDetailExcelPost,
  sendInvoicesExcelPost,
} from "../../../../../services/apiService";
import { pick, getOssImg, digitUppercase, translatePageType, routerToExportPage } from '../../../../../utils/utils';
import ImageDetail from "../../../../../components/image-detail";
import styles from './invoicing-list.less';
import ExpressNoInput from './express-no-input';

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
  };
}

@connect(mapStateToProps, { getInvoices })
@CSSModules(styles, { allowMultiple: true })
@FilterContextCustom
export default class InvoicingList extends Component {

  organizationType = getUserInfo().organizationType// 3为货权 4为托运  5为承运

  state = {
    cancelVisible: false,
    expressVisible: false,
    verifyVisible: false,
    company: '',
    pageSize: 10,
    nowPage: 1,
    ready: false,
    invoiceDentryidIndex : 0,
    invoiceCorrelationEntityList : [],
    showInvoiceDentryidModal : false
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
          dataIndex: 'totalFreight',
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
                  this.props.history.push(`history/modify?pageKey=${record.invoiceId}`,{
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
                  company: '',
                });
              },
              display: [1],
              auth: [thisAuth.HAD_SENDED],
            },
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
                  company: '',
                });
              },
              display: [1],
              auth: [thisAuth.HAD_SENDED],
            },
          ],
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
  }

  componentDidMount() {
    const { filter, getInvoices } = this.props;
    const { offset = 0, limit = 10 } = filter;
    const cacheFilter = JSON.parse(window.sessionStorage.getItem('invoicingFilter'));
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
    },
    invoiceState: {
      label: '开票状态:',
      placeholder: '请选择开票状态',
      component: 'select',
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
          <DebounceFormButton debounce label='查询' type='primary' onClick={this.handleSearch} />
          <DebounceFormButton label='重置' style={{ marginLeft: '10px' }} onClick={this.handleResetClick} />
          <DebounceFormButton style={{ marginLeft: '10px' }} label='导出excel' type='primary' onClick={this.handleExportExcelBtnClick} />
        </SearchForm>
      </>
    );
  }

  handleExportExcelBtnClick = () =>{
    const { filter } = this.props;

    const params = {
      ...filter,
      limit: 100000,
      offset: 0,
    };

    if (params.invoiceState === undefined){
      params.invoiceState = this.organizationType === 1 ? this.invoiceStateInit : undefined;
    }

    routerToExportPage(sendInvoicesExcelPost, params);
  }

  handleSearch = (value) => {
    const applyDateStart = value.createTime && value.createTime.length ? value.createTime[0].set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const applyDateEnd = value.createTime && value.createTime.length ? value.createTime[1].set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const newFilter = this.props.setFilter({
      ...this.props.filter, ...{ applyDateStart, applyDateEnd }, ...{
        limit: 10,
        offset: 0,
      },
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

  toInvoiceImage = (orderPayDentryid) => {
    window.open(getOssImg(orderPayDentryid));
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

  formSchema = {
    invoiceNo: {
      label: '发票号码:',
      component: 'input',
      rules: {
        required: [true, '请输入发票号码'],
        validator: ({ value }) => {
          if (!value.toString().trim()) {
            return '发票号码不能为空';
          }
        },
      },
      placeholder: '请输入发票号码',
    },
    actualInvoiceAmount: {
      label: '开票金额:',
      component: 'input',
      rules: {
        required: [true, '请输入发票号码'],
        validator: ({ value }) => {
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '请正确输入开票金额!   (最高支持两位小数)';
          if (value <= 0) return '请正确输入开票金额!   (最高支持两位小数)';
          const { hadSended, shouldInvoiceAmount } = this.expressFormData;
          if (Number(value) > (Number(shouldInvoiceAmount) - Number(hadSended)).toFixed(2)) {
            return '开票金额超出剩余可开票金额';
          }
        },
      },
      placeholder: '请输入开票金额',
    },
    expressNo: {
      label: '快递单号:',
      component: ExpressNoInput,
      rules: {
        required: [true, '请输入快递单号'],
        validator: ({ value }) => {
          if (!value.toString().trim()) {
            return '快递单号不能为空';
          }
        },
      },
      placeholder: '请输入快递单号',
      writeExpressCompany: this.writeExpressCompany,
    },
    expressCompany: {
      label: '快递公司:',
      component: 'input',
      rules: {
        required: [true, '请输入快递公司'],
        validator: ({ value }) => {
          if (!value.toString().trim()) {
            return '快递公司不能为空';
          }
        },
      },
      placeholder: '请输入快递公司',
      value: Observer({
        watch: '*company',
        action: (company) => company,
      }),
    },
    uploadFile: {
      label: '上传发票:',
      component: UploadFile,
      rules: {
        required: [true, '请上传发票'],
      },
    },
  }

  expressFormRef = React.createRef()

  expressForm = () => {
    const { company } = this.state;
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
      <SchemaForm
        hideRequiredMark
        className='invoicingList_form'
        ref={this.expressFormRef}
        layout='vertical'
        {...formItemLayout}
        schema={this.formSchema}
        trigger={{ company }}
      >
        <Item field='invoiceNo' />
        <Item field='actualInvoiceAmount' />
        <Item field='expressNo' />
        <Item field='expressCompany' />
        <Item field='uploadFile' />
        <div styleName='button_box'>
          <Button style={{ marginRight: '20px' }} onClick={this.expressFormHandleCancel}>取消</Button>
          <DebounceFormButton label='确定' type='primary' onClick={this.postExpressInfo} />
        </div>
      </SchemaForm>
    );
  }

  postExpressInfo = (value) => {
    // PARTIALLY_DONE
    const invoiceDentryid = value.uploadFile[0];
    delete value.uploadFile;
    value = { ...value, invoiceDentryid };
    const { hadSended, shouldInvoiceAmount } = this.expressFormData;
    if ((Number(hadSended) + Number(value.actualInvoiceAmount)).toFixed(2) === Number(shouldInvoiceAmount)) {
      value.invoiceState = INVOICES_LIST_STATE.DONE;
    } else {
      value.invoiceState = INVOICES_LIST_STATE.PARTIALLY_DONE;
    }
    patchInvoice(this.patchInvoiceId, value).then(() => {
      notification.success({
        message: '开出成功',
        description: '已成功提交开票信息',
      });
      this.expressFormHandleCancel();
      this.refresh();
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

  rejectFormSchema = {
    verifyReason: {
      label: '拒绝理由',
      component: 'input.textArea',
      rules: {
        required: [true, '请填写拒绝理由'],
        max: 100,
        validator: ({ value }) => {
          if (!value.toString().trim()) {
            return '拒绝理由不能为空';
          }
        },
      },
      placeholder: '请填写拒绝理由(最多100个字)',
    },
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

  formatData = (arr) => {
    const str = arr.slice(0, 3).join('、');
    return arr.length > 3 ? `${str}等` : str;
  }

  invoiceTable = () => {
    const { detail } = this.state;
    if (detail) {
      const {
        priceExcludingTax,
        tax,
        logisticsBankAccountEntity: plat,
        logisticsUserInvoiceEntity: user,
        invoiceEntity: info,
        transportRouteList,
        goodsNameList,
        carType,
        carNo,
      } = detail;
      return (
        <>
          <table border='1' cellSpacing='0' cellPadding='5px' width='100%'>
            <tbody>
              <tr>
                <td width='5px'>购买方</td>
                <td width='340px' styleName='infoCard'>
                  <p>
                    <span>名&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;称：</span>{user.invoiceTitle}
                  </p>
                  <p><span>纳税人识别号：</span>{user.invoiceNo}</p>
                  <p styleName='font-size12'>
                    <span styleName='font-size14'>地 址、电 话：</span>{user.mailingAddress}&nbsp;{user.recipientPhone}
                  </p>
                  <p styleName='font-size13'><span
                    styleName='font-size14'
                  >开户行及账号：
                  </span>{user.openingBank}&nbsp;{user.bankAccount}
                  </p>
                </td>
                <td width='5px'>密码区</td>
                <td styleName='passwordArea'><span>开票之后生成</span></td>
              </tr>
            </tbody>
          </table>
          <table
            border='1'
            cellSpacing='0'
            cellPadding='5px'
            style={{ borderTop: 'none', borderBottom: 'none' }}
            width='100%'
          >
            <tbody>
              <tr>
                <td width='232px'>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>货物或应税劳务、服务名称</p>
                  <p style={{ textAlign: 'center' }}>运输服务、运费</p>
                  <p style={{
                    textAlign: 'center',
                    marginTop: '40px',
                    marginBottom: 0,
                  }}
                  >合&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;计
                  </p>
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>规格型号</p>
                  <p style={{ textAlign: 'center' }}>水泥</p>
                  <p style={{ textAlign: 'center', marginTop: '61px', marginBottom: 0 }} />
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>单位</p>
                  <p style={{ textAlign: 'center' }}>&nbsp;</p>
                  <p style={{ textAlign: 'center', marginTop: '61px', marginBottom: 0 }} />
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>数量</p>
                  <p style={{ textAlign: 'center' }}>&nbsp;</p>
                  <p style={{ textAlign: 'center', marginTop: '61px', marginBottom: 0 }} />
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>单价</p>
                  <p style={{ textAlign: 'center' }}>&nbsp;</p>
                  <p style={{ textAlign: 'center', marginTop: '61px', marginBottom: 0 }} />
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>金额</p>
                  <p style={{ textAlign: 'center' }}>{priceExcludingTax.toFixed(2)._toFixed(2)}</p>
                  <p style={{
                    textAlign: 'center',
                    marginTop: '40px',
                    marginBottom: 0,
                  }}
                  >￥{priceExcludingTax.toFixed(2)._toFixed(2)}
                  </p>
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>税率</p>
                  <p style={{ textAlign: 'center' }}>{`${info.invoiceTax * 100}%`}</p>
                  <p style={{ textAlign: 'center', marginTop: '61px', marginBottom: 0 }} />
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>税额</p>
                  <p style={{ textAlign: 'center' }}>{tax.toFixed(2)._toFixed(2)}</p>
                  <p style={{ textAlign: 'center', marginTop: '40px', marginBottom: 0 }}>￥{tax.toFixed(2)._toFixed(2)}</p>
                </td>
              </tr>
            </tbody>
          </table>
          <table border='1' cellSpacing='0' cellPadding='5px' style={{ borderBottom: 'none' }} width='100%'>
            <tbody>
              <tr>
                <td width='232px'>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>价税合计(大写)</p>
                </td>
                <td>
                  <span>{digitUppercase(Number(info.shouldInvoiceAmount.toFixed(2))._toFixed(2))}</span>
                  <span styleName='totalMoney'>(小写)￥{info.shouldInvoiceAmount.toFixed(2)._toFixed(2)}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <table border='1' cellSpacing='0' cellPadding='5px' width='100%'>
            <tbody>
              <tr>
                <td width='5px'>销售方</td>
                <td width='341px' styleName='infoCard'>
                  <p>
                    <span>名&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;称：</span>{plat.invoiceTitle}
                  </p>
                  <p><span>纳税人识别号：</span>{plat.invoiceNo || '--'}</p>
                  <p styleName='font-size12'>
                    <span styleName='font-size14'>地 址、电 话：</span>平潭综合实验区北厝镇金井二路台湾创业园31号楼三层C6区&nbsp;18650383900
                  </p>
                  <p styleName='font-size13'><span
                    styleName='font-size14'
                  >开户行及账号：
                  </span>{plat.bankName}&nbsp;{plat.bankAccount}
                  </p>
                </td>
                <td width='5px'>备注</td>
                <td width='341px' styleName='infoCard p_margin3'>
                  <p><span>运输公司：</span>{user.invoiceTitle}</p>
                  <p><span>运输路线：</span>{this.formatData(transportRouteList)}</p>
                  <p><span>货物名称：</span>{this.formatData(goodsNameList)}</p>
                  <p><span>车辆型号：</span>{carType && this.formatData(carType) || '--'}</p>
                  <p>
                    <span>车 牌 号：</span>
                    {this.formatData(carNo)}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      );
    }
    return '';
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

  render() {
    const { nowPage, pageSize, cancelVisible, expressVisible, verifyVisible, rejectVisible, ready, showInvoiceDentryidModal, invoiceDentryidIndex, invoiceCorrelationEntityList } = this.state;
    const { lists } = this.props;
    const dom = (
      <>
        <p style={{ marginBottom: '10px' }}>
          <Icon style={{ color: 'red', marginRight: '5px' }} type='close-circle' theme='filled' />请填写拒绝理由
        </p>
        <SchemaForm className='invoicingList_reject_form' layout='vertical' schema={this.rejectFormSchema}>
          <Item field='verifyReason' />
          <div styleName='effect_button_box'>
            <DebounceFormButton size='small' label='确定' type='primary' onClick={this.rejectThisInvoice} />
            <Button size='small' onClick={this.handleVisibleHide}>取消</Button>
          </div>
        </SchemaForm>
      </>
    );
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
        <Modal
          visible={expressVisible}
          destroyOnClose
          maskClosable={false}
          title='已开出'
          onCancel={this.expressFormHandleCancel}
          footer={null}
        >
          {this.expressForm()}
        </Modal>
        <Modal
          visible={verifyVisible}
          destroyOnClose
          maskClosable={false}
          title='审核'
          width='780px'
          onCancel={this.verifyFormHandleCancel}
          footer={
            <div styleName='verify_button_box' style={{ border: 'none' }}>
              <Popover
                content={dom}
                trigger='click'
                visible={rejectVisible}
                onVisibleChange={this.handleVisibleChange}
              >
                <Button style={{ marginRight: '20px' }} onClick={this.handleVisibleChange}>拒绝</Button>
              </Popover>
              <Button type='primary' onClick={this.egisInvoice}>通过</Button>
            </div>
          }
        >
          {this.invoiceTable()}
        </Modal>
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
