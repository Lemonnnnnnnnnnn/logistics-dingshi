import React, { Component } from 'react';
import { SchemaForm, FormCard, FORM_MODE, Item } from '@gem-mine/antd-schema-form';
import { Row, Col, Radio, message, notification } from 'antd';
import router from 'umi/router';
import { connect } from 'dva';
import CssModule from 'react-css-modules';
import DebounceFormButton from '../../components/debounce-form-button';
import { registerRadio, RADIO_ROLE, authenticationRadio, AUTHENTICATION_TYPE } from '../../constants/authentication/authentication';
import styles from './authentication.css';
import registInfoModel from '../../models/addRegistInfo';
import organizationModel from '../../models/organizations';
import { getAllOperator } from '../../services/apiService';
import { disableDateAfterToday } from '../../utils/utils';
import '@gem-mine/antd-schema-form/lib/fields';
import UploadFile from '../../components/upload/upload-file';

const { actions: { postRegistInfo } } = registInfoModel;
const { actions: { patchOrganizations } } = organizationModel;

function mapStateToProps (state) {
  return {
    registInfo: state.registInfo.entity
  };
}

@connect(mapStateToProps, { postRegistInfo, patchOrganizations })
@CssModule(styles, { allowMultiple: true })

export default class Authentication extends Component {

