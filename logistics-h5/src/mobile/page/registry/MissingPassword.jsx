import React from 'react'
import classnames from 'classnames'
import { Icon } from 'antd'
import { SchemaForm, FORM_MODE, Item, FormButton, ErrorNoticeBar } from '@gem-mine/mobile-schema-form/src';
import '@gem-mine/mobile-schema-form/src/fields'
import router from 'umi/router'
import { Toast } from 'antd-mobile';
import nativeApi from '@/utils/nativeApi';
import { changePassword } from '@/services/apiService'
import { encodePassword } from '@/utils/utils'
import SMsCode from './SmsCode'
import styles from './Registry.css'

export default class MissingPassword extends React.Component {
  state = {
    errors: [],
    showPwd: false,
    showCheckPwd: false
  }

  constructor (props) {
    super(props)

    this.schema = {
      'phone': {
        label: '+86',
        component: 'inputItem',
        placeholder: '请输入手机号',
        rules: {
          required: [true, '请输入手机号'],
          pattern:[/^1\d{10}$/, '请输入正确的手机号'],
          // validator: ({ value }) => {
          //   const reg = /^1\d{10}$/
          //   if (!reg.test(value)) {
          //     return '请输入正确的手机号'
          //   }
          // }
        }
      },
      smsCode: {
        component: SMsCode,
        props: {
          smsType: 'SMS_152852310',
          phoneField: 'phone'
        }
      },
      'password': {
        label: '新密码',
        component: 'inputItem',
        props: {
          watch: ['*showPwd'],
          action: (showPwd) => {
            const iconType = showPwd ? 'eye-invisible' : 'eye'
            return {
              type: showPwd ? 'text' : 'password',
              extra: <Icon type="eye" />
            }
          }
        },
        rules: {
          required: true,
          // pattern:[/^[A-Za-z0-9_]{6,16}$/, '密码由6-16位大小写字母数字组成']
          validator: ({ value }) => {
            const reg = /^[A-Za-z0-9_]{6,16}$/
            if (!reg.test(value)) {
              return { message: "请填写正确的新密码", field: "password" }
            }
          }
        },
        placeholder: '请输入新密码',
      },
      'checkPassword': {
        label: '确认密码',
        component: 'inputItem',
        props: {
          watch: ['*showCheckPwd'],
          action: (showCheckPwd) => {
            const iconType = showCheckPwd ? 'eye-invisible' : 'eye'
            return {
              type: 'password',
              // extra: <Icon type={iconType} />,
            }
          }
        },
        rules: {
          required: true,
          validator: ({ value, formData }) => {
            const { password } = formData
            if (!(value === password)) {
              return '两次输入密码不一致'
            }
          }
        },
        placeholder: '请再次输入新密码',
      },
    }

    this.FormButtonConfig = [
      {
        label: '提交',
        type: 'primary',
        style: { margin: '10px 15px 0', borderRadius: '30px' },
        validate:['phone', 'password', 'checkPassword'],
        onClick: formData => {
          if (!formData.checkPassword===formData.password) return Toast.fail('两次输入密码不一致')
          const { type } = this.props.location.query
          formData.checkPassword = undefined
          formData.password = encodePassword(formData.password)
          formData.organizationType = {
            driver: undefined,
            consignment: 4,
            shipment: 5,
          }[type]
          changePassword(formData)
            .then(() => {
              nativeApi.toLoginPage()
            })
        },
        onError: (errors) => {
          this.setState({ errors })
        }
      }
    ]
  }

  toLogin = () => nativeApi.toLoginPage()

  toRegister = () => router.replace('register')

  render () {
    const toLiginCls = classnames('clearfix', styles.toLogin)
    const { showPwd } = this.state
    const { type } = this.props.location.query
    return (
      <div className={styles['registry-wrap']}>
        <h2 className={styles.description}>忘记密码</h2>
        <SchemaForm schema={this.schema} mode={FORM_MODE.ADD} trigger={{ showPwd }} onChange={() => this.setState({ errors: [] })}>
          <ErrorNoticeBar errors={this.state.errors} />
          <Item field="phone" />
          <Item field="smsCode" />
          <Item field="password" />
          <Item field="checkPassword" />
          <div className={toLiginCls}>
            {type==='driver'&&<a onClick={this.toRegister} className="fr">注册</a>}
            <a onClick={this.toLogin}>直接登录</a>
          </div>
          {this.FormButtonConfig.map((item) => <FormButton debounce key={item.label} {...item} />)}
        </SchemaForm>
      </div>
    )
  }
}
