import React from 'react'
import { Calendar, List } from 'antd-mobile'
import zhCN from 'antd-mobile/lib/calendar/locale/zh_CN'
import moment from 'moment'

const extra = {
  '2017/07/15': { info: 'Disable', disable: true }
}

const now = new Date()

Object.keys(extra).forEach((key) => {
  const info = extra[key]
  const date = new Date(key)
  if (!Number.isNaN(+date) && !extra[+date]) {
    extra[+date] = info
  }
})

export default class CalendarField extends React.Component {
  originbodyScrollY = document.getElementsByTagName('body')[0].style.overflowY;

  constructor (props) {
    super(props)
    this.state = {
      show: false
    }
  }

  getDateExtra = date => extra[+date]

  onSelectHasDisableDate = (dates) => {
    console.warn('onSelectHasDisableDate', dates)
  }

  onSelect = (data) => {
    console.info('this.props.', data, this.props)
    // this.props.form.setFieldsValue({})
  }

  onConfirm = (startTime, endTime) => {
    const date = moment(startTime).set({ hour: 23, minute: 59, second: 59, millisecond: 999 })

    this.props.onChange(date)
    document.getElementsByTagName('body')[0].style.overflowY = this.originbodyScrollY
    this.setState({
      show: false,
      startTime,
      endTime
    })
  }

  onCancel = () => {
    document.getElementsByTagName('body')[0].style.overflowY = this.originbodyScrollY
    this.setState({
      show: false,
      startTime: undefined,
      endTime: undefined
    })
  }

  render () {
    // todo 支持区间选择
    const defaultDate = this.props.value ? new Date(this.props.value) : now
    const { startTime, endTime } = this.state
    // todo 放到 onConfirm 和 onCancel 处理
    // todo 支持默认设置
    let extra = startTime ? moment(startTime).format('YYYY-MM-DD') : ''
    extra += endTime ? `-${moment(endTime).format('YYYY-MM-DD')}` : ''
    console.log(this.props)
    const { disabled, arrow, label, selectType, placeholder } = this.props.field
    return (
      <>
        <List.Item
          arrow={arrow}
          error={false} // todo 当验证不通过时，error=true
          disabled={disabled}
          placeholder={placeholder}
          onClick={() => {
            if (disabled === true) return
            document.getElementsByTagName('body')[0].style.overflowY = 'hidden'
            this.setState({
              show: true
            })
          }}
          extra={this.props.value ? moment(this.props.value).format('YYYY-MM-DD') : extra}
        >
          {label}
        </List.Item>
        <Calendar
          locale={zhCN}
          type={selectType || 'one'}
          defaultValue={[startTime || defaultDate]}
          visible={this.state.show}
          onCancel={this.onCancel}
          onConfirm={this.onConfirm}
          onSelectHasDisableDate={this.onSelectHasDisableDate}
          onSelect={this.onSelect}
          getDateExtra={this.getDateExtra}
          defaultDate={defaultDate}
          minDate={new Date(+defaultDate - 5184000000)}
          maxDate={new Date(+defaultDate + 3153600000000)}
        />
      </>
    )
  }
}
