import React, { useState, useEffect } from 'react';
import { FormCard, Item, Observer, SchemaForm } from "@gem-mine/antd-schema-form";
import { Button, Col, notification, Radio, Row } from "antd";
import DebounceFormButton from "@/components/DebounceFormButton";
import Authorized from '@/utils/Authorized';
import { ADD_BANK_ACCOUNT } from '@/constants/authCodes';
import SMSCODE_TYPE from "@/constants/SmsCode/SmsCode";
import {
  addBankAccount,
  changeBankAccountStatus,
  getAuthNotCode,
  getBankInfo,
  getUsersNow,
  getProjectsSimple
} from "@/services/apiService";

const bankAccountLayout = {
  labelCol: {
    span: 20,
  },
  wrapperCol: {
    span: 20,
  },
};


export default class AddBankCard extends React.Component {

  state = {
    bankAccountItems: [],
    addBankAccountModal: false,
    secondsElapsed: 60,
    openTick: false,
    bankAccountItemsChoise: -1,
    bankAccountItemsChoisePre: -1,
    city: '',
    province: '',
  };

  schemaBank = {
    nickName: {
      component: 'input',
      rules: {
        required: [true, '请输入持卡人'],
      },
    },
    bankAccount: {
      component: 'input',
      rules: {
        required: [true, '请输入银行卡号'],
        pattern: ['^[0-9]*$', '请输入数字'],
        max: [19, '请检查输入长度'],
      },
      defaultValue: '',
    },
    bankName: {
      component: 'input.text',
      value: Observer({
        watch: 'bankAccount',
        action: async (bankAccount) => {
          if (bankAccount.length >= 16) {
            const { province, city, bankName } = await getBankInfo({ bankAccount });

            if (!province || !city || !bankName) {
              notification.error({ message: '请检查银行账号是否正确！' });
              return '--';
            }
            this.setState({ city, province });
            return bankName;
          }
          return '--';
        },
      }),
      rules: {
        required: [true, '请在输入银行卡号后等待生成银行名称'],
      },
    },
    projectIdList: {
      component: 'select',
      showSearch: true,
      mode: "multiple",
      optionFilterProp: "children",
      // label: '关联项目（选填）',
      options: async () => {
        const { items } = await getProjectsSimple({ limit: 10000, offset: 0 });
        return items?.map(({ projectName, projectId }) => ({
          label: projectName,
          key: projectId,
          value: projectId
        }));
      }
    },
    smsCode: {
      component: 'input',
      label: '验证码',
      rules: {
        required: [true, '请输入验证码'],
      },
    },
    phone: {
      component: 'hide',
      defaultValue: this.phone,
    },
  };

  componentDidMount() {
    getUsersNow().then(res => {
      this.phone = res.phone;
      // const {  bankAccountItems } = this.props;
      const { bankAccountItems } = this.state;
      this.setState({
        bankAccountItemsChoise: bankAccountItems[0] ? bankAccountItems[0].bankAccountId : -1,
        bankAccountItemsChoisePre: bankAccountItems[0] ? bankAccountItems[0].bankAccountId : -1,
      });
    });


    // 银行卡权限
    const authLocal = JSON.parse(localStorage.getItem('ejd_authority'));
    this.modifyBankAccountPermission = authLocal.find(item => item.permissionCode === ADD_BANK_ACCOUNT);  // 修改单据、签收单号
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { bankAccountItems } = nextProps;
    // 当传入的type发生变化的时候，更新state
    if (bankAccountItems.length > prevState.bankAccountItems.length) {

      return {
        bankAccountItems,
      };
    }
    // 否则，对于state不进行任何操作
    return null;
  }


  componentWillUnmount() {
    clearInterval(this.interval);
  }

  openBankAccountModal = () => {
    const { addBankAccountModal, bankAccountItemsChoise } = this.state;
    this.setState({
      addBankAccountModal: !addBankAccountModal,
      bankAccountItemsChoise: -1,
      bankAccountItemsChoisePre: bankAccountItemsChoise,
    });
  };

  closeBankAccountModal = async () => {
    const { addBankAccountModal, bankAccountItemsChoisePre } = this.state;
    this.setState({
      addBankAccountModal: !addBankAccountModal,
      bankAccountItemsChoise: bankAccountItemsChoisePre,
    });
  };

  tick = () => {
    const { secondsElapsed, openTick } = this.state;
    if (secondsElapsed > 0) {
      this.setState({ secondsElapsed: secondsElapsed - 1 });
    } else {
      clearInterval(this.interval);
      this.setState({ secondsElapsed: 60, openTick: !openTick });
    }
  };

