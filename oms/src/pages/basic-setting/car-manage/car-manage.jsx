import React, { Component } from 'react';
import { Modal, notification, Button, Tooltip, Col, Row, message, Icon, Input } from 'antd';
import router from 'umi/router';
import { connect } from 'dva';
import { SchemaForm, Item, FormCard, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../components/debounce-form-button';
import { AXLES_NUM_OPTIONS, HEAD_STOCK_OPTIONS } from '../../../constants/car';
import { isArray, encodePassword } from '../../../utils/utils';
import numTemp from '../../../assets/numTemp.png';
import ImageDetail from '../../../components/image-detail';
import { bindCarSearch, addShipmentCar, carBasicAuth, completeCarInfo, getGoodsCategories } from '../../../services/apiService';
import '@gem-mine/antd-schema-form/lib/fields';
import UploadFile from '../../../components/upload/upload-file';
import OwnModal from '../../../components/modal';
import MultipleCheckButton from "./component/multiple-check-button";
import style from './car-manage.less';

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
    entity
  });
}, mapDispatchToProps)
export default class AddCar extends Component {

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

  componentDidMount () {
    const { detailCars, location: { query: { carId: carsId } }, mode = FORM_MODE.ADD } = this.props;
    if (mode !== FORM_MODE.ADD) {
      detailCars({ carsId });
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
          visible: readOnly && JSON.parse(localStorage.getItem('token')).organizationType === 5
        },
        carFrontDentryid: {
          component: UploadFile,
          label:'????????????',
          labelUpload: '????????????????????????',
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
        drivingLicenseFrontDentryid: {
          component: UploadFile,
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
        },
        drivingLicenseBackDentryid: {
          component: UploadFile,
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
          }
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
          label: '??????',
          component: 'input',
          addonAfter:'???',
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
          label: '??????',
          component: 'input',
          addonAfter:'???',
          style:{
            width:'200px'
          },
          placeholder: '???????????????',
          rules: {
            required: [true, '????????????????????????'],
            pattern: /^\d+(\.\d+)?$/
          }
        },
        carWeight: {
          label: '????????????',
          component: 'input',
          addonAfter:'???',
          style:{
            width:'200px'
          },
          placeholder: '?????????????????????',
          rules: {
            required: [true, '??????????????????????????????'],
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
        ready : true
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

  componentWillUnmount () {
    clearInterval(this.timer);
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
    const newData = { ...value,
      categoryIdList : categoryList,
      drivingLicenseFrontDentryid: isArray(value.drivingLicenseFrontDentryid)? value.drivingLicenseFrontDentryid[0] : value.drivingLicenseFrontDentryid,
      drivingLicenseBackDentryid: isArray(value.drivingLicenseBackDentryid)? value.drivingLicenseBackDentryid[0] : value.drivingLicenseBackDentryid,
      roadTransportDentryid : isArray(value.roadTransportDentryid) ? value.roadTransportDentryid[0] : value.roadTransportDentryid,
      carFrontDentryid:isArray(value.carFrontDentryid)? value.carFrontDentryid[0] : value.carFrontDentryid,
    };

    this.setState({
      noClicking:true,
      loading: true
    });

    const { location: { query: { carId } }, mode } = this.props;
    if (carNo !== this.bindCarNo && mode === FORM_MODE.ADD) {
      this.setState({
        noClicking: false,
        loading: false
      });
      return message.error('??????????????????');
    }
    completeCarInfo({ carId:carId || this.carId, ...newData, consistencyCheck:true })
      .then(() => {
        notification.success({ message: '????????????', description: '??????????????????' });
        this.goBack();
      })
      .catch(() => {
        this.setState({
          noClicking: false,
          loading: false
        });
      });
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
    const text = <span>??????????????????????????????????????????????????????</span>;
    return (
      <>
        {
          ready &&<SchemaForm
            data={data}
            schema={this.schema}
            mode={mode}
            trigger={{ allow }}
            hideRequiredMark
            {...formLayout}
          >
            <FormCard
              title={
                this.props.mode === FORM_MODE.DETAIL && this.props.location.query.carId && this.props?.entity?.engineNo?.indexOf('*') !== -1?
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
