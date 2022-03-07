import React, { Component } from 'react';
import { Form, Button, Input, Select } from 'antd';
import { connect } from 'dva';
import CSSModules from 'react-css-modules';
import model from '../../../../models/userInvoice';
import { getOrganizations, fundsRecharge } from '../../../../services/apiService';
import GetSmsCode from '../../../registered/get-sms-code';
import Copy from './copy-text';
import styles from './replace-recharge.less';


const { Option } = Select;

const { actions: { detailUserInvoice } } = model;
@CSSModules(styles, { allowMultiple: true })
class InputMoneyForm extends Component {

  state = {
    options: []
  }

  componentDidMount () {
    getOrganizations({ organizationTypeList: '4,5', selectType: '1', offset: 0, limit: 100000 }).then(({ items }) => {
      this.setState({
        options: items
      });
    });
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const { nextStep } = this.props;
      nextStep(values);
    });
  }

  onChange = (value) => {
    console.log(`selected ${value}`);
  }

  render () {
    const { getFieldDecorator } = this.props.form;
    const { options } = this.state;
    return (
      <div styleName='container'>
        <Form styleName='form'>
          <div styleName='item'>
            <p>金额</p>
            <Form.Item styleName='item'>
              {getFieldDecorator('money', {
                rules: [
                  { required: true, message: '请输入充值金额' },
                  { pattern: /^\d+\.?\d{0,2}$/, message: '请输入正确的金额（最多2位小数）' },
                  {
                    validator: (rule, value, callback) => {
                      if (value && Number(value) === 0) callback('金额必须大于0');
                      callback();
                    }
                  }
                ],
              })(
                <Input size="large" placeholder='请输入充值金额' addonAfter='元' />
              )}
            </Form.Item>
          </div>
          <div styleName='item' style={{ marginTop: '25px' }}>
            <p>客户</p>
            <Form.Item styleName='item'>
              {getFieldDecorator('customerOrganizationId', {
                rules: [{ required: true, message: '请输入客户名称' }],
              })(
                <Select
                  showSearch
                  style={{ width: 350 }}
                  placeholder="请输入客户名称"
                  optionFilterProp="children"
                  onChange={this.onChange}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {
                    options.map(item => (<Option value={item.organizationId}>{item.organizationName}</Option>))
                  }
                </Select>
              )}
            </Form.Item>
          </div>
          {/* <footer styleName='footer_tips'>
            <p>温馨提示：</p>
            <p>1.退款申请成功后，等待处理时间预计为48小时，如金额错误可到收支记录撤销后重新申请</p>
            <p>2.如平台超过48小时未处理该退款申请将关闭，如需退款请重新提交申请</p>
          </footer> */}
          <Form.Item styleName='item_button'>
            <Button
              onClick={this.handleSubmit}
              type='primary'
            >
              下一步
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappedInputMoneyForm = Form.create({ name: 'horizontal_login' })(InputMoneyForm);

@connect(null, { detailUserInvoice })
@CSSModules(styles, { allowMultiple: true })
export default class Index extends Component {

  state = {
    step: 0,
    detail: {
      financeRechargeEntity: {}
    }
  }

  formSchema = {
    bankAccount: {
      component: 'input',
      placeholder: '请输入银行卡号',
      rules: {
        required: [true, '请输入银行卡号'],
        pattern: [/^[0-9]*$/, '银行卡号只能为数字']
      },
    },
    phone: {
      label: '授权手机号',
      component: 'input',
      disabled: true
    },
    smsCode: {
      component: GetSmsCode,
      needCheckCode: false,
      smsType: 'APPREF',
      rules: {
        required: [true, '请输入短信验证码']
      },
      placeholder: '请输入短信验证码'
    },
  }

  stepOne = values => {
    this.InputMoneyForm = values;
    fundsRecharge({ customerOrganizationId: values.customerOrganizationId, agency: true, applyRechargeAmount: values.money }).then((detail) => {
      this.setState({
        detail,
        step: 1,
      });
    });
  }

  goBack = () => {
    this.setState({
      step: 0,
    });
  }

  confirm = () => {
    this.props.closeForm();
  }

  copyDom = React.createRef()

  copy = () => {
    this.copyDom.current.select();
    document.execCommand("Copy");
  }

  render () {
    const { step, detail: { financeRechargeEntity: { payeeAccountNumber, remittanceIdentificationCode, organizationName='' }, paymentAuthorizationPhone='' } } = this.state;
    switch (step) {
      case 1:
        return (
          <div styleName='container'>
            <header styleName='header_tips'>
              <p>充值金额：<span styleName='blueMoney'>{this.InputMoneyForm.money}</span>元</p>
              <p>代充客户: {organizationName}</p>
            </header>
            <div styleName='account_info'>
              <Copy label='对公账号:' renderData={payeeAccountNumber} />
              <Copy label='账户名:' renderData='福建鼎石科技有限公司' />
              <Copy label='开户行:' renderData='中信银行-成都武阳大道支行' />
            </div>
            <p styleName='red fw600'>汇款识别码：<input ref={this.copyDom} styleName='codeInput' readOnly type="text" value={remittanceIdentificationCode} /><a style={{ marginLeft: '10px', fontWeight: 'normal' }} onClick={this.copy}>复制</a></p>
            <p styleName='red fw600'>您的汇款识别码已发送到手机：{paymentAuthorizationPhone}</p>
            <footer styleName='footer_tips'>
              <p>温馨提示：</p>
              <p>1. 线下转账需将此汇款识别码填写至电汇凭证的【备注】等栏内</p>
              <p>2. 线下转账，一个识别码对应一个充值单和相应的金额，请勿多转账或者少转账</p>
              <p>3. 线下转账汇款时备注汇款识别码，可确保充值单及时核销，请务必填写正确，勿私自增加其他文字说明</p>
            </footer>
            <div styleName='btn_box'>
              <Button type='primary' onClick={this.confirm}>确定</Button>
            </div>
          </div>
        );
      default:
        return (
          <WrappedInputMoneyForm nextStep={this.stepOne} />
        );
    }
  }
}
