import React, { Component } from 'react';
import {  notification, Button, message, Icon, Row, Col } from 'antd';
import router from 'umi/router';
import moment from 'moment';
import CssModule from 'react-css-modules';
import { connect } from 'dva';
import { SchemaForm, Item, FormCard, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import {  disableDateBeforeToday, getLocal } from '@/utils/utils';
import {   getCertificationEvents, getOcrIdCard, getOcrDrivingLicense, patchUser } from "@/services/apiService";
import '@gem-mine/antd-schema-form/lib/fields';
import DebounceFormButton from '@/components/DebounceFormButton';
import UploadFile from '@/components/Upload/UploadFile';
import UploadText from '@/components/Upload/UploadText';
import OwnModal from '@/components/Modal';
import Qualification from '@/components/Qualification/Qualification';
import AddBankCard from '@/components/AddBankCard';
import styles from './DriverEdit.less';
import DriverCertificationEvents from "@/pages/certification/subPage/DriverCertification/DriverCertificationEvents";
import { getUserInfo } from "@/services/user";
import { getDriverStatus } from '@/constants/driver/driver';


function mapStateToProps(state) {
  const { dictionaries : { items }, drivers : { entity } } = state;
  const licenseType = items.filter(item=>item.dictionaryType === 'license_type');
  return {
    driverInfo: { ...entity },
    commonStore: state.commonStore,
    licenseType
  };
}

const layout = {
  wrapperCol: {
    md: { span: 8 },
  },
};

function mapDispatchToProps(dispatch) {
  return ({
    detailDrivers: (params) => dispatch({
      type: 'drivers/detailDrivers',
      payload: params,
    }),
    postDrivers: (params) => dispatch({
      type: 'drivers/postDrivers',
      payload: params,
    }),
    patchDrivers: (params) => dispatch({
      type: 'drivers/patchDrivers',
      payload: params,
    }),
    getCertificationEvents: (params) => dispatch({
      type: 'drivers/getCertificationEvents',
      payload: params,
    }),
    deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload }),
    dispatch,
  });
}

