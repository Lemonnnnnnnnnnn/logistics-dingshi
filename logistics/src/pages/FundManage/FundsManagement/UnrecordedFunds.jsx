import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import { connect } from 'dva';
import { Button, Modal } from 'antd';
import { Item, Observer } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import SearchForm from '../../../components/Table/SearchForm2';
import '@gem-mine/antd-schema-form/lib/fields';
import { UNRECORDED_FUNDS_STATE } from '../../../constants/project/project';
import Table from '../../../components/Table/Table';
import TableContainer from '../../../components/Table/TableContainer';
import model from '../../../models/unrecordedFunds';
import { pick, translatePageType, routerToExportPage, getLocal } from '../../../utils/utils';
import { sendManualEntryExcelPost } from "../../../services/apiService";
import BetweenInput from './component/BetweenInput';
import DebounceFormButton from '../../../components/DebounceFormButton';
import { UNRECORDED_FUNDS_EXPORT, UNRECORDED_FUNDS_RECORD } from '../../../constants/authCodes';
import ManualEntryModel from './component/ManualEntryModel';

import styles from './Customer.less';

const {
  actions: { getManualEntry },
} = model;

function mapStateToProps(state) {
  return {
    commonStore: state.commonStore,
    list: pick(state.manualEntry, ['items', 'count']),
  };
}

@connect(
  mapStateToProps,
  { getManualEntry }
)
@TableContainer()
@CSSModules(styles, { allowMultiple: true })
export default class UnrecordedFunds extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  constructor(props) {
    super(props);
    this.state = {
      nowPage: 1,
      pageSize: 10,
      cancelModal: false,
    };

