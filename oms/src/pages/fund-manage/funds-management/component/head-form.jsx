import React, { Component } from 'react';
import { Col, Icon, Button, notification } from 'antd';
import { connect } from 'dva';
import { SchemaForm, Item, FORM_MODE } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../../components/debounce-form-button';
import auth from '../../../../constants/authCodes';
import Authorized from '../../../../utils/Authorized';
import '@gem-mine/antd-schema-form/lib/fields';
import { patchUserInvoices } from '../../../../services/apiService';
import { getUserInfo } from '../../../../services/user';
import { objectTrim } from '../../../../utils/utils';
import model from '../../../../models/userInvoice';

const { actions: { detailUserInvoice } } = model;

const {
  FUNDS_MANAGE_MODIFY
} = auth;

@connect(null, { detailUserInvoice, patchUserInvoices })
class HeadForm extends Component {
  organizationType = getUserInfo().organizationType

  infoForm = {
    invoiceTitle: {
      label: '发票抬头:',
      component: 'input',
      rules: {
        required: [true, '请输入发票抬头'],
        validator: ({ value }) => {
          if (!value.toString().trim()) {
            return '发票抬头不能为空';
          }
        }
      },
      placeholder: '请输入发票抬头'
    },
    invoiceNo: {
      label: '发票税号:',
      component: 'input',
      rules: {
        required: [true, '请输入发票税号'],
        validator: ({ value }) => {
          const reg = /^[^_IOZSVa-z\W]{2}\d{6}[^_IOZSVa-z\W]{10}$/;
          if (!reg.test(value)) {
            return '发票税号输入错误';
          }
        }
      },
      placeholder: '请输入发票税号'
    },
    openingBank: {
      label: '开户行:',
      component: 'input',
      rules: {
        required: [true, '请输入开户行'],
        validator: ({ value }) => {
          if (!value.toString().trim()) {
            return '开户行不能为空';
          }
        }
      },
      placeholder: '请输入开户行'
    },
    bankAccount: {
      label: '银行账号:',
      component: 'input',
      rules: {
        required: [true, '请输入银行账号'],
        validator: ({ value }) => {
          const reg = /^[0-9]*$/;
          if (!reg.test(value)) {
            return '银行账号由数字构成';
          }
        }
      },
      placeholder: '请输入银行账号'
    }
  }

  state = {
    headFormMode: FORM_MODE.DETAIL
  }

  editHeadForm = () => {
    this.setState({ headFormMode: FORM_MODE.MODIFY });
  }

  cancelEditHeadForm = () => {
    this.setState({ headFormMode: FORM_MODE.DETAIL });
  }

  changeHead = value => {
    patchUserInvoices({ ...objectTrim(value), updateType: 1 }).then(() => {
      notification.success({
        message: '修改成功',
        description:
          '修改发票抬头信息成功!',
      });
      // this.props.detailUserInvoice();
      this.props.refresh()
      this.setState({
        headFormMode: FORM_MODE.DETAIL
      });
    });
  }

  render () {
    const { formData, layout } = this.props;
    const { headFormMode } = this.state;
    return (
      <Col height='350px' {...layout}>
        <h4 style={{ fontWeight: 600, fontSize: '14px', margin: '0 0 10px 0px', height: '42px', lineHeight: '42px' }}>
          发票抬头信息
          {
            this.organizationType === 4?
              <Authorized authority={[FUNDS_MANAGE_MODIFY]}>
                <span style={{ display: 'inline-block', paddingLeft: '30px', fontSize: '24px', fontWeight: 'normal', cursor: 'pointer' }} onClick={this.editHeadForm}>
                  <Icon type="edit" /><span style={{ fontSize: '14px' }}>编辑</span>
                </span>
              </Authorized>
              :
              null
          }
        </h4>
        <SchemaForm hideRequiredMark layout='vertical' schema={this.infoForm} mode={headFormMode} data={{ ...formData }}>
          <Item field="invoiceTitle" />
          <Item field="invoiceNo" />
          <Item field="openingBank" />
          <Item field="bankAccount" />
          {
            headFormMode === FORM_MODE.MODIFY?
              <div style={{ marginTop: '20px', display: 'flex', padding: '0 20%', justifyContent: 'flex-end' }}>
                <Button onClick={this.cancelEditHeadForm} style={{ marginRight: '10px' }}>取消</Button>
                <DebounceFormButton label="保存" type="primary" onClick={this.changeHead} />
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
