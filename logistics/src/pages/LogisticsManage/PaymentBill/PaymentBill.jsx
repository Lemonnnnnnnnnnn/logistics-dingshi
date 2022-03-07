import React, { Component } from 'react';
import { Button, Modal, notification, Popover, message, Tag, Icon } from 'antd';
import CSSModules from 'react-css-modules';
import { connect } from 'dva';
import moment from 'moment';
import { SchemaForm, Item, Observer } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import DebounceFormButton from '../../../components/DebounceFormButton';
import { FilterContextCustom } from "@/components/Table/FilterContext";
import SearchForm from '../../../components/Table/SearchForm2';
import Table from '../../../components/Table/Table';
import '@gem-mine/antd-schema-form/lib/fields';
import model from '../../../models/orders';
import { getNetworkOrderStatus, getOrderCompleteStatus, getOrderInvoiceStatus } from "@/services/project";
import { pick, translatePageType, routerToExportPage, dealElement, getLocal, omit } from '../../../utils/utils';
import auth from '../../../constants/authCodes';
import Authorized from '../../../utils/Authorized';
import {
  NETWORK_ORDER_STATE,
  ORDER_COMPLETE_STATUS,
  ORDER_INTERNAL_STATUS,
  ORDER_INVOICE_STATUS,
} from "@/constants/project/project";
import { getUserInfo } from "@/services/user";
import {
  patchOrders,
  getShipmentVirtualAccount,
  getCalcOrders,
  sendOrdersExcelPost,
} from "@/services/apiService";
import styles from './PaymentBill.less';
import PayForm from './component/PayForm';
import Card from './component/Card';

const {
  PAY_BILL_CREATE,
  PAY_BILL_CANCEL,
  PAY_BILL_PAY,
  PAY_BILL_EXCEL,
  PAY_BILL_PAY_ORDER,
  PAY_BILL_VISIT,
} = auth;

const { actions: { getOrders } } = model;

function mapStateToProps(state) {
  return {
    commonStore: state.commonStore,
    orderList: pick(state.orders, ['items', 'count']),
    loading : state.loading
  };
}

