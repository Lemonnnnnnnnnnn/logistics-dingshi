 import React, { Component } from 'react';
import { Modal, notification, Col, Row } from 'antd';
import { connect } from 'dva';
import { SchemaForm, Item, FormCard, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../components/DebounceFormButton';
import { AXLES_NUM_OPTIONS, HEAD_STOCK_OPTIONS } from '../../constants/car';
import { isArray, getLocal } from '../../utils/utils';

import numTemp from '../../assets/numTemp.png';
import ImageDetail from '../../components/ImageDetail';
import { getGoodsCategories, platAddCar } from "../../services/apiService";
import '@gem-mine/antd-schema-form/lib/fields';
import UploadFile from '../../components/Upload/UploadFile';
import OwnModal from '../../components/Modal';
import MultipleCheckButton from "../BasicSetting/CarManagement/component/MultipleCheckButton";
import style from './AddCar.less';

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

@connect(state => ({
  dictionaries: state.dictionaries.items,
  commonStore: state.commonStore,
}), mapDispatchToProps)
export default class AddCar extends Component {
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
      ready : false
    };
  }

  componentWillUnmount () {
    clearInterval(this.timer);
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData,
      }));
    }
  }

  componentDidMount() {
    const { mode = FORM_MODE.ADD } = this.props;
    getGoodsCategories({ parentId : 0 }).then(({ items }) => {
      const tagsArray = items.map(item=>({ id : item.categoryId, name : item.categoryName }));
      this.schema = {
        carNo: {
          label: '车牌号',
          component: 'input',
          style:{
            width:'200px'
          },
          placeholder: '请输入车牌号码',
          rules: {
            required: [true, '请输入正确的车牌号'],
            pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/
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
        carFrontDentryid: {
          component: UploadFile,
          label:'车头照片',
          labelUpload: '点击上传车头照片',
          rules: {
            required: [true, '请上传车头照片'],
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
          label: '车长 mm',
          component: 'input',
          addonAfter:'mm',
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
          label: '载重 kg',
          component: 'input',
          addonAfter:'kg',
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
          label: '车辆自重 kg',
          component: 'input',
          addonAfter:'kg',
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
    platAddCar(newData)
      .then(() => {
        notification.success({ message: '操作成功', description: '添加成功' });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
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
    const { mode, noClicking, loading, imageView, ready } = this.state;
    const { showButton = true } = this.props;
    const data = Object.assign( {}, this.localData.formData || {});
    return (
      <>{
        ready &&
        <SchemaForm
          schema={this.schema}
          mode={mode}
          data={data}
          hideRequiredMark
          {...formLayout}
        >
          <FormCard
            title='基础认证'
            colCount="1"
          >
            <Row>
              <Col {...imgGrid}>
                <Item field="carNo" />
              </Col>
              <Col {...typeGrid}>
                <Item field='categoryList' />
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
          <Item field="carBelong" />
          <div className={`${style.season} ${style.mt10}`}>备注(可选)</div>
          <Item field="remarks" />
          {showButton &&
          <div style={{ textAlign: 'right' }}>
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
        <OwnModal loading={loading} />
      </>
    );
  }
}
