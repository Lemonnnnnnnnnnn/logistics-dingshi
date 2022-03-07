import React, { Component } from 'react';
import { Button, Modal, notification, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { Item } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import DebounceFormButton from '@/components/DebounceFormButton';
import SearchForm from '@/components/Table/SearchForm2';
import Table from '@/components/Table/Table';
import TableContainer from '@/components/Table/TableContainer';
import '@gem-mine/antd-schema-form/lib/fields';
import model from '@/models/orders';
import { pick, cloneDeep, translatePageType, getLocal } from '@/utils/utils';
import { NETWORK_ORDER_STATE } from '@/constants/project/project';
import { patchInvoice, getOldOrders } from '@/services/apiService';

const { actions: { getOrders } } = model;

function mapStateToProps (state) {
  return {
    orderList: pick(state.orders, ['items', 'count']),
    commonStore: state.commonStore
  };
}

@connect(mapStateToProps, { getOrders })
@TableContainer({ orderState:NETWORK_ORDER_STATE.COMPLETED, isCreateInvoice: 0 })
export default class Modify extends Component{

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = this.currentTab && getLocal(this.currentTab.id) || { formData: {} };

  state = {
    addOrder: [],
    nowOrderList: {
      items: []
    },
    visible: false,
    pageSize: 6,
    nowPage: 1,
  }

  tempOrder = []

  searchSchema = {
    orderNo: {
      label: '付款单号',
      placeholder: '请输入付款单号',
      component: 'input'
    }
  }

  searchForm = () => {
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
      <>
        <SearchForm {...layout} layout="inline" schema={this.searchSchema}>
          <Item field="orderNo" />
          <DebounceFormButton debounce label="查询" type="primary" style={{ marginTop: '3px' }} onClick={this.handleSearch} />
          <DebounceFormButton label="重置" style={{ marginLeft: '10px', marginTop: '3px' }} onClick={this.handleResetClick} />
        </SearchForm>
      </>
    );
  }

  handleSearch = (value) => {
    const newFilter = this.props.setFilter({ ...this.props.filter, ...value });
    this.setState({
      nowPage: 1,
    });
    this.props.getOrders({ ...newFilter, projectName: this.projectName });
  }

  handleResetClick = () => {
    this.tableRef.current.resetSelectedRows();
    this.setState({
      nowPage: 1,
      pageSize: 6
    });
    const newFilter = this.props.resetFilter();
    this.props.getOrders({ ...newFilter, projectName: this.projectName });
  }

  tableSchema = {
    variable: true,
    minWidth: 2100,
    columns: [
      {
        title: '付款单号',
        dataIndex: 'orderNo',
        width: '200px',
        fixed: 'left'
      }, {
        title: '项目名称',
        dataIndex: 'projectName',
        width: '300px',
        render: (text, record) => (
          <div style={{ display:'inline-block', width: '250px', whiteSpace:'normal', breakWord: 'break-all' }}><a onClick={() => this.toProjectDetail(record.projectId)}>{text}</a></div>
        )
      }, {
        title: '付款账户',
        dataIndex: 'invoiceTitle',
        render:(text, record)=> {
          if (!record.invoiceTitle || !record.bankAccount) return '--';
          return (<span>{`${record.invoiceTitle}${record.bankAccount}`}</span>);
        }
      }, {
        title: '付款单生成时间',
        dataIndex: 'createTime',
        render:(text)=> text?moment(text).format('YYYY-MM-DD HH:mm'):'--'
      }, {
        title: '付款单支付时间',
        dataIndex: 'PayEventItems',
        render:(text, record)=> {
          if (!record.eventItems) return '--';
          const payEvent = record.eventItems.find(item => item.eventStatus === 3);
          return payEvent? moment(payEvent.createTime).format('YYYY-MM-DD HH:mm'):'--';
        }
      }, {
        title: '运单数',
        dataIndex: 'total',
        render: (text, record) => {
          const { orderId } = record;
          if (!record.orderDetailItems) return '--';
          return (
            <a onClick={() => { this.toTransports(orderId); }}>{record.orderDetailItems.length}</a>
          );
        }
      }, {
        title: '总运费（元）',
        dataIndex: 'totalFreight'
      }, {
        title: '货损赔付（元）',
        dataIndex: 'damageCompensation'
      }, {
        title: '服务费（元）',
        dataIndex: 'serviceCharge'
      }, {
        title: '应付金额（元）',
        dataIndex: 'payedFreight',
        render: (text, record) => {
          const { totalFreight, damageCompensation, serviceCharge, otherExpenses } = record;
          return (Number(totalFreight) - Number(damageCompensation) + Number(serviceCharge) + Number(otherExpenses))._toFixed(2);
        }
      }
    ],
    operations: () => {
      const deletePayment = {
        title: '删除',
        onClick: (record) => {
          if (this.state.nowOrderList.items.length === 1) return message.error('至少保留一条付款单');
          const { nowOrderList } = this.state;
          this.setState({
            nowOrderList: {
              items: nowOrderList.items.filter(item => item.orderId !== record.orderId)
            }
          }, this.saveInvoice);
          const { addOrder } = this.state;
          const index = addOrder.findIndex(item => item.orderId === record.orderId);
          if (index !== -1) {
            this.setState({
              addOrder: addOrder.splice(index, 1)
            });
          }
        },
      };
      return [deletePayment];
    }
  }

  tableRef = React.createRef()

  toTransports = (orderId) => {
    router.push(`/buiness-center/transportList/transport?orderIdlist=${orderId}`);
  }

  toProjectDetail = (id) => {
    router.push(`/buiness-center/project/projectManagement/projectDetail?projectId=${id}`);
  }

  toHistory = () => {
    const { history, location } =  this.props;
    if (location.pathname === '/logistics-management/invoicingWrap/invoicing/historyWrap/history/modify') {
      history.push('/logistics-management/invoicingWrap/invoicing/historyWrap/history');
    } else {
      history.push('/net-transport/invoicingWrap/invoicing/historyWrap/history');
    }
    window.g_app._store.dispatch({
      type: 'commonStore/deleteTab',
      payload: { id: this.currentTab.id }
    });
  }

  componentDidMount () {
    const { location: { state: { orderIdList } } } = this.props;
    let ids = orderIdList.join(',');
    if (this.localData && this.localData.ids && this.localData.ids.length) {
      ids = this.localData.ids.join(',');
    }
    getOldOrders(ids).then(data => {
      this.projectName = data.items[0].projectName;
      const { addOrder } = this.state;
      this.setState({
        nowOrderList: {
          items: [...data.items, ...addOrder],
        }
      });
    });
  }

  componentDidUpdate(p) {
    const { commonStore,  location: { query: { pageKey }, state: { orderIdList } } } = this.props;
    if ('pageKey' in this.props.location.query && p.location.query.pageKey !== pageKey) {
      this.currentTab = commonStore.tabs.find(item => item.id === commonStore.activeKey);
      this.localData = getLocal(this.currentTab.id) || { formData: {} };
      let ids = orderIdList.join(',');
      if (this.localData && this.localData.ids && this.localData.ids.length) {
        ids = this.localData.ids.join(',');
      }
      getOldOrders(ids).then(data => {
        this.projectName = data.items[0].projectName;
        const { addOrder } = this.state;
        this.setState({
          nowOrderList: {
            items: [...data.items, ...addOrder],
          }
        });
      });
    }
  }

  componentWillReceiveProps(p) {
    if (p.commonStore.activeKey !== this.props.commonStore.activeKey){ // 相同路由参数不同的时候存一次本地
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      const formData = this.form ? this.form.getFieldsValue() : null;
      localStorage.removeItem(this.currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(this.currentTab.id, JSON.stringify({
          formData,
        }));
      }
    }
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({ ids: this.state.nowOrderList.items.map(item => item.orderId) }));
    }
  }

  handleCancel = () => {
    this.setState({
      visible: false
    });
    this.props.resetFilter();
  }

  turnPage = (pageInfo) => {
    const { offset, limit, current } = translatePageType(pageInfo);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getOrders({ ...newFilter, projectName: this.projectName });
  }

  onSelectRow = (row) => {
    this.tempOrder = row;
  }

  checkAdd = () => {
    this.addOrder = this.tempOrder;
    const { nowOrderList: { items } } = this.state;
    const newFilterData = [...items, ...this.addOrder].reduce((init, current) => {
      const index = init.findIndex(item => item.orderId === current.orderId);
      if (index === -1) init.push(current);
      return init;
    }, []);
    this.setState({
      visible: false,
      nowOrderList: {
        items: newFilterData
      }
    }, this.saveInvoice);
  }

  addOrderForm = () => {
    const { pageSize, nowPage } = this.state;
    const { orderList } = this.props;
    const addTableSchema = cloneDeep(this.tableSchema);
    delete addTableSchema.operations;
    return (
      <>
        <Table rowKey='orderId' ref={this.tableRef} onSelectRow={this.onSelectRow} dataSource={orderList} pagination={{ current: nowPage, pageSize }} onChange={this.turnPage} schema={addTableSchema} renderCommonOperate={this.searchForm} multipleSelect />
        <Button type='primary' style={{ marginTop: '10px' }} onClick={this.checkAdd}>确认添加</Button>
      </>
    );
  }

  saveInvoice = () => {
    const { location: { state: { invoiceId, pathname } } } = this.props;
    const { nowOrderList } = this.state;
    if (!nowOrderList.items.length) return message.error('请至少选择一条付款单');
    const params = {
      invoiceState: 0,
      invoiceCreateReq: { orderIdList: nowOrderList.items.map(item => item.orderId) }
    };
    patchInvoice(invoiceId, params).then(() => {
      notification.success({
        message: '操作成功',
        description: "已成功修改开票信息"
      });
      router.replace({
        pathname,
        state: {
          invoiceId,
          orderIdList: (nowOrderList.items || []).map(item => item.orderId)
        }
      });
    });
  }

  showMorePaymentBill = () => {
    const { filter } = this.props;
    this.props.getOrders({ ...filter, projectName: this.projectName }).then(() => {
      this.setState({
        visible: true,
      });
    });
  }

  render () {
    const { nowOrderList, visible } = this.state;
    return (
      <>
        <Button onClick={this.showMorePaymentBill}>+ 添加</Button>
        <Table rowKey='orderId' dataSource={nowOrderList} pagination={false} schema={this.tableSchema} />
        <Modal
          width='900px'
          destroyOnClose
          maskClosable={false}
          visible={visible}
          title='添加付款单'
          onCancel={this.handleCancel}
          footer={null}
        >
          {this.addOrderForm()}
        </Modal>
        <Button size='large' type='primary' style={{ marginTop: '10px' }} onClick={this.toHistory}>返回</Button>
      </>
    );
  }
}
