import React, { Component } from 'react';
import { Popover, Icon, Modal, Input, Button, notification } from 'antd';
import { Item, FORM_MODE } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import { connect } from 'dva';
import router from 'umi/router';
import DebounceFormButton from '../../../components/debounce-form-button';
import model from '../../../models/financeBusiness';
import auth from '../../../constants/authCodes';
import Authorized from '../../../utils/Authorized';
import { postBussinessBehalfPay, postTransferBehalfPay, postScanPayOrderPay, repayManualEntry, sendFinanceBusinessExcelPost } from '../../../services/apiService';
import { translatePageType, pick, routerToExportPage } from '../../../utils/utils';
import Table from '../../../components/table/table';
import SearchForm from '../../../components/table/search-form2';
import TableContainer from '../../../components/table/table-container';
import BetweenInput from './component/between-input';

const { actions } = model;

const { TextArea } = Input;

const {
  FUNDS_BUSINESS_DEALINGS_EXPORT_DETAIL,
  FUNDS_BUSINESS_DEALINGS_REMARKS,
  FUNDS_BUSINESS_DEALINGS_REPAY,
} = auth;


function mapStateToProps(state) {
  return {
    financeBusiness: pick(state.financeBusiness, ['items', 'count']),
  };
}

@connect(mapStateToProps, actions)
@TableContainer({ businessFunction: true })
class BusinessDealings extends Component {

