import React, { Component } from 'react';
import { Button, Modal, Icon, Tag, message } from "antd";
import CSSModules from 'react-css-modules';
import { connect } from 'dva';
import { Item, Observer } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import router from 'umi/router';
import DebounceFormButton from '@/components/DebounceFormButton';
import { getNetworkOrderStatus } from '@/services/project';
import { NETWORK_ORDER_STATE } from '@/constants/project/project';
import SearchForm from '@/components/Table/SearchForm2';
import { FilterContextCustom } from '@/components/Table/FilterContext';
import Table from '@/components/Table/Table';
import '@gem-mine/antd-schema-form/lib/fields';
import model from '@/models/userInvoice';
import ordersModel from '@/models/orders';
import { getUserInfo } from '@/services/user';
import auth from '@/constants/authCodes';
import Authorized from '@/utils/Authorized';
import { pick, translatePageType, getLocal, omit } from '@/utils/utils';
import { postInvoice } from '@/services/apiService';
import styles from './Invoicing.less';
import AddressForm from '../../../FundManage/FundsManagement/component/AddressForm';
import HeadForm from '../../../FundManage/FundsManagement/component/HeadForm';

const {
  INVOICE_CREATE,
  PAY_BILL_VISIT,
} = auth;

const { actions: { detailUserInvoice } } = model;
const { actions: { getOrders } } = ordersModel;

function mapStateToProps(state) {
  return {
    info: state.userInvoice.entity,
    commonStore: state.commonStore,
    orders: pick(state.orders, ['items', 'count']),
  };
}