  constructor (props, context) {
    super(props, context);
    this.state ={
      authenticationType: AUTHENTICATION_TYPE.COMPANY,
      applicationType: RADIO_ROLE.LEGAL
    };
    if (!JSON.parse(localStorage.getItem('token'))) {
      router.push('/user/login');
      return null;
    }
    this.organizationType = JSON.parse(localStorage.getItem('token')).organizationType;
    this.auditStatus = JSON.parse(localStorage.getItem('token')).auditStatus;
    this.organizationId = JSON.parse(localStorage.getItem('token')).organizationId;
    this.formSchema = {
      userName: {
        label: '公司简称',
        rules:{
          required: [true, '请输入公司简称'],
          validator: ({ value }) => {
            const reg = /^[0-9]*$/;
            if (value && value.length > 30) {
              return '公司简称长度不能超过30';
            }
            if (!value) {
              return '请输入公司简称';
            }
            if (reg.test(value)) {
              return '公司简称不能为纯数字';
            }

          }
        },
        component: 'input'
      },
      organizationName: {
        label: '公司全称',
        rules:{
          required:[true, '请输入公司全称'],
          max: 30
        },
        component: 'input'
      },
      organizationAddress:{
        label: '公司地址',
        rules:{
          required: [true, '请输入公司地址'],
          max: 30
        },
        component: 'input'
      },
      legalName: {
        label: '法人姓名',
        rules:{
          required: [true, '请输入法人姓名'],
          max: 30
        },
        component: 'input'
      },
      creditCode: {
        label: '统一信用代码',
        rules:{
          required: [true, '请输入统一信用代码'],
          pattern: /^[^_IOZSVa-z\W]{2}\d{6}[^_IOZSVa-z\W]{10}$/
        },
        component: 'input',
        // 统一代码为18位，统一代码由十八位的数字或大写英文字母（不适用I、O、Z、S、V）组成，由五个部分组成：
        // 第一部分（第1位）为登记管理部门代码，9表示工商部门；(数字或大写英文字母)
        // 第二部分（第2位）为机构类别代码;(数字或大写英文字母)
        // 第三部分（第3-8位）为登记管理机关行政区划码；(数字)
        // 第四部分（第9-17位）为全国组织机构代码；(数字或大写英文字母)
        // 第五部分（第18位）为校验码(数字或大写英文字母)
      },
      contactName: {
        label: '企业联系人',
        rules:{
          required: [true, '请输入企业联系人'],
          max: 30
        },
        component: 'input'
      },
      contactPhone: {
        label: '企业联系电话',
        component: 'input',
        rules:{
          required: [true, '请输入企业联系电话'],
          pattern: /^1\d{10}$/
        }
      },
      bussinessLicenseDentryid: {
        label: '上传企业营业执照照片(货权选填)',
        rules:{
          required : [this.organizationType !== 3, '请输入企业营业执照照片'],
          validator: ({ value }) => {
            if (this.organizationType!==3) {
              if (value && value.length === 0) {
                return '请上传企业营业执照';
              }
              if (!value) {
                return '请上传企业营业执照';
              }
            }
          }
        },
        component: UploadFile,
        labelUpload: '企业营业执照'
      },
      registTime: {
        label: '公司注册日期（可选）',
        placeholder: '请选择公司注册日期',
        disabledDate: disableDateAfterToday,
        component: 'datePicker'
      },
      registMoney:{
        label: '公司注册资金（可选）',
        placeholder: '请输入公司注册资金',
        addonAfter: '万元',
        component: 'input',
        rules:{
          pattern: /^[0-9]*$/
        }
      },
      agentName: {
        label: '代理人姓名',
        rules:{
          required: [true, '请输入代理人姓名'],
          max: 30
        },
        component: 'input'
      },
      agentPhone: {
        label: '代理人电话',
        component: 'input',
        rules:{
          required: [true, '请输入代理人电话'],
          pattern: /^1\d{10}$/
        }
      },
      agentAuthorizationDentryid: {
        label: '代理人授权书',
        component: UploadFile,
        labelUpload: '代理人授权书',
        rules: {
          required: [true, '请上传代理人授权书']
        }
      },
      idcardFrontDentryid: {
        colSpan: 8,
        component: UploadFile,
        labelUpload: '身份证正面（头像面)',
        rules:{
          required: [true, '请上传身份证正面(头像面)']
        }
      },
      idcardBackDentryid: {
        colSpan: 8,
        component: UploadFile,
        labelUpload: '身份证反面(国徽面)',
        rules: {
          required: [true, '请上传身份证反面(国徽面)']
        }
      },
      corporationFrontDentryid: {
        colSpan: 8,
        component: UploadFile,
        rules:{
          required: [true, '请上传身份证正面(头像面)']
        },
        labelUpload: '身份证正面(头像面)'
      },
      corporationBackDentryid: {
        colSpan: 8,
        component: UploadFile,
        rules:{
          required: [true, '请上传身份证反面(国徽面)']
        },
        labelUpload: '身份证反面(国徽面)'
      },
      agentFrontDentryid: {
        colSpan: 8,
        component: UploadFile,
        labelUpload: '身份证正面(头像面)',
        rules: {
          required: [true, '请上传身份证正面(头像面)']
        }
      },
      agentBackDentryid: {
        colSpan: 8,
        component: UploadFile,
        labelUpload: '身份证反面(国徽面)',
        rules:{
          required: [true, '请上传身份证反面(国徽面)'],
        }
      },
      transportLicenseDentryid:{
        label: '道路运输许可证',
        component: UploadFile,
        labelUpload: '道路运输许可证',
        rules: {
          required: '请上传道路运输许可证',
        }
      },
      parentId: {
        label: '所属运营方',
        placeholder: '请选择所属运营方',
        component: 'select',
        rules:{
          required: [true, '请选择所属运营方']
        },
        options: async () => {
          const { items } = await getAllOperator();
          const result = items.map(item => ({
            key:item.organizationId,
            value: item.organizationId,
            label: item.organizationName
          }));
          return result;
        }
      },
      nickName: {
        label: '姓名',
        component: 'input',
        rules:{
          required: [true, '请输入姓名'],
          max: 30
        }
      }
    };
  }

  componentDidMount () {
    if (JSON.parse(localStorage.getItem('token'))) {
      message.warning('完善认证信息并通过平台审核后，您才可以使用E键达系统');
    }
  }

  componentWillUnmount () {
    localStorage.removeItem('token');
    localStorage.removeItem('antd-pro-authority');
    localStorage.removeItem('authority');
  }