  tableSchema = {
    variable: true,
    minWidth: 2832,
    columns: [
      {
        title: '交易状态',
        dataIndex: 'transactionStatus',
        width: 130,
        fixed: 'left',
        render: (text) => {
          const config = {
            0: { word: '失败', color: 'red' },
            1: { word: '成功', color: 'green' },
            2: { word: '已关闭-已重新支付', color: 'red' },
            3: { word: '处理中', color: 'orange' },
            4: { word: '已关闭', color: 'red' },
          }[text] || { word: '状态错误', color: 'red' };
          return <div style={{ color: config.color }}>{config.word}</div>;
        },
      }, {
        title: '关联单据号',
        dataIndex: 'orderNo',
        width: 182,
        render: (text, record) => <a
          className='test-ellipsis'
          style={{ display: 'inline-block', width: '150px' }}
          title={text}
          onClick={() => this.toOrder(record.orderId)}
        >{text}
        </a>,
        fixed: 'left',
      }, {
        title: '项目名称',
        dataIndex: 'projectName',
        width: 182,
        render: (text, record) => <a
          className='test-ellipsis'
          style={{ display: 'inline-block', width: '150px' }}
          title={text}
          onClick={() => this.toProject(record.projectId)}
        >{text}
        </a>,
        fixed: 'left',
      }, {
        title: '货主名称',
        dataIndex: 'ownerName',
        width: 182,
        render: (text) => <div
          className='test-ellipsis'
          style={{ display: 'inline-block', width: '150px' }}
          title={text || ''}
        >{text || '--'}
        </div>,
        fixed: 'left',
      }, {
        title: '付款账户',
        dataIndex: 'payerAccount',
        width: 382,
        render: (text, record) => <div
          className='test-ellipsis'
          style={{ display: 'inline-block', width: '350px' }}
          title={`${record.payerName}${text || ''}`}
        >{`${record.payerName}${text || ''}`}
        </div>,
      }, {
        title: '收款账户',
        dataIndex: 'payeeAccount',
        width: 382,
        render: (text, record) => <div
          className='test-ellipsis'
          style={{ display: 'inline-block', width: '350px' }}
          title={`${record.payeeName}${text || ''}`}
        >{`${record.payeeName}${text || ''}`}
        </div>,
      }, {
        title: '司机',
        dataIndex: 'nickName',
      }, {
        title: '司机手机号',
        dataIndex: 'phone',
      }, {
        title: '交易类型',
        dataIndex: 'businessTypeDes',
        // render: (text) => ({
        //   1: '货主充值',
        //   2: '收款转入支付账户',
        //   3: '支付转入收款账户',
        //   4: '货主支付平台运费',
        //   5: '银联通道费',
        //   6: '中信通道费',
        //   7: '司机提现',
        //   8: '收款转入收入账户',
        //   9: '平台充值',
        //   10: '平台收入提现',
        //   11: '收入转入支付账户',
        //   12: '货主手续费',
        //   13: '司机手续费',
        //   14: '手动提现',
        //   15: '承运手续费',
        //   16: '平台支付司机运费',
        //   17: '平台利息收入',
        //   18: '银行其他收费',
        //   19: '自动退款',
        //   20: '合伙人提现',
        //   21: '平台代充值',
        //   // 22: '平台其他费用',
        //   23: '充值失败-平台代收款',
        //   24: '退款失败-平台代收款',
        //   25: '退款失败-收款转代收',
        //   26: '平台手工上账',
        //   27: '司机提现(微信)',
        //   28: '平台代收司机费(微信)',
        //   29: '平台微信充值(内部转账)',
        //   30: '货主支付平台司机运费',
        //   31: '货主支付平台服务费',
        //   32: 'GPS设备押金收取',
        //   33 : 'GPS设备押金退回',
        //   34 : '代扣税费',
        //   35 : '代扣税费转出'
        //   36 : '承运服务费（价差）'
        // }[text] || '未知类型'),
      }, {
        title: '交易金额(元)',
        dataIndex: 'transactionAmount',
        render: text => text ? text._toFixed(2) : '--',
      }, {
        title: '创建时间',
        dataIndex: 'createTime',
        render: text => text ? moment(text).format('YYYY/MM/DD HH:mm') : '--',
      }, {
        title: '交易编号',
        dataIndex: 'transactionNo',
      },
      {
        title :'支付时间',
        dataIndex: 'payTime',
        render: text => text ? moment(text).format('YYYY/MM/DD HH:mm') : '--',
      },
      {
        title: '异常分类',
        dataIndex: 'singularType',
        render: (text) => {
          const word = {
            1: '用户资料不完善',
            2: '系统原因',
          }[text];
          return <div style={{ color: 'red' }}>{word}</div>;
        },
      },
      {
        title: '异常原因',
        dataIndex: 'singularReason',
        width: 232,
        render: (text) =>
          <div
            className='test-ellipsis'
            style={{ display: 'inline-block', width: '200px' }}
            title={text}
          >{text}
          </div>,
      }, {
        title: '备注',
        dataIndex: 'remarks',
        width: 332,
        render: (text, record) => {
          const { remarks, singularRemarks } = record;
          const popoverContent = (
            <>
              {remarks &&
              <div style={{ width: '200px' }}>
                {remarks}
              </div>}
              {singularRemarks &&
              <div style={{ width: '200px' }}>
                自定义备注信息：{singularRemarks}
              </div>}
            </>
          );
          return (
            <Popover content={popoverContent} placement='topLeft'>
              {remarks &&
              <div className='test-ellipsis' style={{ width: '300px', display: 'inline-block' }}>
                {remarks}
              </div>}
              {singularRemarks &&
              <div className='test-ellipsis' style={{ width: '300px' }}>
                自定义备注信息：{singularRemarks}
              </div>}
            </Popover>
          );
        },
      }, {
        title: '操作',
        dataIndex: 'operation',
        width: 100,
        fixed: 'right',
        render :(text, record)=> (
          <div>
            <Authorized authority={[FUNDS_BUSINESS_DEALINGS_REMARKS]}>
              <a style={{ marginRight : '1em' }} onClick={this.addRemarks(record)}>备注</a>
            </Authorized>
            {record.singularType === 2 && record.transactionStatus === 0 && record.businessType !== 14 && record.businessType !== 19 && record.businessType !== 10&& record.businessType !== 29 && record.singularReason !== '收款单笔金额超限' &&
            <Authorized authority={[FUNDS_BUSINESS_DEALINGS_REPAY]}>
              <a onClick={this.repay(record)}>重新支付</a>
            </Authorized>
            }
          </div>)
      },
    ],
  }

