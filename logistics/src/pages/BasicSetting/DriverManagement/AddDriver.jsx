import React, { Component } from 'react';
import { Modal, notification, Button, Input, message, Icon, Row, Col } from 'antd';
import router from 'umi/router';
import moment from 'moment';
import CssModule from 'react-css-modules';
import { connect } from 'dva';
import { SchemaForm, Item, FormCard, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import { testIdCard, disableDateBeforeToday, lodashDebounce, encodePassword, getLocal, cloneDeep } from '@/utils/utils';
import { getBankInfo, patchCompleteInformation, getCertificationEvents, getOcrIdCard, getOcrDrivingLicense } from '@/services/apiService';
import '@gem-mine/antd-schema-form/lib/fields';
import UploadFile from '@/components/Upload/UploadFile';
import UploadText from '@/components/Upload/UploadText';
import OwnModal from '@/components/Modal';
import Qualification from '@/components/Qualification/Qualification';
import CheckDriver from './component/CheckDriver';
import styles from './AddDriver.less';

// const { actions: { postDrivers, detailDrivers, patchDrivers } } = driverModel
function mapStateToProps(state) {
  const { dictionaries : { items }, drivers : { entity } } = state;
  const licenseType = items.filter(item=>item.dictionaryType === 'license_type');
  return {
    driverInfo: { ...entity },
    commonStore: state.commonStore,
    licenseType
  };
}

const { confirm } = Modal;

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
    deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload }),
    dispatch,
  });
}

@connect(mapStateToProps, mapDispatchToProps)
@CssModule(styles, { allowMultiple: true })
export default class AddDriver extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = this.currentTab && getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  constructor(props) {
    super(props);
    const { location: { query: { userId, mode } } } = props;
    this.state = {
      mode: userId ? mode || FORM_MODE.MODIFY : FORM_MODE.ADD,
      isClick: false,
      noClicking: false,
      ready: false,
      loading: false,
      passwordModal: false,
      password: '',
      allow: false,
    };

    this.endTime = '';

    this.cardInfo = {};

