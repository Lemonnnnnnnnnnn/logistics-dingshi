import React, { Component } from 'react';
import { DatePicker, Alert } from 'antd'
import zhCN from 'antd-mobile/lib/calendar/locale/zh_CN'
import { Calendar } from 'antd-mobile'
import moment from 'moment'
import { isFunction } from '@/utils/utils'
import { getIncomeDetails, getIncomeDetailsTotal } from '@/services/apiService'
import IncomeDetailItem from './component/incomeDetailItem'
import ListContainer from '@/mobile/page/component/ListContainer'


const now = new Date()

const List = ListContainer(IncomeDetailItem)

class IncomeDetails extends Component {

  state = {
    show:false,
    data:{
      count:0
    },
    total:0,
    refresh:true
  }

  constructor (props){
    super(props)
    this.listRef = React.createRef()
  }

  componentDidMount (){
    getIncomeDetailsTotal({ transactionType : 4 })
      .then(total=>{
        this.setState({
          total
        })
      })
  }

  showCalendar = () => {
    this.setState({
      show:true
    })
  }

  cancelCalendar = () => {
    this.setState({
      show:false
    })
  }

  checkData = (start, end) => {
    const startDateTime = moment(start).startOf('day')
    const endDateTime = moment(end).endOf('day')
    getIncomeDetailsTotal({ createDateStart: startDateTime.format('YYYY/MM/DD HH:mm:ss'), createDateEnd: endDateTime.format('YYYY/MM/DD HH:mm:ss'), transactionType : 4 })
      .then(total=>{
        this.setState({
          total
        })
      })
    this.setState({
      startDateTime,
      endDateTime,
      refresh:true,
      show:false
    }, ()=>{
      const { refresh } = this.listRef.current
      isFunction(refresh) && refresh()
    })
  }

  countMessage = () => {
    const { data: { count }, total } = this.state
    return (
      <div style={{ textAlign:'center' }}>
        共
        <span style={{ color:'rgba(217, 0, 27, 0.65)', textDecoration:'underline', margin:'0 5px' }}>{count}</span>
        笔收入，总金额
        <span style={{ color:'rgba(217, 0, 27, 0.65)', textDecoration:'underline', margin:'0 5px' }}>{total}</span>
        元
      </div>
    )
  }

  dataCallBack = (data={}) => {
    const { refresh } = this.state
    if (refresh) {
      this.setState({
        data,
        refresh:false
      })
    }
  }

  renderList = () => {
    const { startDateTime, endDateTime } = this.state
    const createDateStart = startDateTime && startDateTime.format('YYYY/MM/DD HH:mm:ss')
    const createDateEnd = endDateTime && endDateTime.format('YYYY/MM/DD HH:mm:ss')
    const props = {
      action: getIncomeDetails,
      primaryKey:'transactionId',
      params: { createDateStart, createDateEnd, transactionType : 4 },
      dataCallBack:this.dataCallBack,
      style:{
        height:'calc(100vh - 106px)'
      }
    }
    return <List ref={this.listRef} {...props} />
  }

  render () {
    const { show, startDateTime, endDateTime } = this.state
    return (
      <>
        <div style={{ paddingTop:'15px' }}>
          <div style={{ display:'inline-block', width:'70px', marginLeft:'10px' }}>时间查询:</div>
          <div style={{ display:'inline-block', width:'calc(100% - 90px)' }}>
            <DatePicker.RangePicker value={[startDateTime, endDateTime]} onOpenChange={this.showCalendar} open={false} />
          </div>
        </div>
        <Alert style={{ width:'95%', margin:'10px auto' }} message={this.countMessage()} type="info" />
        {this.renderList()}
        <Calendar
          locale={zhCN}
          onCancel={this.cancelCalendar}
          onConfirm={this.checkData}
          showShortcut
          visible={show}
          minDate={new Date(+now - 5184000000)}
          maxDate={new Date(now)}
        />
      </>
    );
  }
}

export default IncomeDetails;
