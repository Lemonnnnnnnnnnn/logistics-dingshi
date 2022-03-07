import React, { Component } from 'react'
import { notification, Button } from 'antd'
import { SchemaForm, Item, FormButton } from '@gem-mine/antd-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton';
import CSSModules from 'react-css-modules'
import { TRANSACTION_STATUS, TRANSACTION_TYPE_CODE } from '@/constants/project/project'
import { patchFinanceAccounts } from '@/services/apiService'
import styles from './APPREF.less'
import GetSmsCode from '@/pages/Registered/GetSmsCode'

@CSSModules(styles, { allowMultiple: true })
export default class Index extends Component {

  state = {
    disabled: false
  }

  passFormSchema = {
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

  rejectFormSchema = {
    remarks: {
      component: 'input.textArea',
      placeholder: '请输入拒绝原因',
      rules: {
        max: 100,
        required: [true, '请输入拒绝原因']
      }
    }
  }

  pass = value => {
    const { rowRecord: { transactionId } } = this.props
    this.props.closeModal()
    patchFinanceAccounts({ transactionId, ...value, transactionStatus: TRANSACTION_STATUS.AUDITED, transactionType: TRANSACTION_TYPE_CODE.REFUND }).then(() => {
      this.props.refresh()
      notification.success({
        message: '审核成功',
        description: `已同意该退款申请`
      })
    })
      .catch((error) => {
        notification.error({
          message: '错误',
          description: error.tips,
        })
      })
  }

  reject = value => {
    const { rowRecord: { transactionId } } = this.props
    this.props.closeModal()
    patchFinanceAccounts({ transactionId, ...value, transactionStatus: TRANSACTION_STATUS.REFUSED, transactionType: TRANSACTION_TYPE_CODE.REFUND }).then(() => {
      this.props.refresh()
      notification.success({
        message: '拒绝成功',
        description: `已成功拒绝该退款申请`
      })
    })
  }

  render () {
    const { disabled } = this.state
    const { phone, rowRecord } = this.props
    const formData = { phone }
    return (
      <div styleName='container'>
        <footer styleName='refund_info'>
          <p>
            <span styleName='info_label'>客户名称：</span>
            <span styleName='info_content'>{rowRecord.accountName || '--'}</span>
          </p>
          <p>
            <span styleName='info_label'>申请金额：</span>
            <span styleName='info_content'>{rowRecord.transactionAmount || 0.00}元</span>
          </p>
          <p>
            <span styleName='info_label'>申请原因：</span>
            <span styleName='info_content'>{rowRecord.remarks || '--'}</span>
          </p>
        </footer>
        {
          this.props.auditStatus === 'pass'?
            <>
              <p styleName='tips_red'>*通过客户退款申请，退款金额将退回到客户账户</p>
              <div styleName='item' style={{ width: '380px', marginBottom: '5px' }}>
                <p style={{ marginBottom: '5px' }}>短信验证手机</p>
                <p styleName='phoneNo'>{phone || ''}</p>
              </div>
              <SchemaForm style={{ width: '100%' }} schema={this.passFormSchema} data={formData}>
                <div style={{ width: '380px', margin: '0 auto' }}>
                  <Item style={{ display: 'none' }} field='phone' />
                  <Item field="smsCode" />
                </div>
                <div styleName='btn_box'>
                  <Button onClick={this.props.closeModal}>取消</Button>
                  <DebounceFormButton debounce label="确定" type="primary" disabled={disabled} onClick={this.pass} />
                </div>
              </SchemaForm>
            </>
            :
            <>
              <p styleName='tips_gray'>
                <span>拒绝原因</span>
                <span>(必填)</span>
              </p>
              <SchemaForm style={{ width: '100%' }} schema={this.rejectFormSchema}>
                <div styleName='appref_textArea_box'>
                  <Item field="remarks" style={{ width: '380px', margin: '0 auto' }} />
                </div>
                <div styleName='btn_box'>
                  <Button onClick={this.props.closeModal}>取消</Button>
                  <DebounceFormButton debounce label="确定" type="primary" disabled={disabled} onClick={this.reject} />
                </div>
              </SchemaForm>
            </>
        }
      </div>
    )
  }
}
