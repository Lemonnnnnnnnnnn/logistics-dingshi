
import React, { Component } from 'react';
import { Form, Input, Button, Icon, Radio } from 'antd'
import { connect } from 'dva'
import router from 'umi/router'
import Link from 'umi/link'
import CSSModules from 'react-css-modules'
import role, { roleOptions, SCOPE } from '@/constants/user/role'
import { reloadAuthorized } from '@/utils/Authorized'
import styles from './Login.css'
import { encodePassword } from '@/utils/utils'

const FormItem = Form.Item
const { Password } = Input
const mapDispatchToProps = dispatch => ({
  login: userInfo => dispatch({ type: 'user/login', payload: userInfo }),
  fetchCurrent: () => dispatch({ type: 'user/fetchCurrent' }),
  fetchAuthorizations: () => dispatch({ type: 'user/fetchAuthorizations' })
})

function savePermissionsToLocalStorage (authority) {
  localStorage.setItem('antd-pro-authority', JSON.stringify(authority.map(item => item.permissionCode)))
  localStorage.setItem('authority', JSON.stringify(authority))
}

const ROLE_PLATFORM = 'ROLE_PLATFORM'

@connect((state) => ({
  userInfo: state.user.currentUser
}), mapDispatchToProps)
@Form.create()
@CSSModules(styles)
export default class Login extends Component {
  state = {
    time: Date.now(),
    showCode: false // 显示验证码
  }

  roleOptions = roleOptions.map(item => <Radio.Button key={item.value} value={item.value} style={{ width: 80 }}>{item.label}</Radio.Button>)

  componentDidMount () {
    this.props.fetchCurrent()
      .then(user => {
        if (user && user.isNewUser) {
          localStorage.removeItem('token')
          localStorage.removeItem('antd-pro-authority')
          localStorage.removeItem('authority')
          user && router.replace('/user/login')
        } else {
          user && router.replace('/user/login')
        }
      })
    this.getCurrentPlatform()
  }

  /**
   * 获取当前平台类型
   */
  getCurrentPlatform = () => {
    const platform = localStorage.getItem(ROLE_PLATFORM)
    if (platform) {
      const roleType = JSON.parse(platform)
      this.props.form.setFieldsValue({ roleType })
    } else {
      localStorage.setItem(ROLE_PLATFORM, roleOptions[0].value)
    }
  }

  login = (event) => {
    event.preventDefault()
    const { form: { validateFields }, login, fetchAuthorizations } = this.props
    validateFields((err, values) => {
      if (err) return
      localStorage.setItem(ROLE_PLATFORM, values.roleType)
      login({ ...values, scope: SCOPE[values.roleType], password: encodePassword(values.password) })// 要传入角色权限scope详情见接口
        .then(fetchAuthorizations)
        .then(savePermissionsToLocalStorage)
        .then(reloadAuthorized)
        .then(() => {
          this.setState({ showCode: false })
          router.replace('/mobile/prebookingList')
        })
        .catch(({ code }) => {
          if (code === 'LOGISTICS/ACCOUNT_INVALID_OVERRUN_TIMES') {
            this.setState({ showCode: true })
          }
        })
    })
  }

  // 刷新校验码的图片
  refreshImg = () => {
    const { time } = this.state
    const refreshTime = Date.now()
    if (time !== refreshTime) {
      this.setState({
        time: refreshTime
      })
    }
  }

  // 获取校验码的值
  onChangeCheckCode = e => {
    this.props.form.setFieldsValue({ code: e.target.value })
  }

  render () {
    const { form: { getFieldDecorator } } = this.props
    const { time, showCode } = this.state
    const inputStyle = {
      width: 200,
      marginRight: 10
    }

    return (
      <div styleName="login-block">
        <Form onSubmit={this.login}>
          <FormItem>
            {
              getFieldDecorator('roleType', {
                initialValue: role.PLATFORM
              })(
                <Radio.Group buttonStyle="solid" style={{ textAlign: 'center', display: 'block', marginBottom: 20 }}>
                  {this.roleOptions}
                </Radio.Group>
              )
            }
          </FormItem>
          <FormItem>
            {
              getFieldDecorator('userName', {
                rules: [
                  // { required: true, message: '请输入用户名' },
                  { type: 'string', required: true, message: '用户名为4到12位的字符', min: 4, max: 20 },
                ]
              })(
                <Input addonBefore={<Icon type="user" />} placeholder="用户名" />
              )
            }
          </FormItem>
          <FormItem>
            {
              getFieldDecorator('password', {
                rules: [
                  { required: true, message: '请输入密码' }
                ]
              })(
                <Password type="password" addonBefore={<Icon type="lock" />} placeholder="密码" />
              )
            }
          </FormItem>
          {
            showCode &&
            <FormItem>
              {
                getFieldDecorator('code', {
                  rules: [
                    { required: true, message: '请输入验证码' }
                  ]
                })(
                  <div>
                    <Input placeholder='输入校验码' onChange={this.onChangeCheckCode} style={inputStyle} />
                    <img src={`${window.envConfig.baseUrl}/authgetcode?${time}`} alt="验证码" onClick={this.refreshImg} />
                  </div>
                )
              }
            </FormItem>
          }
          <FormItem>
            <Button htmlType="submit" type="primary" block>登录</Button>
          </FormItem>
          <div className="textRight">
            <Link to="register">去注册</Link>
          </div>
        </Form>
      </div>
    )
  }
}
