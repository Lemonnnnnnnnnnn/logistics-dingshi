
import React, { Component } from 'react';
import { Form, Input, Button, Icon, Radio, message, Modal, Checkbox } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import CSSModules from 'react-css-modules';
import SlideVerify from '@/components/SlideVerify/SlideVerify';
import role, { roleOptions, SCOPE } from '@/constants/user/role';
import { reloadAuthorized } from '@/utils/Authorized';
import { encodePassword } from '@/utils/utils';
import { clearUserInfo } from '@/services/user';
import UserAgreement from '@/pages/BusinessCenter/ProjectManagement/subPage/userAgreement';
import styles from './Login.less';

const FormItem = Form.Item;
const { Password } = Input;
const mapDispatchToProps = dispatch => ({
  login: userInfo => dispatch({ type: 'user/login', payload: userInfo }),
  fetchCurrent: () => dispatch({ type: 'user/fetchCurrent' }),
  fetchAuthorizations: () => dispatch({ type: 'user/fetchAuthorizations' }),
  clearSetTabs: () => dispatch({ type: 'commonStore/clearSetTabs' })
});

function savePermissionsToLocalStorage (authority) {
  localStorage.setItem('ejd_antd-pro-authority', JSON.stringify(authority.map(item => item.permissionCode)));
  localStorage.setItem('ejd_authority', JSON.stringify(authority));
}

function redirectToPage (userInfo) {
  if (`${userInfo.auditStatus}` === '2') {
    clearUserInfo();
    localStorage.removeItem('token_storage');
    localStorage.removeItem('ejd_antd-pro-authority');
    localStorage.removeItem('ejd_authority');
    message.info('您当前信息正在审核，请等待审核完成！', 5);
  } else if (!userInfo.auditStatus) {
    router.push('/user/authentication');
  } else {
    const firstPage = '/index';
    router.replace(firstPage);
  }
}

const ROLE_PLATFORM = 'ROLE_PLATFORM';

@connect((state) => ({
  menu: state.menu.menuData,
  userInfo: state.user.currentUser,
  commonStore: state.commonStore
}), mapDispatchToProps)
@Form.create()
@CSSModules(styles)
export default class Login extends Component {

  constructor (props){
    super(props);
    const { options = roleOptions } = props;
    this.roleOptions = options.map(item => <Radio.Button key={item.value} value={item.value} style={{ width: 100 }}>{item.label}</Radio.Button>);
    const checked = JSON.parse(localStorage.getItem('agreement'));
    this.state = {
      time: Date.now(),
      checked,
      agreementModal:false,
      errorModal:false,
      readSecond:6,
      needSlideValidate: false, // 需要滑动验证
      showSlideValidate: false // 展示滑动验证
    };
  }

  componentDidMount () {
    this.props.clearSetTabs();
    this.props.fetchCurrent()
      .then(user => {
        if (user && user.isNewUser) {
          localStorage.removeItem('token_storage');
          localStorage.removeItem('ejd_antd-pro-authority');
          localStorage.removeItem('ejd_authority');
          user && router.replace('/user/login');
        } else {
          user && router.replace('/index');
        }
      });
    this.getCurrentPlatform();
  }

  /**
   * 获取当前平台类型
   */
  getCurrentPlatform = () => {
    const { isIndepend=false } = this.props;
    const platform = localStorage.getItem(ROLE_PLATFORM);
    if (platform) {
      const roleType = JSON.parse(platform);
      if (!isIndepend){
        this.props.form.setFieldsValue({ roleType });
      }
    } else {
      localStorage.setItem(ROLE_PLATFORM, roleOptions[0].value);
    }
  }

  login = (event) => {
    event.preventDefault();
    const { needSlideValidate } = this.state;

    needSlideValidate
      ? this.showSlideValidate()
      : this.submitForm();
  }

  showSlideValidate = () => this.setState({ showSlideValidate: true })

  validateSlide = (slideVerifyData) => this.submitForm(slideVerifyData)

  // 刷新校验码的图片
  refreshImg = () => {
    const { time } = this.state;
    const refreshTime = Date.now();
    if (time !== refreshTime) {
      this.setState({
        time: refreshTime
      });
    }
  }

  hideSlideValidate = () => this.setState({ showSlideValidate: false })

  checkPasswordSecurity = (password) => {
    let level = 0;
    if (password.trim() === '') {
      return level > 1;
    }
    // 密码中是否有数字
    if (/[0-9]/.test(password)) {
      level++;
    }
    // 判断密码中有没有小写字母
    if (/[a-z]/.test(password)) {
      level++;
    }
    // 判断密码中有没有大写字母
    if (/[A-Z]/.test(password)) {
      level++;
    }
    // 判断密码中有没有特殊符号
    if (/[^0-9a-zA-Z]/.test(password)) {
      level++;
    }
    return level > 1;
  }