  handleSendAuthsendsms = () => {
    const { openTick } = this.state;
    const params = {
      phone: this.phone,
      template: SMSCODE_TYPE.BIND_BANK_ACCOUNT,
    };
    getAuthNotCode(params).then(() => {
      this.setState({ openTick: !openTick });
      this.interval = setInterval(() => this.tick(), 1000);
    });
  };

  handleAddBankAccount = ({ nickName, bankAccount, bankName, smsCode, projectIdList }) => {
    const { userId } = this.props;
    const { province, city } = this.state;

    const params = {
      nickName,
      bankAccount,
      bankName,
      province,
      city,
      driverUserId: userId,
      smsCodePhone: this.phone, smsCode,
      projectIdList
    };
    addBankAccount(params)
      .then(() => this.closeBankAccountModal())
      .then(() => {
        const { detailDrivers } = this.props;
        return detailDrivers({ userId });
      })
      .then(({ bankAccountItems }) => {
        // const { bankAccountItems } = this.props;
        this.setState({
          bankAccountItems,
          bankAccountItemsChoise: bankAccountItems[0].bankAccountId,
          bankAccountItemsChoisePre: bankAccountItems[0].bankAccountId,
        });
        notification.success({ message: '添加银行卡成功！已自动选用新银行卡作为收款账号' });
      });
  };

  handleChoiseBankAccount = (e) => {
    this.setState({ bankAccountItemsChoise: e.target.value });
    changeBankAccountStatus(e.target.value).then(() => notification.success({ message: '切换收款银行卡成功！' }));
  };


  render() {
    const {
      addBankAccountModal,
      secondsElapsed,
      openTick,
      bankAccountItemsChoise,
    } = this.state;
    const { bankAccountItems } = this.state;
    return (
      <FormCard
        title='银行卡信息'
        colCount={1}
        extra={
          this.modifyBankAccountPermission ?
            <Button
              style={{ float: 'right' }}
              type='primary'
              disabled={addBankAccountModal}
              onClick={this.openBankAccountModal}
            >添加银行卡
            </Button> : null}
      >
        <Row style={{ height: '30px', lineHeight: '30px' }}>
          <Col span={1}>收款</Col>
          <Col span={2}>持卡人</Col>
          <Col span={4}>银行卡号</Col>
          <Col span={2}>开户行</Col>
          <Col span={4}>关联项目（选填）</Col>
        </Row>

        {addBankAccountModal &&
          <Row style={{ height: '30px', lineHeight: '30px' }}>
            <SchemaForm schema={this.schemaBank}>
              <Col span={1}><Radio style={{ marginTop: '5px' }} checked /></Col>
              <Col span={2}><Item {...bankAccountLayout} field='nickName' /></Col>
              <Col span={4}><Item {...bankAccountLayout} field='bankAccount' /></Col>
              <Col span={2}><Item {...bankAccountLayout} field='bankName' /></Col>
              <Col span={4}><Item {...bankAccountLayout} field='projectIdList' /></Col>

              <Col span={4}><Item field='smsCode' /></Col>
              <Col span={4}>
                {!openTick ? <Button onClick={this.handleSendAuthsendsms}>发送验证码</Button> :
                <>
                  <div>已发送短信验证码至{this.userPhone}</div>
                  <div style={{ color: 'blue' }}>{secondsElapsed}s</div>
                </>}
              </Col>
              <Button style={{ marginRight: '8px' }} onClick={this.closeBankAccountModal}>取消</Button>
              <DebounceFormButton type='primary' onClick={this.handleAddBankAccount} />
            </SchemaForm>
          </Row>
        }

        <Radio.Group
          style={{ width: '100%' }}
          value={bankAccountItemsChoise}
          onChange={this.handleChoiseBankAccount}
        >
          {
            bankAccountItems && bankAccountItems.map((item, key) =>
              <Row style={{ height: '30px', lineHeight: '30px' }} key={item.bankAccountId}>
                <Col span={1}><Radio disabled={!this.modifyBankAccountPermission} value={item.bankAccountId} /></Col>
                <Col span={2}>{item.cardUserName || item.nickName}</Col>
                <Col span={4}>{item.bankAccount}</Col>
                <Col span={2}>{item.bankName}</Col>
                <Col span={4}>{item.bankAccountProjectAllResps?.map(project => project.projectName).join('，')}</Col>
              </Row>)
          }

        </Radio.Group>
      </FormCard>
    );
  }
}

