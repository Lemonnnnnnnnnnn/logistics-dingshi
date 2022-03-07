import React, { Component } from 'react';
import { Button, message, Popover } from "antd";
import router from 'umi/router';
import { Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import moment from 'moment';
import DebounceFormButton from '../../../components/DebounceFormButton';
import { pick, translatePageType, getLocal, formatMoney } from '../../../utils/utils';
import Table from '../../../components/Table/Table';
import TableContainer from '../../../components/Table/TableContainer';
import accountModel from '../../../models/transportAccount';
import { createOrder } from '../../../services/apiService';
import { getUserInfo } from '../../../services/user';
import SearchForm from '../../../components/Table/SearchForm2';
import '@gem-mine/antd-schema-form/lib/fields';
import { ACCOUNT_MANAGE_ROUTER } from "@/constants/account";

const { actions: { getTransportAccount } } = accountModel;

function mapStateToProps (state) {
  return {
    transportAccount: pick(state.transportAccount, ['items', 'count']),
    commonStore: state.commonStore,
  };
}

@TableContainer()
@connect(mapStateToProps, { getTransportAccount })
export default class Create extends Component{
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state = {
    nowPage: 1,
    pageSize: 10,
    disabled: false,
    selectedRowKeys: [],

  }

  organizationType = getUserInfo().organizationType

  tableRef = React.createRef()

  searchSchema = {
    accountTransportNo: {
      label: '对账单号',
      placeholder: '请输入对账单号',
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
    projectName: {
      label: '项目名称',
      placeholder: '请输入项目名称',
      component: 'input'
    },
    createTime: {
      label: '账单日期',
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
    }
  }

  tableSchema={
    variable: true,
    minWidth:2400,
    columns:[
      {
        title: '对账单号',
        dataIndex: 'accountTransportNo',
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
        width: '300px',
        render: (text, record) => (
          <div style={{ display:'inline-block', width: '250px', whiteSpace:'normal', breakWord: 'break-all' }}><a onClick={() => this.toProjectDetail(record.projectId)}>{text}</a></div>
        )
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        render: (time) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '运单数',
        dataIndex: 'transportNumber'
      },
      {
        title: '总运费(元)',
        dataIndex: 'totalFreight',
        render: text => formatMoney((text || 0)._toFixed(2))
      },
      {
        title: '服务费（元）',
        dataIndex: 'serviceCharge',
        render: text => formatMoney((text || 0)._toFixed(2))
      },
      {
        title: '货损赔付(元)',
        dataIndex: 'damageCompensation',
        render: text => formatMoney((text || 0)._toFixed(2))
      },
      {
        title: '应付账款(元)',
        dataIndex: 'receivables',
        render: (text, record) => formatMoney((Number(text || 0) + Number(record.otherExpenses || 0))._toFixed(2))
      },
      {
        title: '装车总量',
        dataIndex: 'loadingNetWeight',
        render:(text)=><div style={{ whiteSpace:'normal', width:'400px' }}>{text}</div>
      },
      {
        title: '卸车总量',
        dataIndex: 'unloadNetWeight',
        render:(text)=><div style={{ whiteSpace:'normal', width:'400px' }}>{text}</div>
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
          if (text===null) return '--';
          return text;
        }
      },
      {
        title: '审核时间',
        dataIndex: 'auditTime',
        render: time => {
          if (time===null) return '--';
          return moment(time).format('YYYY-MM-DD HH:mm:ss');
        }
      },
      {
        title: '审核意见',
        dataIndex: 'verifyReason',
        width: '200px',
        render: text => {
          if (text===null) return '--';
          return (
            <Popover content={this.cancelDom(text)} placement="topLeft">
              <span className='test-ellipsis' style={{ display: 'inline-block', maxWidth: '165px' }}>{text}</span>
            </Popover>
          );
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
        },
      };
      return [detail];
    }
  }

  cancelDom = (text) => (
    <div style={{ display:'inline-block', width: '200px', whiteSpace:'normal', breakWord: 'break-all' }}>{text}</div>
  )

  componentDidMount () {
    const { localData: { formData ={}, nowPage = 0, pageSize = 10 } } = this;
    const { getTransportAccount, setDefaultFilter, filter } = this.props;
    const _filter = {
      accountStatus: 2,
      settleAccountsStatus: 0,
      accountType: 2,
      orderAccountStatus: 1,
      accountOrgType: this.organizationType === 4 ?  undefined : 2,
      accountOrgTypeArr : this.organizationType === 4 ? '3,4,5' : undefined
    };

    const newFilter = this.props.setFilter({
      ..._filter,
      ...formData,
      createDateStart: formData && formData.createTime && formData.createTime.length ? moment(formData.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      createDateEnd: formData && formData.createTime && formData.createTime.length ? moment(formData.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: nowPage ? pageSize * ( nowPage - 1 ) : 0,
      limit: pageSize });
    setDefaultFilter(_filter);
    getTransportAccount({ ...filter, ...newFilter });
  }

  searchTableList = ()=>{
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
      <SearchForm layout="inline" mode={FORM_MODE.SEARCH} {...layout} schema={this.searchSchema}>
        <Item field="accountTransportNo" />
        <Item field="projectName" />
        <Item field="createTime" />
        <div style={{ display: 'inline-block', marginTop: '3px' }}>
          <DebounceFormButton className="mr-10" label="查询" type="primary" onClick={this.handleSearchBtnClick} />
          <Button className="mr-10" onClick={this.handleResetClick}>重置</Button>
        </div>
      </SearchForm>
    );
  }

  handleSearchBtnClick = value => {
    this.setState({
      nowPage: 1
    });
    const createDateStart = value && value.createTime && value.createTime.length ? moment(value.createTime?.[0]).startOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined;
    const createDateEnd = value && value.createTime && value.createTime.length ? moment(value.createTime?.[1]).endOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined;
    const { accountTransportId, projectName } = value;
    const newFilter = this.props.setFilter({ ...this.props.filter, createDateStart, createDateEnd, accountTransportId, projectName, offset: 0 });
    this.props.getTransportAccount(newFilter).then(() => {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: newFilter,
        nowPage: 1,
        pageSize: 10,
      }));
    });
  }

  handleResetClick = () => {
    const newFilter = this.props.resetFilter();
    this.tableRef.current.resetSelectedRows();
    this.setState({
      nowPage: 1,
      pageSize: 10,
      selectedRowKeys: [],
    });
    this.props.getTransportAccount(newFilter);
    localStorage.setItem(this.currentTab.id, JSON.stringify({ formData: {} }));
  }

  toProjectDetail = (id) => {
    router.push(`/buiness-center/project/projectManagement/projectDetail?projectId=${id}`);
  }

  onSelectRow = (selectedRowKeys) => {
    this.setState({
      selectedRowKeys,
    });
  }

  createPaymentBill = () => {
    this.setState({
      disabled: true
    });
    if (!Number(this.state.selectedRowKeys.length)) {
      this.setState({
        disabled: false
      });
      return message.error('请先勾选对账单');
    }
    const result = this.state.selectedRowKeys.every( (item, index) => {
      if (index) {
        return item.projectId === this.state.selectedRowKeys[0].projectId;
      }
      return true;
    });
    if (result) {
      const accountIdList = this.state.selectedRowKeys.map(item => item.accountTransportId);
      createOrder({ accountIdList })
        .then(() => {
          this.setState({
            disabled: false
          });
          window.g_app._store.dispatch({
            type: 'commonStore/deleteTab',
            payload: { id: this.currentTab.id }
          });
          if (this.organizationType === 4) {
            router.push("/logistics-management/paymentBillWrap/paymentBill");
          } else if (this.organizationType === 5) {
            router.push("/net-transport/paymentBillWrap/paymentBill");
          } else {
            router.push("/bill-account/paymentBillWrap/paymentBill");
          }
        })
        .catch(() => {
          this.setState({
            disabled: false
          });
        });
    } else {
      this.setState({
        disabled: false
      });
      return message.error('只能勾选同一项目的对账单');
    }
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage:current,
      pageSize:limit
    });
    const newFilter=this.props.setFilter({ offset, limit });
    this.props.getTransportAccount({ ...newFilter });
  }

  render () {
    const { nowPage, pageSize, disabled } = this.state;
    const { transportAccount } = this.props;
    return (
      <>
        <Table
          rowKey="accountTransportId"
          ref={this.tableRef}
          onSelectRow={this.onSelectRow}
          renderCommonOperate={this.searchTableList}
          multipleSelect
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          schema={this.tableSchema}
          dataSource={transportAccount}
        />
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button type="primary" disabled={disabled} onClick={this.createPaymentBill}>生成付款单</Button>
        </div>
      </>
    );
  }
}
