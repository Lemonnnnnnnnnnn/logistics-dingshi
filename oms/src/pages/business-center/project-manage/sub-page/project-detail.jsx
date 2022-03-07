import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Modal, Row, Col } from 'antd';
import router from 'umi/router';
import QRCode from 'qrcode.react';
import CSSModules from 'react-css-modules';
import { SchemaForm, Item, FormCard, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import role from '../../../../constants/organization/organization-type';
import { getStatusConfig } from '../../../../services/project';
import { getUserInfo } from '../../../../services/user';
import { PROJECT_STATUS, CHARGE_MODE, NETWORK_CONTRACT_LIST_STATUS } from '../../../../constants/project/project';
import model from '../../../../models/project';
import { detailBusinessType } from '../../../../services/apiService';
import UploadFile from '../../../../components/upload/upload-file';
import GoodsInfo from './components/goods-info';
import styles from './create-project.less';
import DeliveryInfo from './components/delivery-info';
import ContractField from './components/contract-field';
import ReceivingInfo from './components/receiving-info';
import ShipmentInfo from './components/shipment-info';
import ShipmentRadio from './components/shipment-radio';
import '@gem-mine/antd-schema-form/lib/fields';
import CheckBox from '../../../basic-setting/component/check-box';
import SecondOrganizationCheckBox from './components/second-organization-check-box';
import SelectWithPicture from '../../../basic-setting/component/select-with-picture';

const { actions: { detailProjects } } = model;

function mapStateToProps(state) {
  const project = state.project.entity;
  if (project.verifyItems && project.verifyItems.length !== 0 && project.projectStatus === PROJECT_STATUS.SHIPMENT_REFUSE) {
    const lastVerifyItems = project.verifyItems[project.verifyItems.length - 1];
    project.refuseReason = lastVerifyItems.verifyReason;
    project.handleTime = lastVerifyItems.createTime;
  }

  if (project.customerContactName) {
    project.receivingItems = project.receivingItems.map(item => {
      item.customerOrgName = project.customerName;
      return item;
    });
  }
  return {
    project,
    commonStore: state.commonStore,
  };
}

const formLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};

@connect(mapStateToProps, { detailProjects })
@CSSModules(styles, { allowMultiple: true })
class App extends Component {

  organizationType = getUserInfo().organizationType;

  state = {
    ready: false,
    visible: false,
  };