@connect(mapStateToProps, { getOrders  })
@FilterContextCustom
@CSSModules(styles, { allowMultiple: true })
export default class OrderHistory extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  organizationType = getUserInfo().organizationType;

  state = {
    visible: false,
    payFormVisible: false,
    payedPrice: 0,
    nowPage: 1,
    pageSize: 10,
    count: 0,
    totalTransportsNum: 0,
    totalPrice: 0,
    toggleFlag: true,
    cardRenderState: [
      {
        id: 'transportCost',
        visible: false,
        display: true,
      },
      {
        id: 'serviceCharge',
        visible: false,
        display: true,
      },
      {
        id: 'shouldPay',
        visible: false,
        display: true,
      },
    ],
    totalData: undefined,
  };

  constructor(props) {
    super(props);
    this.initOrderStateList = this.organizationType === 1 ? '0,1,2,4,5' : '';
  }

  tableRef = React.createRef();

  searchSchema = {
    projectName: {
      label: '项目名称',
      component: 'input',
      placeholder: '请输入项目名称',
    },
    completeStatus: {
      label: '完成状态',
      component: 'select',
      placeholder: '请选择完成状态',
      visible: this.organizationType === 4 || this.organizationType === 5,
      options: () => [
        {
          label: '未完成',
          value: ORDER_COMPLETE_STATUS.UNCOMPLETE.toString(),
          key: ORDER_COMPLETE_STATUS.UNCOMPLETE.toString(),
        }, {
          label: '已完成',
          value: ORDER_COMPLETE_STATUS.COMPLETE.toString(),
          key: ORDER_COMPLETE_STATUS.COMPLETE.toString(),
        },
      ],
    },
    orderStateList: {
      label: '支付状态',
      placeholder: '请选择订单状态',
      component: 'select',
      options: () => {
        const { organizationType } = this;
        switch (organizationType) {
          case 5:
            return [
              {
                label: '未支付',
                value: NETWORK_ORDER_STATE.UNPAID.toString(),
                key: NETWORK_ORDER_STATE.UNPAID.toString(),
              }, {
                label: '处理中',
                value: `${NETWORK_ORDER_STATE.PROCESSING.toString()}`,
                key: `${NETWORK_ORDER_STATE.PROCESSING.toString()}`,
              }, {
                label: '已作废',
                value: NETWORK_ORDER_STATE.CANCEL.toString(),
                key: NETWORK_ORDER_STATE.CANCEL.toString(),
              }, {
                label: '已支付',
                value: NETWORK_ORDER_STATE.COMPLETED.toString(),
                key: NETWORK_ORDER_STATE.COMPLETED.toString(),
              }, {
                label: '支付失败',
                value: NETWORK_ORDER_STATE.FAIL.toString(),
                key: NETWORK_ORDER_STATE.FAIL.toString(),
              },
              {
                label: '部分支付',
                value: NETWORK_ORDER_STATE.PARTIALLY_COMPLETED,
                key: NETWORK_ORDER_STATE.PARTIALLY_COMPLETED,
              },
            ];
          case 4:
            return [
              {
                label: '未支付',
                value: NETWORK_ORDER_STATE.UNPAID.toString(),
                key: NETWORK_ORDER_STATE.UNPAID.toString(),
              }, {
                label: '处理中',
                value: `${NETWORK_ORDER_STATE.PROCESSING.toString()}`,
                key: `${NETWORK_ORDER_STATE.PROCESSING.toString()}`,
              }, {
                label: '已作废',
                value: NETWORK_ORDER_STATE.CANCEL.toString(),
                key: NETWORK_ORDER_STATE.CANCEL.toString(),
              }, {
                label: '已支付',
                value: NETWORK_ORDER_STATE.COMPLETED.toString(),
                key: NETWORK_ORDER_STATE.COMPLETED.toString(),
              }, {
                label: '支付失败',
                value: NETWORK_ORDER_STATE.FAIL.toString(),
                key: NETWORK_ORDER_STATE.FAIL.toString(),
              },
              {
                label: '部分支付',
                value: NETWORK_ORDER_STATE.PARTIALLY_COMPLETED,
                key: NETWORK_ORDER_STATE.PARTIALLY_COMPLETED,
              },
            ];
          case 1:
            return [
              {
                label: '未支付',
                value: NETWORK_ORDER_STATE.UNPAID.toString(),
                key: NETWORK_ORDER_STATE.UNPAID.toString(),
              },
              {
                label: '处理中',
                value: `${NETWORK_ORDER_STATE.PROCESSING.toString()}`,
                key: `${NETWORK_ORDER_STATE.PROCESSING.toString()}`,
              }, {
                label: '已支付',
                value: NETWORK_ORDER_STATE.COMPLETED.toString(),
                key: NETWORK_ORDER_STATE.COMPLETED.toString(),
              }, {
                label: '支付失败',
                value: NETWORK_ORDER_STATE.FAIL.toString(),
                key: NETWORK_ORDER_STATE.FAIL.toString(),
              },
              {
                label: '部分支付',
                value: NETWORK_ORDER_STATE.PARTIALLY_COMPLETED.toString(),
                key: NETWORK_ORDER_STATE.PARTIALLY_COMPLETED.toString(),
              },
            ];
          default:
            break;
        }
      },
    },
    isCreateInvoice: {
      label: '开票状态',
      component: 'select',
      placeholder: '请选择开票状态',
      options: () => [
        {
          label: '未开票',
          value: ORDER_INVOICE_STATUS.UNCOMPLETE.toString(),
          key: ORDER_INVOICE_STATUS.UNCOMPLETE.toString(),
        }, {
          label: '已开票',
          value: ORDER_INVOICE_STATUS.COMPLETE.toString(),
          key: ORDER_INVOICE_STATUS.COMPLETE.toString(),
        }, {
          label: '开票中',
          value: ORDER_INVOICE_STATUS.PENDING.toString(),
          key: ORDER_INVOICE_STATUS.PENDING.toString(),
        }, {
          label: '待审核',
          value: ORDER_INVOICE_STATUS.UNAUDITED.toString(),
          key: ORDER_INVOICE_STATUS.UNAUDITED.toString(),
        },
      ],
    },
    createTime: {
      label: '付款单生成时间',
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
    payTime: {
      label: '付款单支付时间',
      component: 'rangePicker',
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
    orderNo: {
      label: '付款单号',
      placeholder: '请输入付款单号',
      component: 'input',
    },
    invoiceTitle :{
      label :'付款账户名称',
      placeholder :'请输入账户名称',
      component :'input',
      visible: this.organizationType === 1,
    },
    bankAccount :{
      label :'付款银行账号',
      placeholder :'请输入付款银行名称',
      component :'input',
      visible: this.organizationType === 1,
    }
  };

  formLayOut = {
    labelCol: {
      xs: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 18 },
    },
  };

  payOrderList = [];

  turnPage = (pageInfo) => {
    const { offset, limit, current } = translatePageType(pageInfo);
    this.setState({
      nowPage: current,
      pageSize: limit,
    });
    const newFilter = this.props.setFilter({ offset, limit });
    const filterNewFilter = !newFilter.orderStateList && this.organizationType === 1 ? {
      ...newFilter,
      orderStateList: this.initOrderStateList,
      orderCreateType: 1,
    } : newFilter;
    this.props.getOrders(filterNewFilter);
  };

  toTransports = (orderId, orderState) => {
    router.push(`paymentBill/transport?orderIdlist=${orderId}&orderState=${orderState}`);
  };

  toProof = (orderId) => {
    router.push(`paymentBill/proofDetail?orderId=${orderId}`);
  };

  tableSchema = {
    variable: true,
    minWidth: 2850,
    columns: [
      {
        title: '完成状态',
        dataIndex: 'completeStatus',
        width: '100px',
        fixed: 'left',
        render: (text, record) => {
          if (record.orderState === 3) return '--';
          const status = record.completeStatus ? getOrderCompleteStatus(record.completeStatus) : {
            word: '未完成',
            color: 'orange',
          };
          return (
            <span style={{ color: status.color }}>
              {status.word}
            </span>
          );
        },
      }, {
        title: '支付状态',
        dataIndex: 'orderState',
        width: '100px',
        fixed: 'left',
        render: (text, record) => {
          const status = getNetworkOrderStatus(record.orderState);
          return (
            <span style={{ color: status.color }}>
              {status.word}
            </span>
          );
        },
      }, {
        title: '开票状态',
        dataIndex: 'isCreateInvoice',
        width: '100px',
        fixed: 'left',
        render: (text, record) => {
          if (record.orderState === 3) return '--';
          const status = record.isCreateInvoice ? getOrderInvoiceStatus(record.isCreateInvoice) : {
            word: '未开票',
            color: 'orange',
          };
          return (
            <span style={{ color: status.color }}>
              {status.word}
            </span>
          );
        },
      }, {
        title: '付款单号',
        dataIndex: 'orderNo',
        width: '180px',
        fixed: 'left',
        render: (text, record) => {
          let inside = '';
          if (ORDER_INTERNAL_STATUS.INSIDE === record.orderInternalStatus) inside =
            <span style={{
              display: 'block',
              backgroundColor: 'rgb(24, 144, 255)',
              color: 'white',
              borderRadius: '50%',
              height: '20px',
              width: '20px',
              textAlign: 'center',
              fontSize: '12px',
            }}
            >内
            </span>;
          return (
            <>
              <div style={{ position: 'relative' }}>
                {text}
                <span style={{ position: 'absolute' }}>
                  {inside}
                </span>
              </div>
            </>
          );
        }
      }, {
        title: '项目名称',
        dataIndex: 'projectName',
        width: '300px',
        render: (text, record) => (
          <div style={{ display: 'inline-block', width: '250px', whiteSpace: 'normal', breakWord: 'break-all' }}>
            <a
              onClick={() => this.toProjectDetail(record.projectId)}
            >{text}
            </a>
          </div>
        ),
      }, {
        title: '付款账户',
        dataIndex: 'invoiceTitle',
        render: (text, record) => {
          if (!record.invoiceTitle || !record.bankAccount) return '--';
          return (<span>{`${record.invoiceTitle}${record.bankAccount}`}</span>);
        },
      }, {
        title: '付款单生成时间',
        dataIndex: 'createTime',
        render: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm') : '--',
      }, {
        title: '付款单支付时间',
        dataIndex: 'PayEventItems',
        render: (text, record) => {
          if (!record.eventItems) return '--';
          const payEvent = record.eventItems.find(item => item.eventStatus === 3);
          return payEvent ? moment(payEvent.createTime).format('YYYY-MM-DD HH:mm') : '--';
        },
      }, {
        title: '运单数',
        dataIndex: 'total',
        render: (text, record) => {
          const { orderId, orderState } = record;
          if (!record.orderDetailItems) return '--';
          return (
            <a onClick={() => {
              this.toTransports(orderId, orderState);
            }}
            >{record.orderDetailItems.length}
            </a>
          );
        },
      }, {
        title: '总运费（元）',
        dataIndex: 'totalFreight',
        render: (text, record) => {
          const { totalFreight } = record;
          return (totalFreight || 0.00)._toFixed(2);
        },
      }, {
        title: '货损赔付（元）',
        dataIndex: 'damageCompensation',
        render: text => (text || 0.00)._toFixed(2),
      }, {
        title: '货主服务费（元）',
        dataIndex: 'serviceCharge',
        render: (text, record) => {
          const { orderInternalStatus, serviceCharge } = record;
          if (ORDER_INTERNAL_STATUS.INSIDE === orderInternalStatus) {
            return '0.00';
          }
          return (serviceCharge || 0.00)._toFixed(2);
        },
      }, {
        title: '应付金额（元）',
        dataIndex: 'payedFreight',
        render: (text, record) => {
          const { totalFreight, damageCompensation, serviceCharge, orderInternalStatus } = record;
          if (ORDER_INTERNAL_STATUS.INSIDE === orderInternalStatus) {
            return (Number(totalFreight) - Number(damageCompensation))._toFixed(2);
          } if (ORDER_INTERNAL_STATUS.FORMAL === orderInternalStatus) {
            return (Number(serviceCharge))._toFixed(2);
          }
          return (Number(totalFreight) - Number(damageCompensation) + Number(serviceCharge) )._toFixed(2);
        },
      }, {
        title: '作废原因',
        dataIndex: 'cancelEventItems',
        width: '200px',
        render: (text, record) => {
          if (!record.eventItems) return '--';
          const item = record.eventItems.find(item => item.eventStatus === 2);
          return item ?
            (
              <Popover content={this.cancelDom(item.orderDetail)} placement='topLeft'>
                <span
                  className='test-ellipsis'
                  style={{ display: 'inline-block', width: '165px' }}
                >{item.orderDetail}
                </span>
              </Popover>
            )
            :
            '--';
        },
      },
    ],
    operations: (record) => {
      const detail = {
        title: '详情',
        onClick: (record) => {
          router.push(`paymentBill/detail?orderId=${record.orderId}`);
        },
        auth: [PAY_BILL_VISIT],
      };
      const cancel = {
        title: '作废',
        onClick: (record) => {
          this.orderId = record.orderId;
          this.setState({
            visible: true,
          });
        },
        auth: ()=>{
          if (record.orderInternalStatus === 1) return null;
          return [PAY_BILL_CANCEL];
        },
      };
      const viewPayoutCertificate = {
        title: '查看支付凭证',
        onClick: (record) => {
          if (this.organizationType === 1) this.toTransports(record.orderId, record.orderState);
          if (this.organizationType === 4 || this.organizationType === 5) this.toProof(record.orderId);
        },
        auth: [PAY_BILL_PAY_ORDER],
      };
      const { isCreateInvoice, orderState } = record;
      /* 开票状态为未开票 + 支付状态为未支付 + 非平台方： 显示作废按钮 */

      if (isCreateInvoice === ORDER_INVOICE_STATUS.UNCOMPLETE && orderState === NETWORK_ORDER_STATE.UNPAID && this.organizationType !== 1 ) return [detail, cancel];
      if (orderState === NETWORK_ORDER_STATE.COMPLETED) return [detail, viewPayoutCertificate];
      return [detail];

    },
  };

  toProjectDetail = (id) => {
    router.push(`/buiness-center/project/projectManagement/projectDetail?projectId=${id}`);
  };

  cancelDom = (text) => (
    <div style={{ display: 'inline-block', width: '200px', whiteSpace: 'normal', breakWord: 'break-all' }}>{text}</div>
  );

  componentDidMount() {
    const { getOrders, setFilter, location: { query: { orderIdlist } }, filter } = this.props;
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      createDateStart: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      createDateEnd: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      payTimeStart: localData.formData.payTime && localData.formData.payTime.length ? moment(localData.formData.payTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      payTimeEnd: localData.formData.payTime && localData.formData.payTime.length ? moment(localData.formData.payTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    const newFilter = setFilter(orderIdlist ? { ...filter, orderIdList: orderIdlist } : { ...params, orderCreateType: 1 });

    // 不同方需要展示不同的列表结构，为需要的列表添加司机服务费一栏
    if (this.organizationType === 1 && this.tableSchema?.columns[12]?.title !== '司机服务费') {
      this.tableSchema.columns.splice(12, 0, {
        title: '司机服务费（元）',
        dataIndex: 'driverServiceCharge',
        render: text => (text || 0)._toFixed(2),
      });
    }

    const filterNewFilter = !newFilter.orderStateList && this.organizationType === 1 ? {
      ...newFilter,
      orderStateList: this.initOrderStateList,
      orderCreateType: 1,
    } : newFilter;

    getOrders(omit(filterNewFilter, ['payTime', 'createTime']));
    if (this.organizationType !== 1) {
      Promise.all([getCalcOrders(orderIdlist ? { orderIdList: orderIdlist } : {}), getShipmentVirtualAccount({ virtualAccountType: 1 })]).then(res => {
        const { virtualAccountBalance } = res[1];
        const { cardRenderState } = this.state;
        cardRenderState.some(((item, index) => !(cardRenderState[index].visible = true)));
        const newCardRenderState = JSON.parse(JSON.stringify(cardRenderState));
        this.setState({
          totalData: res[0],
          virtualAccountBalance,
          ready: true,
          nowPage: localData.nowPage || 1,
          pageSize: localData.pageSize || 10,
          cardRenderState: newCardRenderState,
        });
      });
    } else {
      getShipmentVirtualAccount({ virtualAccountType: 1 }).then(data => {
        const { virtualAccountBalance } = data;
        this.setState({
          virtualAccountBalance,
          ready: true,
          nowPage: localData.nowPage || 1,
          pageSize: localData.pageSize || 10,
        });
      });
    }
  }

  componentWillUnmount() {
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

  searchForm = () => {
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 11 },
        xl: { span: 9 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 },
        xl: { span: 15 },
      },
    };
    const { count, totalTransportsNum, totalPrice, payedPrice, virtualAccountBalance, toggleFlag } = this.state;
    return (
      <>
        <SearchForm {...layout} layout='inline' schema={this.searchSchema}>
          <Item field='projectName' />
          <Item field='completeStatus' />
          <Item className='PaymentForm_select' field='orderStateList' />
          <Item field='isCreateInvoice' />
          <Item field='orderNo' />
          <Item field='createTime' />
          <Item field='payTime' />
          <Item field='invoiceTitle' />
          <Item field='bankAccount' />
          <div>
            <DebounceFormButton debounce label='查询' type='primary' style={{ marginTop: '3px' }} onClick={this.handleSearch} />
            <DebounceFormButton label='重置' style={{ marginLeft: '10px', marginTop: '3px' }} onClick={this.handleResetClick} />
            <Authorized authority={[PAY_BILL_EXCEL]}>
              <DebounceFormButton label='导出excel' style={{ marginLeft: '10px', marginTop: '3px' }} onClick={this.getExcel} />
            </Authorized>
          </div>
        </SearchForm>
        {
          this.organizationType === 1 ?
            null
            :
            <Tag color='blue' className='paymentBill_tag_tips'><Icon
              className='paymentBill_info_icon_color'
              type='info-circle'
              theme='filled'
            />已选择 <span>{count}</span> 个付款单，包含 <span>{totalTransportsNum}</span> 条运单， <span>{(totalPrice  - Number(payedPrice) ).toFixed(2)._toFixed(2)}</span> 元，可用余额
            <span className={toggleFlag ? '' : 'paymentBill_tag_red_color'}>{virtualAccountBalance ? Number(virtualAccountBalance)._toFixed(2) : 0.00}</span> 元
            </Tag>
        }
      </>
    );
  };

  getExcel = () => {
    const { filter } = this.props;
    const { orderNo = '', orderStateList = '', completeStatus = '', isCreateInvoice = '', projectName } = filter;
    const createDateStart =  filter.createTime && filter.createTime.length ? moment(filter.createTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd =  filter.createTime && filter.createTime.length ? moment(filter.createTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const payTimeStart =  filter.payTime && filter.payTime.length ? moment(filter.payTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const payTimeEnd =  filter.payTime && filter.payTime.length ? moment(filter.payTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const newOrderState = this.organizationType === 1 && !orderStateList ? this.initOrderStateList : orderStateList;
    const options = {
      ...filter,
      limit : 100000,
      offset : 0,
      organizationId : getUserInfo().organizationId,
      organizationType : this.organizationType,
      orderNo,
      projectName,
      createDateStart,
      payTimeStart,
      payTimeEnd,
      createDateEnd,
      completeStatus,
      isCreateInvoice,
      orderStateList: newOrderState,
      orderCreateType: this.organizationType === 1 ? 1 : undefined,
    };
    const params = dealElement(options);

    routerToExportPage(sendOrdersExcelPost, params);
  };

  handleSearch = (value) => {
    const createDateStart =  value.createTime && value.createTime.length ? moment(value.createTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd =  value.createTime && value.createTime.length ? moment(value.createTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const payTimeStart =  value.payTime && value.payTime.length ? moment(value.payTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const payTimeEnd =  value.payTime && value.payTime.length ? moment(value.payTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const newFilter = this.props.setFilter({
      ...this.props.filter, ...{ createDateStart, createDateEnd },
      payTimeStart,
      payTimeEnd, ...{ limit: 10, offset: 0 },
    });
    this.setState({
      nowPage: 1,
    });
    const filterNewFilter = !newFilter.orderStateList && this.organizationType === 1 ? {
      ...newFilter,
      orderStateList: this.initOrderStateList,
      orderCreateType: 1,
    } : { ...newFilter, orderCreateType: 1 };
    this.props.getOrders(filterNewFilter);
    getCalcOrders(filterNewFilter).then(res => {
      this.setState({
        totalData: res,
      });
    });
  };

  handleResetClick = () => {
    router.replace('paymentBill');
    this.tableRef.current.resetSelectedRows();
    this.payOrderList = [];
    this.setState({
      nowPage: 1,
      pageSize: 10,
      count: 0,
      totalTransportsNum: 0,
      totalPrice: 0,
      toggleFlag: true,
    });
    getCalcOrders().then(res => {
      this.setState({
        totalData: res,
      });
    });
    const newFilter = this.props.resetFilter();
    const filterNewFilter = !newFilter.orderStateList && this.organizationType === 1 ? {
      ...newFilter,
      orderStateList: this.initOrderStateList,
      orderCreateType: 1,
    } : { ...newFilter, orderCreateType: 1 };
    this.props.getOrders(filterNewFilter);
  };

  handleCancel = () => {
    this.setState({
      visible: false,
      payFormVisible: false,
    });
  };

  refresh = () => {
    const { getOrders, filter, setFilter } = this.props;
    const { offset = 0, limit = 10 } = filter;
    const newFilter = setFilter({ offset, limit });
    const filterNewFilter = !newFilter.orderStateList && this.organizationType === 1 ? {
      ...newFilter,
      orderStateList: this.initOrderStateList,
      orderCreateType: 1,
    } : newFilter;
    getOrders(filterNewFilter);
    getCalcOrders().then(res => {
      this.setState({
        totalData: res,
      });
    });
    this.payOrderList = [];
    this.setState({
      count: 0,
      totalTransportsNum: 0,
      totalPrice: 0,
      toggleFlag: true,
    });
    this.tableRef.current.resetSelectedRows();
  };

  backAndRefresh = () => {
    this.refresh();
    this.handleCancel();
  };

  cancelOrder = (value) => {
    if (!value.remarks.toString().trim()) {
      notification.error({
        message: '输入错误',
        description:
          '请正确输入作废原因！',
      });
      return;
    }
    const { orderId } = this;
    value = { ...value, orderState: NETWORK_ORDER_STATE.CANCEL };
    patchOrders(orderId, value).then(() => {
      this.refresh();
      this.handleCancel();
      notification.success({
        message: '作废成功',
        description:
          '已作废该付款单！',
      });
    });
  };

  cancelForm = () => {
    const formSchema = {
      remarks: {
        label: '作废原因',
        component: 'input.textArea',
        rules: {
          required: [true, '请输入作废原因'],
          max: 100,
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
        <SchemaForm className='PaymentBill_reject_form' layout='vertical' schema={formSchema}>
          <Item field='remarks' {...formItemLayout} />
          <div styleName='button_box'>
            <Button style={{ marginRight: '20px' }} onClick={this.handleCancel}>取消</Button>
            <DebounceFormButton label='确定' type='primary' onClick={this.cancelOrder} />
          </div>
        </SchemaForm>
      </>
    );
  };

  filterItems = item => item.orderState === NETWORK_ORDER_STATE.UNPAID || Number(item.orderState) === NETWORK_ORDER_STATE.PARTIALLY_COMPLETED;

  getCheckboxProps = record => {
    if (Number(record.orderState) !== NETWORK_ORDER_STATE.UNPAID  && Number(record.orderState) !== NETWORK_ORDER_STATE.PARTIALLY_COMPLETED) return { disabled: true, style: { display: 'none' } };
  };

  createOrder = () => {
    router.push('paymentBill/create');
  };

  showModal = () => {
    if (this.payOrderList.length === 0) return message.error('请至少勾选一条付款单');
    this.confirmPayList = this.payOrderList;
    this.setState({
      payFormVisible: true,
    });
  };

  onSelectRow = (val) => {
    const { virtualAccountBalance } = this.state;
    this.payOrderList = val.filter(item => Number(item.orderState) === NETWORK_ORDER_STATE.UNPAID || Number(item.orderState) === NETWORK_ORDER_STATE.PARTIALLY_COMPLETED);
    // 如果是内部单，不计算服务费
    const totalServiceCharge = val.reduce((sum, current) => {
      if (ORDER_INTERNAL_STATUS.INSIDE === current.orderInternalStatus) {
        return sum;
      }
      return sum + Number(current.serviceCharge);
    }, 0);

    // 如果是正式单，只计算服务费
    const totalFreight = val.reduce((sum, current) => {
      if (ORDER_INTERNAL_STATUS.FORMAL === current.orderInternalStatus) {
        return sum;
      }
      return sum + Number(current.totalFreight);
    }, 0);
    const payedPrice = val.reduce((r, n) => {
      r += n.payedFreight;
      return r;
    }, 0);
    const totalDamageCompensation = val.reduce((sum, current) => sum + Number(current.damageCompensation), 0);
    const payFreight = (Number(totalFreight) - Number(totalDamageCompensation) + Number(totalServiceCharge));
    const toggleFlag = virtualAccountBalance && (Number(payFreight).toFixed(2) <= Number(virtualAccountBalance).toFixed(2));
    const totalTransportsNum = val.reduce((sum, current) => sum + Number(current.orderDetailItems.length), 0);

    this.setState({
      count: val.length,
      totalPrice: payFreight,
      totalDamageCompensation,
      totalServiceCharge,
      toggleFlag,
      totalFreight,
      totalTransportsNum,
      payedPrice,
    });
  };

  changeVirtualAccountBalance = (val) => {
    this.setState({
      virtualAccountBalance: val,
    });
  };

  changeDisplay = (index) => {
    const { cardRenderState } = this.state;
    cardRenderState[index].display = !cardRenderState[index].display;
    this.setState({
      cardRenderState,
    });
  };

  render() {
    const {
      visible,
      nowPage,
      pageSize,
      payFormVisible,
      virtualAccountBalance,
      ready,
      cardRenderState,
      totalData,
      totalPrice,
      totalFreight,
      totalTransportsNum,
      totalDamageCompensation,
      totalServiceCharge,
      payedPrice,
    } = this.state;
    const { orderList, loading } = this.props;
    const isLoading = loading.effects['orders/getOrders'];

    return (
      ready &&
      <>
        {
          this.organizationType === 5 || this.organizationType === 4 ?
            <div style={{ marginBottom: '20px' }}>
              <Authorized authority={[PAY_BILL_CREATE]}>
                <Button type='primary' onClick={this.createOrder} style={{ marginRight: '20px' }}>+ 新建付款单</Button>
              </Authorized>
              <Authorized authority={[PAY_BILL_PAY]}>
                <Button type='primary' onClick={this.showModal}>￥ 支 付</Button>
              </Authorized>
              {/* <span styleName='redMoney'>可用余额：{virtualAccountBalance?Number(virtualAccountBalance)._toFixed(2): 0.00} 元</span> */}
            </div>
            :
            null
        }
        {this.organizationType === 5 || this.organizationType === 4 ?
          <div styleName='totalDiv'>
            <Card changeDisplay={this.changeDisplay} renderState={cardRenderState[0]} totalData={totalData} />
            <Card changeDisplay={this.changeDisplay} renderState={cardRenderState[1]} totalData={totalData} />
            <Card changeDisplay={this.changeDisplay} renderState={cardRenderState[2]} totalData={totalData} />
          </div>
          :
          null
        }
        {this.organizationType === 5 || this.organizationType === 4 ?
          <Table
            rowKey='orderId'
            ref={this.tableRef}
            filterItems={this.filterItems}
            getCheckboxProps={this.getCheckboxProps}
            onSelectRow={this.onSelectRow}
            dataSource={orderList}
            loading={isLoading}
            pagination={{ current: nowPage, pageSize }}
            onChange={this.turnPage}
            schema={this.tableSchema}
            renderCommonOperate={this.searchForm}
            multipleSelect
          />
          :
          <Table
            rowKey='orderId'
            ref={this.tableRef}
            dataSource={orderList}
            pagination={{ current: nowPage, pageSize }}
            onChange={this.turnPage}
            loading={isLoading}
            schema={this.tableSchema}
            renderCommonOperate={this.searchForm}
          />
        }
        <Modal
          destroyOnClose
          maskClosable={false}
          visible={visible}
          title='作废'
          onCancel={this.handleCancel}
          footer={null}
        >
          {this.cancelForm()}
        </Modal>
        <Modal
          destroyOnClose
          maskClosable={false}
          visible={payFormVisible}
          title='支付'
          width='900px'
          onCancel={this.handleCancel}
          footer={null}
        >
          <PayForm
            refresh={this.refresh}
            count={this.state.count}
            changemoney={this.changeVirtualAccountBalance}
            backAndRefresh={this.backAndRefresh}
            virtualAccountBalance={virtualAccountBalance}
            totalDamageCompensation={totalDamageCompensation}
            totalPrice={totalPrice}
            totalTransportsNum={totalTransportsNum}
            totalFreight={totalFreight}
            totalServiceCharge={totalServiceCharge}
            orderList={this.confirmPayList}
            payedPrice={payedPrice}
          />
        </Modal>
      </>
    );
  }
}