@connect(mapStateToProps, mapDispatchToProps)
@CssModule(styles, { allowMultiple: true })
export default class AddDriver extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = this.currentTab && getLocal(this.currentTab.id) || { formData: {} };

  organizationType = getUserInfo().organizationType

  form = null;

  certified = false

  constructor(props) {
    super(props);
    const { location: { query: {  mode } } } = props;
    this.state = {
      mode: FORM_MODE.MODIFY,
      isClick: false,
      noClicking: false,
      ready: false,
      loading: false,
      allow: false,
    };

    this.endTime = '';

    this.cardInfo = {};

    this.schema = {
      phone: {
        label: <span>联系电话<span style={{ color: '#999', fontWeight: 400 }}>（将用于生成司机的登陆账号）</span></span>,
        component: 'input',
        placeholder: '请输入联系电话',
        name: '手机号',
        readOnly: true,
        disabled: Observer({
          watch: '*isClick',
          action: isClick => isClick,
        }),
        observer: Observer({
          watch: '*localData',
          action: (itemValue, { form }) => {
            if (this.form !== form) {
              this.form = form;
            }
            return { };
          }
        }),
      },
      nickName: {
        label: '司机姓名',
        component: 'input',
        placeholder: '请输入司机名称',
        readOnly: true,
        disabled: Observer({
          watch: '*isClick',
          action: isClick => isClick,
        }),
      },
      idcardNo: {
        label: '身份证号',
        component: 'input',
        placeholder: '请输入身份证号',
        readOnly: true,
        disabled: Observer({
          watch: '*isClick',
          action: isClick => isClick,
        }),
      },
      cardUserName: {
        label: '持卡人姓名',
        component: 'input',
        placeholder: '请输入持卡人姓名',
      },

      licenseType: {
        label: '驾驶证类型',
        component: Observer({
          watch: '*mode',
          action: mode => mode === FORM_MODE.DETAIL ? 'select.text' : 'select',
        }),
        placeholder: '请选择驾驶证类型',
        rules: {
          required: true,
        },
        options: () => {
          const { licenseType } = this.props;
          const result = licenseType.map(item => ({
            key: Number(item.dictionaryCode),
            value: Number(item.dictionaryCode),
            label: item.dictionaryName,
          }));
          return result;
        },
      },
      licenseNo: {
        label: '驾驶证号',
        component: 'input',
        placeholder: '请输入驾驶证号',
        rules: {
          required: [true, '请输入驾驶证号'],
        },
      },
      idCardAddress: {
        label: '住址',
        component: 'input',
        placeholder: '请输入住址',
      },
      idIssuingAuthority: {
        label: "签发机关",
        component: 'input',
        placeholder: '请输入签发机关',
      },
      idValidityDate: {
        label: "有效期",
        component: 'datePicker',
        placeholder: '请选择有效期',
        // renderExtraFooter : ()=> <Button size='small' type='ghost'>长期</Button>,
        disabledDate: disableDateBeforeToday,
        format: {
          input: (value) => value ? moment(value) : undefined,
        },
      },
      idCardSex: {
        label: "性别",
        component: "radio",
        options: [
          {
            label: "男",
            value: 1,
            key: 1
          },
          {
            label: "女",
            value: 2,
            key: 2
          }
        ]
      },
      licenseValidityType: {
        label: "驾驶证有效期",
        component: "radio",
        rules: {
          required: [true, "请选择有效期类型"]
        },
        options: [
          {
            label: "长期",
            value: 2,
            key: 2
          },
          {
            label: "固定期限",
            value: 1,
            key: 1
          }
        ]
      },
      licenseValidityDate: {
        component: 'datePicker',
        keepAlive: false,
        props: {
          showSearch: true,
          optionFilterProp: "label"
        },
        format: {
          input: (value) => value ? moment(value) : undefined
        },
        visible: Observer({
          watch: "licenseValidityType",
          action: licenseValidityType => (
            licenseValidityType === 1
          )
        }),
        rules: { required: [true, "请选择有效期"] },
        placeholder: '请选择有效期',
        disabledDate: disableDateBeforeToday,
      },
      licenseFrontDentryid: {
        component: UploadFile,
        labelUpload: '驾驶证正面（头像面）',
        rules: {
          required: [true, '驾驶证正面（头像面）'],
        },
        props: {
          saveIntoBusiness: true,
          removeFile: () => {
            const { entity } = this.state;
            this.setState({ entity: {
              ...this.localData.formData || {},
              ...entity,
              ...this.form.getFieldsValue(),
              licenseNo: undefined,
              licenseType: undefined,
              licenseValidityDate: undefined,
              licenseValidityType: undefined,
            } });
          },
          afterUpload: (drivingLicenseDentryId) => {
            getOcrDrivingLicense({ drivingLicenseDentryId }).then(res => {
              const { entity } = this.state;
              const { quasiDrivingType, drivingLicenseNumber, termOfValidity } = res;
              const { licenseType } = this.props;
              this.setState({ entity: {
                ...this.localData.formData || {},
                ...entity,
                ...this.form.getFieldsValue(),
                licenseNo: drivingLicenseNumber,
                licenseType: quasiDrivingType && Number(licenseType.find(item => item.dictionaryName === quasiDrivingType).dictionaryCode),
                licenseValidityType: termOfValidity === '长期' ? 2 : 1,
                licenseValidityDate: !termOfValidity || termOfValidity === '长期' ? undefined : moment(termOfValidity),
              } });
            });
          }
        },
        observer: Observer({
          watch: '*allow',
          action: allow => ({
            needAuthority: mode === FORM_MODE.DETAIL,
            mode,
            allow,
          }),
        }),
      },
      licenseViceDentryid: {
        component: UploadFile,
        labelUpload: '驾驶证副页（记录面）',
        rules: {
          required: [true, '请上传驾驶证副页（记录面）'],
        },
        props: {
          saveIntoBusiness: true,
        },
        observer: Observer({
          watch: '*allow',
          action: allow => ({
            needAuthority: mode === FORM_MODE.DETAIL,
            mode,
            allow,
          }),
        }),
      },
      idcardFrontDentryid: {
        component: UploadFile,
        labelUpload: '身份证正面（头像面）',
        rules: {
          required: [true, '请上传身份证正面（头像面）'],
        },
        props: {
          saveIntoBusiness: true,
          removeFile: () => {
            const { entity } = this.state;
            this.setState({ entity: {
              ...this.localData.formData || {},
              ...entity,
              ...this.form.getFieldsValue(),
              idCardSex: undefined,
              idCardAddress: undefined,
            } });
          },
          afterUpload: (idCardDentryId) => {
            getOcrIdCard({ idCardDentryId, idCardSide: 'front' }).then(res => {
              const { entity } = this.state;
              const { sex, address } = res;
              let idCardSex;
              switch (sex) {
                case '男':
                  idCardSex = 1;
                  break;
                case '女':
                  idCardSex = 2;
                  break;
                default:
                  idCardSex = undefined;
              }
              this.setState({ entity: {
                ...this.localData.formData || {},
                ...entity,
                ...this.form.getFieldsValue(),
                idCardSex,
                idCardAddress: address,
              } });
            });
          }
        },
        observer: Observer({
          watch: '*allow',
          action: allow => ({
            needAuthority: mode === FORM_MODE.DETAIL,
            mode,
            allow,
          }),
        }),
      },
      idcardBackDentryid: {
        component: UploadFile,
        labelUpload: '身份证反面（国徽面）',
        rules: {
          required: [true, '请上传身份证反面（国徽面）'],
        },
        props: {
          saveIntoBusiness: true,
          removeFile: () => {
            const { entity } = this.state;
            this.setState({ entity: {
              ...this.localData.formData || {},
              ...entity,
              ...this.form.getFieldsValue(),
              idIssuingAuthority: undefined,
              idValidityDate: undefined,
            } });
          },
          afterUpload: (idCardDentryId) => {
            getOcrIdCard({ idCardDentryId,  idCardSide: 'back'  }).then(res => {
              const { entity } = this.state;
              const { issuingAuthority, expiryDate } = res;
              this.setState({ entity: {
                ...this.localData.formData || {},
                ...entity,
                ...this.form.getFieldsValue(),
                idIssuingAuthority: issuingAuthority,
                idValidityDate: expiryDate ? moment(expiryDate) : undefined,
                // idValidityDate : moment(expiryDate)
              } });
            });
          }
        },
        observer: Observer({
          watch: '*allow',
          action: allow => ({
            needAuthority: mode === FORM_MODE.DETAIL,
            mode,
            allow,
          }),
        }),
      },
      shipmentContract: {
        label: '承运合同',
        component: UploadText,
        visible: mode === FORM_MODE.DETAIL,
      },
      qualificationFrontDentryid: {
        component: UploadFile,
        labelUpload: '货物运输从业资格证',
        props: {
          saveIntoBusiness: true,
        },
        rules: {
          required: [true, '请上传货物运输从业资格证'],
        },
        observer: Observer({
          watch: '*allow',
          action: allow => ({
            needAuthority: mode === FORM_MODE.DETAIL,
            mode,
            allow,
          }),
        }),
      },
      remark: {
        label: <span>备注<span style={{ color: '#999', fontWeight: 400 }}>（可选）</span></span>,
        component: 'input.textArea',
      },
      driverCertificationCreateReqList: {
        component: Qualification,
        addFunc: (func) => this.addFunc = func,
        props: Observer({
          watch: '*perfectStatus',
          action: (perfectStatus) => ({ perfectStatus }),
        }),
        observer: Observer({
          watch: '*allow',
          action: allow => ({
            needAuthority: mode === FORM_MODE.DETAIL,
            mode,
            allow,
          }),
        }),
      },
      qualificationNumber: {
        component: 'input',
        label: '货物运输从业资格证号',
        placeholder: '根据身份证号自动填充',
        rules: {
          required: [true, '请填写货物运输从业资格证号'],
        },
        disabled: true,
        value: Observer({
          watch: 'idcardNo',
          action: (idcardNo) => idcardNo,
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
      event: {
        component: DriverCertificationEvents,
      },
    };

  }


  componentDidMount() {
    const { location: { query: { userId } } } = this.props;
    this.timer = setInterval(() => {
      if (!this.endTime) return;
      if (this.endTime <= Date.parse(new Date())) {
        this.endTime = '';
        this.setState({ allow: false });
        const { location: { query: { userId } }, detailDrivers } = this.props;
        detailDrivers({ userId });
      }
    }, 1000);
    const { mode } = this.state;
    if (userId) {
      this.props.detailDrivers({ userId }).then(async driverInfo => {
        const { auditStatus, perfectStatus } = driverInfo;
        this.certified = getDriverStatus(auditStatus, perfectStatus, this.organizationType).text === '已认证';
        let auditedEvent;
        if (this.certified){
          const res = await this.props.getCertificationEvents(userId);
          auditedEvent = res.items;
        }

        if (driverInfo.perfectStatus === 0) {
          this.setState({ allow: true });
        }
        const { nickName, driverContractDentryid, bankAccountItems } = driverInfo;
        const bankInfo = bankAccountItems?.[0] || {};
        bankInfo.cardUserName = bankInfo.nickName;
        bankInfo.cardUserName1 = bankInfo.cardUserName;
        delete bankInfo.idcardNo;
        delete bankInfo.nickName;
        if (driverInfo.perfectStatus === 0) {
          getCertificationEvents({ authObjId: userId, authObjType: 2 }).then(data => {
            const event = data.items.find(item => item.authObjType === 2 && item.eventStatus === 4);
            this.userId = userId;
            const entity = {
              ...driverInfo,
              ...bankInfo,
              shipmentContract: { content: `易键达-${nickName || ''}承运合同`,
                contractDentryid: driverContractDentryid },
            };
            entity.driverCertificationCreateReqList = entity.driverCertificationEntities;
            entity.event = auditedEvent;
            if (entity.bankAccountItems && entity.bankAccountItems.length > 0) {
              const bankCard = entity.bankAccountItems[0].bankAccount;
              entity.bankInfo = bankCard;
            }

            mode === 'modify' && driverInfo.perfectStatus === 2 ? entity.driverCertificationCreateReqList = [] : false;

            this.setState({
              isClick: true,
              ready: true,
              remark: event && event.eventDetail,
              entity,
            });
          });
        } else {
          this.userId = userId;
          const entity = {
            ...driverInfo,
            ...bankInfo,
            shipmentContract: { content: `易键达-${nickName}承运合同`,
              contractDentryid: driverContractDentryid },
          };
          entity.driverCertificationCreateReqList = entity.driverCertificationEntities;
          entity.event = auditedEvent;
          if (entity.bankAccountItems && entity.bankAccountItems.length > 0) {
            const bankCard = entity.bankAccountItems[0].bankAccount;
            entity.bankInfo = bankCard;
          }
          mode === 'modify' && driverInfo.perfectStatus === 2 ? entity.driverCertificationCreateReqList = [] : false;
          this.setState({
            isClick: true,
            ready: true,
            entity,
          });
        }
      });
    } else {
      this.setState({
        ready: true,
      });
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { driverInfo } = nextProps;
    const { mode } = prevState;
    if (!driverInfo || !driverInfo.nickName || mode !== 'detail' || !prevState.ready) return null;
    const { nickName, driverContractDentryid, bankAccountItems } = driverInfo;
    const bankInfo = bankAccountItems?.[0] || {};
    if (bankInfo.nickName) {
      bankInfo.cardUserName = bankInfo.nickName;
      bankInfo.cardUserName1 = bankInfo.cardUserName;
      delete bankInfo.idcardNo;
      delete bankInfo.nickName;
    }
    if (driverInfo.perfectStatus === 0) {
      getCertificationEvents({ authObjId: driverInfo.userId, authObjType: 2 }).then(data => {
        const event = data.items.find(item => item.authObjType === 2 && item.eventStatus === 4);
        const entity = {
          ...driverInfo, ...bankInfo,
          shipmentContract: { content: `易键达-${nickName}承运合同`, contractDentryid: driverContractDentryid },
        };
        entity.driverCertificationCreateReqList = entity.driverCertificationEntities;
        if (entity.bankAccountItems && entity.bankAccountItems.length > 0) {
          const bankCard = entity.bankAccountItems[0].bankAccount;
          entity.bankInfo = bankCard;
        }

        mode === 'modify' && driverInfo.perfectStatus === 2 ? entity.driverCertificationCreateReqList = [] : false;
        prevState.remark = event && event.eventDetail;
        prevState.entity = entity;
        return prevState;
      });
    } else {
      const entity =  {
        ...driverInfo, ...bankInfo,
        shipmentContract: { content: `易键达-${nickName}承运合同`, contractDentryid: driverContractDentryid },
      };
      entity.driverCertificationCreateReqList = entity.driverCertificationEntities;
      if (entity.bankAccountItems && entity.bankAccountItems.length > 0) {
        const bankCard = entity.bankAccountItems[0].bankAccount;
        entity.bankInfo = bankCard;
      }
      mode === 'modify' && driverInfo.perfectStatus === 2 ? entity.driverCertificationCreateReqList = [] : false;
      prevState.entity = entity;
      return prevState;
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData,
      }));
    }
  }


  goBack = () => {
    router.go(-1);
  };


  savePlatDetail = (formData) =>{
    this.setState({
      noClicking: true,
      loading: true,
    });
    const flag = (formData.driverCertificationCreateReqList || []).find(item => item.qualificationFrontDentryid && !item.qualificationValidityDate || !item.qualificationFrontDentryid && item.qualificationValidityDate);
    if (flag) {
      message.error('存在部分填写的资格证信息，请填写完整');
      return this.setState({
        noClicking: false,
        loading: false,
      });
    }
    const driverCertificationCreateReqList = (formData.driverCertificationCreateReqList || []).filter(item => item.qualificationFrontDentryid && item.qualificationValidityDate);
    const data = {
      ...formData,
      idcardBackDentryid: formData.idcardBackDentryid[0],
      idcardFrontDentryid: formData.idcardFrontDentryid[0],
      licenseViceDentryid: formData.licenseViceDentryid[0],
      licenseFrontDentryid: formData.licenseFrontDentryid[0],
      licenseValidityDate: formData.licenseValidityDate && moment(formData.licenseValidityDate).format('YYYY/MM/DD HH:mm:ss'),
      idValidityDate: formData.idValidityDate && moment(formData.idValidityDate).format('YYYY/MM/DD HH:mm:ss'),
      qualificationFrontDentryid: formData.qualificationFrontDentryid[0],
      driverCertificationCreateReqList: driverCertificationCreateReqList.map(current => ({
        qualificationValidityDate: moment(current.qualificationValidityDate),
        qualificationFrontDentryid: current.qualificationFrontDentryid,
      })),
      qualificationValidityDate : formData.qualificationValidityDate && moment(formData.qualificationValidityDate).format('YYYY/MM/DD HH:mm:ss'),
      // isTemp: true,
    };
    const [, userId] = window.location.search.split('=');
    data.driverId = userId;
    const { bankName, province, city } = this.cardInfo;
    data.bankAccountCreateReq = {};
    data.bankAccountCreateReq.bankAccount = formData.bankInfo;
    data.bankAccountCreateReq.bankName = bankName;
    data.bankAccountCreateReq.province = province;
    data.bankAccountCreateReq.city = city;
    data.bankAccountCreateReq.nickName = formData.cardUserName;

    const { location: { query: { userId : _userId } } } = this.props;
    patchUser({ userId : _userId, ...data, accountType : 2 })
      .then(result => {
        if (result) {
          notification.success({
            message: '修改成功',
            description: `修改${formData.nickName}司机成功！`,
          });
          router.push('/certification-center/driver');
          this.props.deleteTab(this.props.commonStore, { id: this.currentTab.id });
        }
      })
      .catch(() => {
        this.setState({
          noClicking: false,
          loading: false,
        });
      });
  }

  addQualification = () => {
    this.addFunc();
  };

  handleTurnToContract = () => {
    router.push('/contract');
  };

  render() {
    const { isClick, noClicking, ready, remark, entity, loading, mode, allow } = this.state;
    // dataPicker 在form为modify的模式下 需要接收moment的类型的数据 否则会报错
    const formLayout = {
      labelCol: {
        span: 24,
      },
      wrapperCol: {
        span: 24,
      },
    };
    const data = Object.assign(entity || {}, this.localData.formData || {});
    return (
      ready
      &&
      <>
        {
          entity && entity.perfectStatus === 0 ?
            <div styleName='reject_div'>
              <h3>审核拒绝</h3>
              <p>审核理由：{remark}</p>
            </div>
            :
            null
        }
        <SchemaForm
          hideRequiredMark={mode === FORM_MODE.DETAIL}
          data={data}
          schema={this.schema}
          labelCol={{
            span: 24,
          }}
          mode={mode}
          {...formLayout}
          trigger={{ isClick, perfectStatus: this.props.driverInfo.perfectStatus, allow }}
        >
          <FormCard
            title="基础信息"
            colCount='3'
          >
            <Item field='phone' />
            <Item field='nickName' />
            <Item field='idcardNo' />
          </FormCard>

          <AddBankCard
            userId={this.props.location.query.userId}
            detailDrivers={this.props.detailDrivers}
            bankAccountItems={entity?.bankAccountItems}
          />

          <FormCard title='详细信息' colCount='1'>
            <Row>
              <Col span={8}>
                <div>
                  <div styleName='formLabel'>
                    <span>上传司机身份证照片</span>
                  </div>
                  <Item styleName='float-left' field='idcardFrontDentryid' />
                  <Item styleName='float-left' field='idcardBackDentryid' />
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <div styleName='formLabel'>
                    <span>上传司机驾驶证照片</span>
                  </div>
                  <Item field='licenseFrontDentryid' styleName='float-left' />
                  <Item field='licenseViceDentryid' styleName='float-left' />
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <div styleName='formLabel'>
                    <span>上传货物运输从业资格证</span>
                  </div>
                  <Item field='qualificationFrontDentryid' />
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={8} style={{ marginBottom : '1rem', paddingRight : '1rem' }}><Item field='idCardSex' /></Col>
              <Col span={8} style={{ marginBottom : '1rem', paddingRight : '1rem' }}><Item field='licenseType' /></Col>
              <Col span={8} style={{ marginBottom : '1rem', paddingRight : '1rem' }}><Item field='qualificationNumber' /></Col>
            </Row>
            <Row>
              <Col span={8} style={{ marginBottom : '1rem', paddingRight : '1rem' }}><Item field='idCardAddress' /></Col>
              <Col span={8} style={{ marginBottom : '1rem', paddingRight : '1rem' }}><Item field='licenseNo' /></Col>
              <Col span={8} style={{ marginBottom : '1rem', paddingRight : '1rem' }}><Item field='qualificationValidityDate' /></Col>
            </Row>

            <Row>
              <Col span={8} style={{ marginBottom : '1rem', paddingRight : '1rem' }}><Item field='idIssuingAuthority' /></Col>
              <Col span={8} style={{ marginBottom : '1rem', paddingRight : '1rem' }}>
                <Row>
                  <Col span={10} style={{ display: 'flex', alignItems: 'center' }}>
                    <Item field='licenseValidityType' />
                  </Col>
                  <Col span={14} style={{ padding: "20px 0 10px 0" }}>
                    <Item field="licenseValidityDate" />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={8} style={{ marginBottom : '1rem', paddingRight : '1rem' }}><Item field='idValidityDate' /></Col>
            </Row>

          </FormCard>
          <FormCard title='承运合同' colCount='3'>
            <div
              style={{ color: '#1890FF', cursor: 'pointer' }}
              onClick={this.handleTurnToContract}
            >
              {entity && entity.shipmentContract && entity.shipmentContract.content}
            </div>
          </FormCard>
          <div styleName='certification_container'>
            <h3>
              资格证(选填)
            </h3>
            <div styleName='add_box' onClick={this.addQualification}>
              <Icon type='plus' /><span styleName='tips'>添加其他资格证</span>
            </div>
            <Item field='driverCertificationCreateReqList' />
          </div>
          <Item {...layout} field='remark' />

          {this.certified && (
            <div style={{ marginTop : "2rem" }}>
              <FormCard title="审核记录">
                <Item {...formLayout} field="event" />
              </FormCard>
            </div>)}

          <div style={{ paddingRight: '30px', textAlign: 'right' }}>
            <Button className='mr-10' onClick={this.goBack}>返回</Button>
            <DebounceFormButton disabled={noClicking} label='保存详细信息' type='primary' onClick={this.savePlatDetail} />
          </div>
        </SchemaForm>

        <OwnModal loading={loading} />
      </>
    );
  }
}


