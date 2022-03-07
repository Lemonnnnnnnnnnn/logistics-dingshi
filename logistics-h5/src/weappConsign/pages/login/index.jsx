import React, { Component } from 'react';
import { Icon } from 'antd'
import { connect } from 'dva'
import router from 'umi/router';
import { Tabs, WhiteSpace, Card, Toast, Modal } from 'antd-mobile'
import { SchemaForm, Item, FormButton, Observer } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton'
import { encodePassword } from '@/utils/utils'
import SmsCode from '@/components/SmsCode'
import '@gem-mine/mobile-schema-form/src/fields'

@connect(null, dispatch => ({
  login: payload => dispatch({ type: 'user/login', payload }),
  logout: payload => dispatch({ type: 'user/logout', payload }),
  getNowUser: () => dispatch({ type: 'user/getNowUser' }),
  getDictionaries: (payload) => dispatch({ type: 'dictionaries/getDictionaries', payload })
}))
class Login extends Component {

  tabs = [
    { title: '验证码登录', type:'smsCodeLogin' },
    { title: '密码登录', type:'normalLogin' },
  ];

  state = {
    showPwd:false,
    loginType: 'normalLogin'
  }

  constructor (props){
    super(props)
    this.schema = {
      userName: {
        label:'手机号',
        component: 'inputItem',
        placeholder: '请输入手机号',
        clear:true,
        rules:{
          required:[true, '请输入手机号'],
          validator: ({ value }) => {
            const reg = /^1\d{10}$/
            if (!reg.test(value)) {
              return '请输入正确的手机号'
            }
          }
        },
      },
      password: {
        label:'密码',
        component: 'inputItem',
        placeholder: '请输入密码',
        clear:true,
        props: Observer({
          watch: ['*showPwd'],
          action: (showPwd) => {
            const iconType = showPwd ? 'eye-invisible' : 'eye'
            return {
              type: showPwd ? 'text' : 'password',
              extra: <Icon type={iconType} onClick={this.changeIcon} />
            }
          }
        }),
        rules: {
          required: [true, '请输入密码'],
        },
      },
      userPhone: {
        label:'手机号',
        component: 'inputItem',
        placeholder: '请输入手机号',
        rules:{
          required:[true, '请输入手机号'],
          validator: ({ value }) => {
            const reg = /^1\d{10}$/
            if (!reg.test(value)) {
              return '请输入正确的手机号'
            }
          }
        },
      },
      smsCode: {
        label:'验证码',
        component: SmsCode,
        props: {
          smsType: 'SMS_152852316',
          phoneField: 'userPhone'
        },
        sendButtonWord:'发送验证码',
        sendButtonStyle:{
          color:'rgba(46,122,245,1)',
          fontSize:'12px',
          lineHeight:'18px',
          // border:'1px solid rgba(46,122,245,1)',
          // borderRadius:'4px',
          // width:'80px',
          // display:'inline-block',
          // textAlign:'center'
        },
        rules: {
          required: [true, '请输入验证码'],
        },
        placeholder: '请输入手机验证码',
        // extra: <Icon type={iconType} onClick={this.changeIcon} />
      }
    }
  }

  componentDidMount (){
    const str = navigator.userAgent.toLowerCase();
    const ver = str.match(/cpu iphone os (.*?) like mac os/);
    if (ver) {
      const [verson] = ver[1].replace(/_/g, ".").split('.')
      if (verson <= 11) {
        Modal.alert('温馨提示', '建议更新系统至ios12.0以上版本')
      }
    }
  }

  changeIcon = () => {
    this.setState((state)=>({
      showPwd:!state.showPwd
    }))
  }

  login = ({ userName, password }) => {
    Toast.loading("", 10)
    this.props.login({ userName, password:encodePassword(password), scope:'CONSIGNMENT' })
      .then(({ auditStatus })=>{
        if (`${auditStatus}` === '2' || !auditStatus) {
          const error = { noAudit:true }
          return Promise.reject(error)
        }
        setTimeout(()=>this.props.getDictionaries(), 300)
      })
      .then(() => this.props.getNowUser())
      .then(() => {
        Toast.success('登录成功', 1)
        setTimeout(()=>{
          router.replace('main/dataStatistics')
        }, 300)
      })
      .catch((error)=>{
        Toast.hide()
        if (error.noAudit){
          this.props.logout()
          return Toast.fail('您当前信息未通过审核，请联系平台管理员', 1)
        }
        Modal.alert('登录失败', '账号或密码错误')
      })
  }

  _login = ({ userPhone, smsCode }) => {
    Toast.loading("", 10)
    this.props.login({ userName:userPhone, smsCode, scope:'CONSIGNMENT' })
      .then(({ auditStatus })=>{
        if (`${auditStatus}` === '2' || !auditStatus) {
          const error = { noAudit:true }
          return Promise.reject(error)
        }
        setTimeout(()=>this.props.getDictionaries(), 300)
      })
      .then(() => this.props.getNowUser())
      .then(() => {
        Toast.success('登录成功', 1)
        setTimeout(()=>{
          router.replace('main/personalCenter')
        }, 300)
      })
      .catch((error)=>{
        Toast.hide()
        if (error.noAudit){
          this.props.logout()
          return Toast.fail('您当前信息正在审核，请等待审核完成！', 1)
        }
        Modal.alert('登录失败', '账号或密码错误')
      })
  }

  changeTab = ({ type }) => {
    this.setState({
      loginType:type
    })
  }

  forgetPassword = () => {
    router.push('login/forgetPassword')
  }

  toastError = (error) => {
    Toast.fail(error[0], 1.5)
  }

  render (){
    const { showPwd, loginType } = this.state
    return (
      <div style={{ padding:'40px 15px 0 15px' }}>
        <SchemaForm schema={this.schema} trigger={{ showPwd }}>
          <Card>
            <Card.Body>
              <Tabs tabBarInactiveTextColor='#999999' tabBarActiveTextColor='#222222' onChange={this.changeTab} tabs={this.tabs} prerenderingSiblingsNumber={0} animated={false} initialPage={1} useOnPan={false}>
                <div style={{ background: '#fff', paddingTop:'10px' }}>
                  <WhiteSpace />
                  <Item field='userPhone' />
                  <WhiteSpace />
                  <Item field='smsCode' />
                  <DebounceFormButton
                    debounce={1000}
                    validate={['userPhone', 'smsCode']}
                    visible={() => loginType === 'smsCodeLogin'}
                    label='登录'
                    onError={this.toastError}
                    onClick={this._login}
                    style={{
                      margin: '50px 30px 15px 30px',
                      height: '47px',
                      background: 'rgba(46,122,245,1)',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '17px'
                    }}
                  />
                </div>
                <div style={{ background: '#fff', paddingTop:'10px' }}>
                  <WhiteSpace />
                  <Item field='userName' />
                  <WhiteSpace />
                  <Item field='password' />
                  <div onClick={this.forgetPassword} style={{ float:'right', fontSize:'14px', color:'#999' }}>忘记密码？</div>
                  <DebounceFormButton
                    debounce={1000}
                    onError={this.toastError}
                    validate={['userName', 'password']}
                    visible={() => loginType === 'normalLogin'}
                    label='登录'
                    onClick={this.login}
                    style={{
                      margin: '50px 30px 15px 30px',
                      height: '47px',
                      background: 'rgba(46,122,245,1)',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '17px'
                    }}
                  />
                </div>
              </Tabs>
            </Card.Body>
          </Card>
        </SchemaForm>
      </div>
    );
  }
}

export default Login;
