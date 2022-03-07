import React, { Component } from 'react';
import { Item, FormButton, FORM_MODE } from '@gem-mine/antd-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton';
import { connect } from 'dva'
import moment from 'moment';
import Table from '@/components/Table/Table'
import { translatePageType, pick } from '@/utils/utils'
import SearchForm from '@/components/Table/SearchForm2'
import TableContainer from '@/components/Table/TableContainer'
import model from '@/models/financeAccountTransaction'

const { actions } = model

function mapStateToProps (state) {
  return {
    financeAccountTransaction: pick(state.financeAccountTransaction, ['items', 'count']),
  }
}

@connect(mapStateToProps, actions )
@TableContainer({ balanceHistory:true })
class FundRecord extends Component {

  state = {
    ready:false,
    pageSize:10,
    nowPage:1
  }

  searchSchema = {
    accountType:{
      label: '客户类型',
      component: 'select',
      placeholder: '请选择客户类型',
      options:[{
        label:'托运',
        value: 1,
        key:1
      }, {
        label:'承运',
        value: 2,
        key:2
      }, {
        label:'司机',
        value: 3,
        key:3
      }]
    },
    accountName: {
      label: '客户名称',
      placeholder: '请输入客户名称',
      component: 'input'
    },
    virtualAccountNo: {
      label: '客户平台账号',
      placeholder: '请输入客户平台账号',
      component: 'input'
    }
  }

  constructor (props) {
    super(props)
    this.tableSchema = {
      variable:true,
      minWidth:1500,
      columns: [
        {
          title: '日期',
          dataIndex: 'createTime',
          render: (text) => text ?moment(text).format('YYYY/MM/DD HH:mm') : '--'
        },
        {
          title: '客户类型',
          dataIndex: 'accountType',
          render: text => {
            const config = {
              1:'托运方',
              2:'承运方',
              3:'司机'
            }
            return config[text] || '数据异常'
          }
        },
        {
          title: '客户名称',
          dataIndex: 'accountName'
        },
        {
          title: '客户平台账号',
          dataIndex: 'virtualAccountNo'
        },
        {
          title: '客户余额',
          dataIndex: 'accountBalance',
          render: (text) => (text || 0).toFixed(2)._toFixed(2)
        }
      ]
    }
  }

  componentDidMount (){
    const { location:{ query: { accountType, accountName, virtualAccountNo, userId, organizationId } }, getFinanceAccountTransaction, setFilter } =this.props
    const newFilter = setFilter({ accountType:accountType && +accountType, accountName, virtualAccountNo, driverUserId:userId, organizationId })
    getFinanceAccountTransaction(newFilter)
      .then(() => {
        this.setState({
          ready:true
        })
      })
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination)
    this.setState({
      nowPage:current,
      pageSize:limit
    })
    const newFilter=this.props.setFilter({ offset, limit })
    this.props.getFinanceAccountTransaction(newFilter)
  }

  searchTable = () => {
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
        xl: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
        xl: { span: 16 }
      }
    }
    return (
      <>
        <SearchForm layout="inline" {...layout} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
          <Item field="accountType" />
          <Item field="accountName" />
          <Item field="virtualAccountNo" />
          <DebounceFormButton type="primary" label="查询" onClick={this.handleSearchBtnClick} />
          <DebounceFormButton style={{ marginLeft:'10px' }} label="重置" onClick={this.handleResetBtnClick} />
        </SearchForm>
      </>
    )
  }

  handleSearchBtnClick = value => {
    this.setState({
      nowPage:1
    })
    const createDateStart = value.createTime && value.createTime.length ? value.createTime[0].set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss') : undefined
    const createDateEnd = value.createTime && value.createTime.length ? value.createTime[1].set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss') : undefined
    const newFilter = this.props.setFilter({ ...this.props.filter, createDateStart, createDateEnd, offset: 0 })
    this.props.getFinanceAccountTransaction(newFilter)
  }

  handleResetBtnClick = () => {
    const newFilter=this.props.resetFilter()
    this.setState({
      nowPage:1,
      pageSize:10
    })
    this.props.getFinanceAccountTransaction(newFilter)
  }

  render () {
    const { financeAccountTransaction } = this.props
    const { nowPage, pageSize, ready } = this.state
    return (
      ready &&
      <Table
        rowKey="transactionId"
        dataSource={financeAccountTransaction}
        schema={this.tableSchema}
        pagination={{ current:nowPage, pageSize }}
        onChange={this.onChange}
        renderCommonOperate={this.searchTable}
      />
    );
  }
}

export default FundRecord;
