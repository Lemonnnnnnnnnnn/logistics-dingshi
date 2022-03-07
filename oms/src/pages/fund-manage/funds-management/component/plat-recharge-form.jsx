import React, { Component } from 'react';
import { Button } from 'antd';
import CSSModules from 'react-css-modules';
import { SchemaForm, Item } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../../components/debounce-form-button';
import '@gem-mine/antd-schema-form/lib/fields';
import { fundsRecharge } from '../../../../services/apiService';
import styles from './recharge-form.less';
import Copy from './copy-text';

@CSSModules(styles, { allowMultiple: true })
class PlatRechargeForm extends Component {

  state = {
    btnLoading: false,
    formStep: true
  }

  rechargeForm = {
    applyRechargeAmount: {
      label: '充值金额',
      component: 'input',
      allowClear: true,
      placeholder: '请输入充值金额',
      addonAfter:'元',
      rules: {
        required: [true, '请输入充值金额'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '请正确输入充值金额!   (最高支持两位小数)';
          if (value <= 0) return '请正确输入充值金额!   (最高支持两位小数)';
        },
      }
    }
  }

  getRechargeCode = (value) => {
    this.setState({
      btnLoading: false
    });
    fundsRecharge(value).then(data => {
      const { financeRechargeEntity: { remittanceIdentificationCode }, logisticsBankAccountEntity: { invoiceTitle, bankAccount } } = data;
      this.setState({
        remittanceIdentificationCode,
        invoiceTitle,
        bankAccount,
        unPaid: data.financeRechargeEntities.length,
        btnLoading: true,
        formStep: false
      });
    });
  }

  copyDom = React.createRef()

  copy = () => {
    this.copyDom.current.select();
    document.execCommand("Copy");
  }

  render () {
    const { btnLoading, formStep, remittanceIdentificationCode = null, invoiceTitle = null, bankAccount = null, unPaid = 0 } = this.state;
    const { closeForm } = this.props;
    return (
      <>
        {formStep === true?
          <div styleName='from_box'>
            <SchemaForm schema={this.rechargeForm}>
              <Item field='applyRechargeAmount' />
              <div styleName='getRechargeCode_confirm_btn flex_right'>
                <Button styleName='mr10' onClick={closeForm}>取消</Button>
                <DebounceFormButton loading={btnLoading} label="确认" type="primary" onClick={this.getRechargeCode} />
              </div>
            </SchemaForm>
            {/* <h3>注意：</h3>
            <p>1. 受银行处理时间，线下汇款方式到账会有延误</p>
            <p>2. 线下汇款直接向平台的对公账户汇款，系统会将汇款直接匹配到您的易键达账户。</p>
            <p>3. 超出3个工作日未到账，请提供汇款识别码及汇款底单邮件至ejianda@dingshikj.com。</p> */}
          </div>
          :
          <div styleName='from_box'>
            <div styleName='account_info'>
              <Copy label='对公账号:' renderData={bankAccount} />
              <Copy label='账户名:' renderData={invoiceTitle} />
              <Copy label='开户行:' renderData='中信银行-成都武阳大道支行' />
            </div>
            <p styleName='red fw600'>汇款识别码：<input ref={this.copyDom} styleName='codeInput' readOnly type="text" value={remittanceIdentificationCode} /><a style={{ marginLeft: '10px', fontWeight: 'normal' }} onClick={this.copy}>复制</a></p>
            <p styleName='red fw600'>您的汇款识别码已发送到手机：{this.props.phone}</p>
            <p>注意事项：<span styleName='red'>汇款时需要注意以下信息，请牢记！</span></p>
            <p>1. 线下转账需将此汇款识别码填写至电汇凭证的【备注】等栏内。</p>
            <p>2. 线下转账汇款时备注汇款识别码，可确保充值单及时核销，请务必填写正确，勿私自增加其他文字说明。</p>
            <p styleName='mb_30'>3. 线下转账，一个识别码对应一个充值单和相应的金额，请勿多转账或者少转账。</p>
            <div styleName='know'>
              <Button size='large' type="primary" onClick={closeForm}>我知道了</Button>
            </div>
            <div styleName='unpaid_box'>
              <p>您当前还有<span styleName='count'>{unPaid}</span>笔充值记录未付款</p>
            </div>
          </div>
        }
      </>
    );
  }
}

export default PlatRechargeForm;
