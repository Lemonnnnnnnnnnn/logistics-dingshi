import React, { Component } from 'react';
import { Tabs, WhiteSpace, Card, Toast } from 'antd-mobile'
import { SchemaForm, Item, FormButton } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton'
import router from 'umi/router';
import { connect } from 'dva'
import { patchPasswordFirst, getConfirmPhone } from '@/services/apiService'
import { encodePassword } from '@/utils/utils'
import SmsCode from '@/components/SmsCode'
import '@gem-mine/mobile-schema-form/src/fields'

function mapStateToProps (state) {
  console.log(state.user)
  return {
    nowUser: state.user.nowUser
  }
}

@connect(mapStateToProps)
class ForgetPassword extends Component {

  constructor (props){
    super(props)
    const { location: { pathname } } = this.props
    this.flag = pathname.indexOf('modifyPhone')
    this.tabs = this.flag !== -1? [{ title: '修改手机号' }]: [{ title: '修改密码' }]
    this.schema = {
      phone: {
        label: this.flag !== -1? '旧手机号': '手机号',
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
          smsType: this.flag !== -1? 'SMS_156625001': 'SMS_152852310',
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
    if (this.props.nowUser.phone !== value.phone) return Toast.fail('手机号输入错误', 1)
    const { organizationType } = this.props
    if (this.flag !== -1) {
      getConfirmPhone(value)
        .then(() => {
          router.replace(`newPhone`)
        })
        .catch(() => {
          Toast.success('验证码错误')
        })
    } else {
      patchPasswordFirst(value)
        .then(({ userId })=> {
          router.replace(`newPassword?userId=${userId}`)
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
