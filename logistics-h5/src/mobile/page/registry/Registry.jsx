import React from 'react'
import classnames from 'classnames'
import { SchemaForm, FORM_MODE, Item, FormButton, ErrorNoticeBar } from '@gem-mine/mobile-schema-form/src';
import '@gem-mine/mobile-schema-form/src/fields'
import Link from 'umi/link'
import nativeApi from '@/utils/nativeApi';
import { register as registerDriver } from '@/services/apiService'
import { encodePassword } from '@/utils/utils'
import SMsCode from './SmsCode.jsx'
import styles from './Registry.css'

const DEFAULT_REST_TIME = 10

export default class Registry extends React.Component {
  state = {
    errors: [],
    showPwd: false,
    showCheckPwd: false,
    smsPending: false,
    restTime: DEFAULT_REST_TIME,
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
          validator: ({ value }) => {
            const reg = /^1\d{10}$/
            if (!reg.test(value)) {
              return '请输入正确的手机号'
            }
          }
        }
      },
      smsCode: {
        // label: '验证码',
        component: SMsCode,
        props: {
          phoneField: 'phone'
        }
        // placeholder: '请输入验证码',
        // rules: {
        //   required: true
        // },
        // props: {
        //   watch: ['*smsPending', '*restTime'],
        //   action: ([smsPending, restTime]) => ({
        //       extra: smsPending
        //         ? <div>qw1</div>
        //         : <a href="javascript:;" onClick={this.getSMSCode}>获取验证码</a>
        //     })
        // }
      },
      'password': {
        label: '密码',
        component: 'inputItem',
        props: {
          watch: ['*showPwd'],
          action: (showPwd) => {
            const iconType = showPwd ? 'eye-invisible' : 'eye'
            return {
              type: showPwd ? 'text' : 'password',
              // extra: <Icon type="eye" />
            }
          }
        },
        rules: {
          required: true,
          pattern:[/^[A-Za-z0-9_]{6,16}$/, '密码由6-16位大小写字母数字组成'],
          // validator: ({ value }) => {
          //   const reg = /^[A-Za-z0-9_]{6,16}$/
          //   if (!reg.test(value)) {
          //     return '密码由6-16位大小写字母数字组成'
          //   }
          // }
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
        label: '注册',
        type: 'primary',
        style: { margin: '10px 15px 0', borderRadius: '30px' },
        onClick: formData => {
          formData.checkPassword = undefined
          formData.password = encodePassword(formData.password)
          registerDriver(formData)
            .then(data => {
              nativeApi.toCompleteInfo(JSON.stringify({ ...data, auditStatus:null }), formData.phone)
            })
        },
        onError: (errors) => this.setState({ errors })
      }
    ]
  }

  getSMSCode = () => {
    this.setState({
      smsPending: true,
      restTime: DEFAULT_REST_TIME
    })
  }

  toLogin = () => nativeApi.toLoginPage()

  render () {
    const toLiginCls = classnames('clearfix', styles.toLogin)
    const { smsPending, showPwd, restTime } = this.state

    return (
      <div className={styles['registry-wrap']}>
        <h2 className={styles.description}>绑定手机号</h2>
        <SchemaForm schema={this.schema} mode={FORM_MODE.ADD} trigger={{ showPwd, smsPending, restTime }}>
          <ErrorNoticeBar errors={this.state.errors} />
          <Item field="phone" />
          <Item field="smsCode" />
          <Item field="password" />
          <Item field="checkPassword" />
          <div className={toLiginCls}>
            <a onClick={this.toLogin} className="fr">使用已有账户登录</a>
          </div>
          {this.FormButtonConfig.map((item) => <FormButton debounce key={item.label} validate {...item} />)}
        </SchemaForm>
        <div className={classnames('textCenter', styles.registerTip)}>点击“注册”按钮，表示您同意<Link to="registerNotes">《易键达用户协议》</Link></div>
      </div>
    )
  }
}
