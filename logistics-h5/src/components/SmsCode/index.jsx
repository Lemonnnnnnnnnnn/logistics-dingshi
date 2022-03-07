import React, { Component } from 'react'
import { InputItem, Toast } from 'antd-mobile'
import { sendSMSCode } from '@/services/apiService'

const DEFAULT_REEST_TIME = 60

export default class SmsCode extends Component {
  timer = undefined

  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      restTime: DEFAULT_REEST_TIME
    }
  }

  componentWillUnmount () {
    this.timer && clearTimeout(this.timer)
  }

  getExtra = () => {
    const { pending, restTime } = this.state
    const { sendButtonStyle={}, sendButtonWord='获取验证码' } = this.props.field
    return pending
      ? <div>{restTime}s</div>
      : <a style={sendButtonStyle} onClick={this.getSMSCode}>{sendButtonWord}</a>
  }

  getSMSCode = () => {
    const { form, phoneField='phone', isCheckPhone=true } = this.props
    const phone = form.getFieldValue(phoneField)
    const phonePattern = /^1\d{10}$/
    if (isCheckPhone){
      if (!phone || !phonePattern.test(phone)) return Toast.info('请填写正确的手机号')
    }
    this.sendSMS(phone)
    this.timer = setTimeout(this.loop, 1000);
    this.setState({
      pending: true,
      restTime: DEFAULT_REEST_TIME
    })
  }

  sendSMS = phone => {
    const { smsType = 'SMS_152857205' } = this.props
    sendSMSCode({ phone, template: smsType })
  }

  changeSMSCode = value => {
    this.props.onChange(value)
  }

  loop = () => {
    const nextTime = this.state.restTime - 1

    nextTime > 0
      ? (this.timer = setTimeout(this.loop, 1000), this.setState({ restTime: this.state.restTime - 1 }))
      : this.setState({ pending: false })
  }

  render () {
    const { label, placeholder='输入验证码' } = this.props.field
    return (
      <InputItem onChange={this.changeSMSCode} extra={this.getExtra()} placeholder={placeholder}>{label || '获取验证码'}</InputItem>
    )
  }
}
