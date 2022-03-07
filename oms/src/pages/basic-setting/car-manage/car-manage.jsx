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
      const readOnly = mode === FORM_MODE.DETAIL; // 在schema中会用到readOnly
      const tagsArray = items.map(item=>({ id : item.categoryId, name : item.categoryName }));

      this.schema = {
        carNo: {
          label: '车牌号',
          component: readOnly? 'input.text':'input',
          style:{
            width:'200px'
          },
          placeholder: '请输入车牌号码',
          rules: {
            required: [true, '请输入正确的车牌号'],
            pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/
          },
        },
        categoryList : {
          label : (
            <div>
              <span>车辆类型</span>
              <span className='color-gray' style={{ fontSize : '12px', marginLeft : '5px' }}>可承接业务类型（多选）</span>
            </div>),
          component : MultipleCheckButton,
          props: {
            tagsFromServer: tagsArray,
          },
          rules:{
            required : [true, '请选择车辆可承接类型']
          }
        },
        carGroupName: {
          label: '车组名称',
          component: readOnly? 'input.text':'input',
          visible: readOnly && JSON.parse(localStorage.getItem('token')).organizationType === 5
        },
        carFrontDentryid: {
          component: UploadFile,
          label:'车头照片',
          labelUpload: '点击上传车头照片',
          rules: {
            required: readOnly?[false]:[true, '请上传车头照片'],
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
          label:'行驶证正页',
          labelUpload: '点击上传行驶证正页',
          rules: {
            required: [true, '请上传行驶证正页照片'],
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
          label:'行驶证副页',
          labelUpload: '点击上传行驶证副页',
          rules: {
            required: [true, '请上传行驶证副页照片'],
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
          label: '发动机号',
          component: 'input',
          style:{
            width:'200px'
          },
          placeholder: '请输入发动机号',
          rules: {
            required: [true, '请输入正确的发动机号'],
          }
        },
        frameNo: {
          label: '车架号',
          component: 'input',
          style:{
            width:'200px'
          },
          placeholder: '请输入车架号',
          rules: {
            required: [true, '请输入正确的车架号'],
          }
        },
        transportLicenseNo: {
          label: '道路运输经营许可证号',
          component: 'input',
          style:{
            width:'200px'
          },
          placeholder: '请输入道路运输经营许可证号',
          rules: {
            required: [true, '请输入正确的道路运输经营许可证号'],
          }
        },
        roadTransportDentryid:{
          component: UploadFile,
          label:'道路运输证照片',
          labelUpload: '点击上传道路运输证照片',
          rules: {
            required: [true, '请上传道路运输证照片'],
          },
        },
        roadTransportNo: {
          label: '道路运输证号',
          component: 'input',
          style:{
            width:'200px'
          },
          placeholder: '请输入道路运输证号',
          rules: {
            required: [true, '请输入正确的道路运输证号'],
          }
        },
        carLength: {
          label: '车长',
          component: 'input',
          addonAfter:'米',
          style:{
            width:'200px'
          },
          placeholder: '请输入车长',
          rules: {
            required: [true, '请输入正确的车长'],
            pattern: /^\d+(\.\d+)?$/
          }
        },
        carType: {
          label: '车型',
          component: 'select',
          placeholder: '请选择车辆类型',
          rules: {
            required: [true, '请选择车辆类型'],
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
          label: '载重',
          component: 'input',
          addonAfter:'吨',
          style:{
            width:'200px'
          },
          placeholder: '请输入载重',
          rules: {
            required: [true, '请输入正确的载重'],
            pattern: /^\d+(\.\d+)?$/
          }
        },
        carWeight: {
          label: '车辆自重',
          component: 'input',
          addonAfter:'吨',
          style:{
            width:'200px'
          },
          placeholder: '请输入车辆自重',
          rules: {
            required: [true, '请输入正确的车辆自重'],
            pattern: /^\d+(\.\d+)?$/
          }
        },
        axlesNum: {
          label: '轴数',
          component: 'select',
          placeholder: '请选择车辆轴数',
          rules: {
            required: [true, '请选择车辆轴数'],
          },
          options: AXLES_NUM_OPTIONS
        },
        isHeadstock: {
          label: '是否车头',
          component: 'radio',
          options: HEAD_STOCK_OPTIONS,
          defaultValue:true,
          rules: {
            required: [true, '请选择是否车头'],
          }
        },
        carBelong:{
          component: 'select',
          placeholder: '请选择车辆所属',
          rules: {
            required: [true, '请选择车辆所属'],
          },
          options:[{
            label:'自有车辆',
            value:1,
            key:1
          }, {
            label:'外部车辆',
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
      return message.error('请输入密码');
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
        if (!res) return message.error('密码错误');
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
              cancelText:'取消',
              okText:'添加',
              onOk: () => {
                carBasicAuth({ carNo })
                  .then(_car => {
                    this.carId = _car.carId;
                    Modal.success({
                      title: '成功',
                      content:'添加车辆成功'
                    });
                  });
              }
            });
          } else {
            Modal.confirm({
              content:this.confirmBox(car),
              cancelText:'取消',
              okText:'添加',
              onOk: () => {
                addShipmentCar({ carId:car.carId })
                  .then(()=>{
                    this.carId = car.carId;
                    Modal.success({
                      title: '成功',
                      content:'添加车辆成功',
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
        title: '信息不足',
        content:'请先填写基础认证'
      });
    }
  }

  noRegistConfirmBox = carNo => (
    <>
      <p>{`未查询到相关车辆：${carNo}`}</p>
      <p>是否注册车辆？</p>
    </>
  )

  confirmBox=car=>(
    <>
      <p>{`系统已存在该车辆：${car.carNo}`}</p>
      <p>是否直接添加？</p>
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
      return message.error('请先检测车辆');
    }
    completeCarInfo({ carId:carId || this.carId, ...newData, consistencyCheck:true })
      .then(() => {
        notification.success({ message: '操作成功', description: '完善资料成功' });
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
    const text = <span>填入车牌号，可对已有车辆进行快速添加</span>;
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
                    基础认证
                    <Icon
                      onClick={this.showModal()}
                      title='点击可查看全部信息'
                      style={{ cursor: 'pointer', fontSize: '20px', marginTop: '3px', marginLeft: '6px', color: 'rgb(179,179,179)' }}
                      type="lock"
                    />
                  </>
                  :
                  '基础认证'
              }
              colCount="1"
            >
              <Row>
                <Col {...imgGrid}>
                  <Item field="carNo" />
                  {mode === FORM_MODE.ADD &&
                  <Tooltip placement="right" title={text}>
                    <DebounceFormButton validate={false} label="检测车辆" type='primary' onClick={this.checkDriverInfo} />
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
            <FormCard title='详细信息' colCount="1">
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
              <div className={`${style.season} ${style.mt10}`}>道路运输证</div>
              <Row>
                <Col {...imgGrid}>
                  <img onClick={this.openView} style={{ width:'70%', height:'70%' }} src={numTemp} alt='' />
                  <div>(证号图示)</div>
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
              <div className={`${style.season} ${style.mt10}`}>其他信息</div>
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
            <div className={`${style.season} ${style.mt10}`}>车辆所属</div>
            {this.props.mode === FORM_MODE.DETAIL ? <div>{data.organizationName || '-'}</div> : <Item field="carBelong" />}
            <div className={`${style.season} ${style.mt10}`}>备注(可选)</div>
            <Item field="remarks" />
            {showButton &&
            <div style={{ textAlign: 'right' }}>
              <Button className='mr-10' type='default' onClick={this.goBack}>返回</Button>
              {mode !== FORM_MODE.DETAIL && <DebounceFormButton disabled={noClicking} validate label='保存' type='primary' onClick={this.patchData} />}
            </div>}
          </SchemaForm>
        }

        <Modal
          title='图片示例'
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
          title='查看详情'
          width={800}
          maskClosable={false}
          destroyOnClose
          visible={passwordModal}
          onCancel={this.closePasswordModal}
          onOk={this.detailInfo}
        >
          <p style={{ display: 'block', width: '100%', textAlign: 'center', 'fontSize': '14px', color: '#999', margin: '30px auto' }}>严格遵守公司信息网络管理及<a href='/userAgreement'>《用户使用协议》</a>，不得将公司信息网络他人个人信息以任何形式向外界泄露</p>
          <div
            style={{ display: 'block', width: '50%', textAlign: 'center', margin: '40px auto 40px' }}
          >
            <Input type='password' placeholder='请输入您的登录密码' autoComplete='new-password' onChange={this.setPassword} value={password} />
          </div>
        </Modal>
        <OwnModal loading={loading} />
      </>
    );
  }
}
