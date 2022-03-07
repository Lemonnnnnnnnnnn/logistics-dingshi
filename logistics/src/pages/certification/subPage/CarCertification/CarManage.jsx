import React from 'react';
import router from 'umi/router';
import { Button, notification } from 'antd';
import { SchemaForm, FormCard, FORM_MODE, Item, FormButton, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import { CERTIFICATE_TYPE } from '@/constants/certification/certificationType';
import { getCertificationEvents, certificate } from '@/services/apiService';
import CarDetail from '@/pages/BasicSetting/CarManagement/CarManage';
import CarCertificationEvents from './CarCertificationEvents';

const PASS = 1;
const REJECT = 0;

export default class CarManage extends React.Component {

  constructor (props) {
    super(props);
    this.formSchema = {
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
    };
    this.state = {
      events:[],
      ready:false
    };
  }

  componentDidMount () {
    const { location: { query: { carId: carsId } } } = this.props;
    getCertificationEvents({ authObjId:carsId, authObjType: 3 })
      .then((res)=>{
        this.setState({
          ready:true,
          events:res.items
        });
      });
  }

  handleBtnClick = (value) => {
    const { location: { query: { carId } } } = this.props;
    const certificationEntity = {
      verifyObjectType: CERTIFICATE_TYPE.CAR,
      verifyObjectId: carId,
      verifyReason: value.reject_reason || value.pass_reason,
      verifyStatus: value.verifyStatus
    };

    certificate(certificationEntity)
      .then((data) => {
        if (data) {
          notification.success({ message: '操作成功', description: '审核成功' });
          router.push('/certification-center/car');
        }
      });
  }

  render () {
    const { location:{ pathname } } = this.props;
    const { ready, events } = this.state;
    const isDetail = pathname.endsWith('detail');
    return (
      ready &&
      <>
        <CarDetail mode={FORM_MODE.DETAIL} showButton={false} {...this.props} />
        <SchemaForm layout="vertical" mode={isDetail ? FORM_MODE.DETAIL : FORM_MODE.ADD} schema={this.formSchema}>
          <FormCard title="审核记录">
            <CarCertificationEvents value={events} />
          </FormCard>
          {isDetail?
            <div style={{ paddingRight:'20px', textAlign:'right' }}>
              <Button onClick={()=>{ router.goBack(); }}>返回</Button>
            </div>
            :
            <FormCard title="审核信息" colCount="2">
              <Item field="verifyStatus" />
              <Item field="pass_reason" />
              <Item field="reject_reason" />
            </FormCard>
          }
          {isDetail?
            null
            :
            <div style={{ paddingRight: '20px', textAlign: 'right' }}>
              <Button style={{ marginRight:'10px' }} onClick={() => { router.goBack(); }}>返回</Button>
              <DebounceFormButton label="保存" type="primary" onClick={this.handleBtnClick} />
            </div>
          }
        </SchemaForm>
      </>
    );
  }
}
