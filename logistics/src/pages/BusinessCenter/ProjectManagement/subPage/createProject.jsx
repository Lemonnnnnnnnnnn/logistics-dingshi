import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, notification, Button, Select, message } from 'antd';
import { SchemaForm, Item, FormCard, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import CSSModules from 'react-css-modules';
import router from 'umi/router';
import moment from 'moment';
import DebounceFormButton from '@/components/DebounceFormButton';
import model from '@/models/project';
import { PROJECT_AUDIT_STATUS, CHARGE_MODE } from '@/constants/project/project';
import role from '@/constants/organization/organizationType';
import receivingModel from '@/models/receiving';
import request from '@/utils/request';
import { getUserInfo } from '@/services/user';
import { getUser, getReceivingLabel, getBusinessType, getElectronicDocuments } from '@/services/apiService';
import UploadFile from '@/components/Upload/UploadFile';
import { getLocal } from '@/utils/utils';
import GoodsInfo from './components/GoodsInfo';
import DeliveryInfo from './components/DeliveryInfo';
import ReceivingInfo from './components/ReceivingInfo';
import ShipmentInfo from './components/ShipmentInfo';
import ShipmentRadio from './components/ShipmentRadio';
import styles from './createProject.less';
import CheckBox from '../../../BasicSetting/component/CheckBox';
import '@gem-mine/antd-schema-form/lib/fields';
import SecondOrganizationCheckBox from './components/SecondOrganizationCheckBox';
import SelectWithPicture from '../../../BasicSetting/component/SelectWithPicture';

const { actions: { detailProjects, postProjects, patchProjects } } = model;
const { actions: { getReceiving } } = receivingModel;
const formLayout = {
  labelCol: {
    span: 24
  },
  wrapperCol: {
    span: 24
  }
};

const { Option } = Select;

function mapStateToProps(state) {
  return {
    project: state.project.entity,
    commonStore: state.commonStore,
  };
}

@connect(mapStateToProps, { detailProjects, postProjects, patchProjects, getReceiving })
@CSSModules(styles, { allowMultiple: true })
class CreateProject extends Component {

  form = null;

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  organizationType = getUserInfo().organizationType;

  constructor(props) {
    super(props);
    const { location: { query: { projectId, addContractInfo, a } } } = this.props;
    const mode = projectId ? FORM_MODE.MODIFY : FORM_MODE.ADD;
    const schema = {
      deliveryType: {
        disabled: true,
        component: "select",
        label: "????????????",
        observer: Observer({
          watch: '*currentTab',
          action: (itemValue, { form }) => {
            if (this.form !== form) {
              this.form = form;
            }
            return { };
          }
        }),
        options: [{
          label: "??????",
          key: 1,
          value: 1
        }, {
          label: "??????",
          key: 2,
          value: 2
        }, {
          label: "??????",
          key: 3,
          value: 3
        }],
        placeholder: "?????????????????????"
      },
      tips: {
        readOnly: true,
        component: "input",
        label: "???????????????",
        placeholder: "?????????????????????"
      },
      isClientAudit: {
        component: "input",
      },
      activeMeasurementUnit: {
        disabled: true,
        options: [{
          label: "???/??????",
          key: 1,
          value: 1
        }, {
          label: "???",
          key: 2,
          value: 2
        }, {
          label: "???/???",
          key: 3,
          value: 3
        }, {
          label: "???/???",
          key: 4,
          value: 4
        }],
        placeholder: "?????????????????????",
        component: "select"
      },
      businessTypeId: {
        rules: {
          required: [true, "?????????????????????"]
        },
        component: BusinessType,
        observer: Observer({
          watch: "*projectId",
          action: projectId => ({ projectId })
        })
      },
      projectName: {
        label: "????????????",
        placeholder: "?????????????????????",
        component: Observer({
          watch: "*mode",
          action: mode => mode === FORM_MODE.MODIFY ? "input.text" : "input"
        }),
        maxLength: 30,
        rules: {
          required: [true, "?????????????????????"],
          max: 30
        }
      },
      projectNo: {
        label: "????????????",
        component: addContractInfo ? "input.text" : "input",
        placeholder: "?????????????????????",
        rules: {
          required: [true, "?????????????????????"]
        }
      },
      isCustomerAudit: {
        label: "????????????",
        component: mode === FORM_MODE.MODIFY || this.organizationType === role.CARGOES ? "radio.text" : "radio",
        rules: {
          required: [true, "???????????????????????????"]
        },
        options: [
          {
            label: "??????",
            value: 0,
            key: 0
          },
          {
            label: "??????",
            value: 1,
            key: 1
          }
        ]
      },
      customerId: {
        component: mode === FORM_MODE.MODIFY ? "select.text" : "select",
        keepAlive: false,
        props: {
          showSearch: true,
          optionFilterProp: "label"
        },
        visible: Observer({
          watch: "isCustomerAudit",
          action: isCustomerAudit => {
            const { location: { query: { addContractInfo } } } = this.props;
            if (`${addContractInfo}` !== "1") return isCustomerAudit === 1;
            return false;
          }
        }),
        rules: { required: [true, "???????????????"] },
        options: async () => {
          const { items = [] } = await request.get("/v1/organizations", {
            params: {
              selectType: 2,
              organizationType: 7,
              offset: 0,
              limit: 1000
            }
          });
          const result = items.map(item => ({
            key: item.organizationId,
            value: item.organizationId,
            label: item.organizationName
          }));
          return result;
        },
        placeholder: "???????????????"
      },
      customerName: {
        component: "input.text",
        visible: Observer({
          watch: "isCustomerAudit",
          action: isCustomerAudit => {
            const { location: { query: { addContractInfo } } } = this.props;
            if (`${addContractInfo}` === "1") return isCustomerAudit === 1;
            return false;
          }
        })
      },
      consignmentId: {
        component: addContractInfo ? "select.text" : "select",
        label: "????????????",
        props: {
          showSearch: true,
          optionFilterProp: "label"
        },
        rules: { required: [true, "??????????????????"] },
        options: async () => {
          const { items = [] } = await request.get("/v1/organizations", {
            params: {
              selectType: 2,
              organizationType: 4,
              offset: 0,
              limit: 1000
            }
          });
          const result = items.map(item => ({
            key: item.organizationId,
            value: item.organizationId,
            label: item.organizationName
          }));
          if (this.organizationType === role.OWNER) {
            const own = getUserInfo();
            const { organizationId, organizationName = "??????" } = own;
            result.push({ key: organizationId, value: organizationId, label: organizationName });
          }
          return result;
        },
        placeholder: "??????????????????"
      },
      responsibleItems: {
        label: "???????????????",
        component: "select",
        props: {
          mode: "multiple"
        },
        style: { width: "100%" },
        placeholder: "????????????????????????",
        rules: {
          required: true,
          validator: ({ value }) => {
            if (value && value.length < 1) return "????????????????????????";
            if (value && value.length > 10) return "???????????????????????????10???";
          }
        },
        options: async () => {
          const { items } = await getUser({ accountType: 3, isAvailable: true, offset: 0, limit: 1000 });
          const result = items.map(item => ({
            key: item.userId,
            value: item.userId,
            label: item.nickName
          }));
          return result;
        },
        keepAlive: false,
        visible: () => this.organizationType === role.OWNER
      },
      projectTime: {
        label: "??????????????????",
        component: addContractInfo ? "datePicker.text" : "datePicker",
        rules: { required: [true, "???????????????????????????"] },
        format:{
          input: (value) =>  moment(value)
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
      consignmentType: {
        label: "????????????",
        component: addContractInfo ? "radio.text" : "radio",
        rules: {
          required: [true, "?????????????????????"]
        },
        options: [
          {
            label: "??????",
            value: 0,
            key: 0
          },
          {
            label: "??????",
            value: 1,
            key: 1
          }
        ]
      },
      cargoesId: {
        component: addContractInfo ? "select.text" : "select",
        keepAlive: false,
        props: {
          showSearch: true,
          optionFilterProp: "label"
        },
        visible: Observer({
          watch: "consignmentType",
          action: consignmentType => (
            consignmentType === 1
          )
        }),
        rules: { required: [true, "??????????????????"] },
        options: async () => {
          const { items = [] } = await request.get("/v1/organizations", {
            params: {
              selectType: 2,
              organizationType: 3,
              offset: 0,
              limit: 1000
            }
          });
          const result = items.map(item => ({
            key: item.organizationId,
            value: item.organizationId,
            label: item.organizationName
          }));
          return result;
        },
        placeholder: "??????????????????"
      },
      chargeMode: {
        label: "????????????",
        component: addContractInfo ? "radio.text" : "radio",
        options: [{
          key: CHARGE_MODE.DELIVERY,
          label: "???????????????",
          value: CHARGE_MODE.DELIVERY
        }, {
          key: CHARGE_MODE.RECEIVING,
          label: "???????????????",
          value: CHARGE_MODE.RECEIVING
        }],
        rules: {
          required: true
        }
      },
      projectRemark: {
        placeholder: "???????????????",
        label: "??????????????????",
        component: addContractInfo ? "input.textArea.text" : "input.textArea",
        maxLength: 150,
        rules: {
          max: 150
        }
      },
      goodsItems: {
        component: GoodsInfo,
        rules: {
          required: [true, "?????????????????????"]
        },
        isShowFreightCost: mode => {
          if (mode === FORM_MODE.ADD || this.props.project.createOrgType === role.OWNER) return true;
          if (this.organizationType === role.CUSTOMER || this.organizationType === role.CARGOES) return true;
          return false;
        },
        readOnly: addContractInfo === "1"
      },
      deliveryItems: {
        component: DeliveryInfo,
        rules: {
          required: [true, "?????????????????????"]
        },
        value: Observer({
          watch: "businessTypeId",
          action: (_, { value }) => {
            if (mode === FORM_MODE.ADD && value && !value.length) return [];
            return value;
          }
        })
      },
      // receivingLabelId: {
      //   component: "select",
      //   label: "????????????",
      //   placeholder: "??????????????????",
      //   options: async () => {
      //     const { items } = await getReceivingLabel({ isAvailable: true, offset: 0, limit: 1000 });
      //     const result = items.map(item => ({
      //       key: item.receivingLabelId,
      //       value: item.receivingLabelId,
      //       label: item.receivingLabel
      //     }));
      //     return result;
      //   },
      //   visible: Observer({
      //     watch: "isCustomerAudit",
      //     action: (isCustomerAudit) => {
      //       const { location: { query: { addContractInfo } } } = this.props;
      //       if (`${addContractInfo}` === "1") return !(addContractInfo === "1" || a === "1");
      //       return isCustomerAudit === 0;
      //     }
      //   })
      // },
      receivingItems: {
        component: ReceivingInfo,
        rules: {
          required: [true, "?????????????????????"]
        },
        keepAlive: false,
        // observer: Observer({
        //   watch: "receivingLabelId",
        //   action: (receivingLabelId) => {
        //     this.props.getReceiving({ receivingLabelId, limit: 200, offset: 0 }); // ????????????
        //     return false;
        //   }
        // }),
        readOnly: addContractInfo === "1" || a === "1",
        visible: Observer({
          watch: "isCustomerAudit",
          action: (isCustomerAudit) => {
            const { location: { query: { addContractInfo } } } = this.props;
            if (`${addContractInfo}` === "1") return true;
            return isCustomerAudit === 0;
          }
        })
      },
      shipmentType: {
        label: "???????????????",
        component: ShipmentRadio,
        props: {
          isAudited: this.isAudited(mode)
        },
        readOnly: Observer({
          watch: "*mode",
          action: mode => (mode === FORM_MODE.MODIFY)
        })
      },
      shipmentItems: {
        component: ShipmentInfo,
        props: {
          getMode: () => this.state.mode
        },
        visible: Observer({
          watch: "shipmentType",
          action: shipmentType => (
            shipmentType === 1
          )
        }),
        keepAlive: false,
        rules: {
          validator: ({ value, formData }) => {
            if (formData.shipmentType !== 0) { // ?????????????????????????????? ????????????
              if (!value || value.length === 0) {
                return '????????????????????????';
              }
            }
          }
        }
      },
      projectDentryid: {
        label: "????????????",
        value: Observer({
          watch: ["front", "back", "seam", "contractPic1", "contractPic2"],
          action: ([front = [], back = [], seam = [], contractPic1 = [], contractPic2 = []]) => {
            if (front[0] || back[0] || seam[0] || contractPic1[0] || contractPic2[0]) {
              const pictureGroup = [...front, ...back, ...seam, ...contractPic1, ...contractPic2];
              return pictureGroup.join(",");
            }
            return false;
          }
        })
      },
      front: {
        component: UploadFile,
        props: {
          labelUpload: "????????????????????????"
        },
        rules: {
          required: [true, "????????????"]
        },
        format:{
          input: (value) => {
            if (value && Array.isArray(value) && value[0]?.indexOf('business') > -1){
              return value[0];
            }
            return value;
          }
        },
        value: ({ formData: { projectDentryid = "" } }) => projectDentryid.split(",")[0] ? [projectDentryid.split(",")[0]] : []
      },
      back: {
        component: UploadFile,
        format:{
          input: (value) => {
            if (value && Array.isArray(value) && value[0]?.indexOf('business') > -1){
              return value[0];
            }
            return value;
          }
        },
        props: {
          labelUpload: "????????????????????????"
        },
        rules: {
          required: [true, "????????????"]
        },
        value: ({ formData: { projectDentryid = "" } }) => projectDentryid.split(",")[1] ? [projectDentryid.split(",")[1]] : []
      },
      seam: {
        component: UploadFile,
        format:{
          input: (value) => {
            if (value && Array.isArray(value) && value[0]?.indexOf('business') > -1){
              return value[0];
            }
            return value;
          }
        },
        props: {
          labelUpload: "????????????????????????"
        },
        rules: {
          required: [true, "????????????"]
        },
        value: ({ formData: { projectDentryid = "" } }) => projectDentryid.split(",")[2] ? [projectDentryid.split(",")[2]] : []
      },
      contractPic1: {
        component: UploadFile,
        format:{
          input: (value) => {
            if (value && Array.isArray(value) && value[0]?.indexOf('business') > -1){
              return value[0];
            }
            return value;
          }
        },
        props: {
          labelUpload: "????????????????????????"
        },
        value: ({ formData: { projectDentryid = "" } }) => projectDentryid.split(",")[3] ? [projectDentryid.split(",")[3]] : []
      },
      contractPic2: {
        component: UploadFile,
        format:{
          input: (value) => {
            if (value && Array.isArray(value) && value[0]?.indexOf('business') > -1){
              return value[0];
            }
            return value;
          }
        },
        props: {
          labelUpload: "????????????????????????"
        },
        value: ({ formData: { projectDentryid = "" } }) => projectDentryid.split(",")[4] ? [projectDentryid.split(",")[4]] : []
      },
      projectPicture: {
        component: UploadFile,
        format:{
          input: (value) => {
            if (value && Array.isArray(value) && value[0]?.indexOf('business') > -1){
              return value[0];
            }
            return value;
          }
        },
        label: "????????????",
        value: ({ formData }) => {
          if (!formData.projectDentryid) return [];
          return formData.projectDentryid.split(",");
        },
        readOnly: true
      },
      readMe: {
        component: "radio",
        options: [{
          key: 0,
          label: <span>??????<a onClick={() => {
            window.open("/agreement");
          }}
          >?????????????????????
                         </a>
                 </span>,
          value: 0
        }],
        rules: {
          required: [true, "??????????????????????????????"]
        }
      },
      freightPrice: {
        label: '?????????',
        component: 'input',
        rules:{
          required:[true, '???????????????'],
          validator: ({ value })=>{
            if (!/^\d+\.?\d{0,2}$/.test(value)) return '?????????????????????!(????????????????????????)';
            if (value <= 0) return '?????????????????????!(????????????????????????)';
          },
        },
        placeholder: "????????????????????????"
      }
    };
    this.state = {
      mode,
      schema,
      measurementUnit: "",
    };

  }

  handleSaveBtnClick = async (value) => {
    const { mode } = this.state;
    const { commonStore, postProjects, patchProjects, location, project } = this.props;
    if (mode !== FORM_MODE.MODIFY && !value.isClientAudit && value.isCustomerAudit === 1) return message.error("??????????????????????????????????????????");
    delete value.isClientAudit;
    if (value.shipmentType === 0 && this.props.project.shipmentType !== value.shipmentType) { // ?????????????????????????????????????????????????????????????????????????????????shipmentItems
      delete value.shipmentItems;
    }
    if (mode === FORM_MODE.ADD) {
      delete value.readMe; // ????????????????????????????????????
    } else if (project.createOrgType === role.CARGOES) { // ?????????????????????
      if (value.shipmentType === 0) {
        value.projectStatus = PROJECT_AUDIT_STATUS.UNAUDITED;
      } else {
        value.projectStatus = PROJECT_AUDIT_STATUS.SHIPMENT_UNAUDITED;
      }
    }
    delete value.tips;
    const result = await (this.state.mode === FORM_MODE.ADD
      ? postProjects({ ...value, transactionalMode: 1 })
      : patchProjects({ ...value, transactionalMode: 1, projectId: location.query.projectId }));
    if (result) {
      notification.success({
        message: this.state.mode === FORM_MODE.ADD ? "????????????" : "????????????",
        description: this.state.mode === FORM_MODE.ADD ? `????????????` : `????????????`
      });
      const dele = commonStore.tabs.find(item => item.id === commonStore.activeKey);
      window.g_app._store.dispatch({
        type: 'commonStore/deleteTab',
        payload: { id: dele.id }
      });
      router.goBack();
    }
  };

  componentDidMount() {
    const { location } = this.props;
    this.props.getReceiving({ limit: 1000, offset: 0 });
    if ("projectId" in this.props.location.query) {
      Promise.all([this.props.detailProjects({ projectId: location.query.projectId }), getBusinessType({
        offset: 0,
        limit: 1000,
        isOrderByTime: true
      })]).then(res => {
        this.setState({
          projectId: location.query.projectId,
          ready: true
        });
      });
    } else {
      getBusinessType({ offset: 0, limit: 1000, isOrderByTime: true }).then(res => {
        this.setState({
          projectId: location.query.projectId,
          ready: true
        });
      });
    }
  }

  componentDidUpdate(p) {
    const { location, detailProjects, commonStore } = this.props;
    if ('projectId' in this.props.location.query && p.location.query.projectId !== location.query.projectId) {
      this.currentTab = commonStore.tabs.find(item => item.id === commonStore.activeKey);
      this.localData = getLocal(this.currentTab.id) || { formData: {} };
      Promise.all([detailProjects({ projectId: location.query.projectId }), getBusinessType({
        offset: 0,
        limit: 1000,
        isOrderByTime: true
      })]).then(res => {
        this.setState({
          projectId: location.query.projectId,
          ready: true
        });
      });
    }
  }

  componentWillUnmount() {
    // ??????????????????????????? ?????????????????? ??????????????????
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData, projectDentryid:  formData && formData.projectDentryid || '' },
      }));
    }
  }

  componentWillReceiveProps(p) {
    if (p.commonStore.activeKey !== this.props.commonStore.activeKey){ // ????????????????????????????????????????????????
      // ??????????????????????????? ?????????????????? ??????????????????
      const formData = this.form ? this.form.getFieldsValue() : null;
      localStorage.removeItem(this.currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(this.currentTab.id, JSON.stringify({
          formData,
        }));
      }
    }
  }

  isAudited = (mode) => {
    let auditedStatus = false;
    if (mode !== FORM_MODE.ADD) {
      auditedStatus = this.props.project.projectStatus === PROJECT_AUDIT_STATUS.AUDITED;
    }
    return auditedStatus;
  };

  goBack = () => {
    router.goBack();
  };

  render() {
    const { mode, ready } = this.state;
    const { responsibleItems = [], logisticsBusinessTypeEntity } = this.props.project;
    const { deliveryType } = logisticsBusinessTypeEntity || {};
    const project = mode === FORM_MODE.MODIFY
      ? { ...this.props.project, responsibleItems: responsibleItems.map(item => item.responsibleId), deliveryType }
      : {
        consignmentType: this.localData && this.localData.formData.consignmentType !== undefined ? this.localData.formData.consignmentType : 1,
        chargeMode: this.localData && this.localData.formData.chargeMode || 1,
      };
    const uploadPicStyle = {
      display: "inline-block"
    };

    const data = Object.assign({ ...JSON.parse(JSON.stringify(project)) },  this.localData && this.localData.formData || {});
    const { location: { query: { projectId } } } = this.props;

    return (
      <>
        {ready &&
        <SchemaForm
          layout="vertical"
          mode={mode}
          data={data}
          schema={this.state.schema}
          trigger={{ projectId }}
        >
          <FormCard title="????????????" colCount="3">
            <Item {...formLayout} field="projectName" />
            <Item {...formLayout} field="projectNo" />
            <Row style={{ height: "100px" }}>
              <Col span={7}>
                <Item {...formLayout} field="isCustomerAudit" />
              </Col>
              <Col span={17} style={{ margin: "25px 0 10px 0" }}>
                <Item field="customerId" />
              </Col>
              <Col span={17}>
                <Item field="customerName" />
                <Item style={{ display: "none" }} field="isClientAudit" />
              </Col>
            </Row>
            <Item {...formLayout} field="projectTime" />
            <Item {...formLayout} field="projectRemark" />
            {this.organizationType !== role.CARGOES &&
            <Row style={{ height: "100px" }}>
              <Col span={7}>
                <Item {...formLayout} field="consignmentType" />
              </Col>
              <Col span={17} style={{ padding: "25px 0 10px 0" }}>
                <Item field="cargoesId" />
              </Col>
            </Row>
            }
            <Item {...formLayout} field="chargeMode" />
          </FormCard>
          <Item {...formLayout} field="businessTypeId" />
          <FormCard title="????????????" colCount="1">
            <Item {...formLayout} field="goodsItems" />
          </FormCard>
          <FormCard title="?????????????????????" colCount="4">
            <Item {...formLayout} field="consignmentId" />
            <Item {...formLayout} field="responsibleItems" />
          </FormCard>
          {this.organizationType !== role.CARGOES &&
          <>
            <FormCard title="????????????" colCount="1">
              <Item {...formLayout} field="deliveryType" />
              <Item {...formLayout} field="deliveryItems" />
            </FormCard>
            <FormCard title="????????????" colCount="1">
              {/* <Item {...formLayout} field="receivingLabelId" /> */}
              <Item {...formLayout} field="receivingItems" />
            </FormCard>
            <FormCard title="???????????????" colCount="1">
              <Item {...formLayout} field="shipmentType" />
              <Item {...formLayout} field="shipmentItems" />
            </FormCard>
          </>}
          {this.organizationType === role.OWNER && !projectId ?
            <div styleName="item_box">
              <h3 styleName="form_title">????????????</h3>
              <p styleName="p_tips">????????????</p>
              <Row>
                <Col span={7} style={{ width: "auto" }}>
                  <Item
                    {...{ labelCol: { span: 6 }, wrapperCol: { span: 16 } }}
                    styleName="flex_align_start"
                    field="freightPrice"
                  />
                </Col>
                <Col span={3}>
                  <span styleName="unit"><Item field="activeMeasurementUnit" />
                  </span>
                </Col>
                <Col span={7}>
                  {/* <span styleName='unit'>???????????????{this.getMeasurementSource()}</span> */}
                  <Item field="tips" />
                </Col>
              </Row>
            </div>
            :
            null
          }
          {this.organizationType === role.CARGOES || mode === FORM_MODE.ADD ?
            <FormCard title="????????????" colCount="8">
              <Item style={uploadPicStyle} labelCol={{ xs: { span: 24 } }} field="projectDentryid" />
              <Item style={uploadPicStyle} field="front" />
              <Item style={uploadPicStyle} field="back" />
              <Item style={uploadPicStyle} field="seam" />
              <Item style={uploadPicStyle} field="contractPic1" />
              <Item style={uploadPicStyle} field="contractPic2" />
            </FormCard> :
            <FormCard title="????????????" colCount="1">
              <Item {...formLayout} field="projectPicture" />
            </FormCard>
          }
          {mode === FORM_MODE.ADD && <Item {...formLayout} field="readMe" />}
          <div style={{ paddingRight: "20px", textAlign: "right" }}>
            <Button onClick={this.goBack} className="mr-10">??????</Button>
            <DebounceFormButton debounce label="??????" type="primary" onClick={this.handleSaveBtnClick} />
          </div>
        </SchemaForm>}
      </>
    );
  }
}