  searchSchema = {
    transactionStatus: {
      label: '交易状态',
      placeholder: '请选择交易状态',
      component: 'select',
      options: [{
        label: '已失败',
        value: 0,
        key: 0,
      }, {
        label: '已成功',
        value: 1,
        key: 1,
      }, {
        label: '已关闭-已重新支付',
        value: 2,
        key: 2,
      }, {
        label: '处理中',
        value: 3,
        key: 3,
      }, {
        label: '已关闭',
        value: 4,
        key: 4,
      }],
    },
    businessTypeItems: {
      label: '交易类型',
      placeholder: '请选择交易类型',
      component: 'select',
      props: {
        mode: 'multiple',
      },
      options: [{
        label: '货主充值',
        value: 1,
        key: 1,
      }, {
        label: '收款转入支付账户',
        value: 2,
        key: 2,
      }, {
        label: '支付转入收款账户',
        value: 3,
        key: 3,
      }, {
        label: '货主支付平台运费',
        value: 4,
        key: 4,
      }, {
        label: '银联通道费',
        value: 5,
        key: 5,
      }, {
        label: '中信通道费',
        value: 6,
        key: 6,
      }, {
        label: '司机提现',
        value: 7,
        key: 7,
      }, {
        label: '收款转入收入账户',
        value: 8,
        key: 8,
      }, {
        label: '平台充值',
        value: 9,
        key: 9,
      }, {
        label: '平台收入提现',
        value: 10,
        key: 10,
      }, {
        label: '收入转入支付账户',
        value: 11,
        key: 11,
      }, {
        label: '货主手续费',
        value: 12,
        key: 12,
      }, {
        label: '司机手续费',
        value: 13,
        key: 13,
      }, {
        label: '手动提现',
        value: 14,
        key: 14,
      }, {
        label: '承运手续费',
        value: 15,
        key: 15,
      }, {
        label: '平台支付司机运费',
        value: 16,
        key: 16,
      }, {
        label: '平台利息收入',
        value: 17,
        key: 17,
      }, {
        label: '银行其他收费',
        value: 18,
        key: 18,
      }, {
        label: '自动退款',
        value: 19,
        key: 19,
      }, {
        label: '合伙人提现',
        value: 20,
        key: 20,
      }, {
        label: '平台代充值',
        value: 21,
        key: 21,
      },
        // , {
        //   label: '平台其他费用',
        //   value: 22,
        //   key: 22
        // }
        {
          label: '充值失败 - 平台代收款',
          value: 23,
          key: 23,
        }, {
          label: '退款失败 - 平台代收款',
          value: 24,
          key: 24,
        }, {
          label: '退款失败 - 收款转代收',
          value: 25,
          key: 25,
        }, {
          label: '平台手工上账',
          value: 26,
          key: 26,
        }, {
          label: '司机提现(微信)',
          value: 27,
          key: 27,
        }, {
          label: '平台代收司机费(微信)',
          value: 28,
          key: 28,
        }, {
          label: '平台微信充值(内部转账)',
          value: 29,
          key: 29,
        },
        {
          label: '货主支付平台司机运费',
          value: 30,
          key: 30,
        },
        {
          label: '货主支付平台服务费',
          value: 31,
          key: 31,
        },
        {
          label : 'GPS设备押金收取',
          value : 32,
          key : 32
        },
        {
          label : 'GPS设备押金退回',
          value : 33,
          key : 33
        },
        {
          label : '代扣税费',
          value : 34,
          key : 34,
        },
        {
          label : '代扣税费转出',
          value : 35,
          key : 35,
        },
        {
          label : '承运服务费（价差）',
          value : 36,
          key : 36
        }
      ],
    },
    projectName: {
      label: '项目名称',
      placeholder: '请填写项目名称',
      component: 'input',
    },
    orderNo: {
      label: '关联单据号',
      placeholder: '请输入关联单据号',
      component: 'input',
    },
    singularType: {
      label: '异常分类',
      placeholder: '请选择交易状态',
      component: 'select',
      options: [
        {
          label: '用户资料不完善',
          value: 1,
          key: 1,
        }, {
          label: '系统原因',
          value: 2,
          key: 2,
        },
      ],
    },
    payerName: {
      label: '付款账户',
      placeholder: '请输入付款账户',
      component: 'input',
    },
    payeeName: {
      label: '收款账户',
      placeholder: '请输入收款账户',
      component: 'input',
    },
    transactionAmount: {
      label: '交易金额',
      props: {
        placeholder: ['最小金额', '最大金额'],
      },
      component: BetweenInput,
    },
    createTime: {
      label: '创建时间',
      component: 'rangePicker',
    },
    payTime : {
      label :'支付时间',
      component: 'rangePicker',
    },
    nickName: {
      label: '司机姓名',
      component: 'input',
      placeholder: '请输入司机姓名',
    },
    phone: {
      label: '司机手机',
      component: 'input',
      placeholder: '请输入司机手机号',
    },
    ownerName: {
      label: '货主名称',
      component: 'input',
      placeholder: '请输入货主名称',
    },
  }

  constructor(props) {
    super(props);
    this.state = {
      pageSize: 10,
      nowPage: 1,
      ready: false,
      data: {},
      repayData: {},
      remarkModal: false,
      repayModal: false,
    };
  }

  componentDidMount() {
    const { filter, getFinanceBusiness } = this.props;
    getFinanceBusiness(filter)
      .then(() => {
        this.setState({
          ready: true,
        });
      });
  }

  toProject = projectId => {
    router.push(`/buiness-center/project/projectManagement/projectDetail?projectId=${projectId}`);
  }