    this.schema = {
      phone: {
        label: <span>????????????<span style={{ color: '#999', fontWeight: 400 }}>??????????????????????????????????????????</span></span>,
        component: 'input',
        placeholder: '?????????????????????',
        name: '?????????',
        rules: {
          required: [true, '?????????????????????'],
          validator: ({ value }) => {
            const pat = /^1\d{10}$/;
            if (!pat.test(value) && this.state.mode !== FORM_MODE.MODIFY) {
              return '???????????????????????????';
            }
          },
        },
        readOnly: this.state.mode === FORM_MODE.MODIFY,
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
        label: '????????????',
        component: 'input',
        placeholder: '?????????????????????',
        readOnly: this.state.mode === FORM_MODE.MODIFY,
        disabled: Observer({
          watch: '*isClick',
          action: isClick => isClick,
        }),
      },
      idcardNo: {
        label: '????????????',
        component: 'input',
        placeholder: '?????????????????????',
        rules: {
          validator: ({ value }) => {
            if (!testIdCard(value) && this.state.mode !== FORM_MODE.MODIFY) {
              return '??????????????????????????????';
            }
          },
        },
        readOnly: this.state.mode === FORM_MODE.MODIFY,
        disabled: Observer({
          watch: '*isClick',
          action: isClick => isClick,
        }),
      },
      bankInfo: {
        // label: <span>????????????<span style={{ color: '#999', fontWeight: 400 }}>???????????????????????????????????????</span></span>,
        label: '????????????',
        component: InputBankCard,
        visible: ({ formData }) => formData['*mode'] !== FORM_MODE.DETAIL,
        getCardInfo: (data) => {
          this.cardInfo = data;
        },
        // rules: {
        //   required: [true, '??????????????????????????????'],
        // },
      },
      cardUserName: {
        label: '???????????????',
        component: 'input',
        placeholder: '????????????????????????',
        // rules: {
        //   required: [true, '????????????????????????'],
        // },
      },
      bankAccount: {
        label: '????????????',
        component: 'input.text',
        visible: ({ formData }) => formData['*mode'] === FORM_MODE.DETAIL,
      },
      cardUserName1: {
        label: '???????????????',
        component: 'input.text',
        visible: ({ formData }) => formData['*mode'] === FORM_MODE.DETAIL,
      },
      bankName: {
        label: '????????????',
        component: 'input.text',
        visible: ({ formData }) => formData['*mode'] === FORM_MODE.DETAIL,
      },
      checkDriver: {
        component: CheckDriver,
        props : {
          deleteTab:this.props.deleteTab,
          commonStore : this.props.commonStore,
          currentTabId: this.currentTab.id
        },
        checkBtnClick: (userId) => {
          this.userId = userId;
          router.replace(`/basic-setting/driverManagement/editDriver?userId=${userId}`);
          this.props.deleteTab(this.props.commonStore, { id: this.currentTab.id });

        },
      },
      licenseType: {
        label: '???????????????',
        component: Observer({
          watch: '*mode',
          action: mode => mode === FORM_MODE.DETAIL ? 'select.text' : 'select',
        }),
        placeholder: '????????????????????????',
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
        label: '????????????',
        component: 'input',
        placeholder: '?????????????????????',
        rules: {
          required: [true, '?????????????????????'],
        },
      },
      idCardAddress: {
        label: '??????',
        component: 'input',
        placeholder: '???????????????',
      },
      idIssuingAuthority: {
        label: "????????????",
        component: 'input',
        placeholder: '?????????????????????',
      },
      idValidityDate: {
        label: "?????????",
        component: 'datePicker',
        placeholder: '??????????????????',
        // renderExtraFooter : ()=> <Button size='small' type='ghost'>??????</Button>,
        disabledDate: disableDateBeforeToday,
        format: {
          input: (value) => value ? moment(value) : undefined,
        },
      },
      idCardSex: {
        label: "??????",
        component: "radio",
        options: [
          {
            label: "???",
            value: 1,
            key: 1
          },
          {
            label: "???",
            value: 2,
            key: 2
          }
        ]
      },
      licenseValidityType: {
        label: "??????????????????",
        component: "radio",
        rules: {
          required: [true, "????????????????????????"]
        },
        options: [
          {
            label: "??????",
            value: 2,
            key: 2
          },
          {
            label: "????????????",
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
        rules: { required: [true, "??????????????????"] },
        placeholder: '??????????????????',
        disabledDate: disableDateBeforeToday,
      },
      licenseFrontDentryid: {
        component: UploadFile,
        labelUpload: '??????????????????????????????',
        rules: {
          required: [true, '??????????????????????????????'],
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
                licenseValidityType: termOfValidity === '??????' ? 2 : 1,
                licenseValidityDate: !termOfValidity || termOfValidity === '??????' ? undefined : moment(termOfValidity),
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
        labelUpload: '??????????????????????????????',
        rules: {
          required: [true, '???????????????????????????????????????'],
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
        labelUpload: '??????????????????????????????',
        rules: {
          required: [true, '???????????????????????????????????????'],
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
                case '???':
                  idCardSex = 1;
                  break;
                case '???':
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
        labelUpload: '??????????????????????????????',
        rules: {
          required: [true, '???????????????????????????????????????'],
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
                idValidityDate: expiryDate !== '??????' ? moment(expiryDate) : undefined,
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
        label: '????????????',
        component: UploadText,
        visible: mode === FORM_MODE.DETAIL,
      },
      qualificationFrontDentryid: {
        component: UploadFile,
        labelUpload: '???????????????????????????',
        props: {
          saveIntoBusiness: true,
        },
        rules: {
          required: [true, '????????????????????????????????????'],
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
        label: <span>??????<span style={{ color: '#999', fontWeight: 400 }}>????????????</span></span>,
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
        label: '??????????????????????????????',
        placeholder: '??????????????????????????????',
        rules: {
          required: [true, '???????????????????????????????????????'],
        },
        disabled: true,
        value: Observer({
          watch: 'idcardNo',
          action: (idcardNo) => idcardNo,
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
    };
  }

  showModal = () => () => {
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
    const { dispatch } = this.props;
    const { userId } = this.state.entity;
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
      this.props.detailDrivers({ userId }).then(driverInfo => {
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
            const entity = mode === FORM_MODE.ADD
              ? { ...driverInfo }
              : {
                ...driverInfo, ...bankInfo,
                shipmentContract: { content: `?????????-${nickName || ''}????????????`, contractDentryid: driverContractDentryid },
              };
            if (entity) {
              entity.driverCertificationCreateReqList = entity.driverCertificationEntities;
              if (entity.bankAccountItems && entity.bankAccountItems.length > 0) {
                const bankCard = entity.bankAccountItems[0].bankAccount;
                entity.bankInfo = bankCard;
              }
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
          const entity = mode === FORM_MODE.ADD
            ? undefined
            : {
              ...driverInfo, ...bankInfo,
              shipmentContract: { content: `?????????-${nickName}????????????`, contractDentryid: driverContractDentryid },
            };
          if (entity) {
            entity.driverCertificationCreateReqList = entity.driverCertificationEntities;
            if (entity.bankAccountItems && entity.bankAccountItems.length > 0) {
              const bankCard = entity.bankAccountItems[0].bankAccount;
              entity.bankInfo = bankCard;
            }
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
        const entity = mode === FORM_MODE.ADD
          ? undefined
          : {
            ...driverInfo, ...bankInfo,
            shipmentContract: { content: `?????????-${nickName}????????????`, contractDentryid: driverContractDentryid },
          };
        if (entity) {
          entity.driverCertificationCreateReqList = entity.driverCertificationEntities;
          if (entity.bankAccountItems && entity.bankAccountItems.length > 0) {
            const bankCard = entity.bankAccountItems[0].bankAccount;
            entity.bankInfo = bankCard;
          }
        }
        mode === 'modify' && driverInfo.perfectStatus === 2 ? entity.driverCertificationCreateReqList = [] : false;
        prevState.remark = event && event.eventDetail;
        prevState.entity = entity;
        return prevState;
      });
    } else {
      const entity = mode === FORM_MODE.ADD
        ? undefined
        : {
          ...driverInfo, ...bankInfo,
          shipmentContract: { content: `?????????-${nickName}????????????`, contractDentryid: driverContractDentryid },
        };
      if (entity) {
        entity.driverCertificationCreateReqList = entity.driverCertificationEntities;
        if (entity.bankAccountItems && entity.bankAccountItems.length > 0) {
          const bankCard = entity.bankAccountItems[0].bankAccount;
          entity.bankInfo = bankCard;
        }
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

  handleCancel = () => {
    confirm({
      title: '??????',
      content: '??????????????????????????????',
      okText: '??????',
      cancelText: '??????',
      onCancel: () => {
      },
      onOk: () => {
        router.push('/basic-setting/driverManagement');
      },
    });
  };

  goBack = () => {
    router.go(-1);
  };

  postData = formData => {
    this.setState({
      noClicking: true,
      loading: true,
    });
    const { isClick } = this.state;
    if (!isClick) {
      message.error('??????????????????????????????????????????');
      return this.setState({
        noClicking: false,
        loading: false,
      });
    }
    // if (!this.cardInfo || !this.cardInfo.bankName) {
    //   message.error('???????????????????????????????????????????????????');
    //   return this.setState({
    //     noClicking: false,
    //     loading: false,
    //   });
    // }
    const flag = (formData.driverCertificationCreateReqList || []).find(item => item.qualificationFrontDentryid && !item.qualificationValidityDate || !item.qualificationFrontDentryid && item.qualificationValidityDate);
    if (flag) {
      message.error('??????????????????????????????????????????????????????');
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
      idValidityDate: formData.idValidityDate && moment(formData.idValidityDate).format('YYYY/MM/DD HH:mm:ss'),
      licenseValidityDate: formData.licenseValidityDate && moment(formData.licenseValidityDate).format('YYYY/MM/DD HH:mm:ss'),
      qualificationFrontDentryid: formData.qualificationFrontDentryid[0],
      driverCertificationCreateReqList: driverCertificationCreateReqList.map(current => ({
        qualificationValidityDate: moment(current.qualificationValidityDate),
        qualificationFrontDentryid: current.qualificationFrontDentryid,
      })),
      qualificationValidityDate : formData.qualificationValidityDate && moment(formData.qualificationValidityDate).format('YYYY/MM/DD HH:mm:ss'),
      driverId: this.userId,
      // isTemp: true,
    };

    if (this.cardInfo && formData.bankInfo) {
      const { bankName='', province, city } = this.cardInfo;
      data.bankAccountCreateReq = {};
      data.bankAccountCreateReq.bankAccount = formData.bankInfo;
      data.bankAccountCreateReq.bankName = bankName;
      data.bankAccountCreateReq.province = province;
      data.bankAccountCreateReq.city = city;
      data.bankAccountCreateReq.nickName = formData.cardUserName;
    } else {
      data.bankAccountCreateReq = {};
      data.bankAccountCreateReq = null;
    }
    patchCompleteInformation({ ...data, isContainsRealNameInformation: false }).then(result => {
      if (result) {
        notification.success({
          message: '????????????',
          description: `??????${formData.nickName}???????????????`,
        });
        router.push('/basic-setting/driverManagement');
        this.props.deleteTab(this.props.commonStore, { id: this.currentTab.id });
      }
    })
      .catch(() => {
        this.setState({
          noClicking: false,
          loading: false,
        });
      });
  };

  patchData = formData => {
    this.setState({
      noClicking: true,
      loading: true,
    });
    // if (!this.cardInfo || !this.cardInfo.bankName) {
    //   message.error('???????????????????????????????????????????????????');
    //   return this.setState({
    //     noClicking: false,
    //     loading: false,
    //   });
    // }
    const flag = (formData.driverCertificationCreateReqList || []).find(item => item.qualificationFrontDentryid && !item.qualificationValidityDate || !item.qualificationFrontDentryid && item.qualificationValidityDate);
    if (flag) {
      message.error('??????????????????????????????????????????????????????');
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
    if (this.cardInfo && formData.bankInfo) {
      const { bankName='', province, city } = this.cardInfo;
      data.bankAccountCreateReq = {};
      data.bankAccountCreateReq.bankAccount = formData.bankInfo;
      data.bankAccountCreateReq.bankName = bankName;
      data.bankAccountCreateReq.province = province;
      data.bankAccountCreateReq.city = city;
      data.bankAccountCreateReq.nickName = formData.cardUserName;
    } else {
      data.bankAccountCreateReq = {};
      data.bankAccountCreateReq = null;
    }
    patchCompleteInformation({ ...data, isContainsRealNameInformation: false })
      .then(result => {
        if (result) {
          notification.success({
            message: '????????????',
            description: `??????${formData.nickName}???????????????`,
          });
          router.push('/basic-setting/driverManagement');
          this.props.deleteTab(this.props.commonStore, { id: this.currentTab.id });
        }
      })
      .catch(() => {
        this.setState({
          noClicking: false,
          loading: false,
        });
      });
  };

  addQualification = () => {
    this.addFunc();
  };

  handleTurnToContract = () => {
    const { location: { query: { userId } } } = this.props;
    const { entity: { nickName }, mode } = this.state;

    if (mode === FORM_MODE.DETAIL && userId && nickName.indexOf('*') !== -1) {
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
    const { isClick, noClicking, ready, remark, entity, loading, passwordModal, password } = this.state;
    const { mode, allow } = this.state;
    // dataPicker ???form???modify???????????? ????????????moment?????????????????? ???????????????
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
              <h3>????????????</h3>
              <p>???????????????{remark}</p>
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
          // layout="vertical"
          mode={mode}
          {...formLayout}
          className='addDriver_userInfo'
          trigger={{ isClick, perfectStatus: this.props.driverInfo.perfectStatus, allow }}
        >
          <FormCard
            title={
              this.state.mode === FORM_MODE.DETAIL && this.props.location.query.userId && this.state?.entity?.nickName?.indexOf('*') !== -1 ?
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
                      color: 'rgb(179,179,179)',
                    }}
                    type='lock'
                  />
                </>
                :
                '????????????'
            }
            colCount='3'
          >
            <Item field='phone' />
            <Item field='nickName' />
            <Item field='idcardNo' />
            <Item field='bankAccount' />
            <Item field='bankName' />
            <Item field='cardUserName1' />
          </FormCard>
          {
            mode === FORM_MODE.ADD
              ? <Item style={{ marginLeft: '30px' }} field='checkDriver' />
              : null
          }
          {
            mode !== FORM_MODE.DETAIL ?
              <FormCard title='???????????????' colCount='3'>
                <Item field='bankInfo' />
                <Item field='cardUserName' />
              </FormCard>
              :
              null
          }
          <FormCard title='????????????' colCount='1'>
            <Row>
              <Col span={8}>
                <div>
                  <div styleName='formLabel'>
                    {
                      mode !== FORM_MODE.DETAIL ?
                        <span styleName='requiredStar'>*</span>
                        :
                        null
                    }
                    <span>???????????????????????????</span>
                  </div>
                  <Item styleName='float-left' field='idcardFrontDentryid' />
                  <Item styleName='float-left' field='idcardBackDentryid' />
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <div styleName='formLabel'>
                    {
                      mode !== FORM_MODE.DETAIL ?
                        <span styleName='requiredStar'>*</span>
                        :
                        null
                    }
                    <span>???????????????????????????</span>
                  </div>
                  <Item field='licenseFrontDentryid' styleName='float-left' />
                  <Item field='licenseViceDentryid' styleName='float-left' />
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <div styleName='formLabel'>
                    {
                      mode !== FORM_MODE.DETAIL ?
                        <span styleName='requiredStar'>*</span>
                        :
                        null
                    }
                    <span>?????????????????????????????????</span>
                  </div>
                  <Item field='qualificationFrontDentryid' />
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={8}><Item field='idCardSex' /></Col>
              <Col span={8}><Item field='licenseType' /></Col>
              <Col span={8}><Item field='qualificationNumber' /></Col>
            </Row>
            <Row>
              <Col span={8}><Item field='idCardAddress' /></Col>
              <Col span={8}><Item field='licenseNo' /></Col>
              <Col span={8}><Item field='qualificationValidityDate' /></Col>
            </Row>
            <Row>
              <Col span={8}><Item field='idIssuingAuthority' /></Col>
              <Col span={8}>
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
              <Col span={8}><Item field='idValidityDate' /></Col>
            </Row>

            {/* <Item field='shipmentContract' /> */}
            {/* <div>
              <p style={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.85)' }}>????????????</p>
              <div
                style={{ color: '#1890FF', cursor: 'pointer' }}
                onClick={this.handleTurnToContract}
              >
                {entity && entity.shipmentContract.content}
              </div>
            </div> */}
          </FormCard>
          <FormCard title='????????????' colCount='3'>
            <div
              style={{ color: '#1890FF', cursor: 'pointer' }}
              onClick={this.handleTurnToContract}
            >
              {entity && entity.shipmentContract && entity.shipmentContract.content}
            </div>
          </FormCard>
          <div styleName='certification_container'>
            <h3>
              ?????????(??????)
            </h3>
            {
              mode === FORM_MODE.DETAIL ?
                null
                :
                <div styleName='add_box' onClick={this.addQualification}>
                  <Icon type='plus' /><span styleName='tips'>?????????????????????</span>
                </div>
            }
            <Item field='driverCertificationCreateReqList' />
          </div>
          <Item {...layout} field='remark' />
          <div style={{ paddingRight: '30px', textAlign: 'right' }}>
            {mode === FORM_MODE.ADD ? <Button className='mr-10' onClick={this.handleCancel}>??????</Button> :
            <Button className='mr-10' onClick={this.goBack}>??????</Button>}
            {mode === FORM_MODE.ADD ?
              <DebounceFormButton disabled={noClicking} label='??????' type='primary' onClick={this.postData} /> : null}
            {mode === FORM_MODE.MODIFY ?
              <DebounceFormButton disabled={noClicking} label='??????' type='primary' onClick={this.patchData} /> : null}
          </div>
        </SchemaForm>
        <OwnModal loading={loading} />
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
      </>
    );
  }
}

@CssModule(styles, { allowMultiple: true })
class InputBankCard extends React.Component {
  state = {
    bankName: '',
    value: '',
  };

  constructor(props) {
    super(props);
    this._getBankName = lodashDebounce(this.getBankName, 1000);
  }

  componentDidMount() {
    const { value } = this.props;
    if (value) {
      this.setState({
        value,
      });
      if (this.props.mode === 'modify' && value && value.length > 15) {
        this._getBankName({ bankAccount: value });
      }
    }
  }

  getBankName = val => {
    getBankInfo(val).then(data => {
      this.setState({
        bankName: data.bankName || '',
      });
      this.props.getCardInfo(data);
    });
  };

  onChange = e => {
    this.props.getCardInfo(null);
    const val = e.target.value;
    this.setState({
      value: val,
    });
    this.props.onChange(val);
    if (val === '') {
      this.setState({
        bankName: '',
      });
    }
    if (val && val.length > 15) {
      this._getBankName({ bankAccount: val });
    }
  };

  render() {
    const { bankName, value } = this.state;
    return (
      <div width='33.3%'>
        {
          this.props.mode === 'modify' ?
            <Input placeholder='?????????????????????' value={value} onChange={this.onChange} />
            :
            <Input placeholder='?????????????????????' onChange={this.onChange} />
        }
        {/* <p styleName='bankName'>{bankName}</p> */}
        {
          value && <p styleName='bankName'>{bankName}</p>
        }
      </div>
    );
  }
}

