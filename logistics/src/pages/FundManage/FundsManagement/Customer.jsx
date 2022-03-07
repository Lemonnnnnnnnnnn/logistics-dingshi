import React, { Component } from 'react';
import { Popover } from 'antd';
import CSSModules from 'react-css-modules';
import { connect } from 'dva';
import { Item, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../components/DebounceFormButton';
import { getCustomerTransferState, getCustomerTransferType } from '../../../services/project';
import { CUSTOMER_TRANSFER_LIST_STATE } from '../../../constants/project/project';
import SearchForm from '../../../components/Table/SearchForm2';
import Table from '../../../components/Table/Table';
import TableContainer from '../../../components/Table/TableContainer';
import '@gem-mine/antd-schema-form/lib/fields';
import model from '../../../models/recharges';
import UploadFile from '../../../components/Upload/UploadFile';
import { pick, translatePageType, getOssImg, getLocal } from '../../../utils/utils';
import styles from './Customer.less';
import BigPriceInput from './component/BigPriceInput';


const { actions: { getRecharges } } = model;

function mapStateToProps (state) {
  return {
    commonStore: state.commonStore,
    list: pick(state.recharges, ['items', 'count'])
  };
}

@connect(mapStateToProps, { getRecharges })
@TableContainer()
@CSSModules(styles, { allowMultiple: true })
export default class Customer extends Component{
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state = {
    nowPage:1,
    pageSize:10,
  }

  schemaData = {
    applyRechargeAmount: {
      label: '申请金额：',
      component: 'input',
      disabled: true
    },
    actualArrivalAmount: {
      label: '实际支付金额：',
      placeholder: '请输入实际支付金额',
      component: BigPriceInput,
      type: 'number',
      style: {
        marginLeft: '-73px',
        marginBottom: '0',
        color: 'rgba(0, 0, 0, 0.85)'
      },
      rules: {
        required: [true, '请输入实际支付金额(元)'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '请正确输入充值金额!   (最高支持两位小数)';
          if (value <= 0) return '请正确输入充值金额!   (最高支持两位小数)';
        },
      },
      observer: Observer({
        watch:'*initValue',
        action:(initValue)=>({
          props: { initialValue:JSON.parse(JSON.stringify(initValue)) }
        })
      })
    },
    rechargeDentryid: {
      label: '收款凭证',
      component: UploadFile,
      rules: {
        required: [true, '请上传收款凭证']
      },
      accept:"application/pdf, image/jpeg, image/jpg, image/png",
      renderMode:'pdf&img',
      fileSuffix: ['jpeg', 'jpg', 'png', 'pdf'],
    },
    remarks: {
      label: '备注（选填）：',
      component: 'input.textArea',
      placeholder: '请输入备注（选填）',
    }
  }

  // organizationType= getUserInfo().organizationType// 3为货权 4为托运  5为承运

  searchSchema = {
    rechargeState: {
      label: '转账状态：',
      placeholder: '请选择转账状态',
      component: 'select',
      options: () => Object.keys(CUSTOMER_TRANSFER_LIST_STATE).map((item) => (
        {
          key: CUSTOMER_TRANSFER_LIST_STATE[item],
          value: CUSTOMER_TRANSFER_LIST_STATE[item],
          label: getCustomerTransferState(CUSTOMER_TRANSFER_LIST_STATE[item]).word
        }
      )),
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
    transactionNo: {
      label: '交易编号：',
      placeholder: '请输入交易编号',
      component: 'input'
    },
    remittanceIdentificationCode: {
      label: '汇款识别码：',
      component: 'input',
      placeholder: '请输入汇款识别码',
    }
  }

  formLayOut = {
    labelCol: {
      xs: { span: 6 }
    },
    wrapperCol: {
      xs: { span: 18 }
    }
  }

  tableSchema = {
    variable: true,
    minWidth: 2000,
    columns: [
      {
        title: '转账状态',
        dataIndex: 'rechargeState',
        width: '80px',
        fixed: 'left',
        render: (text, record) => {
          const status = getCustomerTransferState(record.rechargeState);
          return (
            <span style={{ color: status.color }}>
              {status.word}
            </span>
          );
        }
      },
      {
        title: '交易编号',
        dataIndex: 'transactionNo',
        width: '200px',
        fixed: 'left'
      }, {
        title: '支付方式',
        dataIndex: 'paymentType',
        width: '150px',
        render: (text, record) => getCustomerTransferType(record.paymentType)
      }, {
        title: '汇款识别码',
        dataIndex: 'remittanceIdentificationCode'
      }, {
        title: '付款方',
        dataIndex: 'organizationName'
      }, {
        title: '付款账号',
        dataIndex: 'paymentAccountNumber'
      }, {
        title: '收款方',
        dataIndex: 'payeeName'
      }, {
        title: '收款账号',
        dataIndex: 'payeeAccountNumber'
      }, {
        title: '申请金额（元）',
        dataIndex: 'applyRechargeAmount',
        render: text => (text || 0)._toFixed(2)
      }, {
        title: '实际支付金额（元）',
        dataIndex: 'actualArrivalAmount',
        render: text => (text || 0)._toFixed(2)
      }, {
        title: '备注',
        dataIndex: 'remarks',
        width: '200px',
        render: (text) => (
          text?
            <Popover content={this.cancelDom(text)} placement="topLeft">
              <span className='test-ellipsis' style={{ display: 'inline-block', maxWidth: '165px' }}>{text}</span>
            </Popover>
            :
            '--'
        )
      }
    ],
    operations: (record) => {
      const operations = {
        [CUSTOMER_TRANSFER_LIST_STATE.UNCONFIRMED]: [],
        [CUSTOMER_TRANSFER_LIST_STATE.CONFIRM]:[
          {
            title: '查看凭证',
            onClick: (record) => {
              const { rechargeDentryid } = record;
              window.open(getOssImg(rechargeDentryid));
            }
          }
        ],
        [CUSTOMER_TRANSFER_LIST_STATE.EXPIRE]:[]
      }[record.rechargeState];
      return operations;
    }
  }

  cancelDom = (text) => (
    <div style={{ display:'inline-block', width: '200px', whiteSpace:'normal', breakWord: 'break-all' }}>{text}</div>
  )

  handleSearch = () => {
    const newFilter = this.props.setFilter({ ...this.props.filter, ...{ limit: 10, offset: 0 } });
    this.setState({
      nowPage: 1
    });
    this.props.getRecharges(newFilter);
  }

  handleResetClick = () => {
    this.setState({
      nowPage: 1,
      pageSize: 10
    });
    const newFilter = this.props.resetFilter();
    this.props.getRecharges(newFilter);
  }

  searchForm = () => (
    <>
      <SearchForm className='customer_transfer_searchForm' style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }} schema={this.searchSchema}>
        <Item style={{ width: '300px', marginRight: '20px' }} layout="inline" {...this.formLayOut} field="rechargeState" />
        <Item style={{ width: '300px', marginRight: '20px' }} layout="inline" {...this.formLayOut} field="transactionNo" />
        <Item style={{ width: '300px', marginRight: '20px' }} layout="inline" {...this.formLayOut} field="remittanceIdentificationCode" />
        <DebounceFormButton debounce label="查询" type="primary" onClick={this.handleSearch} />
        <DebounceFormButton label="重置" style={{ marginLeft: '10px' }} onClick={this.handleResetClick} />
      </SearchForm>
    </>
  )

  componentDidMount () {
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    this.props.setFilter({ ...params });
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
    });
    this.props.getRecharges(params);
  }

  componentWillUnmount() {
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.setItem(this.currentTab.id, JSON.stringify({
      formData: { ...formData },
      pageSize: this.state.pageSize,
      nowPage: this.state.nowPage,
    }));
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage:current,
      pageSize:limit
    });
    const newFilter=this.props.setFilter({ offset, limit });
    this.props.getRecharges({ ...newFilter });
  }

  render () {
    const { nowPage, pageSize } = this.state;
    const { list } = this.props;
    return (
      <>
        <Table rowKey='transactionNo' dataSource={list} schema={this.tableSchema} renderCommonOperate={this.searchForm} pagination={{ current :nowPage, pageSize }} onChange={this.onChange} />
      </>
    );
  }
}
