import React, { Component } from 'react';
import { Tabs, WhiteSpace, Card, Toast } from 'antd-mobile'
import { SchemaForm, Item, FormButton } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton'
import router from 'umi/router';
import { patchPasswordFirst, register } from '@/services/apiService'
import { encodePassword } from '@/utils/utils'
import SmsCode from '@/components/SmsCode'
import '@gem-mine/mobile-schema-form/src/fields'

class ForgetPassword extends Component {

  constructor (props){
    super(props)
    this.tabs = [
      { title: props.title || '忘记密码' },
    ];
    this.schema = {
      phone: {
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
          smsType: props.smsType || 'SMS_152852310',
          phoneField: 'phone'
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

  next = value => {
    const { type, organizationType } = this.props
    if (type === 'registry') {
      register({ ...value, organizationType, isAutoLogin:false, password:encodePassword('123456') })
        .then(({ userId })=> {
          router.replace(`setPassword?userId=${userId}`)
        })
        .catch(({ message }) => {
          Toast.fail(message, 1)
        })
    } else {
      patchPasswordFirst({ ...value, organizationType })
        .then(({ userId })=> {
          router.replace(`setPassword?userId=${userId}`)
        })
        .catch(() => {
          Toast.fail('验证码错误', 1)
        })
    }
  }

  toastError = (error) => {
    Toast.fail(error[0], 1.5)
  }

  render (){
    return (
      <div style={{ padding:'40px 15px 0 15px' }}>
        <SchemaForm schema={this.schema}>
          <Card>
            <Card.Body>
              <Tabs onChange={this.changeTab} tabBarActiveTextColor='#555555' tabs={this.tabs} prerenderingSiblingsNumber={0} tabBarTextStyle={{ fontSize:'20px', fontWeight:'bold' }} animated={false} tabBarUnderlineStyle={{ border:'none' }} initialPage={0} useOnPan={false}>
                <div style={{ background: '#fff', paddingTop:'10px' }}>
                  <WhiteSpace />
                  <Item field='phone' />
                  <WhiteSpace />
                  <Item field='smsCode' />
                  <DebounceFormButton
                    debounce={1000}
                    onError={this.toastError}
                    label='下一步'
                    onClick={this.next}
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

export default ForgetPassword;