@connect(mapStateToProps, { detailProjects, postProjects, patchProjects, getReceiving })
@CSSModules(styles, { allowMultiple: true })
class BusinessType extends React.Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  state = {
    ready: false,
    activeBusinessType: {}
  };

  organizationType = getUserInfo().organizationType;

  detailForm = {
    remarks: {
      label: "?????????????????????",
      component: "input",
      placeholder: "???????????????????????????",
      defaultValue: this.localData && this.localData.formData.remarks || undefined,
      disabled: true
    },
    deliveryType: {
      label: "????????????",
      defaultValue: this.localData && this.localData.formData.deliveryType || undefined,
      component: "radio",
      options: [{
        label: "??????",
        key: 1,
        value: 1
      }, {
        label: "??????",
        key: 2,
        value: 2
      }, {
        label: "???????????????",
        key: 3,
        value: 3
      }],
      disabled: true
    },
    receivingType: {
      label: "????????????",
      defaultValue: this.localData && this.localData.formData.receivingType || undefined,
      component: "radio",
      options: [{
        label: "??????",
        key: 1,
        value: 1
      }, {
        label: "??????",
        key: 2,
        value: 2
      }, {
        label: "????????????",
        key: 3,
        value: 3
      }],
      disabled: true
    },
    prebookingCompleteType: {
      customLabel: "????????????????????????",
      defaultValue: this.localData && this.localData.formData.prebookingCompleteType || undefined,
      component: CheckBox,
      disabled: true,
      options: [{
        label: "???????????????????????????????????????",
        key: 1,
        value: 1
      }, {
        label: "?????????????????????????????????",
        key: 2,
        value: 2
      }, {
        label: "????????????",
        key: 3,
        value: 3
      }, {
        label: "?????????????????????0??????",
        key: 4,
        value: 4
      }]
    },
    releaseHall: {
      label: "????????????????????????????????????",
      defaultValue: this.localData && this.localData.formData.releaseHall !== undefined ? this.localData.formData.releaseHall : undefined,
      component: "radio",
      disabled: true,
      options: [{
        label: "???",
        key: 1,
        value: 1
      }, {
        label: "???",
        key: 0,
        value: 0
      }]
    },
    driverAcceptAudit: {
      label: "????????????????????????????????????",
      defaultValue: this.localData && this.localData.formData.driverAcceptAudit !== undefined ? this.localData.formData.driverAcceptAudit : undefined,
      component: "radio",
      options: [{
        label: "???",
        key: 1,
        value: 1
      }, {
        label: "???",
        key: 0,
        value: 0
      }],
      disabled: true
    },
    confirmOrganization: {
      component: "select",
      defaultValue: this.localData && this.localData.formData.confirmOrganization !== undefined ? this.localData.formData.confirmOrganization : undefined,
      disabled: true,
      options: [{
        label: "?????????",
        key: 0,
        value: 0
      }, {
        label: "?????????",
        key: 4,
        value: 4
      }, {
        label: "?????????",
        key: 5,
        value: 5
      }],
      visible: {
        watch: "driverAcceptAudit",
        action: (driverAcceptAudit, { form }) => {
          if (!driverAcceptAudit) {
            form.setFieldsValue({
              confirmOrganization: undefined
            });
          }
          return driverAcceptAudit === 1;
        }
      }
    },
    transportBill: {
      customLabel: "?????????????????????????????????????????????",
      defaultValue: this.localData && this.localData.formData.transportBill || undefined,
      component: CheckBox,
      disabled: true,
      rules: {
        required: [true, "???????????????????????????"]
      },
      options: [{
        label: "?????????",
        key: 1,
        value: 1
      }, {
        label: "?????????",
        key: 2,
        value: 2
      }, {
        label: "?????????",
        key: 3,
        value: 3
      }, {
        label: "????????????",
        key: 4,
        value: 4
      }]
    },
    billNumberType: {
      customLabel: "????????????????????????????????????????????????",
      defaultValue: this.localData && this.localData.formData.billNumberType || undefined,
      component: CheckBox,
      disabled: Observer({
        watch: "*formMode",
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      visible: Observer({
        watch: "transportBill",
        action: transportBill => !!transportBill
      }),
      options: Observer({
        watch: "transportBill",
        action: transportBill => {
          if (!transportBill) return [];
          if (transportBill.indexOf("1") !== -1 && transportBill.indexOf("3") !== -1) return [{
            label: "????????????????????????",
            key: 1,
            value: 1
          }, {
            label: "????????????????????????",
            key: 3,
            value: 3
          }];
          if (transportBill.indexOf("1") !== -1) return [{
            label: "????????????????????????",
            key: 1,
            value: 1
          }];
          if (transportBill.indexOf("3") !== -1) return [{
            label: "????????????????????????",
            key: 3,
            value: 3
          }];
        }
      }),
      disabled: true
    },
    deliveryElectronicDocumentsId: {
      label: "?????????",
      defaultValue: this.localData && this.localData.formData.deliveryElectronicDocumentsId || undefined,
      component: SelectWithPicture,
      // disabled: Observer({
      //   watch: '*formMode',
      //   action: formMode => formMode === FORM_MODE.DETAIL
      // }),
      disabled: true,
      options: async () => {
        const { items } = await getElectronicDocuments({ electronicDocumentsType: 1, limit: 1000, offset: 0 });
        return [
          { label: "???", value: "temp", key: "temp" },
          ...(items || []).map(item => ({
            key: item.electronicDocumentsId,
            value: item.electronicDocumentsId,
            label: item.electronicDocumentsName,
            url: item.electronicDocumentsDentryid
          }))];
      },
      visible: Observer({
        watch: "transportBill",
        action: (transportBill) => {
          if (!transportBill) return false;
          if (transportBill.indexOf("1") !== -1) return true;
          return false;
        }
      })
    },
    receivingElectronicDocumentsId: {
      label: "?????????",
      defaultValue: this.localData && this.localData.formData.receivingElectronicDocumentsId || undefined,
      component: SelectWithPicture,
      // disabled: Observer({
      //   watch: '*formMode',
      //   action: formMode => formMode === FORM_MODE.DETAIL
      // }),
      disabled: true,
      options: async () => {
        const { items } = await getElectronicDocuments({ electronicDocumentsType: 3, limit: 1000, offset: 0 });
        return [
          { label: "???", value: "temp", key: "temp" },
          ...(items || []).map(item => ({
            key: item.electronicDocumentsId,
            value: item.electronicDocumentsId,
            label: item.electronicDocumentsName,
            url: item.electronicDocumentsDentryid
          }))];
      },
      visible: Observer({
        watch: "transportBill",
        action: (transportBill) => {
          if (!transportBill) return false;
          if (transportBill.indexOf("3") !== -1) return true;
          return false;
        }
      })
    },
    poundDifference: {
      label: "???????????????????????? ????????? ",
      defaultValue: this.localData && this.localData.formData.poundDifference || undefined,
      component: "input",
      disabled: true
    },
    priceType: {
      label: "???????????????",
      defaultValue: this.localData && this.localData.formData.priceType || undefined,
      component: "radio",
      disabled: true,
      options: [{
        label: "??????",
        key: 1,
        value: 1
      }]
    },
    measurementUnit: {
      component: "select",
      defaultValue: this.localData && this.localData.formData.measurementUnit || undefined,
      disabled: true,
      options: [{
        label: "???/??????",
        key: 1,
        value: 1
      }, {
        label: "???",
        key: 2,
        value: 2
      }, {
        label: "???/???",
        key: 3,
        value: 3
      }, {
        label: "???/???",
        key: 4,
        value: 4
      }]
    },
    measurementSource: {
      component: "select",
      defaultValue: this.localData && this.localData.formData.measurementSource || undefined,
      options: [{
        label: "?????????????????????",
        key: 1,
        value: 1
      }, {
        label: "?????????????????????",
        key: 2,
        value: 2
      }, {
        label: "?????????????????????",
        key: 3,
        value: 3
      }],
      disabled: true
    },
    driverDeliveryAudit: {
      label: "?????????????????????????????????????????????",
      defaultValue: this.localData && this.localData.formData.driverDeliveryAudit !== undefined ? this.localData.formData.driverDeliveryAudit : undefined,
      component: "radio",
      rules: {
        required: [true, "???????????????????????????????????????????????????"]
      },
      options: [{
        label: "??????",
        key: 1,
        value: 1
      }, {
        label: "?????????",
        key: 0,
        value: 0
      }],
      disabled: true
    },
    deliveryLaterKilometre: {
      label: "???????????????",
      defaultValue: this.localData && this.localData.formData.deliveryLaterKilometre || undefined,
      component: "input",
      rules: {
        required: [true, '??????????????????'],
        validator: ({ value })=>{
          if (!/^[1-9]\d*$/.test(value)) return '???????????????';
        }
      },
      visible: Observer({
        watch: ["transportCompleteType"],
        action: (transportCompleteType) => transportCompleteType === 2
      }),
      disabled: true
    },
    deliveryLaterMinute: {
      label: "?????????????????????",
      defaultValue: this.localData && this.localData.formData.deliveryLaterMinute || undefined,
      component: "input",
      rules: {
        required: [true, '??????????????????'],
        validator: ({ value })=>{
          if (!/^[1-9]\d*$/.test(value)) return '???????????????';
        }
      },
      visible: Observer({
        watch: ["transportCompleteType"],
        action: (transportCompleteType) => transportCompleteType === 2
      }),
      disabled: true
    },
    deliveryLaterHour: {
      label: "???????????????????????????",
      defaultValue: this.localData && this.localData.formData.deliveryLaterHour || undefined,
      component: "input",
      rules: {
        required: [true, '??????????????????'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '????????????????????????';
          if (value < 0) return '?????????????????????0??????';
        },
      },
      visible: Observer({
        watch: ["transportCompleteType"],
        action: (transportCompleteType) => transportCompleteType === 2
      }),
      disabled: true
    },
    hoursTip: {
      label: "??????",
      defaultValue: this.localData && this.localData.formData.hoursTip || undefined,
      component: "input",
      visible: Observer({
        watch: ["transportCompleteType"],
        action: (transportCompleteType) => transportCompleteType === 2
      }),
      disabled: true
    },
    transportCompleteType: {
      label: "??????????????????????????????",
      defaultValue: this.localData && this.localData.formData.transportCompleteType || undefined,
      component: "radio",
      rules: {
        required: [true, "????????????????????????????????????"]
      },
      options: [{
        label: "????????????",
        key: 1,
        value: 1
      }, {
        label: "????????????",
        key: 2,
        value: 2
      }],
      disabled: true
    },
    auditorOrganization1: {
      component: "select",
      defaultValue: this.localData && this.localData.formData.auditorOrganization1 || undefined,
      label: "??????????????????",
      rules: {
        required: [true, "????????????????????????"]
      },
      placeholder: "????????????????????????",
      options: [{
        label: "??????",
        key: 4,
        value: 4
      }, {
        label: "??????",
        key: 5,
        value: 5
      }],
      visible: Observer({
        watch: ["manualTrigger", "transportCompleteType"],
        action: ([manualTrigger, transportCompleteType], { form }) => {
          if (manualTrigger !== 3) {
            form.setFieldsValue({
              auditorOrganization1: undefined,
              auditorOrganization2: undefined
            });
          }
          if (transportCompleteType === 2) {
            form.setFieldsValue({
              manualTrigger: undefined
            });
          }
          return manualTrigger === 3 && transportCompleteType === 1;
        }
      }),
      disabled: true
    },
    auditorOrganization2: {
      component: SecondOrganizationCheckBox,
      defaultValue: this.localData && this.localData.formData.auditorOrganization2 || undefined,
      placeholder: "??????????????????????????????",
      visible: Observer({
        watch: ["auditorOrganization1", "transportCompleteType", "manualTrigger"],
        action: ([auditorOrganization1, transportCompleteType, manualTrigger], { form }) => {
          if (auditorOrganization1 !== 5) {
            form.setFieldsValue({
              auditorOrganization2: undefined
            });
          }
          if (transportCompleteType === 2) {
            form.setFieldsValue({
              auditorOrganization1: undefined
            });
          }
          if (manualTrigger !== 3) {
            form.setFieldsValue({
              auditorOrganization2: undefined
            });
          }
          return auditorOrganization1 === 5;
        }
      }),
      disabled: true
    },
    manualTrigger: {
      component: "select",
      defaultValue: this.localData && this.localData.formData.manualTrigger || undefined,
      rules: {
        required: [true, "?????????????????????"]
      },
      placeholder: "?????????????????????",
      options: [{
        label: "?????????",
        key: 1,
        value: 1
      }, {
        label: "?????????",
        key: 2,
        value: 2
      }, {
        label: "????????????",
        key: 3,
        value: 3
      }],
      visible: Observer({
        watch: ["transportCompleteType"],
        action: (transportCompleteType) => transportCompleteType === 1
      }),
      disabled: true
    }
  };

  onChange = value => {
    const active = this.state.businessTypeList.find(item => item.businessTypeId === Number(value));
    active.confirmOrganization = Number(active.confirmOrganization);
    if (active.manualTrigger === 3) {
      active.auditorOrganization1 = Number(active.auditorOrganization.split(",")[0]);
      active.auditorOrganization2 = Number(active.auditorOrganization.split(",")[1]);
    }
    active.poundDifference = Number(active.poundDifference * 1000).toFixed(2)._toFixed(2);
    active.deliveryElectronicDocumentsId = ((active.electronicDocumentsEntities || []).find(item => item.electronicDocumentsType === 1) || {}).electronicDocumentsId;
    active.receivingElectronicDocumentsId = ((active.electronicDocumentsEntities || []).find(item => item.electronicDocumentsType === 3) || {}).electronicDocumentsId;
    this.setState({
      activeBusinessType: active
    });
    const tips = {
      1: "?????????????????????",
      2: "?????????????????????",
      3: "?????????????????????"
    }[active.measurementSource];
    this.props.form.setFieldsValue({
      tips,
      activeMeasurementUnit: active.measurementUnit,
      deliveryType: active.deliveryType
    });
    this.props.onChange(active.businessTypeId);
    active.receivingType === 3 ? this.props.form.setFieldsValue({ isClientAudit: false }) : this.props.form.setFieldsValue({ isClientAudit: true });
  };

  componentDidMount() {
    getBusinessType({ offset: 0, limit: 1000, isOrderByTime: true }).then(res => {
      this.setState({
        projectId: this.props.projectId || "",
        ready: true,
        businessTypeList: res.items
      });
    });
  }

  componentWillUnmount() {
    // ??????????????????????????? ?????????????????? ??????????????????
    const localData = getLocal(this.currentTab.id) || { formData: {} };
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1 && localData.formData && localData.formData.businessTypeId && this.state.businessTypeList) {
      localStorage.removeItem(this.currentTab.id);
      const active = this.state.businessTypeList.find(item => item.businessTypeId === Number(localData.formData.businessTypeId));
      active.confirmOrganization = Number(active.confirmOrganization);
      if (active.manualTrigger === 3) {
        active.auditorOrganization1 = Number(active.auditorOrganization.split(",")[0]);
        active.auditorOrganization2 = Number(active.auditorOrganization.split(",")[1]);
      }
      active.poundDifference = Number(active.poundDifference * 1000).toFixed(2)._toFixed(2);
      active.deliveryElectronicDocumentsId = ((active.electronicDocumentsEntities || []).find(item => item.electronicDocumentsType === 1) || {}).electronicDocumentsId;
      active.receivingElectronicDocumentsId = ((active.electronicDocumentsEntities || []).find(item => item.electronicDocumentsType === 3) || {}).electronicDocumentsId;
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...localData.formData, ...active },
      }));
    }
  }

  render() {
    const { ready, activeBusinessType, projectId, businessTypeList } = this.state;
    const { localData } = this;
    return (
      ready
      &&
      <>
        {this.organizationType === role.OWNER && !projectId ?
          <div styleName="item_box" key={projectId}>
            <h3 styleName="form_title">????????????</h3>
            <SchemaForm
              layout="vertical"
              schema={{ ...this.detailForm }}
              mode={FORM_MODE.ADD}
              data={activeBusinessType}
              hideRequiredMark
              className="businessType_setting_form"
            >
              <div styleName="detail_form pdTop25">
                <Row>
                  <Col span={6}>
                    <span>???????????????</span>
                    <Select
                      value={localData && localData.formData.businessTypeId ||  activeBusinessType.businessTypeId}
                      onChange={this.onChange}
                      style={{ width: 200 }}
                      placeholder="?????????????????????"
                    >
                      {
                        businessTypeList.map(item => (
                          <Option value={item.businessTypeId}>{item.businessTypeName}</Option>
                        ))
                      }
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Item {...formLayout} field="remarks" />
                  </Col>
                </Row>
                <br />
                <Row>
                  <Col span={6}>
                    <Item {...formLayout} field="receivingType" />
                  </Col>
                  <Col span={6}>
                    <Item {...formLayout} field="deliveryType" />
                  </Col>
                </Row>
                <br />
                <Item {...formLayout} field="prebookingCompleteType" />
                <br />
                <Row>
                  <Col span={7}>
                    <Item className="createProject_detailForm_releaseHall" field="releaseHall" />
                  </Col>
                  <Col span={7} style={{ width: "auto" }}>
                    <Item className="createProject_detailForm_releaseHall" field="driverAcceptAudit" />
                  </Col>
                  <Col span={7}>
                    <Item field="confirmOrganization" />
                  </Col>
                </Row>
                <Item field="transportBill" />
                <Item field="billNumberType" />
                <Item field="deliveryElectronicDocumentsId" />
                <Item field="receivingElectronicDocumentsId" />
                <br />
                <Item className="businessType_setting_form_poundInput" field="poundDifference" />
                <br />
                <Row>
                  <Col span={10}>
                    <Row>
                      <Col span={8} style={{ width: "auto" }}>
                        <Item className="businessType_setting_form_priceType" field="priceType" />
                      </Col>
                      <Col span={8} style={{ width: "auto" }}>
                        <Item field="measurementUnit" />
                      </Col>
                      <Col span={8}>
                        <Item field="measurementSource" />
                      </Col>
                    </Row>
                  </Col>
                  <Col span={10}>
                    <Item styleName="flex_align_start" field="driverDeliveryAudit" />
                  </Col>
                </Row>
                <Row>
                  <Col span={6} styleName="autoWidth">
                    <Item className="businessType_setting_form_transportCompleteType" field="transportCompleteType" />
                  </Col>
                  <Col span={18}>
                    <Row>
                      <Col span={6} styleName="autoWidth">
                        <Item field="manualTrigger" />
                      </Col>
                      <Col span={6} styleName="autoWidth pdl10">
                        <Item
                          className="businessType_setting_form_auditorOrganization businessType_setting_form_firstOrganization"
                          styleName="flex_align_start"
                          field="auditorOrganization1"
                        />
                      </Col>
                      <Col span={6}>
                        <Item className="businessType_setting_form_auditorOrganization" field="auditorOrganization2" />
                      </Col>
                    </Row>
                    <Row styleName="mrTop20">
                      <Col span={6} styleName="autoWidth">
                        <Item styleName="flex_align_start" field="deliveryLaterKilometre" />
                      </Col>
                      <Col span={6} styleName="autoWidth">
                        <Item styleName="flex_align_start" field="deliveryLaterMinute" />
                      </Col>
                      <Col span={6} styleName="autoWidth">
                        <Item styleName="flex_align_start" field="deliveryLaterHour" />
                      </Col>
                      <Col span={6} styleName="autoWidth">
                        <Item styleName="flex_align_start hours" field="hoursTip" />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            </SchemaForm>
          </div>
          :
          null
        }
      </>
    );
  }
}

export default CreateProject;

