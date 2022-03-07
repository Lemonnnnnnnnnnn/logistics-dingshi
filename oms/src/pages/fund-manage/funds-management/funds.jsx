import React, { Component } from 'react';
import { Button, Row, Col, Modal, Icon, message, notification } from 'antd';
import CSSModules from 'react-css-modules';
import { connect } from 'dva';
import router from 'umi/router';
import { SchemaForm, Item, FORM_MODE } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../components/debounce-form-button';
import '@gem-mine/antd-schema-form/lib/fields';
import model from '../../../models/userInvoice';
import GetSmsCode from '../../registered/get-sms-code';
import auth from '../../../constants/authCodes';
import Authorized from '../../../utils/Authorized';
import { changePaymentAuthorizationPhone, getShipmentVirtualAccount , getAuthorizationPhone } from '../../../services/apiService';
import { getUserInfo } from '../../../services/user';
import RechargeFrom from './component/recharge-form';
import styles from './funds.less';
import HeadForm from './component/head-form';
import AddressForm from './component/address-form';
import APPREF from './component/APPREF';

const {
  FUNDS_MANAGE_RECHARGE,
  FUNDS_MANAGE_FUND_RECORD,
  FUNDS_MANAGE_MODIFY,
  FUNDS_MANAGE_APPLY_REFUND
} = auth;

const { actions: { detailUserInvoice } } = model;

function mapStateToProps (state) {
  return {
    info: state.userInvoice.entity
  };
}

@connect(mapStateToProps, { detailUserInvoice })
@CSSModules(styles, { allowMultiple: true })
class Funds extends Component {
  state = {
    phoneFormMode: FORM_MODE.DETAIL,
    APPREFModal: false,
    rechargeFormStatus: false,
    dataInfo: {},
    paymentAuthorizationPhone: '-',
  }

  addressForm = {
    mailingAddress: {
      label: '邮寄地址:',
      component: 'input.textArea',
      rules: {
        required: [true, '请输入邮寄地址']
      },
      placeholder: '请输入邮寄地址'
    },
    recipientName: {
      label: '收件人:',
      component: 'input',
      rules: {
        required: [true, '请输入收件人名字']
      },
      placeholder: '请输入收件人名字'
    },
    recipientPhone: {
      label: '电话:',
      component: 'input',
      rules: {
        required: [true, '请输入电话号码']
      },
      placeholder: '请输入电话号码'
    },
    recipientEmail: {
      label: '邮箱:',
      component: 'input',
      rules: {
        required: [true, '请输入邮箱地址']
      },
      placeholder: '请输入邮箱地址'
    }
  }

  phoneForm = {
    phone: {
      label: '原手机号:',
      component: 'input',
      disabled: true
    },
    smsCode: {
      label: '短信验证码:',
      component: GetSmsCode,
      needCheckCode: false,
      smsType: 'CHANGE_PHONE',
      rules: {
        required: [true, '请输入短信验证码']
      },
      placeholder: '请输入短信验证码'
    },
    newPhone: {
      label: '新手机号:',
      component: 'input',
      rules: {
        required: [true, '请输入新手机号'],
        validator: ({ value }) => {
          const phone = /^1\d{10}$/;
          if (!phone.test(value)) {
            return '手机号格式错误';
          }
        }
      },
      placeholder: '请输入新手机号'
    },
    newPaymentAuthorizationPhone: {
      label: '确认新手机号:',
      component: 'input',
      rules: {
        required: [true, '请再次确认新手机号'],
        validator: ({ value }) => {
          const phone = /^1\d{10}$/;
          if (!phone.test(value)) {
            return '手机号格式错误';
          }
        }
      },
      placeholder: '请再次确认新手机号'
    }
  }

  componentDidMount () {
    this.props.detailUserInvoice().then(res => {
      this.setState({ dataInfo: { ...res.logisticsUserInvoiceEntity } });
    });
    getAuthorizationPhone().then(({ paymentAuthorizationPhone })=>{
      this.setState({paymentAuthorizationPhone })
    })
    getShipmentVirtualAccount({ virtualAccountType: 1 }).then(data => {
      const { virtualAccountBalance } = data;
      this.setState({
        virtualAccountBalance,
        ready: true
      });
    });
  }

  refresh = () =>{
    this.props.detailUserInvoice().then(res => {
      this.setState({ dataInfo: { ...res.logisticsUserInvoiceEntity } });
    });
  }

  showRechargeForm = () => {
    this.setState({
      rechargeFormStatus: true
    });
  }

  cancelRecharge = () => {
    this.setState({
      rechargeFormStatus: false
    });
  }

  editPhoneForm = () => {
    this.setState({
      phoneFormMode: FORM_MODE.MODIFY
    });
  }

  cancelEditPhoneForm = () => {
    this.setState({
      phoneFormMode: FORM_MODE.DETAIL
    });
  }

