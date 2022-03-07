import React, { Component } from 'react';
import { Tabs, WhiteSpace, Card, Toast } from 'antd-mobile'
import { SchemaForm, Item, FormButton } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton'
import router from 'umi/router';
import { patchPhone, exit } from '@/services/apiService'
import { clearUserInfo, getUserInfo } from '@/services/user'
import SmsCode from '@/components/SmsCode'
import '@gem-mine/mobile-schema-form/src/fields'

class ForgetPassword extends Component {

  constructor (props){
    super(props)
    this.tabs = [{ title: '修改手机号' }]
    this.schema = {
      phone: {
        label: '新手机号',
        component: 'inputItem',
        placeholder: '请输入新手机号',
        rules:{
          required:[true, '请输入新手机号'],
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
          smsType: 'SMS_156625001',
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
    patchPhone(value).then(() => {
      Toast.success('手机号修改成功请重新登录', 1.5, () => {
        const { avatar } = getUserInfo()
        if (avatar) {
          exit().then(() => {
            clearUserInfo()
            this.userLogin()
          })
        } else {
          clearUserInfo()
          this.userLogin()
        }
      })
    })
  }

  userLogin = () => {
    wx.miniProgram.reLaunch({
      url: '/pages/index/index?setIsLoggedFalse=true'
    })
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
                    label='确定'
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