@connect(mapStateToProps, { detailUserInvoice, getOrders })
@CSSModules(styles, { allowMultiple: true })
@FilterContextCustom
export default class Invoicing extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state = {
    visible: false,
    nowPage: 1,
    pageSize: 10,
  }

  allowClickClaimInvoicing = true

  defaultFilter = {
    orderStateList: '1,4,5',
    isCreateInvoice: 0,
    orderInternalStatusArr : '0,2,3'
  }

  organizationType = getUserInfo().organizationType// 3为货权 4为托运  5为承运

  searchSchema = {
    orderNo: {
      label: '付款单号',
      placeholder: '请输入付款单号',
      component: 'input',
    },
    projectName: {
      label: '项目名称',
      placeholder: '请输入项目名称',
      component: 'input',
    },
    createTime: {
      label: '付款单生成日期',
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
  }

  formLayOut = {
    labelCol: {
      xs: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 18 },
    },
  }

  tableRef = React.createRef()

  checkedPaymentBill = []

  tableSchema = {
    variable: true,
    minWidth: 2300,
    columns: [
      {
        title: '支付状态',
        dataIndex: 'status',
        width: '80px',
        fixed: 'left',
        render: (text, record) => {
          const status = getNetworkOrderStatus(record.orderState);
          return (
            <span style={{ color: status.color }}>
              {status.word}
            </span>
          );
        },
      },
      {
        title: '付款单号',
        dataIndex: 'orderNo',
        width: '200px',
        fixed: 'left',
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
        render: (text, record) => (record.invoiceTitle && record.bankAccount ? `${record.invoiceTitle}${record.bankAccount}` : '--'),
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
          const { orderId } = record;
          if (!record.orderDetailItems) return '0';
          return (
            <a onClick={() => {
              this.toTransports(orderId);
            }}
            >
              {record.orderDetailItems.length}
            </a>
          );
        },
      }, {
        title: '总运费（元）',
        dataIndex: 'totalFreight',
        render: text => (text || 0)._toFixed(2),
      }, {
        title: '货损赔付（元）',
        dataIndex: 'damageCompensation',
        render: text => (text || 0)._toFixed(2),
      }, {
        title: '服务费（元）',
        dataIndex: 'serviceCharge',
        render: text => (text || 0)._toFixed(2)
      }, {
        title: '应付金额（元）',
        dataIndex: 'payedFreight',
        render: (text, record) => {
          const { totalFreight, damageCompensation, serviceCharge, otherExpenses } = record;
          return (Number(totalFreight) - Number(damageCompensation) + Number(serviceCharge) + Number(otherExpenses))._toFixed(2);
        },
      },
    ],
    operations: () => {
      const detail = {
        title: '详情',
        onClick: (record) => {
          const { organizationType } = this;
          switch (organizationType) {
            case 1:
              router.push(`/bill-account/paymentBillWrap/paymentBill/detail?orderId=${record.orderId}`);
              break;
            case 4: {
              const { route: { path } } = this.props;
              router.push(`${path}paymentBill/detail?orderId=${record.orderId}`);
            }
              break;
            case 5:
              router.push(`/net-transport/paymentBillWrap/paymentBill/detail?orderId=${record.orderId}`);
              break;
            default:
              break;
          }
        },
        auth: [PAY_BILL_VISIT],
      };
      return [detail];
    },
  }

  toProjectDetail = (id) => {
    router.push(`/buiness-center/project/projectManagement/projectDetail?projectId=${id}`);
  }

  searchForm = () => (
    <>
      <SearchForm style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }} schema={this.searchSchema}>
        <Item style={{ width: '300px', marginRight: '20px' }} layout='inline' {...this.formLayOut} field='orderNo' />
        <Item
          style={{ width: '300px', marginRight: '20px' }}
          layout='inline'
          {...this.formLayOut}
          field='projectName'
        />
        <Item
          className='invoicingSearchItem'
          style={{ width: '350px', marginRight: '20px' }}
          layout='inline'
          {...this.formLayOut}
          field='createTime'
        />
        <DebounceFormButton debounce label='查询' type='primary' onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label='重置' style={{ marginLeft: '10px' }} onClick={this.handleResetClick} />
      </SearchForm>
      <div style={{ margin: '20px 0' }}>
        <Authorized authority={[INVOICE_CREATE]}>
          <Button type='primary' onClick={this.showModal}>+ 申请开票</Button>
          <Button style={{ marginLeft: '20px' }} onClick={this.toHistory}>开票历史</Button>
        </Authorized>
      </div>
    </>
  )

  toHistory = () => {
    router.push('invoicing/historyWrap/history');
  }

  toTransports = (orderId) => {
    router.push(`/buiness-center/transportList/transport?orderIdlist=${orderId}`);
  }

  handleSearchBtnClick = value => {
    this.setState({
      nowPage: 1,
    });
    const createDateStart =  value.createTime && value.createTime.length ? moment(value.createTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd =  value.createTime && value.createTime.length ? moment(value.createTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const { orderNo, projectName } = value;
    const newFilter = this.props.setFilter({
      ...this.props.filter,
      createDateStart,
      createDateEnd,
      orderNo,
      projectName,
      offset: 0,
    });
    this.props.getOrders(newFilter);
  }

  handleResetClick = () => {
    this.tableRef.current.resetSelectedRows();
    this.checkedPaymentBill = [];
    this.setState({
      nowPage: 1,
      pageSize: 10,
    });
    const newFilter = this.props.resetFilter(this.defaultFilter);
    this.props.getOrders(newFilter);
  }

  showModal = () => {
    if (!this.checkedPaymentBill.length) {
      return message.error('请至少勾选一条付款单');
    }
    const result = this.checkedPaymentBill.every((item, index) => {
      if (index) {
        return item.projectId === this.checkedPaymentBill[0].projectId;
      }
      return true;
    });
    if (!result) return message.error('只能勾选同一项目的付款单');
    this.setState({
      visible: true,
    });
  }

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }

  componentDidMount() {
    const { detailUserInvoice, getOrders } = this.props;
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      createDateStart: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      createDateEnd: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    const newFilter = this.props.setFilter({ ...this.defaultFilter, ...params });

    detailUserInvoice();
    getOrders(omit(newFilter, 'createTime')).then(() => {
      this.setState({
        nowPage: localData.nowPage || 1,
        pageSize: localData.pageSize || 10,
      });
    });
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

  onSelectRow = (arr) => {
    this.checkedPaymentBill = arr;
  }

  handleOk = () => {
    const orderIdList = this.checkedPaymentBill.map(item => item.orderId);
    if (this.allowClickClaimInvoicing){
      this.allowClickClaimInvoicing = false;
      postInvoice({ orderIdList })
        .then(() => {
          router.push('invoicing/historyWrap/history');
        }).catch(()=>{
          this.allowClickClaimInvoicing = true;
        });
    }
  }

  refresh = () => {
    this.tableRef.current.resetSelectedRows();
    this.checkedPaymentBill = [];
    const { filter } = this.props;
    this.props.getOrders(filter);
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit,
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getOrders({ ...newFilter });
  }

  renderModal = () => {
    const layout = {
      xs: { span: 12 },
    };
    const { info } = this.props;
    const totalTransportsNum = this.checkedPaymentBill.length && this.checkedPaymentBill.reduce((total, current) => total + Number(current.orderDetailItems.length), 0);
    const invoicedMoney = this.checkedPaymentBill.length && this.checkedPaymentBill.reduce((total, current) => total + Number(current.serviceCharge) + Number(current.totalFreight) - Number(current.damageCompensation), 0);
    return (
      <>
        <div styleName='tips_box'>
          <Icon styleName='blue_icon' type='exclamation-circle' theme='filled' />
          <Tag color='blue' styleName='tag_tips'>已勾选
            <span styleName='red'>{this.checkedPaymentBill.length}</span>个付款单,共
            <span styleName='red'>{totalTransportsNum}</span>个运单，应开票金额<span styleName='red'>{Number(invoicedMoney)._toFixed(2)}</span>元，请核对您的开票信息是否正确。
          </Tag>
        </div>
        <div style={{ paddingLeft: '10px' }}>
          <HeadForm layout={{ ...layout }} formData={{ ...info.logisticsUserInvoiceEntity }} />
          <AddressForm layout={{ ...layout }} formData={{ ...info.logisticsUserInvoiceEntity }} />
          <div style={{ clear: 'both' }} />
        </div>
      </>
    );
  }

  render() {
    const { visible, nowPage, pageSize } = this.state;
    const { orders } = this.props;
    return (
      <>
        <Modal
          className='invoicing_form_box'
          title='申请开票'
          width='800px'
          visible={visible}
          destroyOnClose
          maskClosable={false}
          onCancel={this.handleCancel}
          footer={[
            <Button key='back' onClick={this.handleCancel}>
              取消
            </Button>,
            <Button key='submit' type='primary' disabled={!this.allowClickClaimInvoicing} onClick={this.handleOk}>
              索取发票
            </Button>,
          ]}
        >
          {this.renderModal()}
        </Modal>
        <Table
          rowKey='orderNo'
          onSelectRow={this.onSelectRow}
          ref={this.tableRef}
          dataSource={orders}
          schema={this.tableSchema}
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          renderCommonOperate={this.searchForm}
          multipleSelect
        />
      </>
    );
  }
}
