
import React, { Component } from 'react';
import { Form, Input, Button, Icon, Radio, message, Modal, Checkbox } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import CSSModules from 'react-css-modules';
import SlideVerify from '../../components/slide-verify/slide-verify';
import { roleOptions, SCOPE } from '../../constants/user/role';
import { reloadAuthorized } from '../../utils/Authorized';
import { encodePassword, xmlStr2json } from '../../utils/utils';
import { clearUserInfo } from '../../services/user';
import { getBanner } from '../../services/apiService';
import UserAgreement from '../business-center/project-manage/sub-page/user-agreement';
import guanggao from '../../assets/guanggao.png';
import yonghuming from '../../assets/yonghuming@2x.png';
import mima from '../../assets/mima@2x.png';
import styles from './login.less';

const FormItem = Form.Item;
const { Password } = Input;
const mapDispatchToProps = dispatch => ({
  login: userInfo => dispatch({ type: 'user/login', payload: userInfo }),
  fetchCurrent: () => dispatch({ type: 'user/fetchCurrent' }),
  fetchAuthorizations: () => dispatch({ type: 'user/fetchAuthorizations' }),
  clearSetTabs: () => dispatch({ type: 'commonStore/clearSetTabs' })
});

function savePermissionsToLocalStorage (authority) {
  localStorage.setItem('antd-pro-authority', JSON.stringify(authority.map(item => item.permissionCode)));
  localStorage.setItem('authority', JSON.stringify(authority));
}

function redirectToPage (userInfo) {
  if (`${userInfo.auditStatus}` === '2') {
    clearUserInfo();
    localStorage.removeItem('token');
    localStorage.removeItem('antd-pro-authority');
    localStorage.removeItem('authority');
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
    this.roleOptions = options.map(item => <Radio.Button key={item.value} value={item.value}>{item.label}</Radio.Button>);
    const checked = JSON.parse(localStorage.getItem('agreement'));
    this.state = {
      time: Date.now(),
      checked,
      agreementModal:false,
      errorModal:false,
      readSecond:6,
      needSlideValidate: false, // 需要滑动验证
      showSlideValidate: false, // 展示滑动验证
      imgUrl: '', // 广告位图片
      link: "",  // 广告位链接
    };
  }

  componentDidMount () {
    const { location, fetchCurrent, clearSetTabs, form } = this.props;

    getBanner("ekey-web").then((response) => {
      if ( response && xmlStr2json(response).rss) {
        const obj = xmlStr2json(response).rss.channel;
        let str = obj.item.length ? obj.item[0]['content:encoded']: obj.item['content:encoded'];
        if (str && str.split("src=\"")[1].split("\"")[0]) {
          str = str.split("src=\"")[1].split("\"")[0];
        } else if (str && str.split('(') && str.split('(')[0]) {
          str = str.split('(')[1].split(')')[0];
        } else {
          str = guanggao;
        }
        this.setState({
          imgUrl: str,
          link: obj.item.length ? obj.item[0].link : obj.item.link
        });
      }

    });
    if (location.query && location.query.type) {
      form.setFieldsValue({ roleType: Number(location.query.type) });
    }
    clearSetTabs();
    fetchCurrent()
      .then(user => {
        if (user && user.isNewUser) {
          localStorage.removeItem('token_storage');
          localStorage.removeItem('antd-pro-authority');
          localStorage.removeItem('authority');
          user && router.replace('/user/login');
        } else {
          user && router.replace('/index');
        }
      });
  }

  login = (event) => {
    event.preventDefault();
    const { needSlideValidate } = this.state;
    localStorage.removeItem("oms-showHomeModal");
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
      login({ ...values, ...extraValue, scope: SCOPE[values.roleType], password: encodePassword(values.password) })// 要传入角色权限scope详情见接口
        .then((userInfo) =>{
          const check = this.checkPasswordSecurity(values.password);
          if (!check) return Promise.reject({ err:'level too low' });
          return fetchAuthorizations(userInfo);
        })
        .then(savePermissionsToLocalStorage)
        .then(reloadAuthorized)
        .then(() => {
          const { userInfo, location } = this.props;
          needSlideValidate && this.setState({ needSlideValidate: false, showSlideValidate: false });
          redirectToPage(userInfo);
          if (location.query.redirect) {
            window.location.replace(`${window.envConfig.url}${location.query.redirect}`);
          } else {
            redirectToPage(userInfo);
          }
        })
        .catch(({ code, err }) => {
          if (err === 'level too low') {
            clearUserInfo();
            localStorage.removeItem('token');
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
    const { form: { getFieldDecorator }, isIndepend=false, location  } = this.props;
    const { showSlideValidate, checked, agreementModal, readSecond, errorModal, imgUrl, link } = this.state;
    return (
      <div className={styles.loginBlock}>
        <div className={styles.loginBlockLeft}>

          {
            imgUrl ? <a href={link || ""} target="_blank" rel="noreferrer"><img src={imgUrl} alt="" /></a> : <Icon type="loading" />
          }

        </div>

        <Form onSubmit={this.login} className={styles.loginForm}>
          <div className={styles.registerBox}><Link to="register">注册</Link></div>
          <FormItem>
            {
              getFieldDecorator('roleType', {
                initialValue: location.query && location.query.type ? Number(location.query.type) : 2,
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
                <Input addonBefore={<img src={yonghuming} alt="" width="22" height="22" />} placeholder="用户名/手机号码" />
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
                <Password type="password" addonBefore={<img src={mima} alt="" width="22" height="22" />} placeholder="密码" />
              )
            }
          </FormItem>
          <Modal title="向右滑动填充拼图" destroyOnClose footer={null} visible={showSlideValidate} onCancel={() => this.setState({ showSlideValidate: false })}>
            <SlideVerify width={400} validate={(slideVerifyData) => this.submitForm(slideVerifyData)} />
          </Modal>
          <FormItem>
            <Button style={{ fontSize : '18px' }} htmlType="submit" type="primary" block>登录</Button>
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
                {`${readSecond ? `${readSecond}s`:''}已阅读并同意`}
              </Button>
            ]}
          >
            <div style={{ height:'600px', overflowY:'auto', overflowX:'hidden' }}>
              <UserAgreement needFooter={false} />
            </div>
          </Modal>
          {!isIndepend &&
          <div style={{ margin: '20px 5px 5px', display: 'flex', justifyContent: 'space-between' }}>
            <Checkbox
              checked={checked}
              onChange={this.onChange}
            >
              <span style={{  fontSize : '16px' }}>阅读并同意</span>
              <Link to='/userAgreement' style={{ color:'#14428A', fontSize : '16px' }}>《用户使用协议》</Link>
            </Checkbox>
            {!isIndepend && <div style={{ textAlign: 'right', color: '#14428A',  fontSize : '16px' }} onClick={this.toModifyPassword}>重置密码</div>}
          </div>
          }
        </Form>
      </div>
    );
  }
}
