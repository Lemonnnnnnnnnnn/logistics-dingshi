import React, { Component } from 'react';
import router from 'umi/router'
import { SchemaForm, Item, FormButton, FORM_MODE, ErrorNoticeBar, Observer } from '@gem-mine/mobile-schema-form'
import { Toast } from 'antd-mobile'
import { Icon } from 'antd'
import { modifyUserInfo } from '@/services/apiService'

import { ACCOUNT_TYPE } from '@/constants/user/accountType'
import '@gem-mine/mobile-schema-form/src/fields'
import { encodePassword } from '@/utils/utils'

export default class ModifyPassword extends Component {
  state={
    errors: [],
    showCheckPwd:{
      password: false,
      newPassword: false,
      confirmNewPassword: false
    }
  }

  constructor (props){
    super(props)
    this.schema={
      password:{
        label: '原密码',
        component: 'inputItem',
        props: {
          watch: ['*password'],
          action: (password) => {
            const iconType = password ? 'eye' : 'eye-invisible'
            const type = iconType === 'eye' ? 'text' : 'password'
            return {
              type,
              extra: <Icon type={iconType} onClick={()=>this.changeShowCheckPwdValue('password')} />,
            }
          }
        },
        rules:{
          required: true
        },
        format: {
          output:(value)=> encodePassword(value)
        }
      },
      newPassword:{
        label: '新密码',
        component: 'inputItem',
        props: {
          watch: ['*newPassword'],
          action: (newPassword) => {
            console.log(this.state.showCheckPwd)
            const iconType = newPassword ? 'eye' : 'eye-invisible'
            const type = iconType === 'eye' ? 'text' : 'password'
            return {
              type,
              extra: <Icon type={iconType} onClick={()=>this.changeShowCheckPwdValue('newPassword')} />,
            }
          }
        },
        rules:{
          required:[true, '请输入新密码']
        },
        format: {
          output:(value)=> encodePassword(value)
        }
      },
      confirmNewPassword:{
        label: '确认新密码',
        component: 'inputItem',
        props: {
          watch: ['*confirmNewPassword'],
          action: (confirmNewPassword) => {
            const iconType = confirmNewPassword ? 'eye' : 'eye-invisible'
            const type = iconType === 'eye' ? 'text' : 'password'
            return {
              type,
              extra: <Icon type={iconType} onClick={()=>this.changeShowCheckPwdValue('confirmNewPassword')} />,
            }
          }
        },
        rules:{
          required: [true, '请再次输入新密码'],
          validator: ({ value, formData }) => {
            const { newPassword } = formData
            if (value !== newPassword) {
              return '两次输入密码不一致'
            }
          }
        }
      }
    }
  }

  changeShowCheckPwdValue = (key) => {
    const { showCheckPwd } = this.state
    const newShowCheckPwd = { ...showCheckPwd, [key]: !showCheckPwd[key] }
    this.setState({
      showCheckPwd:newShowCheckPwd
    })
  }

  modifyPasswordButtonClick = formData => {
    modifyUserInfo({ ...formData, accountType:ACCOUNT_TYPE.NORMAL_ACCOUNT })
      .then(({ message }) => {
        if (message){
          Toast.fail(message, 2, null, false)
        } else {
          Toast.success('修改密码成功', 2, router.goBack, false)
        }
      })
  }



  render () {
    const { errors, showCheckPwd:{ password, newPassword, confirmNewPassword } } = this.state
    return (
      <SchemaForm mode={FORM_MODE.ADD} schema={this.schema} trigger={{ password, newPassword, confirmNewPassword }} onChange={() => this.setState({ errors: [] })}>
        <ErrorNoticeBar errors={errors} />
        <Item field="password" />
        <Item field="newPassword" />
        <Item field="confirmNewPassword" />
        <FormButton debounce label="保存" size="small" type='primary' onClick={this.modifyPasswordButtonClick} onError={(errors) => this.setState({ errors })} />
      </SchemaForm>
    );
  }
}