  submitForm = (extraValue = {}) => {
    const { form: { validateFields }, login, fetchAuthorizations, isIndepend=false } = this.props;
    const { needSlideValidate, checked } = this.state;

    validateFields((err, values) => {
      if (err) return;
      if (!checked && !isIndepend) return message.error('请阅读并同意《用户使用协议》');
      // localStorage.setItem(ROLE_PLATFORM, values.roleType || role.PLATFORM )
      login({ ...values, ...extraValue, scope: SCOPE[values.roleType || role.PLATFORM], password: encodePassword(values.password) })// 要传入角色权限scope详情见接口
        .then((userInfo) =>{
          const check = this.checkPasswordSecurity(values.password);
          if (!check) return Promise.reject({ err:'level too low' });
          return fetchAuthorizations(userInfo);
        })
        .then(savePermissionsToLocalStorage)
        .then(reloadAuthorized)
        .then(() => {
          const { userInfo } = this.props;
          needSlideValidate && this.setState({ needSlideValidate: false, showSlideValidate: false });
          redirectToPage(userInfo);
        })
        .catch(({ code, err }) => {
          if (err === 'level too low') {
            clearUserInfo();
            localStorage.removeItem('token_storage');
            this.setState({
              errorModal:true
            });
            return;
          }
          if (code === 'LOGISTICS/ACCOUNT_INVALID_OVERRUN_TIMES') {
            !needSlideValidate && this.setState({ needSlideValidate: true });
          } else {
            this.refreshImg();
          }
        });
    });
  }

  // 获取校验码的值
  onChangeCheckCode = e => {
    this.props.form.setFieldsValue({ code: e.target.value });
  }

  onChange = (e) => {
    if (e.target.checked) {
      this.timeout = setInterval(() => {
        const { readSecond } = this.state;
        this.setState({
          readSecond: readSecond - 1
        }, () => {
          if (this.state.readSecond === 0){
            clearInterval(this.timeout);
          }
        });
      }, 1000);
      this.setState({
        agreementModal:true
      });
      return;
    }
    this.setState({
      checked: e.target.checked,
    });
  }

  closeAgreementModal = () => {
    clearInterval(this.timeout);
    this.setState({
      agreementModal:false,
      readSecond:6
    });
  }

  agree = () => {
    localStorage.setItem('agreement', JSON.stringify(true));
    this.setState({
      agreementModal:false,
      readSecond:6,
      checked: true,
    });
  }

  toModifyPassword = () => {
    router.push('/user/modifyPassword');
  }

  render () {
    const { form: { getFieldDecorator }, isIndepend=false } = this.props;
    const { showSlideValidate, checked, agreementModal, readSecond, errorModal } = this.state;

    return (
      <div styleName="login-block">
        <Form onSubmit={this.login}>
          {isIndepend?
            <h2 style={{ textAlign:'center' }}>
              平台管理员登录
            </h2>
            :
            <FormItem>
              {
                getFieldDecorator('roleType', {
                  initialValue: role.CONSIGNMENT
                })(
                  <Radio.Group buttonStyle="solid" style={{ textAlign: 'center', display: 'block', marginBottom: 20 }}>
                    {this.roleOptions}
                  </Radio.Group>
                )
              }
            </FormItem>
          }
          <FormItem>
            {
              getFieldDecorator('userName', {
                rules: [
                  // { required: true, message: '请输入用户名' },
                  { type: 'string', required: true, message: '用户名为4到12位的字符', min: 4, max: 20 },
                ]
              })(
                <Input addonBefore={<Icon type="user" />} placeholder="用户名/手机号码" />
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
          {!isIndepend && <div style={{ textAlign:'right', color:'#40A9FF' }} onClick={this.toModifyPassword}>重置密码</div>}
          <Modal title="向右滑动填充拼图" destroyOnClose footer={null} visible={showSlideValidate} onCancel={this.hideSlideValidate}>
            <SlideVerify width={400} validate={this.validateSlide} />
          </Modal>
          <FormItem>
            <Button htmlType="submit" type="primary" block>登录</Button>
          </FormItem>
          <Modal
            visible={errorModal}
            maskClosable={false}
            title="风险提示"
            closable={false}
            destroyOnClose
            footer={[
              <Button type="primary" onClick={this.toModifyPassword}>
                修改密码
              </Button>
            ]}
          >
            <div>你的账户密码等级过低，存在一定风险，请及时修改密码</div>
          </Modal>
          <Modal
            visible={agreementModal}
            maskClosable={false}
            title="用户协议"
            width={1000}
            height={600}
            destroyOnClose
            onCancel={this.closeAgreementModal}
            footer={[
              <Button onClick={this.closeAgreementModal}>
                不同意
              </Button>,
              <Button disabled={readSecond !== 0} type="primary" onClick={this.agree}>
                {`${readSecond?`${readSecond}s`:''}已阅读并同意`}
              </Button>
            ]}
          >
            <div style={{ height:'600px', overflowY:'auto', overflowX:'hidden' }}>
              <UserAgreement needFooter={false} />
            </div>
          </Modal>
          {!isIndepend &&
          <div style={{ margin:'5px' }}>
            <Checkbox
              checked={checked}
              onChange={this.onChange}
            >
              <span>阅读并同意</span>
              <a href='/userAgreement'>《用户使用协议》</a>
            </Checkbox>
            <span style={{ float:'right' }}>
              <Link to="register">注册</Link>
            </span>
          </div>}
        </Form>
      </div>
    );
  }
}