  changePhone = (data, form) => {
    if (data.newPaymentAuthorizationPhone !== data.newPhone) return message.error('两次输入的手机号不一致');
    if (data.phone === data.newPaymentAuthorizationPhone) return message.error('新手机号与原手机号相同');
    delete data.newPhone;
    data.oldPaymentAuthorizationPhone = data.phone;
    delete data.phone;
    changePaymentAuthorizationPhone(data)
      .then(() => {
        notification.success({
          message: '修改成功',
          description: '已成功修改授权人手机号'
        });
        this.refresh()
        // this.props.detailUserInvoice();
        this.setState({
          phoneFormMode: FORM_MODE.DETAIL
        });
      })
      .catch((error) => {
        const { setFields } = form;
        setFields({
          smsCode: {
            errors: [new Error(error.tips)]
          }
        });
      });
  }

  routerToFundRecord = () => {
    router.push('funds/fund-record');
  }

  showAPPREFModal = () => {
    this.setState({
      APPREFModal: true
    });
  }

  cancelAPPREFModal = (needRefresh) => {
    this.setState({
      APPREFModal: false
    });
    if (needRefresh) {
      getShipmentVirtualAccount({ virtualAccountType: 1 }).then(data => {
        const { virtualAccountBalance } = data;
        this.setState({
          virtualAccountBalance,
          ready:true
        });
      });
    }
  }

  render () {
    const { rechargeFormStatus, phoneFormMode, virtualAccountBalance, ready, APPREFModal, dataInfo, paymentAuthorizationPhone } = this.state;
    const { info } = this.props;
    const layout = {
      xs: { span: 20, offset: 4 },
      lg: { span: 6, offset: 1 }
    };
    return (
      ready&&
      <div className='funds_management_funds_box'>
        <div styleName='welcome'>欢迎您，<h2 styleName='who'>{getUserInfo().organizationName}</h2></div>
        <Row style={{ marginBottom: '100px', height: '350px' }}>
          <HeadForm refresh={this.refresh} formData={{ ...dataInfo }} layout={{ ...layout }} />
          <AddressForm refresh={this.refresh} formData={{ ...dataInfo }} layout={{ ...layout }} />
          <Col xs={{ span: 20, offset: 4 }} lg={{ span: 7, offset: 1 }}>
            <h4 styleName='formHead'>
              {phoneFormMode === FORM_MODE.MODIFY? '修改授权支付人账号': '授权支付人账号' }
              <Authorized authority={[FUNDS_MANAGE_MODIFY]}>
                <span styleName='edit_span' onClick={this.editPhoneForm}>
                  <Icon type="edit" /><span style={{ fontSize: '14px' }}>编辑</span>
                </span>
              </Authorized>
            </h4>
            {
              phoneFormMode === FORM_MODE.MODIFY?
                <SchemaForm hideRequiredMark layout='vertical' schema={this.phoneForm} data={{ phone: paymentAuthorizationPhone }} mode={phoneFormMode}>
                  <Item field="phone" />
                  <Item field="smsCode" />
                  <Item field="newPhone" />
                  <Item field="newPaymentAuthorizationPhone" />
                  <div styleName='button_box'>
                    <Button onClick={this.cancelEditPhoneForm} style={{ marginRight: '10px' }}>取消</Button>
                    <DebounceFormButton label="确定" type="primary" onClick={this.changePhone} />
                  </div>
                </SchemaForm>
                :
                <p>{paymentAuthorizationPhone}</p>
            }
          </Col>
        </Row>
        <Row styleName='pl30'>
          <h3>现金余额</h3>
          <span styleName='money'>{Number(virtualAccountBalance || 0).toFixed(2)._toFixed(2)}</span><span styleName='yuan'>元</span>
          <Authorized authority={[FUNDS_MANAGE_RECHARGE]}>
            <Button styleName='btn_margin' type='primary' onClick={this.showRechargeForm}>充值</Button>
          </Authorized>
          <Authorized authority={[FUNDS_MANAGE_FUND_RECORD]}>
            <Button onClick={this.routerToFundRecord}>收支记录</Button>
          </Authorized>
          <Authorized authority={[FUNDS_MANAGE_APPLY_REFUND]}>
            <Button style={{ marginLeft: '25px' }} onClick={this.showAPPREFModal}>申请提现</Button>
          </Authorized>
        </Row>
        <Modal visible={rechargeFormStatus} destroyOnClose width='400px' title="充值" onCancel={this.cancelRecharge} footer={null}>
          <RechargeFrom phone={paymentAuthorizationPhone} closeForm={this.cancelRecharge} />
        </Modal>
        <Modal visible={APPREFModal} width='700px' destroyOnClose title="申请提现" onCancel={this.cancelAPPREFModal} footer={null}>
          <APPREF maxMoney={Number(virtualAccountBalance || 0).toFixed(2)._toFixed(2)} logisticsUserInvoiceEntity={dataInfo} phone={paymentAuthorizationPhone} closeModal={this.cancelAPPREFModal} />
        </Modal>
      </div>
    );
  }
}

export default Funds;
