import React, { Component } from 'react';
import { SchemaForm, FormCard, FORM_MODE, Item, Observer } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import { connect } from 'dva';
import CssModule from 'react-css-modules';
import { notification, Button, message, Modal, Icon, Input } from 'antd';
import moment from 'moment';
import DebounceFormButton from '@/components/DebounceFormButton';
import { CERTIFICATE_TYPE } from '@/constants/certification/certificationType';
import '@gem-mine/antd-schema-form/lib/fields';
import UploadFile from '@/components/Upload/UploadFile';
import Qualification from '@/components/Qualification/Qualification';
import {  encodePassword } from "@/utils/utils";
import DriverCertificationEvents from './DriverCertificationEvents';
import styles from './DriverManage.less';
import AddBankCard from "@/components/AddBankCard";

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
    password: '',
    allow: false,
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
    },
    idCardAddress: {
      label: '住址',
      component: 'input.text',
    },
    idIssuingAuthority: {
      label: "签发机关",
      component: 'input.text',
    },
    idValidityDate: {
      label: "有效期",
      component: 'input.text',
    },
    idCardSex: {
      label: "性别",
      component: "input.text",
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
      component: 'input.text',
      // format: {
      //   input: (value) => value ? moment(value) : undefined,
      // },
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
      component: 'input.text',
      label: '资格证有效日期',
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
      // qualificationValidityDate: value.qualificationValidityDate,
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
    ]).then(res => {
      // 数据都加载好了才允许加载
      this.setState({ allow: res[0].show });

      if (res[0].perfectStatus === 0) {
        this.setState({ allow: true });
      }
      this.setState({
        ready: true,
        event: res[1].items,
      });
    });


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
    const { entity, entity: { nickName, bankAccountItems, licenseValidityType, idCardSex : _idCardSex, idValidityDate, licenseValidityDate : _licenseValidityDate, qualificationValidityDate }, location } = this.props;
    let licenseValidityDate;
    let idCardSex;

    if (licenseValidityType === 2){
      licenseValidityDate = '长期';
    }
    if (_licenseValidityDate){
      licenseValidityDate = moment(_licenseValidityDate).format('YYYY/MM/DD');
    }

    if (_idCardSex === 1){
      idCardSex = '男';
    } else if (_idCardSex === 2){
      idCardSex = '女';
    } else {
      idCardSex = '--';
    }

    const {
      ready,
      event,
      password,
      passwordModal,
      allow,
    } = this.state;
    const detailPage = location.pathname.endsWith('detail');
    const certificatePage = location.pathname.endsWith('certificate');
    const modifyPage = location.pathname.endsWith('modifyBankCard');
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
            licenseValidityDate,
            idCardSex,
            idValidityDate : idValidityDate ? moment(idValidityDate).format('YYYY/MM/DD') : '--',
            qualificationValidityDate : qualificationValidityDate ? moment(qualificationValidityDate).format('YYYY/MM/DD') : '--',
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
              this.props.location.query.userId && !entity?.show ?
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
          <AddBankCard
            userId={this.props.location.query.userId}
            detailDrivers={this.props.detailDrivers}
            bankAccountItems={bankAccountItems}
          />
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
              <Item {...formLayout} field='idCardSex' />
              <Item {...formLayout} field='idCardAddress' />
              <Item {...formLayout} field='idIssuingAuthority' />
              <Item {...formLayout} field="idValidityDate" />
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
                style={{ display: 'inline-block', width : '100%' }}
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