  authenticationChange = e => {
    this.setState({
      authenticationType: e.target.value,
      applicationType:AUTHENTICATION_TYPE.COMPANY
    });
  }

  applicationTypeChange = e => {
    this.setState({
      applicationType: e.target.value
    });
  }

  applicationTypeIsAgent = applicationType => {
    if (applicationType === RADIO_ROLE.AGENT) {
      return (
        <FormCard colCount='3' title='代理人信息'>
          <Item field='agentName' />
          <Item field='agentPhone' />
          <Item field='agentAuthorizationDentryid' />
          <div>
            <div styleName='formLabel'>上传代理人身份证</div>
            <Item styleName='formControl' field='agentFrontDentryid' />
            <Item styleName='formControl' field='agentBackDentryid' />
          </div>
        </FormCard>
      );
    }
    return null;
  }

  authenticationTypeIsCompany = authenticationType => {
    const radioOptions = registerRadio.map(item => <Radio.Button key={item.value} value={item.value}>{item.label}</Radio.Button>);
    return (
      <>
        {authenticationType ?
          <FormCard colCount='3' title='基本信息'>
            <Item field='userName' />
            <Item field='nickName' />
            <Item field='organizationAddress' />
            <div>
              <div styleName='formLabel'>身份证</div>
              <Item styleName='formControl' field='idcardFrontDentryid' />
              <Item styleName='formControl' field='idcardBackDentryid' />
            </div>
            {
              this.organizationType === 5
                ? <Item field='parentId' />
                : null
            }
          </FormCard> : null}
        {authenticationType === 0 ?
          <>
            <FormCard colCount='3' title='基本信息'>
              <Item field='userName' />
              <Item field='organizationName' />
              <Item field='organizationAddress' />
            </FormCard>
            <Radio.Group onChange={this.applicationTypeChange} defaultValue={RADIO_ROLE.LEGAL} style={{ margin: '10px 0' }}>
              {radioOptions}
            </Radio.Group>
          </> :
          null
        }
      </>
    );

  }

  renderAuthenticationRadio = () => {
    const radioOptions = authenticationRadio.map(item => <Radio.Button key={item.value} value={item.value}>{item.label}</Radio.Button>);
    if (this.organizationType !== 3) {
      return (
        <Radio.Group onChange={this.authenticationChange} defaultValue={AUTHENTICATION_TYPE.COMPANY} style={{ textAlign: 'center', display: 'block', marginBottom: 10 }}>
          {radioOptions}
        </Radio.Group>
      );
    }
    return null;
  }

  addTransportLicenseDentryid = () => {
    const field = this.organizationType === 5
      ? <Item field='transportLicenseDentryid' />
      : null;
    return field;
  }

  addCorporationDentryid = applicationType => {
    let field = null;
    // 货权方无需法人身份证
    if (!applicationType && this.organizationType !== 3){
      field = (
        <div>
          <div styleName='formLabel'><span style={{ color : 'red', fontSize : '1rem', lineHeight : '1rem' }}> * </span>法人身份证</div>
          <Item styleName='formControl' field='corporationFrontDentryid' />
          <Item styleName='formControl' field='corporationBackDentryid' />
        </div>
      );
    }
    return field;
  }

