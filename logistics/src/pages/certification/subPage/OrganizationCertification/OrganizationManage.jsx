import React from 'react';
import { SchemaForm, FormCard, FORM_MODE, Item, FormButton, Observer } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import { notification, Row, Col, Button } from 'antd';
import DebounceFormButton from '@/components/DebounceFormButton';
import BindStore from '@/utils/BindStore';
import { RADIO_ROLE } from '@/constants/authentication/authentication';
import { getAllOperator } from '@/services/apiService';
import CertificationEvents from './OrganizationCertificationEvents';
import '@gem-mine/antd-schema-form/lib/fields';
import UploadFile from '@/components/Upload/UploadFile';

const { DETAIL } = FORM_MODE;
const PASS = 1;
const REJECT = 0;
@BindStore('organizations', {
  mapStateToProps (state) {
    state.entity.certificationEvents = state.certificationEvents;
    return state;
  }
})
export default class OrganizationManage extends React.Component {

  formSchema = {
    certificationEvents: {
      component: CertificationEvents
    },
    authenticationType: {
      label: '认证类型',
      component: 'select.text',
      options: [{
        value: 0,
        label: '公司认证'
      }, {
        value: 1,
        label: '个人认证'
      }]
    },
    userName: {
      label: '登录账号',
      component: 'input.text'
    },
    organizationName: {
      label: '公司名称',
      component: 'input.text'
    },
    organizationAddress: {
      label: '地址',
      component: 'input.text'
    },
    legalName: {
      label: '法人姓名',
      component: 'input.text'
    },
    creditCode: {
      label: '统一信用代码',
      component: 'input.text'
    },
    contactName:{
      label: '企业联系人',
      component: 'input.text'
    },
    contactPhone: {
      label: '企业联系电话',
      component: 'input.text'
    },
    bussinessLicenseDentryid:{
      label: '上传企业营业执照照片',
      component: UploadFile,
      labelUpload: '企业营业执照',
      props:{
        mode: FORM_MODE.DETAIL
      }
    },
    registTime: {
      label: '公司注册日期',
      component: 'datePicker.text'
    },
    registMoney:{
      label: '公司注册资金',
      addonAfter: '万元',
      component: 'input.text'
    },
    agentName:{
      label: '代理人姓名',
      component: 'input.text'
    },
    agentPhone:{
      label: '代理人电话',
      component: 'input.text'
    },
    agentAuthorizationDentryid: {
      label: '代理人授权书',
      component: UploadFile,
      labelUpload: '代理人授权书',
      props:{
        mode: FORM_MODE.DETAIL
      }
    },
    idcardFrontDentryid: {
      colSpan: 8,
      component: UploadFile,
      labelUpload: '身份证正面（头像面）',
      props:{
        mode: FORM_MODE.DETAIL
      }
    },
    idcardBackDentryid: {
      colSpan: 8,
      component: UploadFile,
      labelUpload: '身份证反面（国徽面）',
      props:{
        mode: FORM_MODE.DETAIL
      }
    },
    corporationFrontDentryid:{
      colSpan: 8,
      component: UploadFile,
      labelUpload: '身份证反面（国徽面）',
      props:{
        mode: FORM_MODE.DETAIL
      }
    },
    corporationBackDentryid: {
      colSpan: 8,
      component: UploadFile,
      labelUpload: '身份证反面（国徽面）',
      props:{
        mode: FORM_MODE.DETAIL
      }
    },
    agentFrontDentryid: {
      colSpan: 8,
      component: UploadFile,
      labelUpload: '身份证反面（国徽面）',
      props:{
        mode: FORM_MODE.DETAIL
      }
    },
    agentBackDentryid: {
      colSpan: 8,
      component: UploadFile,
      labelUpload: '身份证反面（国徽面）',
      props:{
        mode: FORM_MODE.DETAIL
      }
    },
    transportLicenseDentryid: {
      label: '道路运输许可证',
      component: UploadFile,
      labelUpload: '道路运输许可证',
      props:{
        mode: FORM_MODE.DETAIL
      }
    },
    parentId: {
      label: '所属运营方',
      component: 'select.text',
      options: async () => {
        const { items } = await getAllOperator();
        const result = items.map(item => ({
          key: item.organizationId,
          value: item.organizationId,
          label: item.organizationName
        }));
        return result;
      }
    },
    nickName:{
      label: '姓名',
      component: 'input.text'
    },
    'verifyStatus':{
      label: '审核',
      component: 'radio',
      defaultValue: 1,
      options: [{
        // key: 1,
        label: '通过',
        value: 1
      }, {
        // key: 0,
        label: '拒绝',
        value: 0
      }],
      rules: {
        required: [ true, '请选择审核状态']
      }
    },
    pass_reason: {
      label: '备注（可选）',
      component: 'input.textArea',
      placeholder: '请输入备注',
      visible: Observer({
        watch:'verifyStatus',
        action: verifyStatus => (verifyStatus === PASS)
      }),
      keepAlive: false
    },
    reject_reason:{
      label: '拒绝原因',
      component: 'input.textArea',
      visible: Observer({
        watch:'verifyStatus',
        action: verifyStatus => (verifyStatus === REJECT)
      }),
      keepAlive: false,
      placeholder: '请输入拒绝原因',
      rules: {
        required: true
      }
    }
  }

