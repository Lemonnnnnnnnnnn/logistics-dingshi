import React from 'react'
import { DatePicker, List } from 'antd-mobile';
import moment from 'moment'
import zhCN from 'antd-mobile/lib/date-picker/locale/zh_CN';

export default class DatePickerComponent extends React.Component {
  state = {
    date: ''
  }

  pickDate = (date) => {
    this.setState({
      date
    })
    this.props.onChange(moment(date).format())
  }

  componentDidMount () {
    if (this.props.value) {
      this.setState({
        date: new Date(this.props.value)
      })
    }
  }

  render () {
    const { date } = this.state
    return (
      <>
        <DatePicker
          mode='datetime'
          locale={zhCN}
          value={date}
          title='选择用车日期'
          extra='选择用车日期'
          minDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), 60)}
          minuteStep={60}
          format={(date)=> moment(new Date(date)).format('MM月DD日 HH时')}
          onChange={this.pickDate}
        >
          <List.Item arrow="horizontal">用车时间</List.Item>
        </DatePicker>
      </>
    )
  }
}