    this.searchSchema = {
      rechargeStateList: {
        label: '入账状态',
        placeholder: '请选择入账状态',
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
            label: '未入账',
            value: 0,
            key: 0,
          },
          {
            label: '已入账',
            value: 1,
            key: 1,
          },
          {
            label: '入账中',
            value: 3,
            key: 3,
          },
        ],
      },
      paymentTypeList: {
        label: '交易类型',
        placeholder: '请选择交易类型',
        component: 'select',
        options: [
          {
            label: '平台手工上账',
            value: 3,
            key: 3,
          },
          {
            label: '退款失败-平台代收款',
            value: 4,
            key: 4,
          },
        ],
      },
      payerName: {
        label: '付款账户',
        placeholder: '请输入付款账户',
        component: 'input',
      },
      transactionAmount: {
        label: '交易金额',
        props: {
          placeholder: ['最小金额', '最大金额'],
        },
        component: BetweenInput,
      },
      transactionTime: {
        label: '交易时间',
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
    };

    this.formLayOut = {
      labelCol: {
        xs: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 18 },
      },
    };

    this.tableSchema = {
      variable: true,
      minWidth: 2000,
      columns: [
        {
          title: '入账状态',
          dataIndex: 'rechargeState',
          width: '80px',
          fixed: 'left',
          render: text => {
            if (text === 0) return <span style={{ color: 'gray' }}>未入账</span>;
            if (text === 1) return <span style={{ color: '#98CA49' }}>已入账</span>;
            if (text === 3) return <span style={{ color: '#F69000' }}>入账中</span>;
          },
        },
        {
          title: '付账账户',
          dataIndex: 'paymentAccountNumber',
          width: '200px',
          fixed: 'left',
          render : (text, record)=> {
            const { payerName } = record;
            return `${payerName} ${text}`;
          }
        },
        {
          title: '收款账户',
          width: '150px',
          render:(text, row, index) => (<span>{row.payeeName} {row.payeeAccountNumber}</span>)
        },
        {
          title: '交易类型',
          dataIndex: 'paymentType',
          render: text => {
            if (text === 3) return '平台手工上账';
            if (text === 4) return '退款失败-平台代收款';
          },
        },
        {
          title: '交易金额（元）',
          dataIndex: 'applyRechargeAmount',
        },
        {
          title: '交易时间',
          dataIndex: 'transactionTime',
          render: text => moment(text).format('YYYY/MM/DD HH:mm:ss'),
        },
        {
          title: '交易编号',
          dataIndex: 'transactionNo',
        },
        {
          title: '失败原因',
          dataIndex: 'singularReason',
        },
        {
          title: '货主名称',
          dataIndex: 'organizationName',
        },
        {
          title: '货主平台账号',
          dataIndex: 'organizationVirtualAccountNo',
          render: text => (text === null ? '无' : text),
        },
        {
          title: '上账金额（元）',
          dataIndex: 'actualArrivalAmount',
          render: text => (text === null ? '0.00' : text),
        },
        {
          title: '操作人',
          dataIndex: 'operationUserName',
        },
        {
          title: '操作时间',
          dataIndex: 'operationTime',
          render: text => text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '',
        },
        {
          title: '备注',
          dataIndex: 'remarks',
        },
      ],
      operations: record =>
        ({
          [UNRECORDED_FUNDS_STATE.UNRECORDED]: [
            {
              title: '上账',
              onClick: () => {
                this.setState({ rechargeId: record.rechargeId });
                this.toggleCancelModal();
              },
              auth: UNRECORDED_FUNDS_RECORD,
            },
          ],
          [UNRECORDED_FUNDS_STATE.RECORDED]: [],
          [UNRECORDED_FUNDS_STATE.RECORDING]: []
        }[record.rechargeState]),
    };
  }

  // 显示隐藏弹窗
  toggleCancelModal = () => {
    const { cancelModal } = this.state;
    this.setState({
      cancelModal: !cancelModal,
    });
  };

  // 搜索事件
  handleSearch = () => {
    this.setState({
      nowPage: 1,
    });
    this.refresh();
  };

  refresh = () => {
    const { filter } = this.props;
    const startTransactionTime =  filter.transactionTime?.length ? moment(filter.transactionTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const endTransactionTime =  filter.transactionTime?.length ? moment(filter.transactionTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const miniTransactionAmount = filter.transactionAmount?.[0];
    const maxTransactionAmount = filter.transactionAmount?.[1];

    const newFilter = this.props.setFilter({
      ...this.props.filter,
      startTransactionTime,
      endTransactionTime,
      miniTransactionAmount,
      maxTransactionAmount,
    });

    this.props.getManualEntry(newFilter);
  };

  // 重置事件
  handleResetClick = () => {
    this.setState({
      nowPage: 1,
      pageSize: 10,
    });
    const newFilter = this.props.resetFilter();
    this.props.getManualEntry(newFilter);
  };

  exportTable = () => {
    const { offset, limit, rechargeStateList, paymentTypeList, payerName, transactionAmount, transactionTime } = this.props.filter;
    const miniTransactionAmount = transactionAmount?.[0];
    const maxTransactionAmount = transactionAmount?.[1];
    const startTransactionTime =  transactionTime.length ? moment(transactionTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const endTransactionTime =  transactionTime.length ? moment(transactionTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;

    const params = {
      rechargeStateList,
      paymentTypeList,
      payerName,
      miniTransactionAmount,
      maxTransactionAmount,
      startTransactionTime,
      endTransactionTime,
      limit,
      offset
    };

    routerToExportPage(sendManualEntryExcelPost, params);
    // sendManualEntryExcelPost(params).then(()=>routerToExportPage())

    // let paramsString = Object.keys(params)
    //   .map(item => params[item] !== undefined && `${item}=${params[item]}`)
    //   .filter(item => item)
    //   .join('&')
    // paramsString = encodeURI(paramsString)
    // window.open(
    //   `${window.envConfig.baseUrl}/v1/manualEntry/excel?offset=${offset}&limit=${limit}&${paramsString}`
    // )
  };

  // 搜索栏
  searchForm = () => (
    <>
      <SearchForm
        layout="inline"
        className="customer_transfer_searchForm"
        schema={this.searchSchema}
      >
        <Item
          style={{ width: '300px', marginRight: '20px' }}
          {...this.formLayOut}
          field="rechargeStateList"
        />
        <Item
          style={{ width: '300px', marginRight: '20px' }}
          {...this.formLayOut}
          field="paymentTypeList"
        />
        <Item
          style={{ width: '300px', marginRight: '20px' }}
          {...this.formLayOut}
          field="payerName"
        />
        <Item
          style={{ width: '300px', marginRight: '20px' }}
          {...this.formLayOut}
          field="transactionAmount"
        />
        <Item
          style={{ width: '300px', marginRight: '20px' }}
          {...this.formLayOut}
          field="transactionTime"
        />
        <DebounceFormButton debounce label="查询" type="primary" onClick={this.handleSearch} />
        <DebounceFormButton
          label="重置"
          style={{ marginLeft: '10px' }}
          onClick={this.handleResetClick}
        />
        {this.exportPermission && <Button type='primary' style={{ float: 'right' }} onClick={this.exportTable}>
          导出明细
        </Button>}
      </SearchForm>
    </>
  );

  // 挂载事件
  componentDidMount() {
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      startTransactionTime: localData.formData.transactionTime && localData.formData.transactionTime.length ? moment(localData.formData.transactionTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      endTransactionTime: localData.formData.transactionTime && localData.formData.transactionTime.length ? moment(localData.formData.transactionTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    this.props.setFilter({ ...params });
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
    });
    const authLocal = JSON.parse(localStorage.getItem('ejd_authority'));
    this.exportPermission = authLocal.find(item => item.permissionCode === UNRECORDED_FUNDS_EXPORT);

    this.props.getManualEntry(params);
  }

  componentWillUnmount() {
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.setItem(this.currentTab.id, JSON.stringify({
      formData: { ...formData },
      pageSize: this.state.pageSize,
      nowPage: this.state.nowPage,
    }));
  }

  // 分页切换事件
  onChange = pagination => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit,
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getManualEntry({ ...newFilter });
  };

  render() {
    const { nowPage, pageSize, cancelModal, rechargeId } = this.state;
    const { list } = this.props;

    return (
      <>
        <Table
          rowKey="transactionNo"
          dataSource={list}
          schema={this.tableSchema}
          renderCommonOperate={this.searchForm}
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
        />
        <Modal
          visible={cancelModal}
          maskClosable={false}
          destroyOnClose
          title="货主上账"
          onCancel={this.toggleCancelModal}
          width={648}
          footer={null}
        >
          <ManualEntryModel
            refresh={this.refresh}
            toggleCancelModal={this.toggleCancelModal}
            rechargeId={rechargeId}
          />
        </Modal>
      </>
    );
  }
}
