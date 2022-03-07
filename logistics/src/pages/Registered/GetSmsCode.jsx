import React, { Component } from 'react';
import { Input, Button, message, notification, Icon } from 'antd';
import SMSCODE_TYPE from '@/constants/SmsCode/SmsCode';
import registeredModel from '@/models/registered';
import { getAuthNotCode } from '@/services/apiService';

const { requests: { getSmscode } } = registeredModel;

export default class GetSmsCode extends Component {
  timeout = undefined

  constructor (props) {
    super(props);
    this.state = {
      number: 60,
      time: Date.now(),
      code: ''
    };
  }

  componentWillMount () {
    if (this.timeout) {
      clearInterval(this.timeout);
    }
  }

  componentDidMount() {
    const { sendAtBegin, needCheckCode } = this.props;
    if (sendAtBegin && !needCheckCode){
      this.getCheckCodeWithoutCode();
    }
  }

  // 获取验证码
  getCheckCode = () => {
    const { form } = this.props;
    if (this.props.callback){
      this.props.callback();
    }
    form.validateFields(['organizationType', 'phone'], async (error, values) => {
      if (!error) {
        const { code } = this.state;
        if (!code) {
          message.error('请输入校验码！');
          return;
        }
        const { organizationType, phone } = values;
        const params = {
          code,
          phone,
          type: String(organizationType)
        };
        let data;
        try {
          data = await getSmscode(params);
        } catch (e){
          this.refreshImg();
        }
        if (data && data.Code && data.Code.toLocaleLowerCase() === 'ok') {
          this.timeout = setInterval(() => {
            const { number } = this.state;
            this.setState({
              number: number - 1
            }, () => {
              if (this.state.number === 0){
                clearInterval(this.timeout);
                this.setState({
                  number: 60
                });
              }
            });
          }, 1000);
        } else if (data && data.Code && data.Code === 'isv.BUSINESS_LIMIT_CONTROL') {
          notification.error({
            message: '获取验证码失败',
            description: data && data.Message || '触发节流，请稍后获取验证码'
          });
        }
      }
    });
  }

  getCheckCodeWithoutCode = () => {
    const { form, smsType } = this.props;
    if (this.props.callback){
      this.props.callback();
    }
    form.validateFields(['phone'], async (error, values) => {
      if (!error) {
        const { phone } = values;
        const params = {
          phone,
          template: SMSCODE_TYPE[smsType]
        };
        const data = await getAuthNotCode(params);
        if (data && data.Code && data.Code.toLocaleLowerCase() === 'ok') {
          this.timeout = setInterval(() => {
            const { number } = this.state;
            this.setState({
              number: number - 1
            }, () => {
              if (this.state.number === 0){
                clearInterval(this.timeout);
                this.setState({
                  number: 60
                });
              }
            });
          }, 1000);
        } else if (data && data.Code && data.Code === 'isv.BUSINESS_LIMIT_CONTROL') {
          notification.error({
            message: '获取验证码失败',
            description: data && data.Message || '触发节流，请稍后获取验证码'
          });
        }
      }
    });
  }

  // 改变值
  onChange = e => {
    const { target: { value } } = e;
    const { form } = this.props;
    form.setFieldsValue({ smsCode: (value && value.trim()) || '' });
  }

  // 刷新校验码的图片
  refreshImg = () => {
    const { time } = this.state;
    const refreshTime = Date.now();
    if (time !== refreshTime) {
      this.setState({
        time: refreshTime
      });
    }
  }

  // 获取校验码的值
  onChangeCheckCode = e => {
    this.setState({
      code: e.target.value || ''
    });
  }

  render () {
    const { number, time } = this.state;
    const inputStyle = {
      width: 200,
      marginRight: 10
    };
    const boxStyle ={
      width: 360,
      marginRight: 10,
      display: 'inline-block'
    };
    const disabled = number !== 60;
    const { needCheckCode = true } = this.props;
    return (
      <>
        { needCheckCode?
          <div style={boxStyle}>
            <Input placeholder='输入校验码' onChange={this.onChangeCheckCode} style={inputStyle} />
            <div style={{ display: 'inline-block', width: '120px', verticalAlign: 'middle' }} onClick={this.refreshImg}>
              <img src={`${window.envConfig.baseUrl}/authgetcode?${time}`} alt="验证码" style={{ width:'120px', height: '32px' }} />
              <div style={{ lineHeight: '14px', textAlign: 'center', color: 'rgba(0,0,0,0.4)' }}>点击刷新验证码</div>
            </div>
          </div>
          :
          null
        }
        <div style={boxStyle}>
          <Input placeholder='输入验证码' style={inputStyle} onChange={this.onChange} />
          { needCheckCode?
            <Button disabled={disabled} style={{ width: '122px' }} onClick={this.getCheckCode}>获取验证码{number === 60 ? '' : `(${number})`}</Button>
            :
            <Button disabled={disabled} style={{ width: '122px' }} onClick={this.getCheckCodeWithoutCode}>获取验证码{number === 60 ? '' : `(${number})`}</Button>
          }
        </div>
      </>
    );
  }
}