  handleSubmitBtnClick = value => {
    const { authenticationType, applicationType } = this.state;
    this.auditStatus === 0
      ?this.props.patchOrganizations({
        ...value,
        organizationId:this.organizationId,
        organizationType:this.organizationType,
        authenticationType,
        applicationType,
        idcardFrontDentryid: value.idcardFrontDentryid && value.idcardFrontDentryid[0],
        idcardBackDentryid: value.idcardBackDentryid && value.idcardBackDentryid[0],
        authorizationDentryid: value.authorizationDentryid && value.authorizationDentryid[0],
        bussinessLicenseDentryid: value.bussinessLicenseDentryid && value.bussinessLicenseDentryid[0],
        corporationFrontDentryid: value.corporationFrontDentryid && value.corporationFrontDentryid[0],
        corporationBackDentryid: value.corporationBackDentryid && value.corporationBackDentryid[0],
        agentFrontDentryid: value.agentFrontDentryid && value.agentFrontDentryid[0],
        agentBackDentryid: value.agentBackDentryid && value.agentBackDentryid[0],
        agentAuthorizationDentryid: value.agentAuthorizationDentryid && value.agentAuthorizationDentryid[0],
        transportLicenseDentryid: value.transportLicenseDentryid && value.transportLicenseDentryid[0]
      })
        .then(data=>{
          if (data){
            notification.success({
              message: '重新提交成功',
              description: '重新提交资料成功请等待平台审核'
            });
            // 添加成功之后跳转登录页面
            router.replace('/user/login');
          }
        })
      :this.props.postRegistInfo({
        ...value,
        authenticationType,
        applicationType,
        idcardFrontDentryid: value.idcardFrontDentryid && value.idcardFrontDentryid[0],
        idcardBackDentryid: value.idcardBackDentryid && value.idcardBackDentryid[0],
        authorizationDentryid: value.authorizationDentryid && value.authorizationDentryid[0],
        bussinessLicenseDentryid: value.bussinessLicenseDentryid && value.bussinessLicenseDentryid[0],
        corporationFrontDentryid: value.corporationFrontDentryid && value.corporationFrontDentryid[0],
        corporationBackDentryid: value.corporationBackDentryid && value.corporationBackDentryid[0],
        agentFrontDentryid: value.agentFrontDentryid && value.agentFrontDentryid[0],
        agentBackDentryid: value.agentBackDentryid && value.agentBackDentryid[0],
        agentAuthorizationDentryid: value.agentAuthorizationDentryid && value.agentAuthorizationDentryid[0],
        transportLicenseDentryid: value.transportLicenseDentryid && value.transportLicenseDentryid[0]
      })
        .then(data=>{
          if (data){
            notification.success({
              message: '提交成功',
              description: '提交资料成功请等待平台审核'
            });
            // 添加成功之后跳转登录页面
            router.replace('/user/login');
          }
        });
  }

  render () {
    const { authenticationType, applicationType } = this.state;
    const formLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };
    return (
      <>
        {this.renderAuthenticationRadio()}
        <div style={{ margin: '0 150px' }}>
          <SchemaForm {...formLayout} mode={FORM_MODE.Add} schema={this.formSchema}>
            {this.authenticationTypeIsCompany(authenticationType)}
            {authenticationType
              ? null
              : (
                <FormCard colCount='1' title='企业信息'>
                  <Row>
                    <Col span={8} style={{ paddingRight: '20px' }}><Item field='legalName' /></Col>
                    <Col span={8} style={{ paddingRight: '20px' }}><Item field='creditCode' /></Col>
                    <Col span={8} style={{ paddingRight: '20px' }}><Item field='contactName' /></Col>
                  </Row>

                  <Row>
                    <Col span={8} style={{ paddingRight: '20px' }}><Item field='contactPhone' /></Col>
                    <Col span={8} style={{ paddingRight: '20px' }}><Item field='registTime' /></Col>
                    <Col span={8} style={{ paddingRight: '20px' }}>
                      <Item field='registMoney' />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8} style={{ paddingRight: '20px' }}>{this.addCorporationDentryid(applicationType)}</Col>
                    <Col span={8} style={{ paddingRight: '20px' }}><Item field='bussinessLicenseDentryid' /></Col>
                    <Col span={6} style={{ paddingRight: '20px' }}>{this.addTransportLicenseDentryid()}</Col>
                  </Row>
                  {this.applicationTypeIsAgent(applicationType)}
                  <div style={{ paddingRight: '20px', textAlign: 'right' }}>
                    <DebounceFormButton label="提交审核" type="primary" onClick={this.handleSubmitBtnClick} />
                  </div>
                </FormCard>)
            }

          </SchemaForm>
        </div>
      </>
    );
  }
}
