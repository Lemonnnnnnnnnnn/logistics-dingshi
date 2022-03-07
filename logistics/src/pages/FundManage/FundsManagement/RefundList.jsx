import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Modal, notification, Timeline, Button } from 'antd';
import {  Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../components/DebounceFormButton';
import '@gem-mine/antd-schema-form/lib/fields';
import { REFUND_OPERATION_TYPE, TRANSACTION_STATUS } from '../../../constants/project/project';
import { getTransactionStatus } from '../../../services/project';
import {
  getAuthorizationPhone,
  refundRepay,
  sendFinanceAccountsExcelPost
} from "../../../services/apiService";
import { getUserInfo } from '../../../services/user';
import Table from '../../../components/Table/Table';
import SearchForm from '../../../components/Table/SearchForm2';
import { pick, translatePageType, routerToExportPage, getLocal, omit } from '../../../utils/utils';
import { ORGANIZATION_TEXT } from '../../../constants/organization/organizationType';
import model from '../../../models/financeAccountTransaction';
import TableContainer from '../../../components/Table/TableContainer';
import auth from '../../../constants/authCodes';
import PlatFormRefund from './component/PlatFormRefund';

const { actions } = model;

const {
  PLAT_REFUND_APPLY_AGAIN,
  PLAT_REFUND_JUDGE
} = auth;

function mapStateToProps (state) {
  return {
    commonStore: state.commonStore,
    financeAccountTransaction: pick(state.financeAccountTransaction, ['items', 'count']),
  };
}

@connect(mapStateToProps, actions )
@TableContainer({ transactionType: 5 })
export default class Index extends React.Component{
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state = {
    ready: false,
    nowPage: 1,
    pageSize: 10,
    APPREFModal: false
  }

  tableSchema = {
    minWidth:1800,
    variable:true,
    columns: [
      {
        title: '状态',
        dataIndex: 'transactionStatus',
        render: (text, record) => {
          if (!text && text !== 0) return '--';
          const status = getTransactionStatus(text);
          return (
            <span style={{ color: status.color }}>
              {status.word}
            </span>
          );
        },
        width:100,
      },
      {
        title: '申请日期',
        dataIndex: 'createTime',
        render: (text) => text? moment(text).format('YYYY.MM.DD HH:mm'): '--',
        width:200,
      },
      {
        title: '交易编号',
        dataIndex: 'transactionNo',
      },
      {
        title: '交易类型',
        dataIndex: 'operationType',
        render: (text) => {
          if (text && text === 1) {
            return '自动退款';
          }
          if (text && text === 2) {
            return '手动提现';
          }
          return '--';
        },
        width:200,
      },
      {
        title: '客户名称',
        dataIndex: 'accountName',
        render: (text) => text || '--',
        width:200,
      },
      {
        title: '客户平台账号',
        dataIndex: 'virtualAccountNo',
        render: (text) => text || '--',
        width:200,
      },
      {
        title: '金额(元)',
        dataIndex: 'transactionAmount',
        render: (text) => text || '--',
        width:200,
      },
      {
        title: '审核人',
        dataIndex: 'nickName',
        render: (text, record) => {
          if (!record.verifyRespList || record.verifyRespList.length === 0) return '--';
          return record.verifyRespList[0].nickName || '--';
        },
        width:200,
      },
      {
        title: '原因',
        dataIndex: 'verifyReason',
        render: (text, record) => {
          if (record.transactionType === 5) {
            if (record.transactionStatus === TRANSACTION_STATUS.PENDING || record.transactionStatus === TRANSACTION_STATUS.AUDITED) return <span className='test-ellipsis' title={record.remarks || ''} style={{ display: 'inline-block', width: '165px' }}>{record.remarks || '--'}</span>;
            if (record.transactionStatus === TRANSACTION_STATUS.OVERTIME) return <span className='test-ellipsis' title='超时关闭，如需退款请重新申请' style={{ display: 'inline-block', width: '165px', color: 'red' }}>超时关闭，如需退款请重新申请</span>;
            if (record.transactionStatus === TRANSACTION_STATUS.REFUSED) {
              if (!record.verifyRespList || record.verifyRespList.length === 0) return '--';
              return <span className='test-ellipsis' title={record.verifyRespList[0].verifyReason || ''} style={{ display: 'inline-block', width: '165px', color: 'red' }}>{record.verifyRespList[0].verifyReason || '--'}</span>;
            }
            if (record.transactionStatus === TRANSACTION_STATUS.FAILED) {
              if (!record.financeEventEntities || record.financeEventEntities.length === 0) return '--';
              const item = record.financeEventEntities.find(item => item.financeEventType === 3 && item.financeEventStatus === 0);
              return <span className='test-ellipsis' title={item?.remarks || ''} style={{ display: 'inline-block', width: '165px', color: 'red' }}>{item?.remarks || '--'}</span>;
            }
          }
          return '--';
        },
        width:200,
      },
    ],
    operations: record => {
      const pass = {
        title: '通过',
        auth: [PLAT_REFUND_JUDGE],
        onClick: (record) => {
          this.rowRecord = record;
          this.auditStatus = 'pass';
          this.setState({
            APPREFModal: true
          });
        }
      };

      const refuse = {
        title: '拒绝',
        auth: [PLAT_REFUND_JUDGE],
        onClick: (record) => {
          this.rowRecord = record;
          this.auditStatus = 'reject';
          this.setState({
            APPREFModal: true
          });
        }
      };

      const operationRecord = {
        title: '操作记录',
        onClick: () => {
          // 倒序
          // const dailyRecord = data.items.sort((a, b) => moment(b.createTime).unix() - moment(a.createTime).unix())
          this.setState({
            modal: true,
            dailyRecord: record.financeEventEntities || []
          });
        }
      };

      const refund = {
        title: '重新退款',
        auth: [PLAT_REFUND_APPLY_AGAIN],
        confirmMessage: () => `您确定要重新退款吗？`,
        onClick: (record) => {
          refundRepay(record.transactionId).then(() => {
            notification.success({
              message: '发起成功',
              description: `已成功发起重新退款`,
            });
            this.refresh();
          });
        }
      };

      if (record.transactionStatus === TRANSACTION_STATUS.PENDING && record.operationType === REFUND_OPERATION_TYPE.MANUAL) return [pass, refuse];
      // if (record.transactionStatus === TRANSACTION_STATUS.FAILED && record.operationType === REFUND_OPERATION_TYPE.AUTO) return [operationRecord, refund];
      // 暂时隐藏重新退款
      if (record.transactionStatus === TRANSACTION_STATUS.FAILED && record.operationType === REFUND_OPERATION_TYPE.AUTO) return [operationRecord];
      return [operationRecord];
    }
  }

  showModal = () => {
    this.setState({
      modal: true,
    });
  }

  handleOk = () => {
    this.setState({
      modal: false,
    });
  }

  searchForm = {
    transactionStatus: {
      label: '状态',
      placeholder: '请选择状态',
      component: 'select',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return { };
        }
      }),
      options: [
        {
          label: '已退款',
          key: TRANSACTION_STATUS.SUCCESS,
          value: TRANSACTION_STATUS.SUCCESS
        }, {
          label: '已失败',
          key: TRANSACTION_STATUS.FAILED,
          value: TRANSACTION_STATUS.FAILED
        }, {
          label: '待审核',
          key: TRANSACTION_STATUS.PENDING,
          value: TRANSACTION_STATUS.PENDING
        }, {
          label: '待退款',
          key: TRANSACTION_STATUS.AUDITED,
          value: TRANSACTION_STATUS.AUDITED
        }, {
          label: '已拒绝',
          key: TRANSACTION_STATUS.REFUSED,
          value: TRANSACTION_STATUS.REFUSED
        }, {
          label: '已关闭',
          key: TRANSACTION_STATUS.OVERTIME,
          value: TRANSACTION_STATUS.OVERTIME
        }, {
          label: '已撤销',
          key: TRANSACTION_STATUS.CANCEL,
          value: TRANSACTION_STATUS.CANCEL
        }
      ]
    },
    operationType: {
      label: '交易类型:',
      placeholder: '请选择交易类型',
      component: 'select',
      options: [
        {
          label: '自动退款',
          key: REFUND_OPERATION_TYPE.AUTO,
          value: REFUND_OPERATION_TYPE.AUTO
        }, {
          label: '手动提现',
          key: REFUND_OPERATION_TYPE.MANUAL,
          value: REFUND_OPERATION_TYPE.MANUAL
        }
      ]
    },
    accountName: {
      label: '客户名称:',
      component: 'input',
      placeholder: '请输入客户名称'
    },
    createTime: {
      label: '日期',
      format: {
        input: (value) => {
          if (Array.isArray(value)) {
            return value.map(item => moment(item));
          }
          return value;
        },
        output: (value) => value
      },
      component: 'rangePicker'
    }
  }

  componentDidMount () {
    const { getFinanceAccountTransaction } = this.props;
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      transactionType: 5,
      createDateStart: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      createDateEnd: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    this.props.setFilter({ ...params });
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
    });
    Promise.all([getFinanceAccountTransaction(omit(params, 'createTime')), getAuthorizationPhone()]).then(res => {
      this.setState({
        ready: true
      });
      this.phone = res[1].paymentAuthorizationPhone;
    });
  }

  componentWillUnmount() {
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.setItem(this.currentTab.id, JSON.stringify({
      formData: { ...formData },
      pageSize: this.state.pageSize,
      nowPage: this.state.nowPage,
    }));
  }

  searchTableList = () => {
    const formLayOut = {
      labelCol:{
        xs: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 18 }
      }
    };
    return (
      <SearchForm layout="inline" {...formLayOut} schema={this.searchForm} mode={FORM_MODE.SEARCH}>
        <Item field="transactionStatus" />
        <Item field="operationType" />
        <Item field="accountName" />
        <Item field="createTime" />
        <DebounceFormButton label="查询" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="重置" className="mr-10" onClick={this.handleResetBtnClick} />
        <Button onClick={this.getExcel}>导出</Button>
      </SearchForm>
    );
  }

  getExcel = () => {
    const { filter } = this.props;
    const newFilter = JSON.parse(JSON.stringify(filter));
    delete newFilter.offset;
    delete newFilter.limit;
    delete newFilter.createTime;
    const createDateStart = newFilter.createTime && newFilter.createTime.length ? moment(newFilter.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd = newFilter.createTime && newFilter.createTime.length ? moment(newFilter.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const params = {
      ...newFilter,
      limit : 100000,
      offset : 0,
      createDateStart,
      createDateEnd,
      accessToken : getUserInfo().accessToken,
    };
    routerToExportPage(sendFinanceAccountsExcelPost, params);
  }

  handleSearchBtnClick = value => {
    this.setState({
      nowPage:1
    });
    const createDateStart = value.createTime && value.createTime.length ? moment(value.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd = value.createTime && value.createTime.length ? moment(value.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const newFilter = this.props.setFilter({ ...this.props.filter, createDateStart, createDateEnd, offset: 0 });
    this.props.getFinanceAccountTransaction(newFilter);
  }

  handleResetBtnClick = () => {
    const newFilter=this.props.resetFilter({});
    this.setState({
      nowPage:1,
      pageSize:10
    });
    this.props.getFinanceAccountTransaction(newFilter);
  }

  refresh = () => {
    const { nowPage, pageSize } = this.state;
    const { filter } = this.props;
    this.props.getFinanceAccountTransaction({ ...filter, nowPage, pageSize });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage:current,
      pageSize:limit
    });
    const newFilter=this.props.setFilter({ offset, limit });
    this.props.getFinanceAccountTransaction(newFilter);
  }

  cancelAPPREFModal = () => {
    this.setState({
      APPREFModal: false
    });
  }

  renderTimeLine = () => {
    const { dailyRecord } = this.state;
    if (!dailyRecord || dailyRecord.length === 0) return '暂无数据';
    const getContent = (type, status) => {
      const operationType = {
        1: '自动扣款',
        2: '充值',
        3: '退款',
        4: '内部转账',
        5: '收入账户提现',
        6: '支付付款单'
      }[type];
      const description = {
        0: '失败',
        1: '成功',
        2: '发起',
        3: '已撤销',
        4: '已超时',
        5: '审核成功',
        6: '审核失败',
      }[status];
      return `${operationType}${description}`;
    };
    const getColor = (status) => ({
      0: 'red',
      1: 'green',
      2: 'green',
      3: 'gray',
      4: 'red',
      5: 'green',
      6: 'red',
    }[status]);
    return (
      <Timeline>
        {
          dailyRecord.map(item => (
            <Timeline.Item key={item.financeEventId} color={getColor(item.financeEventStatus)}>
              <p style={{ marginBottom: '3px' }}>{moment(item.createTime).format('YYYY.MM.DD HH:mm')}</p>
              {item.nickName? `${item.nickName}(${ORGANIZATION_TEXT[item.organizationType]}) ${item.phone} `: null }
              {getContent(item.financeEventType, item.financeEventStatus)}&nbsp;&nbsp;
              <p style={{ marginBottom: '7px' }}>{item.remarks? `描述：${item.remarks}`: null}</p>
            </Timeline.Item>))
        }
      </Timeline>
    );
  }

  render () {
    const { ready, nowPage, pageSize, APPREFModal } = this.state;
    const { financeAccountTransaction } = this.props;
    return (
      ready
      &&
      <>
        <Modal
          title="操作日志"
          visible={this.state.modal}
          onOk={this.handleOk}
          onCancel={this.handleOk}
          footer={null}
        >
          {
            this.renderTimeLine()
          }
        </Modal>
        <Modal visible={APPREFModal} width='700px' destroyOnClose title={this.auditStatus === 'pass'? "通过": '拒绝'} onCancel={this.cancelAPPREFModal} footer={null}>
          <PlatFormRefund rowRecord={this.rowRecord} phone={this.phone} auditStatus={this.auditStatus} closeModal={this.cancelAPPREFModal} refresh={this.refresh} />
        </Modal>
        <Table schema={this.tableSchema} rowKey="transactionId" renderCommonOperate={this.searchTableList} pagination={{ current: nowPage, pageSize }} onChange={this.onChange} dataSource={financeAccountTransaction} />
      </>
    );
  }
}
