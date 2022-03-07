import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, notification, Button, Select, message } from 'antd';
import { SchemaForm, Item, FormCard, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import CSSModules from 'react-css-modules';
import router from 'umi/router';
import moment from 'moment';
import DebounceFormButton from '../../../../components/debounce-form-button';
import model from '../../../../models/project';
import { PROJECT_AUDIT_STATUS, CHARGE_MODE } from '../../../../constants/project/project';
import role from '../../../../constants/organization/organization-type';
import receivingModel from '../../../../models/receiving';
import request from '../../../../utils/request';
import { getUserInfo } from '../../../../services/user';
import { getUser, getReceivingLabel, getBusinessType, getElectronicDocuments } from '../../../../services/apiService';
import UploadFile from '../../../../components/upload/upload-file';
import { getLocal, assign } from '../../../../utils/utils';
import GoodsInfo from './components/goods-info';
import DeliveryInfo from './components/delivery-info';
import ReceivingInfo from './components/receiving-info';
import ShipmentInfo from './components/shipment-info';
import ShipmentRadio from './components/shipment-radio';
import styles from './create-project.less';
import CheckBox from '../../../basic-setting/component/check-box';
import '@gem-mine/antd-schema-form/lib/fields';
import SecondOrganizationCheckBox from './components/second-organization-check-box';
import SelectWithPicture from '../../../basic-setting/component/select-with-picture';

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
        label: "提货类型",
        observer: Observer({
          watch: '*currentTab',
          action: (itemValue, { form }) => {
            if (this.form !== form) {
              this.form = form;
            }
            return {};
          }
        }),
        options: [{
          label: "单提",
          key: 1,
          value: 1
        }, {
          label: "多提",
          key: 2,
          value: 2
        }, {
          label: "未知",
          key: 3,
          value: 3
        }],
        placeholder: "请选择业务模板"
      },
      tips: {
        readOnly: true,
        component: "input",
        label: "计量来源：",
        placeholder: "请选择业务模板"
      },
      isClientAudit: {
        component: "input",
      },
      activeMeasurementUnit: {
        disabled: true,
        options: [{
          label: "吨/公里",
          key: 1,
          value: 1
        }, {
          label: "方",
          key: 2,
          value: 2
        }, {
          label: "元/吨",
          key: 3,
          value: 3
        }, {
          label: "元/方",
          key: 4,
          value: 4
        }],
        placeholder: "请选择业务模板",
        component: "select"
      },
      businessTypeId: {
        rules: {
          required: [true, "请选择业务模板"]
        },
        component: BusinessType,
        observer: Observer({
          watch: "*projectId",
          action: projectId => ({ projectId })
        })
      },
      projectName: {
        label: "合同名称",
        placeholder: "请输入合同名称",
        component: Observer({
          watch: "*mode",
          action: mode => mode === FORM_MODE.MODIFY ? "input.text" : "input"
        }),
        maxLength: 30,
        rules: {
          required: [true, "请输入合同名称"],
          max: 30
        }
      },
      projectNo: {
        label: "合同编号",
        component: addContractInfo ? "input.text" : "input",
        placeholder: "请输入合同编号",
        rules: {
          required: [true, "请输入合同编号"]
        }
      },
      isCustomerAudit: {
        label: "客户审核",
        component: mode === FORM_MODE.MODIFY || this.organizationType === role.CARGOES ? "radio.text" : "radio",
        rules: {
          required: [true, "请选择是否客户审核"]
        },
        options: [
          {
            label: "无需",
            value: 0,
            key: 0
          },
          {
            label: "需要",
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
        rules: { required: [true, "请选择客户"] },
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
        placeholder: "请选择客户"
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
        label: "托运单位",
        props: {
          showSearch: true,
          optionFilterProp: "label"
        },
        rules: { required: [true, "请选择托运方"] },
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
            const { organizationId, organizationName = "自己" } = own;
            result.push({ key: organizationId, value: organizationId, label: organizationName });
          }
          return result;
        },
        placeholder: "请选择托运方"
      },
      responsibleItems: {
        label: "合同负责人",
        component: "select",
        props: {
          mode: "multiple"
        },
        style: { width: "100%" },
        placeholder: "请选择合同负责人",
        rules: {
          required: true,
          validator: ({ value }) => {
            if (value && value.length < 1) return "请选择合同负责人";
            if (value && value.length > 10) return "合同负责人最多选择10个";
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
        label: "合同签订日期",
        component: addContractInfo ? "datePicker.text" : "datePicker",
        rules: { required: [true, "请选择合同签订日期"] },
        format: {
          input: (value) => moment(value)
        },
        observer: Observer({
          watch: '*localData',
          action: (itemValue, { form }) => {
            if (this.form !== form) {
              this.form = form;
            }
            return {};
          }
        }),
      },
      consignmentType: {
        label: "交易模式",
        component: addContractInfo ? "radio.text" : "radio",
        rules: {
          required: [true, "请选择交易模式"]
        },
        options: [
          {
            label: "直发",
            value: 0,
            key: 0
          },
          {
            label: "代发",
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
        rules: { required: [true, "请选择货权方"] },
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
        placeholder: "请选择货权方"
      },
      chargeMode: {
        label: "计费方式",
        component: addContractInfo ? "radio.text" : "radio",
        options: [{
          key: CHARGE_MODE.DELIVERY,
          label: "按提货重量",
          value: CHARGE_MODE.DELIVERY
        }, {
          key: CHARGE_MODE.RECEIVING,
          label: "按卸货重量",
          value: CHARGE_MODE.RECEIVING
        }],
        rules: {
          required: true
        }
      },
      projectRemark: {
        placeholder: "请输入备注",
        label: "备注（可选）",
        component: addContractInfo ? "input.textArea.text" : "input.textArea",
        maxLength: 150,
        rules: {
          max: 150
        }
      },
      goodsItems: {
        component: GoodsInfo,
        rules: {
          required: [true, "请添加货品信息"]
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
          required: [true, "请添加提货信息"]
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
      //   label: "项目标签",
      //   placeholder: "请选项目标签",
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
          required: [true, "请添加收货信息"]
        },
        keepAlive: false,
        // observer: Observer({
        //   watch: "receivingLabelId",
        //   action: (receivingLabelId) => {
        //     this.props.getReceiving({ receivingLabelId, limit: 200, offset: 0 }); // 无法修改
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
        label: "选择承运方",
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
            if (formData.shipmentType !== 0) { // 当承运方式选择平台时 不做校验
              if (!value || value.length === 0) {
                return '请添加承运方信息';
              }
            }
          }
        }
      },
      projectDentryid: {
        label: "上传图片",
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
          labelUpload: "上传合同（封面）"
        },
        rules: {
          required: [true, "添加封面"]
        },
        format: {
          input: (value) => {
            if (value && Array.isArray(value) && value[0]?.indexOf('business') > -1) {
              return value[0];
            }
            return value;
          }
        },
        value: ({ formData: { projectDentryid = "" } }) => projectDentryid.split(",")[0] ? [projectDentryid.split(",")[0]] : []
      },
      back: {
        component: UploadFile,
        format: {
          input: (value) => {
            if (value && Array.isArray(value) && value[0]?.indexOf('business') > -1) {
              return value[0];
            }
            return value;
          }
        },
        props: {
          labelUpload: "上传合同（封底）"
        },
        rules: {
          required: [true, "添加封底"]
        },
        value: ({ formData: { projectDentryid = "" } }) => projectDentryid.split(",")[1] ? [projectDentryid.split(",")[1]] : []
      },
      seam: {
        component: UploadFile,
        format: {
          input: (value) => {
            if (value && Array.isArray(value) && value[0]?.indexOf('business') > -1) {
              return value[0];
            }
            return value;
          }
        },
        props: {
          labelUpload: "上传合同（骑缝）"
        },
        rules: {
          required: [true, "添加骑缝"]
        },
        value: ({ formData: { projectDentryid = "" } }) => projectDentryid.split(",")[2] ? [projectDentryid.split(",")[2]] : []
      },
      contractPic1: {
        component: UploadFile,
        format: {
          input: (value) => {
            if (value && Array.isArray(value) && value[0]?.indexOf('business') > -1) {
              return value[0];
            }
            return value;
          }
        },
        props: {
          labelUpload: "上传合同（内容）"
        },
        value: ({ formData: { projectDentryid = "" } }) => projectDentryid.split(",")[3] ? [projectDentryid.split(",")[3]] : []
      },
      contractPic2: {
        component: UploadFile,
        format: {
          input: (value) => {
            if (value && Array.isArray(value) && value[0]?.indexOf('business') > -1) {
              return value[0];
            }
            return value;
          }
        },
        props: {
          labelUpload: "上传合同（内容）"
        },
        value: ({ formData: { projectDentryid = "" } }) => projectDentryid.split(",")[4] ? [projectDentryid.split(",")[4]] : []
      },
      projectPicture: {
        component: UploadFile,
        format: {
          input: (value) => {
            if (value && Array.isArray(value) && value[0]?.indexOf('business') > -1) {
              return value[0];
            }
            return value;
          }
        },
        label: "合同图片",
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
          label: <span>已读<a onClick={() => {
            window.open("/agreement");
          }}
          >《项目协议书》
                         </a>
                 </span>,
          value: 0
        }],
        rules: {
          required: [true, "请选择已读合同协议书"]
        }
      },
      freightPrice: {
        label: '单价：',
        component: 'input',
        rules: {
          required: [true, '请输入金额'],
          validator: ({ value }) => {
            if (!/^\d+\.?\d{0,2}$/.test(value)) return '请正确输入单价!(最高支持两位小数)';
            if (value <= 0) return '请正确输入单价!(最高支持两位小数)';
          },
        },
        placeholder: "请输入金额（元）"
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
    if (mode !== FORM_MODE.MODIFY && !value.isClientAudit && value.isCustomerAudit === 1) return message.error("无卸货点的项目无需客户审核！");
    delete value.isClientAudit;
    if (value.shipmentType === 0 && this.props.project.shipmentType !== value.shipmentType) { // 当托运方把承运方式从指定承运的修改为平台时，则不用上传shipmentItems
      delete value.shipmentItems;
    }
    if (mode === FORM_MODE.ADD) {
      delete value.readMe; // 去除已读项目协议书的数据
    } else if (project.createOrgType === role.CARGOES) { // 如果是修改模式
      if (value.shipmentType === 0) {
        value.projectStatus = PROJECT_AUDIT_STATUS.UNAUDITED;
      } else {
        value.projectStatus = PROJECT_AUDIT_STATUS.SHIPMENT_UNAUDITED;
      }
    }
    delete value.tips;
    // 只传需要的数据，表单的其他数据是为了动态创建提卸货点而填写的
    const deliveryItems = value.deliveryItems.map(item=>({
      deliveryId : item.deliveryId,
      isOpenFence : item.isOpenFence,
      radius : Number(item.radius)
    }));

    const receivingItems = value.receivingItems.map(item=>({
      receivingId : item.receivingId,
      isOpenFence : item.isOpenFence,
      radius : Number(item.radius),
      signDentryid : item.signDentryid
    }));

    value.deliveryItems = deliveryItems;
    value.receivingItems = receivingItems;

    const result = await (this.state.mode === FORM_MODE.ADD
      ? postProjects({ ...value, transactionalMode: 1 })
      : patchProjects({ ...value, transactionalMode: 1, projectId: location.query.projectId }));
    if (result) {
      notification.success({
        message: this.state.mode === FORM_MODE.ADD ? "添加成功" : "修改成功",
        description: this.state.mode === FORM_MODE.ADD ? `添加成功` : `修改成功`
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
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabs').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData, projectDentryid: formData && formData.projectDentryid || '' },
      }));
    }
  }

  componentWillReceiveProps(p) {
    if (p.commonStore.activeKey !== this.props.commonStore.activeKey) { // 相同路由参数不同的时候存一次本地
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      const formData = this.form ? this.form.getFieldsValue() : null;
      localStorage.removeItem(this.currentTab.id);
      if (getLocal('local_commonStore_tabs').tabs.length > 1) {
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

    const data = Object.assign({ ...JSON.parse(JSON.stringify(project)) }, this.localData && this.localData.formData || {});

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
            <FormCard title="合同信息" colCount="3">
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
            <FormCard title="货品信息" colCount="1">
              <Item {...formLayout} field="goodsItems" />
            </FormCard>
            <FormCard title="托运方相关信息" colCount="4">
              <Item {...formLayout} field="consignmentId" />
              <Item {...formLayout} field="responsibleItems" />
            </FormCard>
            {this.organizationType !== role.CARGOES &&
              <>
                <FormCard title="提货信息" colCount="1">
                  <Item {...formLayout} field="deliveryType" />
                  <Item {...formLayout} field="deliveryItems" />
                </FormCard>
                <FormCard title="收货信息" colCount="1">
                  {/* <Item {...formLayout} field="receivingLabelId" /> */}
                  <Item {...formLayout} field="receivingItems" />
                </FormCard>
                <FormCard title="承运方信息" colCount="1">
                  <Item {...formLayout} field="shipmentType" />
                  <Item {...formLayout} field="shipmentItems" />
                </FormCard>
              </>}
            {this.organizationType === role.OWNER && !projectId ?
              <div styleName="item_box">
                <h3 styleName="form_title">物流运费</h3>
                <p styleName="p_tips">价格类型</p>
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
                    {/* <span styleName='unit'>计量来源：{this.getMeasurementSource()}</span> */}
                    <Item field="tips" />
                  </Col>
                </Row>
              </div>
              :
              null
            }
            {this.organizationType === role.CARGOES || mode === FORM_MODE.ADD ?
              <FormCard title="合同上传" colCount="8">
                <Item style={uploadPicStyle} labelCol={{ xs: { span: 24 } }} field="projectDentryid" />
                <Item style={uploadPicStyle} field="front" />
                <Item style={uploadPicStyle} field="back" />
                <Item style={uploadPicStyle} field="seam" />
                <Item style={uploadPicStyle} field="contractPic1" />
                <Item style={uploadPicStyle} field="contractPic2" />
              </FormCard> :
              <FormCard title="合同上传" colCount="1">
                <Item {...formLayout} field="projectPicture" />
              </FormCard>
            }
            {mode === FORM_MODE.ADD && <Item {...formLayout} field="readMe" />}
            <div style={{ paddingRight: "20px", textAlign: "right" }}>
              <Button onClick={this.goBack} className="mr-10">返回</Button>
              <DebounceFormButton debounce label="保存" type="primary" onClick={this.handleSaveBtnClick} />
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
    transportCreateMode:{
      label : '运单生成方式',
      component : CheckBox,
      defaultValue: this.localData && this.localData.formData.transportCreateMode || undefined,
      options: [
        {
          label: '电子围栏自动触发',
          key: 1,
          value: 1,
        },
      ],
      disabled: true
    },
    remarks: {
      label: "业务模板描述：",
      component: "input",
      placeholder: "请输入业务模板描述",
      defaultValue: this.localData && this.localData.formData.remarks || undefined,
      disabled: true
    },
    deliveryType: {
      label: "提货点：",
      defaultValue: this.localData && this.localData.formData.deliveryType || undefined,
      component: "radio",
      options: [{
        label: "单提",
        key: 1,
        value: 1
      }, {
        label: "多提",
        key: 2,
        value: 2
      }, {
        label: "未知提货点",
        key: 3,
        value: 3
      }],
      disabled: true
    },
    receivingType: {
      label: "卸货点：",
      defaultValue: this.localData && this.localData.formData.receivingType || undefined,
      component: "radio",
      options: [{
        label: "单卸",
        key: 1,
        value: 1
      }, {
        label: "多卸",
        key: 2,
        value: 2
      }, {
        label: "未知卸货点",
        key: 3,
        value: 3
      }],
      disabled: true
    },
    prebookingCompleteType: {
      customLabel: "预约单关闭条件：",
      defaultValue: this.localData && this.localData.formData.prebookingCompleteType || undefined,
      component: CheckBox,
      disabled: true,
      options: [{
        label: "预约重量全部调度完成则关闭",
        key: 1,
        value: 1
      }, {
        label: "超过截止日期则自动关闭",
        key: 2,
        value: 2
      }, {
        label: "手动关闭",
        key: 3,
        value: 3
      }, {
        label: "每天自动关闭（0点）",
        key: 4,
        value: 4
      }]
    },
    releaseHall: {
      label: "是否允许发布到货源大厅：",
      defaultValue: this.localData && this.localData.formData.releaseHall !== undefined ? this.localData.formData.releaseHall : undefined,
      component: "radio",
      disabled: true,
      options: [{
        label: "是",
        key: 1,
        value: 1
      }, {
        label: "否",
        key: 0,
        value: 0
      }]
    },
    driverAcceptAudit: {
      label: "司机接单后是否需要确认：",
      defaultValue: this.localData && this.localData.formData.driverAcceptAudit !== undefined ? this.localData.formData.driverAcceptAudit : undefined,
      component: "radio",
      options: [{
        label: "是",
        key: 1,
        value: 1
      }, {
        label: "否",
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
        label: "发起方",
        key: 0,
        value: 0
      }, {
        label: "托运方",
        key: 4,
        value: 4
      }, {
        label: "承运方",
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
      customLabel: "可多选，至少需要勾选一个单据：",
      defaultValue: this.localData && this.localData.formData.transportBill || undefined,
      component: CheckBox,
      disabled: true,
      rules: {
        required: [true, "请选择所需运输单据"]
      },
      options: [{
        label: "提货单",
        key: 1,
        value: 1
      }, {
        label: "过磅单",
        key: 2,
        value: 2
      }, {
        label: "签收单",
        key: 3,
        value: 3
      }, {
        label: "到站图片",
        key: 4,
        value: 4
      }]
    },
    billNumberType: {
      customLabel: "选择需要自动生成单号的单据类型：",
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
            label: "自动生成提货单号",
            key: 1,
            value: 1
          }, {
            label: "自动生成签收单号",
            key: 3,
            value: 3
          }];
          if (transportBill.indexOf("1") !== -1) return [{
            label: "自动生成提货单号",
            key: 1,
            value: 1
          }];
          if (transportBill.indexOf("3") !== -1) return [{
            label: "自动生成签收单号",
            key: 3,
            value: 3
          }];
        }
      }),
      disabled: true
    },
    deliveryElectronicDocumentsId: {
      label: "提货单",
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
          { label: "无", value: "temp", key: "temp" },
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
      label: "签收单",
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
          { label: "无", value: "temp", key: "temp" },
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
      label: "允许的磅差范围： 千分之 ",
      defaultValue: this.localData && this.localData.formData.poundDifference || undefined,
      component: "input",
      disabled: true
    },
    priceType: {
      label: "价格类型：",
      defaultValue: this.localData && this.localData.formData.priceType || undefined,
      component: "radio",
      disabled: true,
      options: [{
        label: "单价",
        key: 1,
        value: 1
      }]
    },
    measurementUnit: {
      component: "select",
      defaultValue: this.localData && this.localData.formData.measurementUnit || undefined,
      disabled: true,
      options: [{
        label: "吨/公里",
        key: 1,
        value: 1
      }, {
        label: "方",
        key: 2,
        value: 2
      }, {
        label: "元/吨",
        key: 3,
        value: 3
      }, {
        label: "元/方",
        key: 4,
        value: 4
      }]
    },
    measurementSource: {
      component: "select",
      defaultValue: this.localData && this.localData.formData.measurementSource || undefined,
      options: [{
        label: "按提货数量计算",
        key: 1,
        value: 1
      }, {
        label: "按签收数量计算",
        key: 2,
        value: 2
      }, {
        label: "按最小数量计算",
        key: 3,
        value: 3
      }],
      disabled: true
    },
    driverDeliveryAudit: {
      label: "司机提货后是否需要托运方审核：",
      defaultValue: this.localData && this.localData.formData.driverDeliveryAudit !== undefined ? this.localData.formData.driverDeliveryAudit : undefined,
      component: "radio",
      rules: {
        required: [true, "请选择司机提货后是否需要托运方审核"]
      },
      options: [{
        label: "需要",
        key: 1,
        value: 1
      }, {
        label: "不需要",
        key: 0,
        value: 0
      }],
      disabled: true
    },
    deliveryLaterKilometre: {
      label: "提货后行驶",
      defaultValue: this.localData && this.localData.formData.deliveryLaterKilometre || undefined,
      component: "input",
      rules: {
        required: [true, '请输入公里数'],
        validator: ({ value }) => {
          if (!/^[1-9]\d*$/.test(value)) return '仅支持整数';
        }
      },
      visible: Observer({
        watch: ["transportCompleteType"],
        action: (transportCompleteType) => transportCompleteType === 2
      }),
      disabled: true
    },
    deliveryLaterMinute: {
      label: "公里且停车超过",
      defaultValue: this.localData && this.localData.formData.deliveryLaterMinute || undefined,
      component: "input",
      rules: {
        required: [true, '请输入分钟数'],
        validator: ({ value }) => {
          if (!/^[1-9]\d*$/.test(value)) return '仅支持整数';
        }
      },
      visible: Observer({
        watch: ["transportCompleteType"],
        action: (transportCompleteType) => transportCompleteType === 2
      }),
      disabled: true
    },
    deliveryLaterHour: {
      label: "分钟，或提货后超过",
      defaultValue: this.localData && this.localData.formData.deliveryLaterHour || undefined,
      component: "input",
      rules: {
        required: [true, '请输入小时数'],
        validator: ({ value }) => {
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch: ["transportCompleteType"],
        action: (transportCompleteType) => transportCompleteType === 2
      }),
      disabled: true
    },
    hoursTip: {
      label: "小时",
      defaultValue: this.localData && this.localData.formData.hoursTip || undefined,
      component: "input",
      visible: Observer({
        watch: ["transportCompleteType"],
        action: (transportCompleteType) => transportCompleteType === 2
      }),
      disabled: true
    },
    transportCompleteType: {
      label: "触发运单完成的操作：",
      defaultValue: this.localData && this.localData.formData.transportCompleteType || undefined,
      component: "radio",
      rules: {
        required: [true, "请选择触发运单完成的操作"]
      },
      options: [{
        label: "手动触发",
        key: 1,
        value: 1
      }, {
        label: "自动触发",
        key: 2,
        value: 2
      }],
      disabled: true
    },
    auditorOrganization1: {
      component: "select",
      defaultValue: this.localData && this.localData.formData.auditorOrganization1 || undefined,
      label: "第一审核方：",
      rules: {
        required: [true, "请选择第一审核方"]
      },
      placeholder: "请选择第一审核方",
      options: [{
        label: "托运",
        key: 4,
        value: 4
      }, {
        label: "承运",
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
      placeholder: "第二审核方（可选）：",
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
        required: [true, "请选择触发节点"]
      },
      placeholder: "请选择触发节点",
      options: [{
        label: "已到站",
        key: 1,
        value: 1
      }, {
        label: "已签收",
        key: 2,
        value: 2
      }, {
        label: "审核通过",
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
      1: "按提货数量计算",
      2: "按签收数量计算",
      3: "按最小数量计算"
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
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const localData = getLocal(this.currentTab.id) || { formData: {} };
    if (getLocal('local_commonStore_tabs').tabs.length > 1 && localData.formData && localData.formData.businessTypeId && this.state.businessTypeList) {
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
            <h3 styleName="form_title">业务类型</h3>
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
                    <span>业务模板：</span>
                    <Select
                      value={localData && localData.formData.businessTypeId || activeBusinessType.businessTypeId}
                      onChange={this.onChange}
                      style={{ width: 200 }}
                      placeholder="请选择业务模板"
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
                <Item {...formLayout} field="transportCreateMode" />
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

