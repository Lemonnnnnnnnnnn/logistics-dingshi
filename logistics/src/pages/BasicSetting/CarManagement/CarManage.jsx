import React, { Component } from 'react';
import { Modal, notification, Button, Tooltip, Col, Row, message, Icon, Input } from 'antd';
import router from 'umi/router';
import { connect } from 'dva';
import { SchemaForm, Item, FormButton, FormCard, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import DebounceFormButton from '@/components/DebounceFormButton';
import { AXLES_NUM_OPTIONS, HEAD_STOCK_OPTIONS } from '@/constants/car';
import { isArray, encodePassword, getLocal, getWeight } from "@/utils/utils";
import numTemp from '@/assets/numTemp.png';
import ImageDetail from '@/components/ImageDetail';
import { bindCarSearch, addShipmentCar, carBasicAuth, completeCarInfo, getGoodsCategories, vehicleLicenseLastOcr } from '@/services/apiService';
import '@gem-mine/antd-schema-form/lib/fields';
import UploadFile from '@/components/Upload/UploadFile';
import OwnModal from '@/components/Modal';
import MultipleCheckButton from "./component/MultipleCheckButton";
import style from './CarManage.less';
import { editCar, ocrVehicleLicenseOcr } from "@/services/carService";

const formLayout = {
  labelCol: {
    span: 24
  },
  wrapperCol: {
    span: 24
  }
};
const imgGrid = {
  md:12,
  lg:5
};

const typeGrid = {
  md:12,
  lg:12
};

const inputGrid = {
  md:12,
  lg:4
};

function mapDispatchToProps (dispatch) {
  return ({
    detailCars: (params) => dispatch({
      type: 'cars/detailCars',
      payload: params
    }),
    deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload }),
    dispatch
  });
}

@connect(state => {
  const { entity } = state.cars;
  if (entity.carCorrelationEntities && entity.carCorrelationEntities[0]) {
    entity.carGroupName = entity.carCorrelationEntities[0].carGroupName;
  }
  return ({
    dictionaries: state.dictionaries.items,
    commonStore: state.commonStore,
    entity
  });
}, mapDispatchToProps)
export default class CarManage extends Component {

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = this.currentTab && getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  constructor (props){
    super(props);
    const { mode } = props;
    this.bindCarNo = undefined;
    this.state = {
      mode,
      noClicking: false,
      loading: false,
      passwordModal: false,
      password: '',
      allow: false
    };
  }

  endTime = ''

