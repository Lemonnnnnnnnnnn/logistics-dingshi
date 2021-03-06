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
      label: '????????????',
      component: 'input.text',
    },
    phone: {
      label: '????????????',
      component: 'input.text',
    },
    idcardNo: {
      label: '????????????',
      component: 'input.text',
      placeholder: '?????????????????????',
    },
    bankAccount: {
      label: '????????????',
      component: 'input.text',
    },
    bankName: {
      label: '????????????',
      component: 'input.text',
    },
    cardUserName: {
      label: '???????????????',
      component: 'input.text',
    },
    licenseType: {
      label: ' ???????????????',
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
      label: '????????????',
      component: 'input.text',
    },
    licenseValidityDate: {
      label: '??????????????????',
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
      label: '?????????????????????',
      placeholder: '?????????????????????',
      format: {
        input: (value) => value ? moment(value) : undefined,
      },
      rules: {
        validator: ({ value, formData }) => {
          const { verifyStatus } = formData;
          if (verifyStatus && !value) {
            return '??????????????????????????????';
          }
        },
      },
    },
    remark: {
      label: <span>??????<span style={{ color: '#999', fontWeight: 400 }}>????????????</span></span>,
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
      label: '??????',
      component: 'radio',
      defaultValue: 1,
      options: [{
        key: 1,
        label: '??????',
        value: 1,
      }, {
        key: 0,
        label: '??????',
        value: 0,
      }],
      rules: {
        required: [true, '?????????????????????'],
      },
    },
    pass_reason: {
      label: '??????????????????',
      component: 'input.textArea',
      visible: Observer({
        watch: 'verifyStatus',
        action: verifyStatus => verifyStatus === PASS,
      }),
      keepAlive: false,
      placeholder: '???????????????',
      rules: {
        max: 500,
      },
    },
    reject_reason: {
      label: '????????????',
      component: 'input.textArea',
      visible: Observer({
        watch: 'verifyStatus',
        action: verifyStatus => verifyStatus === REJECT,
      }),
      keepAlive: false,
      placeholder: '?????????????????????',
      rules: {
        required: true,
        max: 500,
      },
    },
    qualificationNumber: {
      component: 'input.text',
      label: '??????????????????????????????',
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
        required: [true, '??????????????????'],
      },
    },
    bankAccount: {
      component: 'input',
      rules: {
        required: [true, '?????????????????????'],
        pattern: ['^[0-9]*$', '???????????????'],
        max: [19, '?????????????????????'],
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
              notification.error({ message: '????????????????????????????????????' });
              return '--';
            }
            this.setState({ city, province });
            return bankName;
          }
          return '--';
        },
      }),
      rules: {
        required: [true, '???????????????????????????????????????????????????'],
      },
    },
    smsCode: {
      component: 'input',
      label: '?????????',
      rules: {
        required: [true, '??????????????????'],
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
      return message.error('???????????????');
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
        if (!res) return message.error('????????????');
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
          notification.success({ message: '????????????', description: '????????????' });
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

      // ?????????????????????????????????????????????????????????????????????
      this.phone = res[2].phone;
      // ?????????????????????????????????
      const { entity: { bankAccountItems } } = this.props;
      this.setState({
        bankAccountItemsChoise: bankAccountItems[0] ? bankAccountItems[0].bankAccountId : -1,
        bankAccountItemsChoisePre: bankAccountItems[0] ? bankAccountItems[0].bankAccountId : -1,
      });

      // ????????????????????????????????????
      if (res[0].perfectStatus === 0) {
        this.setState({ allow: true });
      }
      this.setState({
        ready: true,
        event: res[1].items,
      });
    });

    // ???????????????
    const authLocal = JSON.parse(localStorage.getItem('authority'));
    this.modifyBankAccountPermission = authLocal.find(item => item.permissionCode === ADD_BANK_ACCOUNT);  // ???????????????????????????

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
      notification.success({ message: '?????????????????????????????????????????????????????????????????????' });
    });

  };

  handleChoiseBankAccount = (e) => {
    this.setState({ bankAccountItemsChoise: e.target.value });
    changeBankAccountStatus(e.target.value).then(() => notification.success({ message: '??????????????????????????????' }));
  };

  handleTurnToContract = () => {
    const { entity: { nickName }, location: { query: { userId } } } = this.props;
    if (userId && nickName.indexOf('*') !== -1) {
      // ?????????
      notification.open({ message: '????????????????????????????????????????????????' });
      this.setState({
        passwordModal: true,
      });
    } else {
      // ?????????
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
          title='????????????'
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
          >???????????????????????????????????????<a href='/userAgreement'>????????????????????????</a>??????????????????????????????????????????????????????????????????????????????
          </p>
          <div
            style={{ display: 'block', width: '50%', textAlign: 'center', margin: '40px auto 40px' }}
          >
            <Input
              type='password'
              placeholder='???????????????????????????'
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
                  ????????????
                  <Icon
                    onClick={this.showModal()}
                    title='???????????????????????????'
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
                '????????????'
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
            title='???????????????'
            colCount={1}
            extra={
              this.modifyBankAccountPermission ?
                <Button
                  style={{ float: 'right' }}
                  type='primary'
                  disabled={addBankAccountModal}
                  onClick={this.openBankAccountModal}
                >???????????????
                </Button> : null}
          >
            <Row style={{ height: '30px', lineHeight: '30px' }}>
              <Col span={1}>??????</Col>
              <Col span={2}>?????????</Col>
              <Col span={4}>????????????</Col>
              <Col span={4}>?????????</Col>
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
                  {!openTick ? <Button onClick={this.handleSendAuthsendsms}>???????????????</Button> :
                  <>
                    <div>???????????????????????????{this.userPhone}</div>
                    <div style={{ color: 'blue' }}>{secondsElapsed}s</div>
                  </>}
                </Col>
                <Button style={{ marginRight: '8px' }} onClick={this.closeBankAccountModal}>??????</Button>
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
          <FormCard title='????????????' colCount='3'>
            <Item {...formLayout} field='licenseType' />
            <Item {...formLayout} field='licenseNo' />
            <Item {...formLayout} field='licenseValidityDate' />
            <div>
              <div className='fw-bold'>???????????????????????????</div>
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
              <div className='fw-bold'>???????????????????????????</div>
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
              <div className='fw-bold'>?????????????????????????????????</div>
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
              <p style={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.85)' }}>????????????</p>
              <div
                style={{ color: '#1890FF', cursor: 'pointer' }}
                onClick={this.handleTurnToContract}
              >{`?????????-${nickName || ''}????????????`}
              </div>
            </div>
            <Item {...formLayout} field='remark' />
          </FormCard>
          <div styleName='certification_container'>
            <h3>?????????</h3>
            <Item field='driverCertificationCreateReqList' />
          </div>
          <FormCard title='????????????'>
            <Item {...formLayout} field='event' />
          </FormCard>
          {
            certificatePage
              ? (
                <FormCard title='????????????' colCount='2'>
                  <Item {...formLayout} field='verifyStatus' />
                  <Item {...formLayout} field='pass_reason' />
                  <Item {...formLayout} field='reject_reason' />
                </FormCard>
              )
              : null
          }
          <div />
          <div style={{ paddingRight: '20px', textAlign: 'right' }}>
            {detailPage && <Button className='mr-10' onClick={this.handleCancelBtnClick}>??????</Button>}
            {certificatePage &&
            <>
              <Button className='mr-10' onClick={this.handleCancelBtnClick}>??????</Button>
              <DebounceFormButton label='??????' type='primary' onError={this.test} onClick={this.handleSaveBtnClick} />
            </>}
          </div>
        </SchemaForm>
      </>
    );
  }

}
