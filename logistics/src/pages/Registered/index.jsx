import React, { Component } from 'react';
import { SchemaForm, Item, FormButton, FORM_MODE } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import router from 'umi/router';
import { message, Button, Popover, Icon } from 'antd';
import DebounceFormButton from '@/components/DebounceFormButton';
import { ORGANIZATIONTYPE } from '@/constants/regisetred';
import { SCOPE } from '@/constants/user/role';
import { encodePassword } from '@/utils/utils';
import GetSmsCode from './GetSmsCode';
import registeredModel from '@/models/registered';
import '@gem-mine/antd-schema-form/lib/fields';

const { requests: { postAuthregister } } = registeredModel;
// 将ORGANIZATIONTYPE子元素中的title属性名改成label以支持新表单
const NewORGANIZATIONTYPE = ORGANIZATIONTYPE.map(item => ({
  label: item.title,
  value: item.value
}));

const mapDispatchToProps = dispatch => ({
  submit: userInfo => dispatch({ type: 'user/login', payload: userInfo })
});
@connect(() => ({}), mapDispatchToProps)
export default class Registered extends Component {

  constructor (props) {
    super(props);
    this.state = { okDisable: false };
    this.formSchema={
      organizationType:{
        component:'select',
        placeholder: '请选择用户端',
        rules: {
          required: [true, '请选择用户端'],
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
        rules: {
          required: [true, '请输入验证码']
        }
      },
      userName: {
        component: 'input',
        placeholder: '请输入4-12位用户登录账号',
        addonAfter :  <Popover content='注册成功后可按此账号或验证通过的手机号作为“登录账号”登录系统' trigger="hover"><Icon type="question-circle" /></Popover>,
        rules: {
          required: [true, '请输入用户登录账号'],
          validator : ({ value })=>{
            const reg = /^[0-9]*$/;
            if (reg.test(value)) {
              return '登录账号不能为纯数字';
            }
            if (value.length < 4 || value.length > 12){
              return '登录账号应为4位至12位';
            }
          }
        }
      },
      password: {
        name: '密码',
        component: 'input',
        placeholder: '用户密码',
        rules: {
          required: [true, '请输入密码'],
          validator: ({ value }) => {
            const check = this.checkPasswordSecurity(value);
            if (!check) {
              return '密码长度为8-16位，数字、大小写字母、字符至少包含两种';
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
              return '两次密码输入不一致';
            }
          }
        }
      }
    };
  }

  checkPasswordSecurity = (password) => {
    let level = 0;
    if (password.trim() === '' || password.trim().length < 8 || password.trim().length > 16) {
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


  authregister = formData => {
    delete formData.confirmPassword;
    formData.portraitDentryid = '用户_KEY_1562742522570.png';
    formData.password = encodePassword(formData.password);
    this.setState({ okDisable: true });
    if (this.state.okDisable) {
      postAuthregister(formData).then(results => {
        if (results && results.userId) {
          message.success('注册成功！');
          let scope = '';
          const [CARGO, CONSIGNMENT, SHIPMENT] = NewORGANIZATIONTYPE; // 解构组织类型
          switch (formData.organizationType) {
            case CARGO.value:
              scope = SCOPE[5];
              break;
            case CONSIGNMENT.value:
              scope = SCOPE[2];
              break;
            case SHIPMENT.value:
              scope = SCOPE[3];
              break;
            default : scope = '';
          }
          const data = {
            scope,
            userName: formData.phone,
            password: formData.password
          };
          setTimeout(() => {
            this.login(data);
          }, 1000);
        }
      }).catch((error) => {
        this.setState({ okDisable: false });
      });
    }

  }

  login = data => {
    // 登录获取token
    this.props.submit({ ...data }).then(response => {
      if (!response) {
        this.setState({ okDisable: false });
        return;
      };
      // 跳转补充页面
      if (response.isNewUser) {
        router.push('/user/authentication');
        this.setState({ okDisable: false });
      }
    });
  }

  goBack = () => {
    router.push('/user/login');
  }

  render () {
    const wrapperCol = {
      xs: { span: 16 },
      push: 4
    };
    return (
      <div style={{ width: 500, margin: '43px auto 0', backgroundColor: '#fff', boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.16)", padding: "30px" }}>
        <h3 style={{ textAlign: 'center' }}>注册</h3>
        <SchemaForm
          schema={this.formSchema}
          layout="horizontal"
          mode={FORM_MODE.ADD}
          wrapperCol={wrapperCol}
        >
          <Item field="organizationType" />
          <Item field='userName' />
          <Item field='password' />
          <Item field='confirmPassword' />
          <Item field="phone" />
          <Item field='smsCode' />
          <div style={{ textAlign:'center' }}>
            <DebounceFormButton label="注册" style={{ width: '67%' }} type='primary' onClick={this.authregister} loading={this.state.okDisable} />
            <Button style={{ width: '67%', marginTop: '10px' }} type='default' onClick={this.goBack}>返回</Button>
          </div>
        </SchemaForm>
      </div>
    );
  }
}
