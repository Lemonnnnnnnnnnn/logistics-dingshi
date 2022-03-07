import React, { Component } from 'react';
import { Button, Modal, notification } from 'antd';
import { connect } from 'dva';
import CSSModules from 'react-css-modules';
import { SchemaForm, Item } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../components/debounce-form-button';
import '@gem-mine/antd-schema-form/lib/fields';
import model from '../../models/bankInvoice';
import styles from './bank-manage.less';
import AccountList from './component/account-list';

function mapStateToProps (state) {
  return {
    dataList: state.bankAccount.items
  };
}

const { actions: { getBankAccount, postBankAccount } } = model;

@connect(mapStateToProps, { getBankAccount, postBankAccount })
@CSSModules(styles, { allowMultiple: true })
export default class BankManage extends Component{
  title = ''

  formSchema = {
    invoiceTitle: {
      label: '账户名称',
      component: 'input',
      rules: {
        required: [true, '请输入账户名称'],
        validator: ({ value }) => {
          if (!value.toString().trim()) {
            return '账户名称不能为空';
          }
        }
      },
      placeholder: '请输入账户名称'
    },
    invoiceNo: {
      label: '发票税号',
      component: 'input',
      rules: {
        required: [true, '请输入发票税号'],
        pattern: /^[^_IOZSVa-z\W]{2}\d{6}[^_IOZSVa-z\W]{10}$/
      },
      placeholder: '请输入发票税号'
    },
    bankName: {
      label: '开户行',
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
      label: '银行账号',
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
    visible: false
  }

  showModal = (e) => {
    const cardAccountType = Number(e.target.getAttribute('bankaccounttype'));
    this.formData = {
      cardAccountType
    };
    this.title = cardAccountType? '新增备付金账户': '新增对公账户';
    this.setState({
      visible: true
    });
  }

  handleCancel = () => {
    this.setState({
      visible: false
    });
  }

  saveBankInfo = (formData) => {
    const params = { ...this.formData, ...formData };
    const { postBankAccount } = this.props;
    postBankAccount(params).then( data => {
      notification.success({
        message: `新增成功`,
        description:
          `新增${!Number(data.cardAccountType)?'对公账户': '备付金账户'}成功`,
      });
      this.handleCancel();
      this.props.getBankAccount({ limit: 1000, offset: 0 });
    });
  }

  componentDidMount () {
    const { getBankAccount } = this.props;
    getBankAccount({ limit: 1000, offset: 0 });
  }

  render () {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    const { visible } = this.state;
    const { dataList = [] } = this.props;
    const businessAccount = dataList.filter(item => item.cardAccountType === 1);
    const provisionsAccount = dataList.filter(item => item.cardAccountType === 2);
    return (
      <>
        <div styleName='title'>
          <span>对公账户信息</span>
        </div>
        <AccountList dataList={[...businessAccount]} />
        <div styleName='title'>
          <span>备付金账户信息</span>
        </div>
        <AccountList dataList={[...provisionsAccount]} />
        <Modal
          destroyOnClose
          maskClosable={false}
          visible={visible}
          title={this.title}
          onCancel={this.handleCancel}
          footer={null}
        >
          <SchemaForm layout='vertical' {...formItemLayout} schema={this.formSchema} data={{ ...this.formData }}>
            <Item field="invoiceTitle" />
            <Item field="invoiceNo" />
            <Item field="bankName" />
            <Item field="bankAccount" />
            <div styleName="button_box">
              <Button style={{ marginRight: '20px' }} onClick={this.handleCancel}>取消</Button>
              <DebounceFormButton label="保存" type="primary" onClick={this.saveBankInfo} />
            </div>
          </SchemaForm>
        </Modal>
      </>
    );
  }
}