  async componentDidMount () {
    const { detailCars, location: { query: { carId: carsId } }, mode = FORM_MODE.ADD } = this.props;
    if (mode !== FORM_MODE.ADD) {
      await detailCars({ carsId });
      this.setState({
        allow : this.props?.entity?.show,
      });
    }

    getGoodsCategories({ parentId : 0 }).then(({ items })=> {
      const readOnly = mode === FORM_MODE.DETAIL; // ???schema????????????readOnly
      const tagsArray = items.map(item=>({ id : item.categoryId, name : item.categoryName }));

      this.schema = {
        carNo: {
          label: '?????????',
          component: readOnly? 'input.text':'input',
          style:{
            width:'200px'
          },
          placeholder: '?????????????????????',
          rules: {
            required: [true, '???????????????????????????'],
            pattern: /^[???????????????????????????????????????????????????????????????????????????????????????????????????A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9???????????????]{1}$/
          },
        },
        categoryList : {
          label : (
            <div>
              <span>????????????</span>
              <span className='color-gray' style={{ fontSize : '12px', marginLeft : '5px' }}>?????????????????????????????????</span>
            </div>),
          component : MultipleCheckButton,
          props: {
            tagsFromServer: tagsArray,
          },
          rules:{
            required : [true, '??????????????????????????????']
          }
        },
        carGroupName: {
          label: '????????????',
          component: readOnly? 'input.text':'input',
          visible: readOnly && JSON.parse(localStorage.getItem('token_storage')).organizationType === 5
        },
        carFrontDentryid: {
          component: UploadFile,
          label:'????????????',
          labelUpload: '????????????????????????',
          saveIntoBusiness : true,
          rules: {
            required: readOnly?[false]:[true, '?????????????????????'],
          },
          observer: Observer({
            watch: '*allow',
            action: allow => ({
              needAuthority: mode === FORM_MODE.DETAIL,
              allow
            })
          }),
        },
        carBodyDentryid: {
          component: UploadFile,
          saveIntoBusiness : true,
          label:'????????????',
          labelUpload: '????????????????????????',
          observer: Observer({
            watch: '*allow',
            action: allow => ({
              needAuthority: mode === FORM_MODE.DETAIL,
              allow
            })
          }),
        },
        drivingLicenseFrontDentryid: {
          component: UploadFile,
          saveIntoBusiness : true,
          label:'???????????????',
          labelUpload: '???????????????????????????',
          rules: {
            required: [true, '??????????????????????????????'],
          },
          observer: Observer({
            watch: '*allow',
            action: allow => ({
              needAuthority: mode === FORM_MODE.DETAIL,
              allow
            })
          }),
          afterUpload : async (drivingLicenseFrontDentryid, { formData, form }) => {
            const { engineNo, frameNo } = formData;
            let _ocrData = {};
            if (drivingLicenseFrontDentryid?.[0]){
              try {
                _ocrData = await ocrVehicleLicenseOcr({ drivingLicenseDentryId : drivingLicenseFrontDentryid?.[0], vehicleLicenseSide : 'front' });
              } catch (error) {
                console.log(error);
              }
              const { vehicleIdentificationNumber, engineNumber } = _ocrData;
              form.setFieldsValue({ frameNo: vehicleIdentificationNumber || frameNo, engineNo : engineNumber || engineNo });
            }
          }
        },
        drivingLicenseBackDentryid: {
          component: UploadFile,
          label:'?????????????????????',
          saveIntoBusiness : true,
          labelUpload: '?????????????????????????????????',
          rules: {
            required: [true, '????????????????????????????????????'],
          },
          observer: Observer({
            watch: '*allow',
            action: allow => ({
              needAuthority: mode === FORM_MODE.DETAIL,
              allow
            })
          }),
          props: {
            removeFile: async () => {
              const drivingLicenseBackDentryidLast = this.form.getFieldValue("drivingLicenseBackDentryidLast");
              if (!drivingLicenseBackDentryidLast?.[0]){
                this.form.setFieldsValue({ drivingLicenseValidityDate: undefined });
              }
            }
          },
          afterUpload : async (drivingLicenseBackDentryid, { formData, form }) => {
            const { carLength, carWeight, carLoad, drivingLicenseBackDentryidLast, drivingLicenseValidityDate } = formData;
            let _ocrData = {};
            if (drivingLicenseBackDentryid?.[0]){
              try {
                _ocrData = await ocrVehicleLicenseOcr({ drivingLicenseDentryId : drivingLicenseBackDentryid?.[0], vehicleLicenseSide : 'back' });
              } catch (error) {
                console.log(error);
              }
              /*
              * ?????????????????????????????????????????????+???????????????/???????????????????????????????????????
              * ?????????????????????????????????????????????????????????????????????????????????????????????????????????
              *
              * ?????????????????????carWeight
              * ????????????carLoad
              * ??????????????????ratifiedLoadCapacity
              * ???????????????curbWeight
              * */

              const { carLength : _carLength, carWeight : _carWeight, carLoad : _carLoad, ratifiedLoadCapacity, curbWeight, inspectionRecordDate } = _ocrData;
              const carLoadVal = getWeight(ratifiedLoadCapacity) || getWeight(_carWeight);
              const carWeightVal = getWeight(_carLoad) || (getWeight(curbWeight) + (getWeight(ratifiedLoadCapacity) || getWeight(_carWeight)));
              const params = { carLength: _carLength || carLength, carWeight : carWeightVal || carWeight, carLoad : carLoadVal || carLoad };
              if (!drivingLicenseBackDentryidLast && !drivingLicenseValidityDate ) {
                if (!inspectionRecordDate) {
                  message.info("??????????????????????????????????????????????????????????????????");
                } else {
                  if (moment(inspectionRecordDate).valueOf() < moment().valueOf()) {
                    message.info("???????????????????????????????????????????????????????????????????????????");
                  }
                  params.drivingLicenseValidityDate =  moment(inspectionRecordDate);
                }
              }
              form.setFieldsValue(params);
            }
          }
        },
        drivingLicenseBackDentryidLast: {
          component: UploadFile,
          label:'?????????????????????',
          saveIntoBusiness : true,
          labelUpload: '?????????????????????????????????',
          observer: Observer({
            watch: '*allow',
            action: allow => ({
              needAuthority: mode === FORM_MODE.DETAIL,
              allow
            })
          }),
          props: {
            removeFile: async () => {
              const drivingLicenseBackDentryid = this.form.getFieldValue("drivingLicenseBackDentryid");
              this.form.setFieldsValue({ drivingLicenseValidityDate: undefined });
              if (drivingLicenseBackDentryid?.[0]){
                let _ocrData;
                try {

                  _ocrData = await ocrVehicleLicenseOcr({ drivingLicenseDentryId : drivingLicenseBackDentryid?.[0], vehicleLicenseSide : 'back' });
                } catch (error) {
                  console.log(error);
                }
                const { inspectionRecordDate } = _ocrData;

                if (inspectionRecordDate) {
                  this.form.setFieldsValue({ drivingLicenseValidityDate: moment(inspectionRecordDate) });
                  if (moment(inspectionRecordDate) .valueOf() < moment().valueOf()) {
                    message.info("???????????????????????????????????????????????????????????????????????????");
                  }
                }  else {
                  message.info("??????????????????????????????????????????????????????????????????");
                }
              }
            }
          },
          afterUpload : async (drivingLicenseBackDentryidLast, { formData, form }) => {
            const { drivingLicenseBackDentryid } = formData;
            let _ocrData = {};
            if (drivingLicenseBackDentryidLast?.[0]){
              try {
                _ocrData = await vehicleLicenseLastOcr({ drivingLicenseBackDentryidLast : drivingLicenseBackDentryidLast?.[0], drivingLicenseBackDentryid });
              } catch (error) {
                console.log(error);
              }
              const { drivingLicenseValidityDate, ocrResult } = _ocrData;
              if (ocrResult === "SUCCESS") {
                form.setFieldsValue({ drivingLicenseValidityDate: moment(drivingLicenseValidityDate) });
                if (moment(drivingLicenseValidityDate) .valueOf() < moment().valueOf()) {
                  message.info("???????????????????????????????????????????????????????????????????????????");
                }
              } else {
                message.info("??????????????????????????????????????????????????????????????????");
              }
            }
          }
        },
        engineNo: {
          label: '????????????',
          component: 'input',
          style:{
            width:'200px'
          },
          placeholder: '?????????????????????',
          rules: {
            required: [true, '??????????????????????????????'],
          },
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
        frameNo: {
          label: '?????????',
          component: 'input',
          style:{
            width:'200px'
          },
          placeholder: '??????????????????',
          rules: {
            required: [true, '???????????????????????????'],
          }
        },
        // ??????
        drivingLicenseValidityDate: {
          label: '??????????????????',
          component: 'datePicker',
          style:{
            width:'200px'
          },
          rules: {
            required: [true, '???????????????????????????'],
          },
          placeholder: '???????????????????????????',
          format: {
            input: (value) => value ? moment(value) : undefined,
          },
        },
        transportLicenseNo: {
          label: '??????????????????????????????',
          component: 'input',
          style:{
            width:'200px'
          },
          placeholder: '???????????????????????????????????????',
          rules: {
            required: [true, '????????????????????????????????????????????????'],
          }
        },
        roadTransportDentryid:{
          component: UploadFile,
          label:'?????????????????????',
          saveIntoBusiness : true,
          labelUpload: '?????????????????????????????????',
          rules: {
            required: [true, '??????????????????????????????'],
          },
        },
        roadTransportNo: {
          label: '??????????????????',
          component: 'input',
          style:{
            width:'200px'
          },
          placeholder: '???????????????????????????',
          rules: {
            required: [true, '????????????????????????????????????'],
          }
        },
        carLength: {
          label: '?????? mm',
          component: 'input',
          addonAfter:'mm',
          style:{
            width:'200px'
          },
          placeholder: '???????????????',
          rules: {
            required: [true, '????????????????????????'],
            pattern: /^\d+(\.\d+)?$/
          }
        },
        carType: {
          label: '??????',
          component: 'select',
          placeholder: '?????????????????????',
          rules: {
            required: [true, '?????????????????????'],
          },
          options: () => (
            this.props.dictionaries.filter(item => item.dictionaryType === "car_type").map(({ dictionaryCode, dictionaryName }) => ({
              value: dictionaryCode,
              label: dictionaryName,
              key:dictionaryName
            }))
          )
        },
        carLoad: {
          label: '???????????? kg',
          component: 'input',
          addonAfter:'kg',
          style:{
            width:'200px'
          },
          placeholder: '?????????????????????',
          rules: {
            required: [true, '??????????????????????????????'],
            pattern: /^\d+(\.\d+)?$/
          }
        },
        carWeight: {
          label: '????????? kg',
          component: 'input',
          addonAfter:'kg',
          style:{
            width:'200px'
          },
          placeholder: '??????????????????',
          rules: {
            required: [true, '???????????????????????????'],
            pattern: /^\d+(\.\d+)?$/
          }
        },
        axlesNum: {
          label: '??????',
          component: 'select',
          placeholder: '?????????????????????',
          rules: {
            required: [true, '?????????????????????'],
          },
          options: AXLES_NUM_OPTIONS
        },
        isHeadstock: {
          label: '????????????',
          component: 'radio',
          options: HEAD_STOCK_OPTIONS,
          defaultValue:true,
          rules: {
            required: [true, '?????????????????????'],
          }
        },
        carBelong:{
          component: 'select',
          placeholder: '?????????????????????',
          rules: {
            required: [true, '?????????????????????'],
          },
          options:[{
            label:'????????????',
            value:1,
            key:1
          }, {
            label:'????????????',
            value:2,
            key:2
          }]
        },
        remarks: {
          component: 'input.textArea',
          props: {
            rows: 5
          },
          className:style.remarks,
          rules: {
            max: 100
          }
        }
      };
      this.setState({
        ready : true,
      });
    });

    this.timer = setInterval(() => {
      if (!this.endTime) return;
      if (this.endTime <= Date.parse(new Date())) {
        this.endTime= '';
        this.setState({ allow: false });
        const { location: { query: { carId: carsId } }, detailCars } = this.props;
        detailCars({ carsId });
      }
    }, 1000);
  }

  componentDidUpdate(p) {
    if (p.location.query.carId && p.location.query.carId !== this.props.location.query.carId){
      const { detailCars, location: { query: { carId: carsId } }, mode = FORM_MODE.ADD, commonStore } = this.props;
      if (mode !== FORM_MODE.ADD) {
        detailCars({ carsId });
      }
      this.currentTab = commonStore.tabs.find(item => item.id === commonStore.activeKey);
      this.localData = getLocal(this.currentTab.id) || { formData: {} };
    }
    this.schema={
      ...this.schema,
    };
  }

  componentWillUnmount () {
    clearInterval(this.timer);
    if (this.props.mode !== FORM_MODE.DETAIL) {
      const formData = this.form ? this.form.getFieldsValue() : null;
      localStorage.removeItem(this.currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(this.currentTab.id, JSON.stringify({
          formData,
        }));
        this.form.setFieldsValue({});
      }
    }
  }

  showModal = (userId) => () => {
    this.userId= userId;
    this.setState({
      passwordModal: true
    });
  }

  closePasswordModal = () => {
    this.setState({
      passwordModal: false,
      password: undefined
    });
  }

  setPassword = e => {
    const password = e.target.value;
    this.setState({
      password
    });
  }

  detailInfo = async () => {
    const { password } = this.state;
    if (!password.trim()) {
      return message.error('???????????????');
    }
    const { location: { query: { carId } }, dispatch } = this.props;
    dispatch({
      type: 'cars/detailInfo',
      payload: {
        carId,
        password: encodePassword(password.trim())
      }
    })
      .then((res) => {
        if (!res) return message.error('????????????');
        this.endTime = Date.parse(new Date()) + 180000;
        this.setState({ allow: true });
        this.closePasswordModal();
      });
  }

  checkDriverInfo = (formData, { validateFields }) => {
    let check = true;
    validateFields(['carNo'], (errors) => {
      if (errors) {
        check = false;
      }
    });
    if (check){
      const { carNo } = formData;
      this.bindCarNo = carNo;
      bindCarSearch({ carNo })
        .then(car=>{
          if (!car){
            Modal.confirm({
              content:this.noRegistConfirmBox(carNo),
              cancelText:'??????',
              okText:'??????',
              onOk: () => {
                carBasicAuth({ carNo })
                  .then(_car => {
                    this.carId = _car.carId;
                    Modal.success({
                      title: '??????',
                      content:'??????????????????'
                    });
                  });
              }
            });
          } else {
            Modal.confirm({
              content:this.confirmBox(car),
              cancelText:'??????',
              okText:'??????',
              onOk: () => {
                addShipmentCar({ carId:car.carId })
                  .then(()=>{
                    this.carId = car.carId;
                    Modal.success({
                      title: '??????',
                      content:'??????????????????',
                      onOk (){
                        router.goBack();
                      }
                    });
                  });
              }
            });
          }
        },
        );
    } else {
      Modal.error({
        title: '????????????',
        content:'????????????????????????'
      });
    }
  }

  noRegistConfirmBox = carNo => (
    <>
      <p>{`???????????????????????????${carNo}`}</p>
      <p>?????????????????????</p>
    </>
  )

  confirmBox=car=>(
    <>
      <p>{`???????????????????????????${car.carNo}`}</p>
      <p>?????????????????????</p>
    </>
  )

  goBack = () => {
    router.goBack();
  }

  patchData = (value) => {
    const { carNo, categoryList } = value;
    const newData = {
      ...value,
      categoryIdList : categoryList,
      drivingLicenseFrontDentryid: isArray(value.drivingLicenseFrontDentryid)? value.drivingLicenseFrontDentryid[0] : value.drivingLicenseFrontDentryid,
      drivingLicenseBackDentryid: isArray(value.drivingLicenseBackDentryid)? value.drivingLicenseBackDentryid[0] : value.drivingLicenseBackDentryid,
      drivingLicenseBackDentryidLast: isArray(value.drivingLicenseBackDentryidLast)? value.drivingLicenseBackDentryidLast[0] : value.drivingLicenseBackDentryidLast,
      roadTransportDentryid : isArray(value.roadTransportDentryid) ? value.roadTransportDentryid[0] : value.roadTransportDentryid,
      carFrontDentryid:isArray(value.carFrontDentryid)? value.carFrontDentryid[0] : value.carFrontDentryid,
      drivingLicenseValidityDate: value.drivingLicenseValidityDate ? moment(value.drivingLicenseValidityDate).format("YYYY/MM/DD HH:mm:ss") : undefined,
      carBodyDentryid:isArray(value.carBodyDentryid)? value.carBodyDentryid[0] : value.carBodyDentryid,
    };

    this.setState({
      noClicking:true,
      loading: true
    });

    const { location: { query: { carId, type } }, mode } = this.props;
    if (carNo !== this.bindCarNo && mode === FORM_MODE.ADD) {
      this.setState({
        noClicking: false,
        loading: false
      });
      return message.error('??????????????????');
    }

    if (type === 'plat'){
      editCar(carId || this.carId, newData).then(() => {
        notification.success({ message: '????????????', description: '??????????????????' });
        router.push('/certification-center/car');
        this.props.deleteTab(this.props.commonStore, { id: this.currentTab.id });
      })
        .catch(() => {
          this.setState({
            noClicking: false,
            loading: false
          });
        });
    } else {
      completeCarInfo({ carId:carId || this.carId, ...newData, consistencyCheck:false })
        .then(() => {
          notification.success({ message: '????????????', description: '??????????????????' });
          router.push('/basic-setting/carManagement');
          this.props.deleteTab(this.props.commonStore, { id: this.currentTab.id });
          // this.goBack();
        })
        .catch(() => {
          this.setState({
            noClicking: false,
            loading: false
          });
        });
    }

  }

  openView = () => {
    this.setState({
      imageView:true
    });
  }

  closeView = () => {
    this.setState({
      imageView:false
    });
  }

  render () {
    const { mode, noClicking, loading, imageView, passwordModal, password, allow, ready } = this.state;
    const { entity: data, showButton=true } = this.props;
    const newData = Object.assign( mode === 'add' ? {}  : data, this.localData.formData || {});
    const text = <span>??????????????????????????????????????????????????????</span>;
    return (
      <>
        {
          ready &&<SchemaForm
            data={newData}
            schema={this.schema}
            mode={mode}
            trigger={{ allow }}
            hideRequiredMark
            {...formLayout}
          >
            <FormCard
              title={
                this.props.mode === FORM_MODE.DETAIL && this.props.location.query.carId && !this.props?.entity?.show?
                  <>
                    ????????????
                    <Icon
                      onClick={this.showModal()}
                      title='???????????????????????????'
                      style={{ cursor: 'pointer', fontSize: '20px', marginTop: '3px', marginLeft: '6px', color: 'rgb(179,179,179)' }}
                      type="lock"
                    />
                  </>
                  :
                  '????????????'
              }
              colCount="1"
            >
              <Row>
                <Col {...imgGrid}>
                  <Item field="carNo" />
                  {mode === FORM_MODE.ADD &&
                  <Tooltip placement="right" title={text}>
                    <DebounceFormButton validate={false} label="????????????" type='primary' onClick={this.checkDriverInfo} />
                  </Tooltip>}
                </Col>
                <Col {...typeGrid}>
                  <Item field='categoryList' />
                </Col>
                <Col {...imgGrid}>
                  <Item field="carGroupName" />
                </Col>
              </Row>

            </FormCard>
            <FormCard title='????????????' colCount="1">
              <Row>
                <Col {...imgGrid}>
                  <Item field="drivingLicenseFrontDentryid" />
                </Col>
                <Col {...imgGrid}>
                  <Item field="drivingLicenseBackDentryid" />
                </Col>
                <Col {...imgGrid}>
                  <Item field="drivingLicenseBackDentryidLast" />
                </Col>
                <Col {...inputGrid}>
                  <Item field="engineNo" />
                </Col>
                <Col {...inputGrid}>
                  <Item field="frameNo" />
                </Col>
              </Row>
              <Row>
                <Col {...imgGrid}>
                  <Item field="carFrontDentryid" />
                </Col>
                <Col {...imgGrid}>
                  <Item field="carBodyDentryid" />
                </Col>
                <Col {...inputGrid}>
                  <Item field="drivingLicenseValidityDate" />
                </Col>
              </Row>
              <div className={`${style.season} ${style.mt10}`}>???????????????</div>
              <Row>
                <Col {...imgGrid}>
                  <img onClick={this.openView} style={{ width:'70%', height:'70%' }} src={numTemp} alt='' />
                  <div>(????????????)</div>
                </Col>
                <Col {...imgGrid}>
                  <Item field='roadTransportDentryid' />
                </Col>
                <Col {...inputGrid}>
                  <Item field="roadTransportNo" />
                </Col>
                <Col {...inputGrid}>
                  <Item field="transportLicenseNo" />
                </Col>
              </Row>
              <div className={`${style.season} ${style.mt10}`}>????????????</div>
              <Row>
                <Col {...inputGrid}>
                  <Item field="carLength" />
                </Col>
                <Col {...inputGrid}>
                  <Item field="carType" />
                </Col>
                <Col {...inputGrid}>
                  <Item field="carLoad" />
                </Col>
                <Col {...inputGrid}>
                  <Item field="carWeight" />
                </Col>
                <Col {...inputGrid}>
                  <Item field="axlesNum" />
                </Col>
              </Row>
              <Row>
                <Col {...inputGrid}>
                  <Item field="isHeadstock" />
                </Col>
              </Row>
            </FormCard>
            <div className={`${style.season} ${style.mt10}`}>????????????</div>
            {this.props.mode === FORM_MODE.DETAIL ? <div>{data.organizationName || '-'}</div> : <Item field="carBelong" />}
            <div className={`${style.season} ${style.mt10}`}>??????(??????)</div>
            <Item field="remarks" />
            {showButton &&
            <div style={{ textAlign: 'right' }}>
              <Button className='mr-10' type='default' onClick={this.goBack}>??????</Button>
              {mode !== FORM_MODE.DETAIL && <DebounceFormButton disabled={noClicking} validate label='??????' type='primary' onClick={this.patchData} />}
            </div>}
          </SchemaForm>
        }

        <Modal
          title='????????????'
          footer={null}
          width={948}
          maskClosable={false}
          destroyOnClose
          visible={imageView}
          onCancel={this.closeView}
        >
          <ImageDetail height={500} width={800} imageData={[numTemp]} />
        </Modal>
        <Modal
          title='????????????'
          width={800}
          maskClosable={false}
          destroyOnClose
          visible={passwordModal}
          onCancel={this.closePasswordModal}
          onOk={this.detailInfo}
        >
          <p style={{ display: 'block', width: '100%', textAlign: 'center', 'fontSize': '14px', color: '#999', margin: '30px auto' }}>???????????????????????????????????????<a href='/userAgreement'>????????????????????????</a>??????????????????????????????????????????????????????????????????????????????</p>
          <div
            style={{ display: 'block', width: '50%', textAlign: 'center', margin: '40px auto 40px' }}
          >
            <Input type='password' placeholder='???????????????????????????' autoComplete='new-password' onChange={this.setPassword} value={password} />
          </div>
        </Modal>
        <OwnModal loading={loading} />
      </>
    );
  }
}
