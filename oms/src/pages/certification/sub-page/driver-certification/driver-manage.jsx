import React, { Component } from 'react';
import { SchemaForm, FormCard, FORM_MODE, Item, Observer } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import { connect } from 'dva';
import CssModule from 'react-css-modules';
import { notification, Button, message, Modal, Icon, Input, Radio, Row, Col } from 'antd';
import moment from 'moment';
import DebounceFormButton from '../../../../components/debounce-form-button';
import { CERTIFICATE_TYPE } from '../../../../constants/certification/certificationType';
import '@gem-mine/antd-schema-form/lib/fields';
import UploadFile from '../../../../components/upload/upload-file';
import Qualification from '../../../basic-setting/driver-manage/qualification';
import { encodePassword } from '../../../../utils/utils';
import auth from '../../../../constants/authCodes';
import {
  changeBankAccountStatus,
  getBankInfo,
  getUsersNow,
  getAuthNotCode,
  addBankAccount,
} from '../../../../services/apiService';
import SMSCODE_TYPE from '../../../../constants/SmsCode/SmsCode';
import DriverCertificationEvents from './driver-certification-events';
import styles from './driver-manage.less';

const { ADD_BANK_ACCOUNT } = auth;

const { DETAIL, ADD } = FORM_MODE;
const PASS = 1;
const REJECT = 0;
const formLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};

const bankAccountLayout = {
  labelCol: {
    span: 20,
  },
  wrapperCol: {
    span: 20,
  },
};

function mapStateToProps(state) {
  const { dictionaries : { items }, drivers : { entity } } = state;
  const licenseType = items.filter(item=>item.dictionaryType === 'license_type');

  return {
    entity,
    licenseType
  };
}

function mapDispatchToProps(dispatch) {
  return ({
    detailDrivers: (params) => dispatch({
      type: 'drivers/detailDrivers',
      payload: params,
    }),
    getCertificationEvents: (params) => dispatch({
      type: 'drivers/getCertificationEvents',
      payload: params,
    }),
    certificateDriver: (params) => dispatch({
      type: 'drivers/certificateDriver',
      payload: params,
    }),
    dispatch,
  });
}

@connect(mapStateToProps, mapDispatchToProps)
@CssModule(styles, { allowMultiple: true })
export default class DriverManage extends Component {

  state = {
    ready: false,
    passwordModal: false,
    addBankAccountModal: false,
    password: '',
    allow: false,
    secondsElapsed: 60,
    openTick: false,
    bankAccountItemsChoise: -1,
    bankAccountItemsChoisePre: -1,
    city: '',
    province: '',
  };

  endTime = '';

