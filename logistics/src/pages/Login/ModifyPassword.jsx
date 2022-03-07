import React, { Component } from 'react';
import { Button, notification } from 'antd'
import router from 'umi/router'
import { SchemaForm, Item, FormButton, FORM_MODE } from '@gem-mine/antd-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton';
import GetSmsCode from '@/pages/Registered/GetSmsCode'
import { homepageModifyPassword } from '@/services/apiService'
import { encodePassword } from '@/utils/utils'
import { _ORGANIZATIONTYPE } from '@/constants/regisetred'
import '@gem-mine/antd-schema-form/lib/fields'

const wrapperCol = {
  xs: { span: 16 },
  push: 4
}

const NewORGANIZATIONTYPE = _ORGANIZATIONTYPE.map(item => ({
  label: item.title,
  value: item.value
}))

class ModifyPassword extends Component {

  constructor (props) {
    super(props)
    this.formSchema={
      organizationType:{
        component:'select',
        placeholder: '请选择组织机构',
        rules: {
          required: [true, '请选择组织机构'],
        },
        props:{
          style: {
            width:'100%'
          }
        },
        options: NewORGANIZATIONTYPE
      },
      phone: {
        name: '手机号',
        component: 'input',
        placeholder: '请输入11位手机号',
        addonBefore: '+86',
        rules: {
          required: [true, '请输入正确的手机号'],
          pattern: /^1\d{10}$/
        }
      },
      smsCode: {
        component: GetSmsCode,
        needCheckCode: false,
        smsType: 'FORGET_PASSWORD',
        rules: {
          required: [true, '请输入验证码']
        }
      },
      password: {
        name: '密码',
        component: 'input',
        placeholder: '请输入新密码',
        rules: {
          required: [true, '请输入密码'],
          validator: ({ value }) => {
            const check = this.checkPasswordSecurity(value)
            if (!check) {
              return '密码长度为8-16位，数字、大小写字母、字符至少包含两种'
            }
          }
        },
        props:{
          type:'password'
        }
      },
      confirmPassword: {
        component: 'input',
        placeholder: '确认密码',
        props:{
          type:'password'
        },
        rules: {
          required: [true, '请再次输入密码'],
          validator: ({ value, formData }) => {
            if ( value !== formData.password){
              return '两次密码输入不一致'
            }
          }
        }
      }
    }
  }

  checkPasswordSecurity = (password) => {
    let level = 0
    if (password.trim() === '' || password.trim().length < 8 || password.trim().length > 16) {
      return level > 1
    }
    // 密码中是否有数字
    if (/[0-9]/.test(password)) {
      level++
    }
    // 判断密码中有没有小写字母
    if (/[a-z]/.test(password)) {
      level++
    }
    // 判断密码中有没有大写字母
    if (/[A-Z]/.test(password)) {
      level++
    }
    // 判断密码中有没有特殊符号
    if (/[^0-9a-zA-Z]/.test(password)) {
      level++
    }
    return level > 1
  }

  goBack = () => {
    router.push('/user/login')
  }

  modifyPassword = value => {
    delete value.confirmPassword
    value.password = encodePassword(value.password)
    homepageModifyPassword(value)
      .then(() => {
        notification.success({
          message: '成功',
          description: `重置密码成功`,
        })
        this.goBack()
      })
  }

  render () {
    return (
      <div style={{ width: 500, margin: '43px auto 0', backgroundColor: '#fff', boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.16)", padding: "30px" }}>
        <h3 style={{ textAlign:'center', fontSize:'20px', fontWeight:'bold' }}>重置密码</h3>
        <SchemaForm
          schema={this.formSchema}
          layout="horizontal"
          mode={FORM_MODE.ADD}
          wrapperCol={wrapperCol}
        >
          <Item field="organizationType" />
          <Item field="phone" />
          <Item field='smsCode' />
          <Item field='password' />
          <Item field='confirmPassword' />
          <div style={{ textAlign:'center' }}>
            <DebounceFormButton label="确认" style={{ width: '67%' }} type='primary' onClick={this.modifyPassword} />
            <Button style={{ width: '67%', marginTop: '10px' }} type='default' onClick={this.goBack}>返回</Button>
          </div>
        </SchemaForm>
      </div>
    );
  }
}

export default ModifyPassword;