  handleCancelBtnClick = () => { router.push(`/certification-center/${this.props.organization.title}`); }

  handleSaveBtnClick = value => {
    const { entity: { organizationId }, organization, certificateOrganization } = this.props;
    const certificationEntity = {
      verifyObjectType: organization.verifyType,
      verifyObjectId: organizationId,
      verifyReason: value.reject_reason
      ,
      verifyStatus: value.verifyStatus
    };
    certificateOrganization(certificationEntity)
      .then((data) => {
        if (data) {
          notification.success({ message: '操作成功', description: '审核成功' });
          router.push(`/certification-center/${organization.title}`);
        }
      });
  }

  componentDidMount () {
    const { organizationsId, detailOrganizations, getCertificationEvents } = this.props;
    // 先请求审核记录，然后再请求详情数据
    getCertificationEvents(organizationsId).then(() => {
      detailOrganizations({ organizationsId });
    });
  }

  renderTransportLicenseDentryid = () => {
    const formLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };
    const field = this.props.entity.organizationType === 5
      ? <Item {...formLayout} field='transportLicenseDentryid' />
      : null;
    return field;
  }

  renderCorporationDentryid = () => {
    const { applicationType } = this.props.entity;
    const field = applicationType
      ? null
      : (
        <div>
          <div className='fw-bold'>法人身份证</div>
          <Item className='formControl' field='corporationFrontDentryid' />
          <Item className='formControl' field='corporationBackDentryid' />
        </div>
      );

    return field;
  }

  renderAuthenticationType = () => {
    const { authenticationType, organizationType } = this.props.entity;
    if (authenticationType) {
      // 个人
      return (
        <FormCard colCount='3' title='基本信息'>
          <Item field='authenticationType' />
          <Item field='nickName' />
          <Item field='userName' />
          <Item field='organizationAddress' />
          <div>
            <div className='fw-bold'>身份证</div>
            <Row>
              <Col span={10}><Item field="idcardFrontDentryid" /></Col>
              <Col span={10}><Item field="idcardBackDentryid" /></Col>
            </Row>
          </div>
          {
            organizationType === 5
              ? <Item field="parentId" />
              : null
          }
        </FormCard>
      );
    }
    return (
      <FormCard colCount='3' title='基本信息'>
        <Item field='authenticationType' />
        <Item field='userName' />
        <Item field='organizationName' />
        <Item field='organizationAddress' />
      </FormCard>
    );

  }

  renderApplication = () => {
    const { applicationType } = this.props.entity;
    const formLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };
    if (applicationType === RADIO_ROLE.AGENT) {
      return (
        <FormCard colCount='3' title='代理人信息'>
          <Item {...formLayout} field='agentName' />
          <Item {...formLayout} field='agentPhone' />
          <Item {...formLayout} field='agentAuthorizationDentryid' />
          <div>
            <div styleName='formLabel'>上传代理人身份证</div>
            <Item styleName='formControl' field='agentFrontDentryid' />
            <Item styleName='formControl' field='agentBackDentryid' />
            {/* <Item {...formLayout} styleName='formControl' field={['agentFrontDentryid', 'agentBackDentryid']} /> */}
          </div>
        </FormCard>
      );
    }
    return null;
  }

  render () {
    const { entity, mode } = this.props;
    const formLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };
    return (
      <SchemaForm layout="vertical" {...formLayout} data={entity} mode={mode} schema={this.formSchema}>
        {this.renderAuthenticationType()}
        {
          entity.authenticationType
            ? null
            : (
              <FormCard colCount='3' title='企业信息'>
                <Item field='legalName' />
                <Item field='creditCode' />
                <Item field='contactName' />
                <Item field='contactPhone' />
                <Item field='bussinessLicenseDentryid' />
                {this.renderTransportLicenseDentryid()}
                {this.renderCorporationDentryid()}
                <Item field='registTime' />
                <Row>
                  <Col span={12}>
                    <Item field='registMoney' />
                  </Col>
                </Row>
              </FormCard>
            )
        }
        {this.renderApplication()}
        <FormCard title="审核记录">
          <Item {...formLayout} field="certificationEvents" />
        </FormCard>
        {
          mode !== DETAIL
            ? (
              <FormCard title="审核信息" colCount="2">
                <Item {...formLayout} field="verifyStatus" />
                <Item {...formLayout} field="pass_reason" />
                <Item {...formLayout} field="reject_reason" />
              </FormCard>
            )
            : null
        }
        <div style={{ paddingRight:'20px', textAlign: 'right' }}>

          { mode !== FORM_MODE.DETAIL ?
            <div>
              <Button className="mr-10" onClick={this.handleCancelBtnClick}>取消</Button>
              <DebounceFormButton label="保存" type="primary" onClick={this.handleSaveBtnClick} />
            </div> : <Button className="mr-10" onClick={this.handleCancelBtnClick}>返回</Button> }
        </div>
      </SchemaForm>
    );
  }
}