  toOrder = orderId => {
    router.push(`/bill-account/paymentBillWrap/paymentBill/detail?orderId=${orderId}`);
  }

  repay = record => () => {
    this.setState({
      repayData: record,
      repayDisabled: false,
      repayModal: true,
    });
  }

  addRemarks = record => {
    const addRemarkFunc = () => {
      this.setState({
        remarkModal: true,
        data: record,
      });
    };
    return addRemarkFunc;
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit,
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getFinanceBusiness(newFilter);
  }

  searchTableList = () => {
    const formLayOut = {
      labelCol: {
        xs: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 16 },
      },
    };
    return (
      <SearchForm layout='inline' {...formLayOut} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
        <Item field='transactionStatus' />
        <Item field='businessTypeItems' />
        <Item field='projectName' />
        <Item field='orderNo' />
        <Item field='singularType' />
        <Item field='payerName' />
        <Item field='payeeName' />
        <Item field='transactionAmount' />
        <Item field='createTime' />
        <Item field='payTime' />
        <Item field='nickName' />
        <Item field='phone' />
        <Item field='ownerName' />
        <div style={{ margin : '1rem 0' }}>
          <DebounceFormButton label='查询' type='primary' className='mr-10' onClick={this.handleSearchBtnClick} />
          <DebounceFormButton label='重置' className='mr-10' onClick={this.handleResetBtnClick} />
          <Authorized authority={[FUNDS_BUSINESS_DEALINGS_EXPORT_DETAIL]}>
            <DebounceFormButton label='导出明细' onClick={this.getExcel} />
          </Authorized>
        </div>
      </SearchForm>
    );
  }

  getExcel = () => {
    const { filter } = this.props;
    const createDateStart = filter.createTime && filter.createTime.length ? filter.createTime[0].set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    }).format('YYYY/MM/DD HH:mm:ss') : '';
    const createDateEnd = filter.createTime && filter.createTime.length ? filter.createTime[1].set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    }).format('YYYY/MM/DD HH:mm:ss') : '';
    const payDateStart = filter.payTime && filter.payTime.length ? filter.payTime[0].set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    }).format('YYYY/MM/DD HH:mm:ss') : '';
    const payDateEnd = filter.payTime && filter.payTime.length ? filter.payTime[1].set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    }).format('YYYY/MM/DD HH:mm:ss') : '';
    const {
      projectName,
      businessTypeItems,
      orderNo,
      transactionStatus,
      singularType,
      payerName,
      payeeName,
      transactionAmount,
      phone,
      nickName,
      ownerName,
    } = this.props.filter;
    const options = {
      projectName,
      createDateStart,
      createDateEnd,
      payDateStart,
      payDateEnd,
      businessTypeItems: businessTypeItems && businessTypeItems.length ? businessTypeItems : undefined,
      orderNo,
      transactionStatus,
      singularType,
      payerName,
      payeeName,
      transactionAmount,
      phone,
      nickName,
      ownerName,
      businessFunction: true,
      limit : 100000,
      offset : 0
    };
    routerToExportPage(sendFinanceBusinessExcelPost, options);
  }

  handleSearchBtnClick = value => {
    this.setState({
      nowPage: 1,
    });
    const createDateStart = value.createTime && value.createTime.length ? value.createTime[0].set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd = value.createTime && value.createTime.length ? value.createTime[1].set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const payDateStart = value.payTime && value.payTime.length ? value.payTime[0].set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const payDateEnd = value.payTime && value.payTime.length ? value.payTime[1].set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const transactionAmountMin = value.transactionAmount?.[0];
    const transactionAmountMax = value.transactionAmount?.[1];
    const newFilter = this.props.setFilter({
      ...this.props.filter,
      createDateStart,
      createDateEnd,
      payDateStart,
      payDateEnd,
      transactionAmountMin,
      transactionAmountMax,
      offset: 0,
      businessFunction: true,
    });
    this.props.getFinanceBusiness(newFilter);
  }

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({});
    this.setState({
      nowPage: 1,
      pageSize: 10,
    });
    this.props.getFinanceBusiness(newFilter);
  }

  inputChange = (e) => {
    const { value } = e.target;
    this.remark = value;
  }

  closeRemarkModal = () => {
    this.remark = undefined;
    this.setState({ remarkModal: false });
  }

  submitRemark = () => {
    const { patchFinanceBusiness } = this.props;
    const { data: { financeBusinessId } } = this.state;
    patchFinanceBusiness({ financeBusinessId, singularRemarks: this.remark })
      .then(() => {
        notification.success({
          message: `成功`,
          description: '添加备注成功',
        });
        this.closeRemarkModal();
      });
  }

  renderRepayContent = () => {
    const { repayData } = this.state;
    const { payeeAccount, payeeName, transactionAmount } = repayData;
    return (
      <div style={{ marginLeft: '35px' }}>
        <div>{`收款户名${payeeName}`}</div>
        <div>{`收款账户：${payeeAccount}`}</div>
        <div>{`付款金额：${transactionAmount}元`}</div>
      </div>
    );
  }

  closeRepayModal = () => {
    this.setState({ repayModal: false });
  }

  submitRepay = () => {
    this.setState({
      repayDisabled: true,
    });
    const { repayData } = this.state;
    const { getFinanceBusiness, filter } = this.props;
    if (`${repayData.businessType}` === '7' || `${repayData.businessType}` === '20') {
      postBussinessBehalfPay({ financeBusinessId: repayData.financeBusinessId })
        .then(() => {
          getFinanceBusiness(filter)
            .then(() => {
              notification.success({
                message: `成功`,
                description: '重新支付成功',
              });
              const { filter } = this.props;
              this.props.getFinanceBusiness(filter);
              this.closeRepayModal();
            });
        })
        .catch(() => {
          this.setState({
            repayDisabled: false,
          });
        });
    } else if (repayData.businessType === 26){
      repayManualEntry({ financeBusinessId : repayData.financeBusinessId })
        .then(() => {
          getFinanceBusiness(filter)
            .then(() => {
              notification.success({
                message: `成功`,
                description: '重新支付成功',
              });
              const { filter } = this.props;
              this.props.getFinanceBusiness(filter);
              this.closeRepayModal();
            });
        })
        .catch(() => {
          this.setState({
            repayDisabled: false,
          });
        });
    } else if (repayData.businessType === 27){
      postScanPayOrderPay({ businessId :repayData.financeBusinessId })
        .then(() => {
          getFinanceBusiness(filter)
            .then(() => {
              notification.success({
                message: `成功`,
                description: '重新支付成功',
              });
              const { filter } = this.props;
              this.props.getFinanceBusiness(filter);
              this.closeRepayModal();
            });
        })
        .catch(() => {
          this.setState({
            repayDisabled: false,
          });
        });
    } else {
      postTransferBehalfPay(({ financeBusinessId: repayData.financeBusinessId }))
        .then(() => {
          getFinanceBusiness(filter)
            .then(() => {
              notification.success({
                message: `成功`,
                description: '重新支付成功',
              });
              const { filter } = this.props;
              this.props.getFinanceBusiness(filter);
              this.closeRepayModal();
            });
        })
        .catch(() => {
          this.setState({
            repayDisabled: false,
          });
        });
    }
  }

  render() {
    const { nowPage, pageSize, ready, remarkModal, data, repayModal, repayDisabled } = this.state;
    const { financeBusiness } = this.props;
    return (
      ready &&
      <>
        <Modal
          title='备注'
          footer={null}
          width={500}
          maskClosable={false}
          destroyOnClose
          visible={remarkModal}
          onCancel={this.closeRemarkModal}
        >
          <div style={{ marginBottom: '5px' }}>请填写备注</div>
          <TextArea
            style={{ height: '100px' }}
            maxLength={50}
            defaultValue={data.singularRemarks}
            placeholder='备注(最多50个字)'
            onChange={this.inputChange}
          />
          <div style={{ marginTop: '10px', textAlign: 'right' }}>
            <Button style={{ marginRight: '5px' }} onClick={this.closeRemarkModal}>取消</Button>
            <Button type='primary' onClick={this.submitRemark}>确定</Button>
          </div>
        </Modal>
        <Modal
          footer={null}
          width={600}
          maskClosable={false}
          destroyOnClose
          visible={repayModal}
          onCancel={this.closeRepayModal}
        >
          <h2 style={{ marginBottom: '5px' }}>
            <Icon
              style={{ color: 'rgba(250,173,20,0.85)', marginRight: '15px' }}
              type='exclamation-circle'
              theme='filled'
            />
            您确定要重新支付吗？
          </h2>
          {this.renderRepayContent()}
          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            <Button style={{ marginRight: '20px' }} onClick={this.closeRepayModal}>取消</Button>
            <Button disabled={repayDisabled} type='primary' onClick={this.submitRepay}>继续</Button>
          </div>
        </Modal>
        <Table
          schema={this.tableSchema}
          rowKey='financeBusinessId'
          renderCommonOperate={this.searchTableList}
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          dataSource={financeBusiness}
        />
      </>
    );
  }
}

export default BusinessDealings;
