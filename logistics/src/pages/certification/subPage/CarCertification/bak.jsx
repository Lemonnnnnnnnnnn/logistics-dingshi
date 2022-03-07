import React from 'react';
import { SchemaForm, FormCard, FORM_MODE, Item, FormButton, Observer } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import { notification, Button } from 'antd';
import moment from 'moment';
import DebounceFormButton from '@/components/DebounceFormButton';
import { CERTIFICATE_TYPE } from '@/constants/certification/certificationType';
import CarCertificationEvents from './CarCertificationEvents';
import BindStore from '@/utils/BindStore';
import '@gem-mine/antd-schema-form/lib/fields';
import UploadFile from '@/components/Upload/UploadFile';

const { ADD, DETAIL } = FORM_MODE;
const PASS = 1;
const REJECT = 0;
@BindStore('cars', {
  mapStateToProps (state) {
    state.entity.certificationEvents = state.certificationEvents;
    return state;
  }
})

export default class CarManage extends React.Component {
  formSchema = {
    carNo: {
      label: '车牌号',
      component: 'input.text'
    },
    transportLicenseNo: {
      label: '道路运输证号',
      component: 'input.text'
    },
    carLoad: {             // todo 支持数字输入框
      label: '载重数量（吨）',
      component: 'input.text'
    },
    carType: {
      label: ' 车辆类型',
      component: 'select.text'
    },
    axlesNum: {
      label: '轴数',
      component: 'input.text'
    },
    isHeadstock: {
      label: '是否车头',
      component: 'input.text'
    },
    engineNo:{
      label: '发动机号',
      component: 'input.text'
    },
    carWeight:{
      label: '车辆自重',
      component: 'input.text'
    },
    frameNo: {
      label: '车架号',
      component: 'input.text'
    },
    carLength: {
      label: '车长(米)',
      component: 'input.text'
    },
    carWidth: {
      label: '车宽(米)',
      component: 'input.text'
    },
    dateOfPurchase: {
      label: '购车日期',
      component: 'datePicker.text',
      format:{
        input:(value)=>value?moment(value):undefined
      }
    },
    annualTrialDate: {
      label: '年审日期',
      component: 'datePicker.text',
      format:{
        input:(value)=>value?moment(value):undefined
      }
    },
    insuranceOverdueDate:{
      label: '交强险到期日期',
      component: 'datePicker.text',
      format:{
        input:(value)=>value ? moment(value):undefined
      }
    },
    bussinessOverdueDate:{
      label: '商业险到期日期',
      component: 'datePicker.text',
      format:{
        input:(value)=>value?moment(value):undefined
      }
    },
    permitFrontDentryid:{
      component: UploadFile,
      colSpan: 8,
      labelUpload: '行驶证照片',
      props: {
        readOnly: true
      }
    },
    permitBackDentryid: {
      component: UploadFile,
      colSpan: 8,
      labelUpload: '运营证照片',
      props: {
        readOnly: true
      }
    },
    remarks:{
      label: '备注',
      component: 'input.text',
      rows: 5
    },
    certificationEvents: {
      component: CarCertificationEvents
    },
    verifyStatus: {
      label: '审核',
      component: 'radio',
      defaultValue: 1,
      options: [{
        key: 1,
        label: '通过',
        value: 1
      }, {
        key: 0,
        label: '拒绝',
        value: 0
      }],
      rules:{
        required: [true, '请选择审核状态']
      }
    },
    pass_reason: {
      label: '备注（可选）',
      component: 'input.textArea',
      placeholder: '请输入备注',
      visible:Observer({
        watch:'verifyStatus',
        action: verifyStatus => verifyStatus === PASS
      }),
      rules: {
        max: 500
      },
      keepAlive: false,
    },
    reject_reason:{
      label: '拒绝原因',
      component: 'input.textArea',
      placeholder: '请输入拒绝原因',
      rules: {
        required: true,
        max: 150
      },
      visible:Observer({
        watch: 'verifyStatus',
        action: verifyStatus => verifyStatus === REJECT
      }),
      keepAlive: false
    }
  }

  state = {
    ready:false
  }

  componentDidMount () {
    const { location: { query: { carId: carsId } }, detailCars, getCertificationEvents } = this.props;
    Promise.all([detailCars({ carsId }), getCertificationEvents(carsId)])
      .then(()=>{
        this.setState({
          ready:true
        });
      });
  }

  handleBtnClick = (value) => {
    const { entity: { carId }, certificateCar } = this.props;
    const certificationEntity = {
      verifyObjectType: CERTIFICATE_TYPE.CAR,
      verifyObjectId: carId,
      verifyReason: value.verifyReason,
      verifyStatus: value.verifyStatus
    };

    certificateCar(certificationEntity)
      .then((data) => {
        if (data) {
          notification.success({ message: '操作成功', description: '审核成功' });
          router.push('/certification-center/car');
        }
      });
  }

  render () {
    const { ready } = this.state;
    const { entity, location } = this.props;
    const isDetail = location.pathname.endsWith('detail');
    const formLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };
    return (
      ready &&
      <SchemaForm layout="vertical" data={entity} mode={isDetail ? DETAIL : ADD} schema={this.formSchema}>
        <FormCard title="基础信息" colCount="3">
          <Item {...formLayout} field="carNo" />
          <Item {...formLayout} field="transportLicenseNo" />
          <Item {...formLayout} field="carLoad" />
        </FormCard>
        <FormCard title="详细信息" colCount="3">
          <Item {...formLayout} field='engineNo' />
          <Item {...formLayout} field="carWeight" />
          <Item {...formLayout} field='frameNo' />
          <Item {...formLayout} field='carLength' />
          <Item {...formLayout} field='carWidth' />
          <Item {...formLayout} field='dateOfPurchase' />
          <Item {...formLayout} field='annualTrialDate' />
          <Item {...formLayout} field='insuranceOverdueDate' />
          <Item {...formLayout} field='bussinessOverdueDate' />
          <div>
            <div className='fw-bold'>上传证件照片</div>
            <div style={{ display: 'inline-block' }}>
              <Item className='formControl' field="permitFrontDentryid" />
            </div>
            <div style={{ display: 'inline-block' }}>
              <Item className='formControl' field="permitBackDentryid" />
            </div>
          </div>
          <Item {...formLayout} field="remarks" />
        </FormCard>
        <FormCard title="审核记录">
          <Item field="certificationEvents" />
        </FormCard>
        {
          !isDetail
            ? (
              <FormCard title="审核信息" colCount="2">
                <Item {...formLayout} field="verifyStatus" />
                <Item {...formLayout} field="pass_reason" />
                <Item {...formLayout} field="reject_reason" />
              </FormCard>
            )
            : null
        }
        <div style={{ paddingRight:'20px', textAlign:'right' }}>
          { isDetail ?
            <Button onClick={()=>{ router.push('/certification-center/car'); }}>返回</Button>
            :
            <>
              <Button className="mr-10" onClick={()=>{ router.push('/certification-center/car'); }}>取消</Button>
              <DebounceFormButton label="保存" type="primary" onClick={this.handleBtnClick} />
            </>
          }

        </div>
      </SchemaForm>
    );
  }
}