  constructor(props) {
    super(props);
    this.schema = {
      freightPrice: {
        label: '单价：',
        component: 'input',
      },
      projectStatus: {
        component: 'hide',
      },
      isAvailable: {
        component: 'hide',
      },
      verifyItems: {
        component: 'hide',
      },
      eventItems: {
        component: 'hide',
      },
      cargoesName: {
        component: 'hide',
      },
      projectDentryid: {
        component: 'hide',
      },
      projectStatusWord: {
        component: 'input',
        label: '合同状态',
        value: ({ formData }) => {
          const { projectStatus, isAvailable } = formData;
          const config = getStatusConfig(projectStatus, isAvailable);
          return config[0].word;
        },
      },
      forbiddenTime: {
        component: 'input',
        label: '禁用时间',
        value: ({ formData }) => {
          const { eventItems } = formData;
          if (!eventItems) return '';
          // TODO 客户合同审核verifyObjectType编码未定义
          const forbidItems = eventItems.filter(item => item.eventStatus === 2);
          forbidItems.sort((prev, next) => moment(next.createTime) > moment(prev.createTime) ? 1 : -1);
          if (forbidItems.length) return moment(forbidItems[0].createTime).format('YYYY-MM-DD');
          return '--';
        },
        visible: ({ formData }) => {
          // 合同状态为禁用时展示禁用时间
          if (!formData.isAvailable) return true;
          return false;
        },
      },
      refuseReason: {
        component: 'input',
        label: '拒绝理由',
        visible: ({ formData }) => {
          // 合同状态为客户拒绝时展示拒绝理由
          if (!formData.projectStatus === PROJECT_STATUS.SHIPMENT_REFUSE && formData.isAvailable === true) return true;
          return false;
        },
        rules: {
          max: 100,
        },
      },
      handleTime: {
        component: 'input',
        label: '审核时间',
        visible: ({ formData }) => {
          // 合同状态为客户拒绝时展示审核时间
          if (!formData.projectStatus === PROJECT_STATUS.SHIPMENT_REFUSE && formData.isAvailable === true) return true;
          return false;
        },
      },
      projectName: {
        label: '合同名称',
        component: 'input',
      },
      responsibleItems: {
        label: '合同负责人',
        component: 'input',
      },
      projectNo: {
        label: '合同编号',
        component: 'input',
      },
      customerName: {
        label: '客户单位',
        component: 'input',
      },
      customerContactName: {
        label: '客户联系人',
        component: 'input',
      },
      customerContactPhone: {
        label: '客户联系电话',
        component: 'input',
      },
      supplyOrg: {
        label: '供货单位',
        component: 'input',
        value: ({ formData }) => {
          if (formData.consignmentType) return formData.cargoesName;
          return formData.consignmentName;
        },
      },
      consignmentType: {
        label: '交易模式',
        component: 'radio',
        options: [
          {
            key: 0,
            value: 0,
            label: '直发',
          },
          {
            key: 1,
            value: 1,
            label: '代发',
          },
        ],
      },
      businessType: {
        label: '业务模板',
        component: RouterTo,
        type: 1,
        visible: this.organizationType === 1,
        props: Observer({
          watch: '*detail',
          action: detail => ({ detailId: detail.logisticsBusinessTypeEntity?.businessTypeId }),
        }),
      },
      tradingType: {
        label: '交易方案',
        component: RouterTo,
        type: 2,
        visible: this.organizationType === 1,
        props: Observer({
          watch: '*detail',
          action: detail => ({ detailId: detail?.logisticsTradingSchemeEntity?.tradingSchemeId }),
        }),
      },
      chargeMode: {
        label: '计费方式',
        component: 'radio',
        options: [{
          key: CHARGE_MODE.DELIVERY,
          label: '按提货重量',
          value: CHARGE_MODE.DELIVERY,
        }, {
          key: CHARGE_MODE.RECEIVING,
          label: '按卸货重量',
          value: CHARGE_MODE.RECEIVING,
        }],
        rules: {
          required: true,
        },
      },
      projectRemark: {
        placeholder: '请输入备注',
        label: '备注（可选）',
        component: 'input.textArea',
      },
      projectTime: {
        placeholder: '请输入备注',
        label: '合同签订日期',
        component: 'input',
        format: {
          input: (value) => value ? moment(value).format('YYYY-MM-DD') : '--',
        },
      },
      contractItems: {
        label: '运输合同',
        component: ContractField,
        visible: ({ formData }) => {
          // 仅在承运平台下展示
          if (this.organizationType !== 1 && this.organizationType !== 5) return false;
          const usefulContract = (formData.contractItems || []).filter(({
            contractState,
            isAvailable,
          }) => contractState === NETWORK_CONTRACT_LIST_STATUS.AUDITED && isAvailable);
          return usefulContract.length !== 0;
        },
      },
      goodsItems: {
        component: GoodsInfo,
        isShowFreightCost: mode => {
          if (this.organizationType === role.SHIPMENT) return false;
          if (mode === FORM_MODE.ADD || this.props.project.createOrgType === role.OWNER) return true;
          if (this.organizationType === role.CUSTOMER || this.organizationType === role.CARGOES) return true;
          return false;
        },
      },
      consignmentName: {
        component: 'input',
        label: '托运单位',
      },
      consgignmentContactName: {
        component: 'input',
        label: '联系人',
      },
      consgignmentContactPhone: {
        component: 'input',
        label: '联系方式',
      },
      deliveryItems: {
        component: DeliveryInfo,
      },
      receivingItems: {
        component: ReceivingInfo,
      },
      shipmentType: {
        label: '选择承运方',
        component: ShipmentRadio,
      },
      shipmentItems: {
        component: ShipmentInfo,
        props: { organizationType: this.organizationType },
        getMode: () => FORM_MODE.DETAIL,
      },
      projectPicture: {
        component: UploadFile,
        label: '合同图片',
        value: ({ formData }) => {
          if (!formData.projectDentryid) return [];
          return formData.projectDentryid.split(',');
        },
      },
    };
  }

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
    businessTypeName: {
      label: '业务模板名称：',
      component: 'input',
      disabled: true,
    },
    remarks: {
      label: '业务模板描述：',
      component: 'input',
      placeholder: '请输入业务模板描述',
      disabled: true,
    },
    deliveryType: {
      label: '提货点：',
      component: 'radio',
      options: [{
        label: '单提',
        key: 1,
        value: 1,
      }, {
        label: '多提',
        key: 2,
        value: 2,
      }, {
        label: '未知提货点',
        key: 3,
        value: 3,
      }],
      disabled: true,
    },
    receivingType: {
      label: '卸货点：',
      component: 'radio',
      options: [{
        label: '单卸',
        key: 1,
        value: 1,
      }, {
        label: '多卸',
        key: 2,
        value: 2,
      }, {
        label: '未知卸货点',
        key: 3,
        value: 3,
      }],
      disabled: true,
    },
    prebookingCompleteType: {
      customLabel: '预约单关闭条件：',
      component: CheckBox,
      disabled: true,
      options: [{
        label: '预约重量全部调度完成则关闭',
        key: 1,
        value: 1,
      }, {
        label: '超过截止日期则自动关闭',
        key: 2,
        value: 2,
      }, {
        label: '手动关闭',
        key: 3,
        value: 3,
      }, {
        label: '每天自动关闭（0点）',
        key: 4,
        value: 4,
      }],
    },
    releaseHall: {
      label: '是否允许发布到货源大厅：',
      component: 'radio',
      disabled: true,
      options: [{
        label: '是',
        key: 1,
        value: 1,
      }, {
        label: '否',
        key: 0,
        value: 0,
      }],
    },
    driverAcceptAudit: {
      label: '司机接单后是否需要确认：',
      component: 'radio',
      options: [{
        label: '是',
        key: 1,
        value: 1,
      }, {
        label: '否',
        key: 0,
        value: 0,
      }],
      disabled: true,
    },
    confirmOrganization: {
      component: 'select',
      disabled: true,
      options: [{
        label: '发起方',
        key: 0,
        value: 0,
      }, {
        label: '托运方',
        key: 4,
        value: 4,
      }, {
        label: '承运方',
        key: 5,
        value: 5,
      }],
      visible: {
        watch: 'driverAcceptAudit',
        action: (driverAcceptAudit, { form }) => {
          if (!driverAcceptAudit) {
            form.setFieldsValue({
              confirmOrganization: undefined,
            });
          }
          return driverAcceptAudit === 1;
        },
      },
    },
    transportBill: {
      customLabel: '可多选，至少需要勾选一个单据：',
      component: CheckBox,
      disabled: true,
      rules: {
        required: [true, '请选择所需运输单据'],
      },
      options: [{
        label: '提货单',
        key: 1,
        value: 1,
      }, {
        label: '过磅单',
        key: 2,
        value: 2,
      }, {
        label: '签收单',
        key: 3,
        value: 3,
      }, {
        label: '到站图片',
        key: 4,
        value: 4,
      }],
    },
    billNumberType: {
      customLabel: '选择需要自动生成单号的单据类型(可选)：',
      component: CheckBox,
      disabled: true,
      visible: Observer({
        watch: 'transportBill',
        action: (transportBill) => {
          if (transportBill === '2' || transportBill === '4' || transportBill === '2,4') return false;
          return !!transportBill;
        },
      }),
      options: Observer({
        watch: 'transportBill',
        disabled: true,
        action: transportBill => {
          if (!transportBill) return [];
          if (transportBill.indexOf('1') !== -1 && transportBill.indexOf('3') !== -1) return [{
            label: '自动生成提货单号',
            key: 1,
            value: 1,
          }, {
            label: '自动生成签收单号',
            key: 3,
            value: 3,
          }];
          if (transportBill.indexOf('1') !== -1) return [{
            label: '自动生成提货单号',
            key: 1,
            value: 1,
          }];
          if (transportBill.indexOf('3') !== -1) return [{
            label: '自动生成签收单号',
            key: 3,
            value: 3,
          }];
        },
      }),
    },
    deliveryElectronicDocumentsId: {
      label: '提货单',
      component: SelectWithPicture,
      disabled: true,
      options: () => {
        const { businessType: { electronicDocumentsEntities } } = this.state;
        const items = electronicDocumentsEntities.filter(item => item.electronicDocumentsType === 1);
        return [
          { label: '无', value: 'temp', key: 'temp' },
          ...(items || []).map(item => ({
            key: item.electronicDocumentsId,
            value: item.electronicDocumentsId,
            label: item.electronicDocumentsName,
            url: item.electronicDocumentsDentryid,
          }))];
      },
      value: () => {
        const { businessType: { electronicDocumentsEntities } } = this.state;
        const items = electronicDocumentsEntities.filter(item => item.electronicDocumentsType === 1);
        return items.length ? items[0].electronicDocumentsId : 'temp';
      },
      visible: Observer({
        watch: 'transportBill',
        action: (transportBill) => {
          if (!transportBill) return false;
          if (transportBill.indexOf('1') !== -1) return true;
          return false;
        },
      }),
    },
    receivingElectronicDocumentsId: {
      label: '签收单',
      component: SelectWithPicture,
      disabled: true,
      options: async () => {
        const { businessType: { electronicDocumentsEntities } } = this.state;
        const items = electronicDocumentsEntities.filter(item => item.electronicDocumentsType === 3);
        return [
          { label: '无', value: 'temp', key: 'temp' },
          ...(items || []).map(item => ({
            key: item.electronicDocumentsId,
            value: item.electronicDocumentsId,
            label: item.electronicDocumentsName,
            url: item.electronicDocumentsDentryid,
          }))];
      },
      value: () => {
        const { businessType: { electronicDocumentsEntities } } = this.state;
        const items = electronicDocumentsEntities.filter(item => item.electronicDocumentsType === 3);
        return items.length ? items[0].electronicDocumentsId : 'temp';
      },
      visible: Observer({
        watch: 'transportBill',
        action: (transportBill) => {
          if (!transportBill) return false;
          if (transportBill.indexOf('3') !== -1) return true;
          return false;
        },
      }),
    },
    poundDifference: {
      label: '允许的磅差范围： 千分之 ',
      component: 'input',
      disabled: true,
    },
    priceType: {
      label: '价格类型：',
      component: 'radio',
      disabled: true,
      options: [{
        label: '单价',
        key: 1,
        value: 1,
      }],
    },
    measurementUnit: {
      component: 'select',
      disabled: true,
      options: [{
        label: '吨/公里',
        key: 1,
        value: 1,
      }, {
        label: '方',
        key: 2,
        value: 2,
      }, {
        label: '元/吨',
        key: 3,
        value: 3,
      }, {
        label: '元/方',
        key: 4,
        value: 4,
      }],
    },
    measurementSource: {
      component: 'select',
      options: [{
        label: '按提货数量计算',
        key: 1,
        value: 1,
      }, {
        label: '按签收数量计算',
        key: 2,
        value: 2,
      }, {
        label: '按最小数量计算',
        key: 3,
        value: 3,
      }],
      disabled: true,
    },
    driverDeliveryAudit: {
      label: '司机提货后是否需要托运方审核：',
      component: 'radio',
      rules: {
        required: [true, '请选择司机提货后是否需要托运方审核'],
      },
      options: [{
        label: '需要',
        key: 1,
        value: 1,
      }, {
        label: '不需要',
        key: 0,
        value: 0,
      }],
      disabled: true,
    },
    deliveryLaterKilometre: {
      label: '提货后行驶',
      component: 'input',
      rules: {
        required: [true, '请输入公里数'],
        validator: ({ value }) => {
          if (!/^[1-9]\d*$/.test(value)) return '仅支持整数';
        },
      },
      visible: Observer({
        watch: ['transportCompleteType'],
        action: (transportCompleteType) => transportCompleteType === 2,
      }),
      disabled: true,
    },
    deliveryLaterMinute: {
      label: '公里且停车超过',
      component: 'input',
      rules: {
        required: [true, '请输入分钟数'],
        validator: ({ value }) => {
          if (!/^[1-9]\d*$/.test(value)) return '仅支持整数';
        },
      },
      visible: Observer({
        watch: ['transportCompleteType'],
        action: (transportCompleteType) => transportCompleteType === 2,
      }),
      disabled: true,
    },
    deliveryLaterHour: {
      label: '分钟，或提货后超过',
      component: 'input',
      rules: {
        required: [true, '请输入小时数'],
        validator: ({ value }) => {
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch: ['transportCompleteType'],
        action: (transportCompleteType) => transportCompleteType === 2,
      }),
      disabled: true,
    },
    hoursTip: {
      label: '小时',
      component: 'input',
      visible: Observer({
        watch: ['transportCompleteType'],
        action: (transportCompleteType) => transportCompleteType === 2,
      }),
      disabled: true,
    },
    transportCompleteType: {
      label: '触发运单完成的操作：',
      component: 'radio',
      rules: {
        required: [true, '请选择触发运单完成的操作'],
      },
      options: [{
        label: '手动触发',
        key: 1,
        value: 1,
      }, {
        label: '自动触发',
        key: 2,
        value: 2,
      }],
      disabled: true,
    },
    auditorOrganization1: {
      component: 'select',
      label: '第一审核方：',
      rules: {
        required: [true, '请选择第一审核方'],
      },
      placeholder: '请选择第一审核方',
      options: [{
        label: '托运',
        key: 4,
        value: 4,
      }, {
        label: '承运',
        key: 5,
        value: 5,
      }],
      visible: Observer({
        watch: ['manualTrigger', 'transportCompleteType'],
        action: ([manualTrigger, transportCompleteType], { form }) => {
          if (manualTrigger !== 3) {
            form.setFieldsValue({
              auditorOrganization1: undefined,
              auditorOrganization2: undefined,
            });
          }
          if (transportCompleteType === 2) {
            form.setFieldsValue({
              manualTrigger: undefined,
            });
          }
          return manualTrigger === 3 && transportCompleteType === 1;
        },
      }),
      disabled: true,
    },
    auditorOrganization2: {
      component: SecondOrganizationCheckBox,
      placeholder: '第二审核方（可选）：',
      visible: Observer({
        watch: ['auditorOrganization1', 'transportCompleteType', 'manualTrigger'],
        action: ([auditorOrganization1, transportCompleteType, manualTrigger], { form }) => {
          if (auditorOrganization1 !== 5) {
            form.setFieldsValue({
              auditorOrganization2: undefined,
            });
          }
          if (transportCompleteType === 2) {
            form.setFieldsValue({
              auditorOrganization1: undefined,
            });
          }
          if (manualTrigger !== 3) {
            form.setFieldsValue({
              auditorOrganization2: undefined,
            });
          }
          return auditorOrganization1 === 5;
        },
      }),
      disabled: true,
    },
    manualTrigger: {
      component: 'select',
      rules: {
        required: [true, '请选择触发节点'],
      },
      placeholder: '请选择触发节点',
      options: [{
        label: '已到站',
        key: 1,
        value: 1,
      }, {
        label: '已签收',
        key: 2,
        value: 2,
      }, {
        label: '审核通过',
        key: 3,
        value: 3,
      }],
      visible: Observer({
        watch: ['transportCompleteType'],
        action: (transportCompleteType) => transportCompleteType === 1,
      }),
      disabled: true,
    },
  };

  getMeasurementSource = () => {
    const { businessType } = this.state;
    if (!businessType.businessTypeId) return '--';
    const options = [{
      label: '按提货数量计算',
      key: 1,
      value: 1,
    }, {
      label: '按签收数量计算',
      key: 2,
      value: 2,
    }, {
      label: '按最小数量计算',
      key: 3,
      value: 3,
    }].find(item => item.value === businessType.measurementSource);
    if (!options) return '--';
    return options.label;
  };

  componentDidMount() {
    const { detailProjects, location: { query: { projectId } } } = this.props;
    detailProjects({ projectId })
      .then(data => {
        if (this.organizationType === 4 && data.businessTypeId) {
          detailBusinessType(data.businessTypeId).then(active => {
            active.confirmOrganization = Number(active.confirmOrganization);
            active.poundDifference = Number(Number(active.poundDifference) * 1000).toFixed(2)._toFixed(2);
            if (active.manualTrigger === 3) {
              active.auditorOrganization1 = Number(active.auditorOrganization.split(',')[0]);
              active.auditorOrganization2 = Number(active.auditorOrganization.split(',')[1]);
            }
            this.setState({
              ready: true,
              businessType: active,
            });
          });
        } else {
          this.setState({
            ready: true,
          });
        }
      });
  }

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  render() {
    const { project: _entity, project: { responsibleItems = [] } } = this.props;
    const { ready, visible, businessType } = this.state;
    const entity = {
      ..._entity,
      responsibleItems: responsibleItems.map(item => item.responsibleName).join('、'),
      businessType: _entity.logisticsBusinessTypeEntity && _entity.logisticsBusinessTypeEntity.businessTypeName || '--',
      tradingType: _entity.configurationStatus !== 1 ? _entity.logisticsTradingSchemeEntity && _entity.logisticsTradingSchemeEntity.tradingSchemeName || '--' : '--',
    };

    return (
      <>
        <Modal
          centered
          title='授权码'
          visible={visible}
          onCancel={this.handleCancel}
          footer={null}
          destroyOnClose
        >
          {ready &&
          <div style={{ textAlign: 'center' }}>
            <QRCode
              value={_entity.qrCodeValue}
              size={200}
              fgColor='#000000'
              style={{
                margin: '0 auto',
              }}
            />
            <div style={{ fontSize: '18px', fontWeight: '600', marginTop: '10px' }}>
              {_entity.qrCodeValue}
            </div>

          </div>
          }
        </Modal>
        {ready &&
        <SchemaForm
          layout='vertical'
          data={entity}
          schema={this.schema}
          mode={FORM_MODE.DETAIL}
          trigger={{ detail: entity }}
        >
          {/* {
            entity.projectStatus === PROJECT_STATUS.SHIPMENT_REFUSE &&
            <FormCard title="拒绝理由" colCount="3">
              <Item {...formLayout} field="refuseReason" />
              <Item {...formLayout} field="handleTime" />
            </FormCard>
          } */}
          <FormCard title='合同状态' colCount='3'>
            <Item {...formLayout} field='projectStatusWord' />
            <Item {...formLayout} field='refuseReason' />
            <Item {...formLayout} field='handleTime' />
            <Item {...formLayout} field='forbiddenTime' />
          </FormCard>
          {this.organizationType === 4 && businessType ?
            <div styleName='item_box'>
              <h3 styleName='form_title'>业务类型</h3>
              <SchemaForm
                layout='vertical'
                schema={{ ...this.detailForm }}
                mode={FORM_MODE.ADD}
                data={businessType}
                hideRequiredMark
                className='businessType_setting_form'
              >
                <div styleName='detail_form pdTop25'>
                  <Row>
                    <Col span={6}>
                      <Item wrapperCol={{ span: 12 }} field='businessTypeName' />
                    </Col>
                    <Col span={6}>
                      <Item {...formLayout} field='remarks' />
                    </Col>
                  </Row>
                  <br />
                  <Item field='transportCreateMode' />
                  <br />
                  <Row>
                    <Col span={6}>
                      <Item {...formLayout} field='receivingType' />
                    </Col>
                    <Col span={6}>
                      <Item {...formLayout} field='deliveryType' />
                    </Col>
                  </Row>
                  <br />
                  <Item {...formLayout} field='prebookingCompleteType' />
                  <br />
                  <Row>
                    <Col span={7}>
                      <Item className='createProject_detailForm_releaseHall' field='releaseHall' />
                    </Col>
                    <Col span={7} style={{ width: 'auto' }}>
                      <Item className='createProject_detailForm_releaseHall' field='driverAcceptAudit' />
                    </Col>
                    <Col span={7}>
                      <Item field='confirmOrganization' />
                    </Col>
                  </Row>
                  <Item field='transportBill' />
                  <Item field='billNumberType' />
                  <br />
                  <Item field='deliveryElectronicDocumentsId' />
                  <br />
                  <Item field='receivingElectronicDocumentsId' />
                  <br />
                  <Item className='businessType_setting_form_poundInput' field='poundDifference' />
                  <br />
                  <Row>
                    <Col span={10}>
                      <Row>
                        <Col span={8} style={{ width: 'auto' }}>
                          <Item className='businessType_setting_form_priceType' field='priceType' />
                        </Col>
                        <Col span={8} style={{ width: 'auto' }}>
                          <Item field='measurementUnit' />
                        </Col>
                        <Col span={8}>
                          <Item field='measurementSource' />
                        </Col>
                      </Row>
                    </Col>
                    <Col span={10}>
                      <Item styleName='flex_align_start' field='driverDeliveryAudit' />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={6} styleName='autoWidth'>
                      <Item className='businessType_setting_form_transportCompleteType' field='transportCompleteType' />
                    </Col>
                    <Col span={18}>
                      <Row>
                        <Col span={6} styleName='autoWidth'>
                          <Item field='manualTrigger' />
                        </Col>
                        <Col span={6} styleName='autoWidth pdl10'>
                          <Item
                            className='businessType_setting_form_auditorOrganization businessType_setting_form_firstOrganization'
                            styleName='flex_align_start'
                            field='auditorOrganization1'
                          />
                        </Col>
                        <Col span={6}>
                          <Item
                            className='businessType_setting_form_auditorOrganization'
                            field='auditorOrganization2'
                          />
                        </Col>
                      </Row>
                      <Row styleName='mrTop20'>
                        <Col span={6} styleName='autoWidth'>
                          <Item styleName='flex_align_start' field='deliveryLaterKilometre' />
                        </Col>
                        <Col span={6} styleName='autoWidth'>
                          <Item styleName='flex_align_start' field='deliveryLaterMinute' />
                        </Col>
                        <Col span={6} styleName='autoWidth'>
                          <Item styleName='flex_align_start' field='deliveryLaterHour' />
                        </Col>
                        <Col span={6} styleName='autoWidth'>
                          <Item styleName='flex_align_start hours' field='hoursTip' />
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
          <FormCard title='合同信息' colCount='3'>
            <Item {...formLayout} field='projectName' />
            <Item {...formLayout} field='projectNo' />
            <Item {...formLayout} field='customerName' />
            <Item {...formLayout} field='customerContactName' />
            <Item {...formLayout} field='customerContactPhone' />
            <Item {...formLayout} field='supplyOrg' />
            <Item {...formLayout} field='consignmentType' />
            <Item {...formLayout} field='chargeMode' />
            <Item {...formLayout} field='projectRemark' />
            <Item {...formLayout} field='projectTime' />
            <Item {...formLayout} field='contractItems' />
            <Item {...formLayout} field='businessType' />
            <Item {...formLayout} field='tradingType' />
          </FormCard>
          <FormCard title='货品信息' colCount='1'>
            <Item {...formLayout} field='goodsItems' />
          </FormCard>
          <FormCard title='托运方信息' colCount='3'>
            <Item {...formLayout} field='consignmentName' />
            <Item {...formLayout} field='consgignmentContactName' />
            <Item {...formLayout} field='consgignmentContactPhone' />
            <Item {...formLayout} field='responsibleItems' />
          </FormCard>
          <FormCard title='提货信息' colCount='1'>
            <Item {...formLayout} field='deliveryItems' />
          </FormCard>
          <FormCard title='收货信息' colCount='1'>
            <Item {...formLayout} field='receivingItems' />
          </FormCard>
          <FormCard title='承运方信息' colCount='1'>
            <Item {...formLayout} field='shipmentType' />
            <Item {...formLayout} field='shipmentItems' />
          </FormCard>
          {this.organizationType === 4 && businessType ?
            <div styleName='item_box'>
              <h3 styleName='form_title'>物流运费</h3>
              <p styleName='p_tips'>价格类型</p>
              <Row>
                <Col span={7} style={{ width: 'auto' }}>
                  <Item
                    {...{ labelCol: { span: 6 }, wrapperCol: { span: 16 } }}
                    styleName='flex_align_start'
                    className='projectDetail_freightPrice'
                    field='freightPrice'
                  />
                </Col>
                <Col span={3}>
                  <span styleName='unit'>
                    {
                      !businessType.measurementUnit ?
                        '元/吨'
                        :
                        {
                          1: '吨/公里',
                          2: '方',
                          3: '元/吨',
                          4: '元/方',
                        }[businessType.measurementUnit]
                    }
                  </span>
                </Col>
                <Col span={7}>
                  <span styleName='unit'>计量来源：{this.getMeasurementSource()}</span>
                </Col>
              </Row>
            </div>
            :
            null
          }
          <FormCard title='合同上传' colCount='1'>
            <Item {...formLayout} field='projectPicture' />
          </FormCard>
          <div style={{ paddingRight: '20px', textAlign: 'right' }}>
            {entity.isCustomerAudit === 1 && this.organizationType === entity.createOrgType &&
            <Button type='primary' onClick={this.showModal} style={{ marginRight: '15px' }}>查看授权码</Button>}
            <Button onClick={() => {
              router.goBack();
            }}
            >返回
            </Button>
          </div>
        </SchemaForm>}
      </>
    );
  }
}

export default App;

function RouterTo({ value, type, detailId }) {
  if (!detailId) return '--';
  if (type === 1) {
    return (
      value === '--' ?
        <span>{value}</span>
        :
        <span
          onClick={() => router.push(`/basic-setting/businessTypeSetting?businessTypeId=${detailId}`)}
          style={{ color: '#1890FF', cursor: 'pointer', textDecoration: 'underline' }}
        >{value}
        </span>
    );
  }
  return (
    value === '--' ?
      <span>{value}</span>
      :
      <span
        onClick={() => router.push(`/basic-setting/logisticsTransaction/detail?tradingSchemeId=${detailId}`)}
        style={{ color: '#1890FF', cursor: 'pointer', textDecoration: 'underline' }}
      >{value}
      </span>
  );
}