  schema = {
    nickName: {
      label: '司机姓名',
      component: 'input.text',
    },
    phone: {
      label: '联系电话',
      component: 'input.text',
    },
    idcardNo: {
      label: '身份证号',
      component: 'input.text',
      placeholder: '请输入身份证号',
    },
    bankAccount: {
      label: '银行卡号',
      component: 'input.text',
    },
    bankName: {
      label: '开户银行',
      component: 'input.text',
    },
    cardUserName: {
      label: '持卡人姓名',
      component: 'input.text',
    },
    licenseType: {
      label: ' 驾驶证类型',
      component: 'select.text',
      options: () => {
        const { licenseType } = this.props;
        const result = licenseType.map(item => ({
          value: Number(item.dictionaryCode),
          label: item.dictionaryName,
        }));
        return result;
      },
    },
    licenseNo: {
      label: '驾驶证号',
      component: 'input.text',
    },
    licenseValidityDate: {
      label: '驾驶证有效期',
      component: 'datePicker.text',
      format: {
        input: (value) => value ? moment(value) : undefined,
      },
    },
    licenseFrontDentryid: {
      colSpan: 8,
      component: UploadFile,
      props: {
        mode: FORM_MODE.DETAIL,
      },
      observer: Observer({
        watch: '*allow',
        action: allow => ({
          needAuthority: true,
          allow,
        }),
      }),
    },
    licenseViceDentryid: {
      colSpan: 8,
      component: UploadFile,
      props: {
        mode: FORM_MODE.DETAIL,
      },
      observer: Observer({
        watch: '*allow',
        action: allow => ({
          needAuthority: true,
          allow,
        }),
      }),
    },
    idcardFrontDentryid: {
      colSpan: 8,
      component: UploadFile,
      props: {
        mode: FORM_MODE.DETAIL,
      },
      observer: Observer({
        watch: '*allow',
        action: allow => ({
          needAuthority: true,
          allow,
        }),
      }),
    },
    idcardBackDentryid: {
      colSpan: 8,
      component: UploadFile,
      props: {
        mode: FORM_MODE.DETAIL,
      },
      observer: Observer({
        watch: '*allow',
        action: allow => ({
          needAuthority: true,
          allow,
        }),
      }),
    },
    driverFrontDentryid: {
      colSpan: 8,
      component: UploadFile,
      props: {
        mode: FORM_MODE.DETAIL,
      },
      observer: Observer({
        watch: '*allow',
        action: allow => ({
          needAuthority: true,
          allow,
        }),
      }),
    },
    qualificationFrontDentryid: {
      colSpan: 8,
      component: UploadFile,
      props: {
        mode: FORM_MODE.DETAIL,
      },
      observer: Observer({
        watch: '*allow',
        action: allow => ({
          needAuthority: true,
          allow,
        }),
      }),
    },
    qualificationValidityDate: {
      component: 'datePicker',
      label: '资格证有效日期',
      placeholder: '资格证有效日期',
      format: {
        input: (value) => value ? moment(value) : undefined,
      },
      rules: {
        validator: ({ value, formData }) => {
          const { verifyStatus } = formData;
          if (verifyStatus && !value) {
            return '请选择资格证有效日期';
          }
        },
      },
    },
    remark: {
      label: <span>备注<span style={{ color: '#999', fontWeight: 400 }}>（可选）</span></span>,
      component: 'input.textArea.text',
    },
    driverCertificationCreateReqList: {
      component: Qualification,
      addFunc: (func) => this.addFunc = func,
      props: {
        mode: FORM_MODE.DETAIL,
      },
      observer: Observer({
        watch: '*allow',
        action: allow => ({
          needAuthority: true,
          allow,
        }),
      }),
    },
    event: {
      component: DriverCertificationEvents,
    },
    verifyStatus: {
      label: '审核',
      component: 'radio',
      defaultValue: 1,
      options: [{
        key: 1,
        label: '通过',
        value: 1,
      }, {
        key: 0,
        label: '拒绝',
        value: 0,
      }],
      rules: {
        required: [true, '请选择审核状态'],
      },
    },
    pass_reason: {
      label: '备注（可选）',
      component: 'input.textArea',
      visible: Observer({
        watch: 'verifyStatus',
        action: verifyStatus => verifyStatus === PASS,
      }),
      keepAlive: false,
      placeholder: '请输入备注',
      rules: {
        max: 500,
      },
    },
    reject_reason: {
      label: '拒绝原因',
      component: 'input.textArea',
      visible: Observer({
        watch: 'verifyStatus',
        action: verifyStatus => verifyStatus === REJECT,
      }),
      keepAlive: false,
      placeholder: '请输入拒绝原因',
      rules: {
        required: true,
        max: 500,
      },
    },
    qualificationNumber: {
      component: 'input.text',
      label: '货物运输从业资格证号',
      value: Observer({
        watch: 'idcardNo',
        action: (idcardNo) => idcardNo,
      }),
    },
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

  showModal = (userId) => () => {
    this.userId = userId;
    this.setState({
      passwordModal: true,
    });
  };

  closePasswordModal = () => {
    this.setState({
      passwordModal: false,
      password: undefined,
    });
  };

  setPassword = e => {
    const password = e.target.value;
    this.setState({
      password,
    });
  };

  detailInfo = async () => {
    const { password } = this.state;
    if (!password.trim()) {
      return message.error('请输入密码');
    }
    const { dispatch, location: { query: { userId } } } = this.props;
    dispatch({
      type: 'drivers/detailInfo',
      payload: {
        userId,
        password: encodePassword(password.trim()),
      },
    })
      .then((res) => {
        if (!res) return message.error('密码错误');
        this.endTime = Date.parse(new Date()) + 180000;
        this.setState({ allow: true });
        this.closePasswordModal();
      });
  };

  handleCancelBtnClick = () => {
    router.push('/certification-center/driver');
  };

  handleSaveBtnClick = (value) => {
    const { entity: { userId }, certificateDriver } = this.props;
    const certificationEntity = {
      verifyObjectType: CERTIFICATE_TYPE.DRIVER,
      verifyObjectId: userId,
      verifyReason: value.reject_reason,
      verifyStatus: value.verifyStatus,
      qualificationValidityDate: value.qualificationValidityDate,
    };
    certificateDriver(certificationEntity)
      .then((data) => {
        if (data) {
          notification.success({ message: '操作成功', description: '审核成功' });
          router.push('/certification-center/driver');
        }
      });
  };

  componentDidMount() {
    const {
      location: { query: { userId } },
      detailDrivers,
      getCertificationEvents,
    } = this.props;

    Promise.all([
      detailDrivers({ userId }),
      getCertificationEvents(userId),
      getUsersNow(),
    ]).then(res => {

      // 记录当前用户的手机号，用于新增银行卡的短信校验
      this.phone = res[2].phone;
      // 初始化当前选择的银行卡
      const { entity: { bankAccountItems } } = this.props;
      this.setState({
        bankAccountItemsChoise: bankAccountItems[0] ? bankAccountItems[0].bankAccountId : -1,
        bankAccountItemsChoisePre: bankAccountItems[0] ? bankAccountItems[0].bankAccountId : -1,
      });

      // 数据都加载好了才允许加载
      if (res[0].perfectStatus === 0) {
        this.setState({ allow: true });
      }
      this.setState({
        ready: true,
        event: res[1].items,
      });
    });

    // 银行卡权限
    const authLocal = JSON.parse(localStorage.getItem('authority'));
    this.modifyBankAccountPermission = authLocal.find(item => item.permissionCode === ADD_BANK_ACCOUNT);  // 修改单据、签收单号

    this.timer = setInterval(() => {
      if (!this.endTime) return;
      if (this.endTime <= Date.parse(new Date())) {
        this.endTime = '';
        this.setState({ allow: false });
        const { location: { query: { userId } }, detailDrivers } = this.props;
        detailDrivers({ userId });
      }
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    clearInterval(this.interval);
  }

  test = ([error]) => {
    message.error(error);
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

  handleAddBankAccount = ({ nickName, bankAccount, bankName, smsCode }) => {
    const { location: { query: { userId } } } = this.props;
    const { province, city } = this.state;

    const params = {
      nickName, bankAccount, bankName, province, city, driverUserId: userId, smsCodePhone: this.phone, smsCode,
    };
    addBankAccount(params).then(() => {
      const { detailDrivers } = this.props;
      return detailDrivers({ userId });
    }).then(() => this.closeBankAccountModal()).then(() => {
      const { entity: { bankAccountItems } } = this.props;
      this.setState({
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

  handleTurnToContract = () => {
    const { entity: { nickName }, location: { query: { userId } } } = this.props;
    if (userId && nickName.indexOf('*') !== -1) {
      // 未解锁
      notification.open({ message: '请在解密数据后再点击一次查看合同' });
      this.setState({
        passwordModal: true,
      });
    } else {
      // 已解锁
      router.push('/contract');
    }
  };

  render() {
    const { entity, entity: { nickName, bankAccountItems }, location } = this.props;
    const {
      ready,
      event,
      password,
      passwordModal,
      allow,
      addBankAccountModal,
      secondsElapsed,
      openTick,
      bankAccountItemsChoise,
    } = this.state;
    const detailPage = location.pathname.endsWith('detail');
    const certificatePage = location.pathname.endsWith('certificate');
    const modifyPage = location.pathname.endsWith('modify');
    entity.driverCertificationCreateReqList = entity.driverCertificationEntities;
    return (
      ready
      &&
      <>
        <Modal
          title='查看详情'
          width={800}
          maskClosable={false}
          destroyOnClose
          visible={passwordModal}
          onCancel={this.closePasswordModal}
          onOk={this.detailInfo}
        >
          <p style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            'fontSize': '14px',
            color: '#999',
            margin: '30px auto',
          }}
          >严格遵守公司信息网络管理及<a href='/userAgreement'>《用户使用协议》</a>，不得将公司信息网络他人个人信息以任何形式向外界泄露
          </p>
          <div
            style={{ display: 'block', width: '50%', textAlign: 'center', margin: '40px auto 40px' }}
          >
            <Input
              type='password'
              placeholder='请输入您的登录密码'
              autoComplete='new-password'
              onChange={this.setPassword}
              value={password}
            />
          </div>
        </Modal>
        <SchemaForm
          // {...this.props}
          data={{
            ...entity,
            event,
            cardUserName: bankAccountItems[0] ? bankAccountItems[0].nickName : '--',
            bankAccount: bankAccountItems[0] ? bankAccountItems[0].bankAccount : '--',
            bankName: bankAccountItems[0] ? bankAccountItems[0].bankName : '--',
          }}
          schema={this.schema}
          layout='horizontal'
          trigger={{ allow }}
          mode={detailPage ? DETAIL : ADD}
        >
          <FormCard
            title={
              this.props.location.query.userId && entity?.nickName?.indexOf('*') !== -1 ?
                <>
                  基础信息
                  <Icon
                    onClick={this.showModal()}
                    title='点击可查看全部信息'
                    style={{
                      cursor: 'pointer',
                      fontSize: '20px',
                      marginTop: '3px',
                      marginLeft: '6px',
                      color: '#1890FF',
                    }}
                    type='lock'
                  />
                </>
                :
                '基础信息'
            }
            colCount='3'
          >
            <Item {...formLayout} field='phone' />
            <Item {...formLayout} field='nickName' />
            <Item {...formLayout} field='idcardNo' />
            <Item {...formLayout} field='bankAccount' />
            <Item {...formLayout} field='bankName' />
            <Item {...formLayout} field='cardUserName' />
          </FormCard>
          {modifyPage &&
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
              <Col span={4}>开户行</Col>
            </Row>

            {addBankAccountModal &&
            <Row style={{ height: '30px', lineHeight: '30px' }}>
              <SchemaForm schema={this.schemaBank}>
                <Col span={1}><Radio style={{ marginTop: '5px' }} checked /></Col>
                <Col span={2}><Item {...bankAccountLayout} field='nickName' /></Col>
                <Col span={4}><Item {...bankAccountLayout} field='bankAccount' /></Col>
                <Col span={4}><Item {...bankAccountLayout} field='bankName' /></Col>
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
                bankAccountItems && bankAccountItems.map(item =>
                  <Row style={{ height: '30px', lineHeight: '30px' }} key={item.bankAccountId}>
                    <Col span={1}><Radio disabled={!this.modifyBankAccountPermission} value={item.bankAccountId} /></Col>
                    <Col span={2}>{item.nickName}</Col>
                    <Col span={4}>{item.bankAccount}</Col>
                    <Col span={4}>{item.bankName}</Col>
                  </Row>)
              }

            </Radio.Group>
          </FormCard>
          }
          <FormCard title='详细信息' colCount='3'>
            <Item {...formLayout} field='licenseType' />
            <Item {...formLayout} field='licenseNo' />
            <Item {...formLayout} field='licenseValidityDate' />
            <div>
              <div className='fw-bold'>上传司机驾驶证照片</div>
              <Item
                {...formLayout}
                className='formControl'
                field='licenseFrontDentryid'
                style={{ display: 'inline-block' }}
              />
              <Item
                {...formLayout}
                className='formControl'
                field='licenseViceDentryid'
                style={{ display: 'inline-block' }}
              />
            </div>
            <div>
              <div className='fw-bold'>上传司机身份证照片</div>
              <Item
                {...formLayout}
                className='formControl'
                field='idcardFrontDentryid'
                style={{ display: 'inline-block' }}
              />
              <Item
                {...formLayout}
                className='formControl'
                field='idcardBackDentryid'
                style={{ display: 'inline-block' }}
              />
            </div>
            <div>
              <div className='fw-bold'>上传货物运输从业资格证</div>
              <div>
                <Item
                  {...formLayout}
                  className='formControl'
                  field='qualificationFrontDentryid'
                  style={{ display: 'inline-block' }}
                />
              </div>
              <Item
                {...formLayout}
                className='formControl'
                field='qualificationNumber'
                style={{ display: 'inline-block' }}
              />
              <Item
                {...formLayout}
                className='formControl'
                field='qualificationValidityDate'
                style={{ display: 'inline-block' }}
              />
            </div>
            <div>
              <p style={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.85)' }}>承运合同</p>
              <div
                style={{ color: '#1890FF', cursor: 'pointer' }}
                onClick={this.handleTurnToContract}
              >{`易键达-${nickName || ''}承运合同`}
              </div>
            </div>
            <Item {...formLayout} field='remark' />
          </FormCard>
          <div styleName='certification_container'>
            <h3>资格证</h3>
            <Item field='driverCertificationCreateReqList' />
          </div>
          <FormCard title='审核记录'>
            <Item {...formLayout} field='event' />
          </FormCard>
          {
            certificatePage
              ? (
                <FormCard title='审核信息' colCount='2'>
                  <Item {...formLayout} field='verifyStatus' />
                  <Item {...formLayout} field='pass_reason' />
                  <Item {...formLayout} field='reject_reason' />
                </FormCard>
              )
              : null
          }
          <div />
          <div style={{ paddingRight: '20px', textAlign: 'right' }}>
            {detailPage && <Button className='mr-10' onClick={this.handleCancelBtnClick}>返回</Button>}
            {certificatePage &&
            <>
              <Button className='mr-10' onClick={this.handleCancelBtnClick}>取消</Button>
              <DebounceFormButton label='保存' type='primary' onError={this.test} onClick={this.handleSaveBtnClick} />
            </>}
          </div>
        </SchemaForm>
      </>
    );
  }

}
