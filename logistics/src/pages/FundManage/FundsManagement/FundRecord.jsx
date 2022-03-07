import React, { Component } from 'react';
import { Item, Observer, FORM_MODE } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import { Modal, Timeline, notification } from 'antd';
import router from 'umi/router';
import moment from 'moment';
import DebounceFormButton from '../../../components/DebounceFormButton';
import model from '../../../models/financeAccountTransaction';
import { getUserInfo } from '../../../services/user';
import { translatePageType, pick, getLocal, omit } from '../../../utils/utils';
import Table from '../../../components/Table/Table';
import SearchForm from '../../../components/Table/SearchForm2';
import TableContainer from '../../../components/Table/TableContainer';
import { ORGANIZATION_TEXT } from '../../../constants/organization/organizationType';
import { TRANSACTION_STATUS, TRANSACTION_TYPE_CODE, TRANSACTION_TYPE } from '../../../constants/project/project';
import { patchFinanceAccounts } from '../../../services/apiService';

const { actions } = model;


function mapStateToProps(state) {
  return {
    commonStore: state.commonStore,
    financeAccountTransaction: pick(state.financeAccountTransaction, ['items', 'count']),
  };
}

@connect(mapStateToProps, actions)
@TableContainer()
class FundRecord extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  organizationName = getUserInfo().organizationName

  organizationType = getUserInfo().organizationType

  balanceRecord = {}

  tableSchema = {
    variable: true,
    minWidth: 1800,
    columns: [
      {
        title: '状态',
        dataIndex: 'status',
        width: 150,
        fixed: 'left',
        render: (text, record, index) => {
          const obj = {
            children: '--',
            props: {},
          };
          let status;
          const { items } = this.props.financeAccountTransaction;
          if ((items[index - 1] || {}).transactionNo !== record.transactionNo && (items[index + 1] || {}).transactionNo === record.transactionNo) {
            // 第一行的数据按实际item.colSpan渲染
            obj.props.rowSpan = items.filter(item => item.transactionNo === record.transactionNo).length;
          } else if ((items[index - 1] || {}).transactionNo !== record.transactionNo && (items[index + 1] || {}).transactionNo !== record.transactionNo) {
            obj.props.rowSpan = 1;
          } else {
            obj.props.rowSpan = 0;
          }
          if (record.transactionType === 2 || record.transactionType === 3) status = { color: 'green', word: '已完成' };
          if (record.transactionType === 1 || record.transactionType === 7 || record.transactionType === 37) {
            status = {
              [TRANSACTION_STATUS.PENDING]: { color: 'orange', word: '未完成' },
              [TRANSACTION_STATUS.SUCCESS]: { color: 'green', word: '已完成' },
              [TRANSACTION_STATUS.OVERTIME]: { color: 'red', word: '已关闭' }
            }[record.transactionStatus];
          }
          if (record.transactionType === 5 || record.transactionType === 9 || record.transactionType === 38 || record.transactionType === 39 || record.transactionType === 40 || record.transactionType === 41 || record.transactionType === 42 || record.transactionType === 43) {
            status = {
              [TRANSACTION_STATUS.PENDING]: { color: 'orange', word: '未完成' },
              [TRANSACTION_STATUS.AUDITED]: { color: 'orange', word: '未完成' },
              [TRANSACTION_STATUS.SUCCESS]: { color: 'green', word: '已完成' },
              [TRANSACTION_STATUS.OVERTIME]: { color: 'red', word: '已关闭' },
              [TRANSACTION_STATUS.FAILED]: { color: 'red', word: '已失败' },
              [TRANSACTION_STATUS.CANCEL]: { color: 'red', word: '已撤销' },
              [TRANSACTION_STATUS.REFUSED]: { color: 'red', word: '被拒绝' }
            }[record.transactionStatus];
          }

          obj.children = <span style={{ color: status?.color || 'blue' }}>{status?.word || '脏数据'}</span>;
          return obj;
        }
      },
      {
        title: '交易时间',
        dataIndex: 'payTime',
        render: (text, record, index) => {
          let time;
          if (text) time = moment(text).format('YYYY.MM.DD HH:mm');
          if (!text && record.createTime) time = moment(record.createTime).format('YYYY.MM.DD HH:mm');
          const obj = {
            children: time || '--',
            props: {},
          };
          const { items } = this.props.financeAccountTransaction;
          if ((items[index - 1] || {}).transactionNo !== record.transactionNo && (items[index + 1] || {}).transactionNo === record.transactionNo) {
            // 第一行的数据按实际item.colSpan渲染
            obj.props.rowSpan = items.filter(item => item.transactionNo === record.transactionNo).length;
          } else if ((items[index - 1] || {}).transactionNo !== record.transactionNo && (items[index + 1] || {}).transactionNo !== record.transactionNo) {
            obj.props.rowSpan = 1;
          } else {
            obj.props.rowSpan = 0;
          }
          return obj;
        },
        width: 200,
        fixed: 'left'
      }, {
        title: '交易编号',
        dataIndex: 'transactionNo',
        render: (text, record, index) => {
          const obj = {
            children: text,
            props: {},
          };
          const { items } = this.props.financeAccountTransaction;
          if ((items[index - 1] || {}).transactionNo !== record.transactionNo && (items[index + 1] || {}).transactionNo === record.transactionNo) {
            // 第一行的数据按实际item.colSpan渲染
            obj.props.rowSpan = items.filter(item => item.transactionNo === record.transactionNo).length;
          } else if ((items[index - 1] || {}).transactionNo !== record.transactionNo && (items[index + 1] || {}).transactionNo !== record.transactionNo) {
            obj.props.rowSpan = 1;
          } else {
            obj.props.rowSpan = 0;
          }
          return obj;
        },
        width: 200
      }, {
        title: '客户名称',
        dataIndex: 'selfName',
        render: (text, record, index) => {
          const obj = {
            children: this.organizationName,
            props: {},
          };
          const { items } = this.props.financeAccountTransaction;
          if ((items[index - 1] || {}).transactionNo !== record.transactionNo && (items[index + 1] || {}).transactionNo === record.transactionNo) {
            // 第一行的数据按实际item.colSpan渲染
            obj.props.rowSpan = items.filter(item => item.transactionNo === record.transactionNo).length;
          } else if ((items[index - 1] || {}).transactionNo !== record.transactionNo && (items[index + 1] || {}).transactionNo !== record.transactionNo) {
            obj.props.rowSpan = 1;
          } else {
            obj.props.rowSpan = 0;
          }
          return obj;
        },
      }, {
        title: '交易类型',
        dataIndex: 'transactionTypeDes',
      },
      {
        title: '关联单据号',
        dataIndex : 'orderNo'
      },
      {
        title: '交易金额(元)',
        dataIndex: 'transactionAmount',
        render: (text , record) => {
          const {creditDebiFlag} = record
          if( creditDebiFlag === 1 ) return `-${(text || 0)._toFixed(2)}`
          if( creditDebiFlag === 2 ) return `+${(text || 0)._toFixed(2)}`
        }
      },
      {
        title: '账户余额(元)',
        dataIndex: 'accountBalance',
        render: (text, record, index) => {
          if ((record.transactionType === 1 || record.transactionType === 7) && record.transactionStatus === 2) {
            return '--';
          }
          const { balanceRecord } = this.state;
          const obj = {
            children: balanceRecord !== undefined && balanceRecord[record.transactionNo] && (record.transactionType === 2 || record.transactionType === 3) ? (balanceRecord[record.transactionNo] || 0)._toFixed(2) : (text || 0)._toFixed(2),
            props: {},
          };
          const { items } = this.props.financeAccountTransaction;
          if ((items[index - 1] || {}).transactionNo !== record.transactionNo && (items[index + 1] || {}).transactionNo === record.transactionNo) {
            // 第一行的数据按实际item.colSpan渲染
            obj.props.rowSpan = items.filter(item => item.transactionNo === record.transactionNo).length;
          } else if ((items[index - 1] || {}).transactionNo !== record.transactionNo && (items[index + 1] || {}).transactionNo !== record.transactionNo) {
            obj.props.rowSpan = 1;
          } else {
            obj.props.rowSpan = 0;
          }
          return obj;
        }
      }, {
        title: '项目名称',
        dataIndex: 'projectName',
        width: '300px',
        render: (text, record, index) => {
          if (record.transactionType === 5 || record.transactionType === 1) return '--';
          const obj = {
            children: <div style={{ display: 'inline-block', width: '250px', whiteSpace: 'normal', breakWord: 'break-all', color: '#1890FF' }} onClick={() => this.toProject(record.projectId)}>{text}</div>,
            props: {},
          };
          const { items } = this.props.financeAccountTransaction;
          if ((items[index - 1] || {}).transactionNo !== record.transactionNo && (items[index + 1] || {}).transactionNo === record.transactionNo) {
            // 第一行的数据按实际item.colSpan渲染
            obj.props.rowSpan = items.filter(item => item.transactionNo === record.transactionNo).length;
          } else if ((items[index - 1] || {}).transactionNo !== record.transactionNo && (items[index + 1] || {}).transactionNo !== record.transactionNo) {
            obj.props.rowSpan = 1;
          } else {
            obj.props.rowSpan = 0;
          }
          return obj;
        }
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
        width: 200,
      },
    ],
    operations: record => {
      const dailyRecord = {
        title: '操作日志',
        onClick: () => {
          // 倒序
          // const dailyRecord = data.items.sort((a, b) => moment(b.createTime).unix() - moment(a.createTime).unix())
          this.setState({
            modal: true,
            dailyRecord: record.financeEventEntities || []
          });
        }
      };
      const cancel = {
        title: '撤销',
        confirmMessage: () => `你确定要撤销该退款申请？`,
        onClick: () => {
          patchFinanceAccounts({ transactionId: record.transactionId, transactionStatus: TRANSACTION_STATUS.CANCEL, transactionType: TRANSACTION_TYPE_CODE.REFUND }).then(() => {
            this.refresh();
            notification.success({
              message: '审核成功',
              description: `已同意该退款申请`
            });
          });
        }
      };
      if (record.transactionType === 5 && record.transactionStatus === TRANSACTION_STATUS.PENDING) return [dailyRecord, cancel];
      return [dailyRecord];
    }
  }

  showModal = () => {
    this.setState({
      modal: true,
    });
  }

  refresh = () => {
    this.props.getFinanceAccountTransaction(this.formatParams(this.props.filter));
  }

  handleOk = () => {
    this.setState({
      modal: false,
    });
  }

  searchSchema = {
    transactionNo: {
      label: '交易编号',
      placeholder: '请输入交易编号',
      component: 'input',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return {};
        }
      }),
    },
    projectName: {
      label: '项目名称',
      placeholder: '请输入项目名称',
      component: 'input'
    },
    transactionType: {
      label: '交易类型',
      placeholder: '请选择交易类型',
      component: 'select',
      options: () => {
        const options = [{
          label: '充值',
          value: 1,
          key: 1,
        }, {
          label: '支付付款单',
          value: 2,
          key: 2,
        }, {
          label: '服务费',
          value: 3,
          key: 3,
        }, {
          label: '退款',
          value: 5,
          key: 5,
        }, {
          label : '支付投标保证金',
          value : 38,
          key : 38
        }, {
          label : '支付标书费',
          value : 39,
          key : 39
        }, {
          label : '投标保证金退回',
          value : 40,
          key : 40
        }, {
          label : '标书费退回',
          value : 41,
          key : 41
        }
      ];
        if (this.organizationType === 1) options.push({
          label: '合伙人提现',
          value: 6,
          key: 6,
        });
        if (this.organizationType === 4 || this.organizationType === 5) options.push({
          label: '平台代充值',
          value: 7,
          key: 7,
        }, {
          label: '平台手工上账',
          value: 9,
          key: 9,
        },
          {
            label: '承运服务费（价差）收入',
            value: 37,
            key: 37
          },
        );
        return options;
      }
    },
    orderNo: {
      label: '关联单据号',
      component: 'input',
      placeholder: '请输入关联单据号'
    },
    createTime: {
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
    transactionStatus: {
      label: '状态',
      placeholder: '请选择状态',
      component: 'select',
      options: [{
        label: '已完成',
        value: 1,
        key: 1,
      }, {
        label: '已失败',
        value: 0,
        key: 0,
      }, {
        label: '未完成',
        value: 2,
        key: 2,
      }, {
        label: '已撤销',
        value: 3,
        key: 3,
      }, {
        label: '已关闭',
        value: 4,
        key: 4,
      }, {
        label: '被拒绝',
        value: 6,
        key: 6,
      }]
    },
    creditDebiFlag : {
      label : '交易方向',
      component: 'select',
      options : [
        {
          label: '支出',
          value: 1,
          key: 1,
        },
        {
          label: '收入',
          value: 2,
          key: 2,
        }
      ]
    }
    
  }

  constructor(props) {
    super(props);
    this.state = {
      pageSize: 10,
      nowPage: 1,
      ready: false,
      modal: false
    };
  }

  componentDidMount() {
    const { getFinanceAccountTransaction } = this.props;
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      createDateStart: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      createDateEnd: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: localData.tab1NowPage ? localData.tab1PageSize * (localData.tab1NowPage - 1) : 0,
      limit: localData.tab1PageSize ? localData.tab1PageSize : 10,
    };
    const newFilter = this.props.setFilter({ ...params });
    getFinanceAccountTransaction(omit({ ...newFilter }, 'createTime'))
      .then((data) => {
        this.setBalanceRecord(data);
        this.setState({
          ready: true
        });
      });
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.props.setFilter();
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        pageSize: this.state.pageSize,
        nowPage: this.state.nowPage,
      }));
    }
  }

  setBalanceRecord = (data) => {
    data.items.forEach((item, index) => {
      const { transactionNo, accountBalance } = item;
      if (!this.balanceRecord[transactionNo] || this.balanceRecord[transactionNo] > accountBalance) this.balanceRecord[transactionNo] = accountBalance;
      if (index === Number(data.items.length) - 1) this.setState({ balanceRecord: this.balanceRecord });
    });
  }

  toProject = projectId => {
    router.push(`/buiness-center/project/projectManagement/projectDetail?projectId=${projectId}`);
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getFinanceAccountTransaction(this.formatParams(newFilter)).then(data => this.setBalanceRecord(data));
  }

  searchTableList = () => {
    const formLayOut = {
      labelCol: {
        xs: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 18 }
      }
    };
    return (
      <SearchForm layout="inline" {...formLayOut} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
        <Item field="transactionNo" />
        <Item field="projectName" />
        <Item field="transactionType" />
        <Item field="createTime" />
        <Item field="transactionStatus" />
        <Item field='orderNo' />
        <Item field='creditDebiFlag' />
        <DebounceFormButton label="查询" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="重置" onClick={this.handleResetBtnClick} />
      </SearchForm>
    );
  }

  handleSearchBtnClick = value => {
    this.setState({
      nowPage: 1
    });
    const createDateStart = value.createTime && value.createTime.length ? moment(value.createTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd = value.createTime && value.createTime.length ? moment(value.createTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const newFilter = this.props.setFilter({ ...this.props.filter, createDateStart, createDateEnd, offset: 0 });
    this.props.getFinanceAccountTransaction(this.formatParams(omit({ ...newFilter }, 'createTime'))).then(data => this.setBalanceRecord(data));
  }

  /**
   *
   *
   * @description 添加状态参数
   */
  formatParams = (params) => {
    if (params.transactionStatus === 2) params.transactionStatusList = '2,5';
    return params;
  }

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({});
    this.setState({
      nowPage: 1,
      pageSize: 10
    });
    this.props.getFinanceAccountTransaction(this.formatParams(newFilter)).then(data => this.setBalanceRecord(data));
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
        6: '支付付款单',
        7 : '手工上账',
        8 : '代缴税费转出',
        9 : '支付投标保证金',
        10 : '支付标书费',
        11 : '投标保证金退回',
        12 : '标书费退回',
        13 : '标书费收入',
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
              {item.nickName ? `${item.nickName}(${ORGANIZATION_TEXT[item.organizationType]}) ${item.phone} ` : null}
              {getContent(item.financeEventType, item.financeEventStatus)}&nbsp;&nbsp;
              <p style={{ marginBottom: '7px' }}>{item.remarks ? `描述：${item.remarks}` : null}</p>
            </Timeline.Item>))
        }
      </Timeline>
    );
  }

  render() {
    const { nowPage, pageSize, ready } = this.state;
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
        <Table schema={this.tableSchema} rowKey="transactionId" renderCommonOperate={this.searchTableList} pagination={{ current: nowPage, pageSize }} onChange={this.onChange} dataSource={financeAccountTransaction} />
      </>
    );
  }
}

export default FundRecord;
