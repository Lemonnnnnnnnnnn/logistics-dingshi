import React, { Component } from 'react';
import { Tabs, WhiteSpace, Card, Toast } from 'antd-mobile'
import { SchemaForm, Item, FormButton } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton'
import router from 'umi/router';
import { encodePassword } from '@/utils/utils'
import { patchPasswordSecond } from '@/services/apiService'
import '@gem-mine/mobile-schema-form/src/fields'

class SetPassword extends Component {

  constructor (props){
    super(props)
    this.tabs = [
      { title: this.props.title || '设置新密码' },
    ];
    this.schema = {
      password: {
        label: '新密码',
        component: 'inputItem',
        type:'password',
        rules: {
          required: [true, '请输入新密码'],
          pattern:[/^[A-Za-z0-9_]{6,16}$/, '密码由6-16位大小写字母数字组成'],
        },
        placeholder: '请输入新的密码',
      },
      checkPassword: {
        label: '确认密码',
        component: 'inputItem',
        type:'password',
        rules: {
          required: [true, '请输入确认密码'],
          validator: ({ value, formData }) => {
            const { password } = formData

            if (!(value === password)) {
              return '两次输入密码不一致'
            }
          }
        },
        placeholder: '请再次输入新的密码',
      },
    }
  }

  changePassword = value => {
    delete value.checkPassword
    const { location:{ query: { userId } } } = this.props
    patchPasswordSecond({ userId, password:encodePassword(value.password) })
      .then(()=> {
        Toast.success('设置密码成功', 1)
        setTimeout(() => {
          router.goBack()
        }, 1000)
      })
  }

  toastError = (error) => {
    Toast.fail(error[0], 1.5)
  }

  render () {
    return (
      <div style={{ padding:'40px 15px 0 15px' }}>
        <SchemaForm schema={this.schema}>
          <Card>
            <Card.Body>
              <Tabs onChange={this.changeTab} tabBarActiveTextColor='#555555' tabs={this.tabs} prerenderingSiblingsNumber={0} tabBarTextStyle={{ fontSize:'20px', fontWeight:'bold' }} animated={false} tabBarUnderlineStyle={{ border:'none' }} initialPage={0} useOnPan={false}>
                <div style={{ background: '#fff', paddingTop:'10px' }}>
                  <WhiteSpace />
                  <Item field='password' />
                  <WhiteSpace />
                  <Item field='checkPassword' />
                  <DebounceFormButton
                    debounce={1000}
                    onError={this.toastError}
                    label='保存'
                    onClick={this.changePassword}
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

export default SetPassword;
