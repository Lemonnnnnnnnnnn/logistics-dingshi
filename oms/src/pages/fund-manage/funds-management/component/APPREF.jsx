import React, { Component } from 'react';
import { Form, Button, Input, notification } from 'antd';
import { connect } from 'dva';
import CSSModules from 'react-css-modules';
import { SchemaForm, Item, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../../components/debounce-form-button';
import model from '../../../../models/userInvoice';
import { getUserInfo } from '../../../../services/user';
import { postFinanceAccounts } from '../../../../services/apiService';
import GetSmsCode from '../../../registered/get-sms-code';
import styles from './APPREF.less';
import BranchBanksSelector from './branch-banks-selector';

const { TextArea } = Input;

const { actions: { detailUserInvoice } } = model;
@CSSModules(styles, { allowMultiple: true })
class InputMoneyForm extends Component{

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const { nextStep } = this.props;
      nextStep(values);
    });
  }

  allIn = () => {
    const { maxMoney } = this.props;
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ money: maxMoney });
  }

  render () {
    const { getFieldDecorator } = this.props.form;
    const { maxMoney } = this.props;
    return (
      <div styleName='container'>
        <Form styleName='form'>
          <div styleName='item'>
            <p>金额</p>
            <Form.Item styleName='item'>
              {getFieldDecorator('money', {
                rules: [
                  { required: true, message: '请输入退款金额' },
                  { pattern: /^\d+\.?\d{0,2}$/, message: '请输入正确的金额（最多2位小数）' },
                  { validator: (rule, value, callback) => {
                    if (value > Number(maxMoney || 0)) callback('超出可退款金额');
                    if (value && Number(value) === 0) callback('金额必须大于0');
                    callback();
                  } }
                ],
              })(
                <Input size="large" placeholder={`可退款金额${Number(maxMoney || 0).toFixed(2)._toFixed(2)}元`} addonAfter={<div style={{ cursor: 'pointer' }} onClick={this.allIn}>全部</div>} />
              )}
            </Form.Item>
          </div>
          <div styleName='item' style={{ marginTop: '25px' }}>
            <p>退款原因<span styleName='required'>(必填)</span></p>
            <Form.Item styleName='item'>
              {getFieldDecorator('remarks', {
                rules: [{ required: true, message: '请输入退款原因' }],
              })(
                <TextArea placeholder='请输入退款原因' maxLength={100} rows={3} />
              )}
            </Form.Item>
          </div>
          <footer styleName='footer_tips'>
            <p>温馨提示：</p>
            <p>1.退款申请成功后，等待处理时间预计为48小时，如金额错误可到收支记录撤销后重新申请</p>
            <p>2.如平台超过48小时未处理该退款申请将关闭，如需退款请重新提交申请</p>
          </footer>
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
    disabled: false
  }

  formSchema = {
    bankAccount: {
      component: 'input',
      placeholder: '请输入银行卡号',
      rules: {
        required: [true, '请输入银行卡号'],
        pattern:[/^[0-9]*$/, '银行卡号只能为数字']
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
    branchBanks: {
      component: BranchBanksSelector
    },
    bankCode: {
      component: 'input',
      placeholder: '请输入提现银行行号',
      rules: {
        required: [true, '请输入提现银行行号'],
        validator: ({ value }) => {
          const reg = /^[0-9]*$/;
          if (!reg.test(value)) {
            return '银行行号由数字构成';
          }
          if (value.length !== 12) {
            return '银行行号由12位数字构成';
          }
        }
      },
      value: Observer({
        watch:'branchBanks',
        action: (branchBanks={}) => branchBanks.key
      })
    }
  }

  stepOne = values => {
    this.InputMoneyForm = values;
    this.setState({
      step: 1,
      disabled: false
    });
  }

  goBack = () => {
    this.setState({
      step: 0,
      disabled: false
    });
  }

  confirm = value => {
    const formValue = { ...this.InputMoneyForm, ...value, transactionType: 5 };
    formValue.transactionAmount = formValue.money;
    postFinanceAccounts(formValue).then(() => {
      const { closeModal } = this.props;
      closeModal(true);
      notification.success({
        message: '操作成功',
        description: `已成功申请退款，请耐心等待`,
      });
    })
      .catch((error) => {
        notification.error({
          message: '错误',
          description: error.tips,
        });
      });
  }

  render () {
    const { step, disabled } = this.state;
    const { maxMoney, phone } = this.props;
    const formData = { phone };
    const formLayOut = {
      labelCol:{
        xs: { span: 24 }
      },
      wrapperCol: {
        xs: { span: 24 }
      }
    };
    switch (step) {
      case 1:
        return (
          <div styleName='container'>
            <SchemaForm style={{ width: '100%' }} schema={this.formSchema} data={formData}>
              <div styleName='item' style={{ width: '380px', margin: '0 auto', marginBottom: '5px' }}>
                <p>收款银行卡</p>
                <p styleName='invoiceTitle'>{getUserInfo().organizationName || ''}</p>
                <Item {...formLayOut} styleName='cardNo' field='bankAccount' />
              </div>
              <div styleName='item' style={{ width: '380px', margin: '0 auto', marginBottom: '10px' }}>
                <p>开户支行</p>
                <Item {...formLayOut} field='branchBanks' />
                <p>银行行号</p>
                <Item {...formLayOut} styleName='cardNo' field='bankCode' />
              </div>
              <div styleName='item' style={{ width: '380px', margin: '0 auto', marginBottom: '5px' }}>
                <p style={{ marginBottom: '5px' }}>授权手机号</p>
                <p styleName='phoneNo'>{phone || ''}</p>
              </div>
              <div style={{ width: '380px', margin: '0 auto' }}>
                <Item style={{ display: 'none' }} field='phone' />
                <Item field="smsCode" />
              </div>
              <footer styleName='footer_tips'>
                <p>温馨提示：</p>
                <p>1.退款申请成功后，等待处理时间预计为48小时，如金额错误可到收支记录撤销后重新申请</p>
                <p>2.如平台超过48小时未处理该退款申请将关闭，如需退款请重新提交申请</p>
              </footer>
              <div styleName='btn_box'>
                <Button onClick={this.goBack}>上一步</Button>
                <DebounceFormButton debounce label="确定" type="primary" disabled={disabled} onClick={this.confirm} />
              </div>
            </SchemaForm>
          </div>
        );
      default:
        return (
          <WrappedInputMoneyForm {...{ maxMoney }} nextStep={this.stepOne} />
        );
    }
  }
}
