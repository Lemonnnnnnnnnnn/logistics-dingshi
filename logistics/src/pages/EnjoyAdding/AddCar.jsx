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
          label: '?????????',
          component: 'input',
          style:{
            width:'200px'
          },
          placeholder: '?????????????????????',
          rules: {
            required: [true, '???????????????????????????'],
            pattern: /^[???????????????????????????????????????????????????????????????????????????????????????????????????A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9???????????????]{1}$/
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
        carFrontDentryid: {
          component: UploadFile,
          label:'????????????',
          labelUpload: '????????????????????????',
          rules: {
            required: [true, '?????????????????????'],
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
          label: '?????? kg',
          component: 'input',
          addonAfter:'kg',
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
        notification.success({ message: '????????????', description: '????????????' });
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
            title='????????????'
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
          <Item field="carBelong" />
          <div className={`${style.season} ${style.mt10}`}>??????(??????)</div>
          <Item field="remarks" />
          {showButton &&
          <div style={{ textAlign: 'right' }}>
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
        <OwnModal loading={loading} />
      </>
    );
  }
}
