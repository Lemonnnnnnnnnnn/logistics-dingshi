import React, { Component } from 'react';
import { Col, Icon, Button, notification } from 'antd';
import { connect } from 'dva';
import { SchemaForm, Item, FORM_MODE } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../../components/debounce-form-button';
import '@gem-mine/antd-schema-form/lib/fields';
import auth from '../../../../constants/authCodes';
import Authorized from '../../../../utils/Authorized';
import { getUserInfo } from '../../../../services/user';
import { patchUserInvoices } from '../../../../services/apiService';
import { objectTrim } from '../../../../utils/utils';
import model from '../../../../models/userInvoice';

const {
  FUNDS_MANAGE_MODIFY
} = auth;

const { actions: { patchUserInvoice, detailUserInvoice } } = model;

@connect(null, { patchUserInvoice, detailUserInvoice })
class HeadForm extends Component {

  organizationType = getUserInfo().organizationType

  addressForm = {
    mailingAddress: {
      label: '邮寄地址:',
      component: 'input.textArea',
      rules: {
        required: [true, '请输入邮寄地址'],
        validator: ({ value }) => {
          if (!value.toString().trim()) {
            return '邮寄地址不能为空';
          }
        }
      },
      placeholder: '请输入邮寄地址'
    },
    recipientName: {
      label: '收件人:',
      component: 'input',
      rules: {
        required: [true, '请输入收件人名字'],
        validator: ({ value }) => {
          if (!value.toString().trim()) {
            return '名字不能为空';
          }
        }
      },
      placeholder: '请输入收件人名字'
    },
    recipientPhone: {
      label: '手机号:',
      component: 'input',
      rules: {
        required: [true, '请输入电话号码'],
        validator: ({ value }) => {
          const phone = /^1\d{10}$/;
          if (!phone.test(value)) {
            return '手机号格式错误';
          }
        }
      },
      placeholder: '请输入电话号码'
    },
    recipientEmail: {
      label: '邮箱:',
      component: 'input',
      rules: {
        required: [true, '请输入邮箱地址'],
        validator: ({ value }) => {
          const reg = /^\w+@[a-z0-9]+\.[a-z]{2,4}$/;
          if (!reg.test(value)) {
            return '邮箱地址格式错误';
          }
        }
      },
      placeholder: '请输入邮箱地址'
    }
  }

  state = {
    addressFormMode: FORM_MODE.DETAIL
  }

  editAddressForm = () => {
    this.setState({ addressFormMode: FORM_MODE.MODIFY });
  }

  cancelEditAddressForm = () => {
    this.setState({ addressFormMode: FORM_MODE.DETAIL });
  }

  changeAddress = (value) => {
    const { patchUserInvoice } = this.props;
    if (this.organizationType === 4) {
      patchUserInvoices({ ...objectTrim(value), updateType: 2 }).then(() => {
        notification.success({
          message: '修改成功',
          description:
            '修改发票邮寄地址成功!',
        });
        this.props.refresh()
        // this.props.detailUserInvoice();
        this.setState({
          addressFormMode: FORM_MODE.DETAIL
        });
      });
    } else {
      patchUserInvoice(objectTrim(value)).then(() => {
        notification.success({
          message: '修改成功',
          description:
            '修改发票邮寄地址成功!',
        });
        this.props.detailUserInvoice();
        this.setState({
          addressFormMode: FORM_MODE.DETAIL
        });
      });
    }
  }

  render () {
    const { formData, layout } = this.props;
    const { addressFormMode } = this.state;
    return (
      <Col {...layout}>
        <h4 style={{ fontWeight: 600, fontSize: '14px', margin: '0 0 10px 0px', height: '42px', lineHeight: '42px' }}>
          发票邮寄地址
          <Authorized authority={[FUNDS_MANAGE_MODIFY]}>
            <span style={{ display: 'inline-block', paddingLeft: '30px', fontSize: '24px', fontWeight: 'normal', cursor: 'pointer' }} onClick={this.editAddressForm}>
              <Icon type="edit" /><span style={{ fontSize: '14px' }}>编辑</span>
            </span>
          </Authorized>
        </h4>
        <SchemaForm layout='vertical' schema={this.addressForm} mode={addressFormMode} hideRequiredMark data={{ ...formData }}>
          <Item field="mailingAddress" />
          <Item field="recipientName" />
          <Item field="recipientPhone" />
          <Item field="recipientEmail" />
          {
            addressFormMode === FORM_MODE.MODIFY?
              <div style={{ marginTop: '20px', display: 'flex', padding: '0 20%', justifyContent: 'flex-end' }}>
                <Button onClick={this.cancelEditAddressForm} style={{ marginRight: '10px' }}>取消</Button>
                <DebounceFormButton label="保存" type="primary" onClick={this.changeAddress} />
              </div>
              :
              null
          }
        </SchemaForm>
      </Col>
    );
  }
}

export default HeadForm;
