import React, { Component } from 'react';
import { notification, Button, InputNumber } from 'antd';
import { connect } from 'dva';
import { SchemaForm, Item, FormCard, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import router from 'umi/router';
import CSSModules from "react-css-modules";
import DebounceFormButton from '../../../../components/debounce-form-button';
import prebookingModel from '../../../../models/preBooking';
import goodsPlanModel from '../../../../models/goodsPlan';
import { unit, source } from '../../../../constants/prebooking/prebooking';
import { requestDebounce, disableDateBeforeToday, isEqual, isObject, sortBy, uniqBy, getLocal } from '../../../../utils/utils';
import { getProjectDetail, getProject, postPreBooking, postReleaseHallPrebooking } from '../../../../services/apiService';
import DeliveryTable from './components/delivery-table';
import ReceivingTable from './components/receiving-table';
import ShipmentTable from './components/shipment-table';
import PreBookingEvents from './components/pre-booking-events';
import '@gem-mine/antd-schema-form/lib/fields';
import styles from "./create-pre-booking.less";


const { actions: { detailPreBooking, patchPreBooking } } = prebookingModel;
const { actions: { detailGoodsPlan } } = goodsPlanModel;

// 对项目详情请求进行节流
const [getProjectDetailDebounce, clear] = requestDebounce(getProjectDetail);

function mapStateToProps (state) {
  const { shipmentId, shipmentContactName, shipmentContactPhone, shipmentName, responsibleItems } = state.preBooking.entity;
  return {
    preBooking: { ...state.preBooking.entity,
      shipmentItems: shipmentId && [{ shipmentId, contactName: shipmentContactName, contactPhone: shipmentContactPhone, shipmentName }],
      responsibleItems: responsibleItems && responsibleItems.map(item=>item.responsibleName).join('、')
    },
    commonStore: state.commonStore,
    goodsPlan: state.goodsPlan.entity
  };
}
const formLayout = {
  labelCol: {
    span: 24
  },
  wrapperCol: {
    span: 24
  }
};

@CSSModules(styles)
@connect(mapStateToProps, {  detailPreBooking, detailGoodsPlan, patchPreBooking })
export default class CreatePreBooking extends Component {

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  logisticsBusinessTypeEntity = {}

  constructor (props) {
    super(props);
    window.goodsItems = [];
    window.deliveryItems = [];
    clear();
    let mode = FORM_MODE.ADD;
    if ('prebookingId' in props.location.query){
      if ('mode' in props.location.query){
        mode = FORM_MODE.DETAIL;
      } else {
        mode = FORM_MODE.MODIFY;
      }
    }
    const schema = {
      projectId:{
        label: '选择合同',
        component: Observer({
          watch: '*mode',
          action: mode => ( mode === FORM_MODE.ADD ? 'select' : 'select.text' )
        }),
        placeholder: '请选择合同',
        props:{
          showSearch: true,
          optionFilterProp: 'label'
        },
        rules:{
          required: true,
        },
        options: async () => {
          const { items: data } = await getProject({ isPassShipments: true, isAvailable: true, limit:1000, offset:0 });
          const items = data || [];
          const _items = items.filter(item=>item.isCustomerAudit === 0);
          const result = _items.map(item => ({
            key: item.projectId,
            value: item.projectId,
            label: item.projectName
          }));
          return result;
        },
        keepAlive:false,
        visible:()=>{
          if (this.props.location.query.goodsPlanId) return false;
          return true;
        }
      },
      goodsPlanName:{
        component:'input.text',
        label:'计划单名称',
        visible:()=>{
          if (this.props.location.query.goodsPlanId) return true;
          return false;
        }
      },
      acceptanceTime:{
        label: '预约单截止日期',
        component: 'datePicker',
        disabledDate: disableDateBeforeToday,
        rules:{
          required: true
        },
        placeholder: '请选择预约单截止日期',
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
      shipmentId:{
        label: '选择承运方',
        component: 'select',
        rules:{
          required: true
        },
        placeholder: '请选择承运方',
        options: Observer({
          watch: 'projectId',
          action: async (projectId) => {
            let shipment;
            // const { location:{ query:{ goodsPlanId } }, goodsPlan } = this.props
            // if (goodsPlanId) {
            //   shipment = goodsPlan.shipmentItems || [{ shipmentOrganizationId:310582128678105, shipmentOrganizationName:"四川不能投有限公司", isAvailable:true, auditStatus:1 }]
            // } else
            if (!projectId) {
              shipment = [];
            } else {
              const { shipmentItems } = await getProjectDetailDebounce(projectId);// await request(`/v1/projects/${formData.projectId}`)
              shipment = shipmentItems;
            }
            return shipment.map(item => {
              if (item.auditStatus===1&&item.isAvailable){
                return { key: item.shipmentOrganizationId, value: item.shipmentOrganizationId, label: item.shipmentOrganizationName };
              }
              return '';
            }).filter(item => isObject(item));
          }
        })
      },
      shippingPrice:{
        label: '托运发单价',
        component: ShippingPrice,
        observer:Observer({
          watch:'projectId',
          action:async (projectId) => {
            if (!projectId) {
              return {};
            }
            const { mode } = this.state;
            const { preBooking } = this.props;
            const { logisticsBusinessTypeEntity, freightPrice } = await getProjectDetailDebounce(projectId);
            if (logisticsBusinessTypeEntity) {
              const { measurementUnit, measurementSource } = logisticsBusinessTypeEntity;
              if (mode === FORM_MODE.DETAIL) return { unit:unit[measurementUnit]?.label, chargeMode:source[measurementSource]?.label, value: preBooking?.maximumShippingPrice };
              return { unit:unit[measurementUnit]?.label, chargeMode:source[measurementSource]?.label, value:freightPrice };
            }
            return { unit:undefined, chargeMode:undefined, value:undefined };
          }
        }),
        rules:{
          required: [true, '请输入托运发单价']
        },
      },
      maxAvailableOrders:{
        label: '所需车辆数',
        component: MaxAvailableOrders,
        rules:{
          required: [true, '请输入所需车辆数'],
          pattern:/^\+?[1-9]\d*$/
        },
        visible:Observer({
          watch:'projectId',
          action:async (projectId) => {
            if (!projectId) {
              return {};
            }
            const { logisticsBusinessTypeEntity } = await getProjectDetailDebounce(projectId);
            this.logisticsBusinessTypeEntity = logisticsBusinessTypeEntity || {};
            if (logisticsBusinessTypeEntity) {
              const { releaseHall } = logisticsBusinessTypeEntity;
              this.releaseHall = !!releaseHall;
              return !!releaseHall;
            }
            this.releaseHall = !!logisticsBusinessTypeEntity;
            return !!logisticsBusinessTypeEntity;
          }
        }),
      },
      prebookingRemark:{
        label: '备注',
        component: 'input.textArea',
        placeholder: '请输入备注',
      },
      deliveryItems:{
        component: DeliveryTable,
        rules:{
          validator: ({ formData, value }) => {
            // 1.单提,2.多提,3.无提货点
            const { deliveryType } = this.logisticsBusinessTypeEntity;
            if (formData.receivingItems && formData.receivingItems.length > 0 && value && value.length > 0) {
              const receivingItems = formData.receivingItems.map(item => ({ goodsId:item.goodsId, goodsNum:item.receivingNum }));
              console.log(value)
              const deliveryItems = value.map(item => ({ goodsId:item.goodsId, goodsNum:item.receivingNum }));
              const sortReceivingItems = sortBy(receivingItems, ['goodsId']);
              const sortDeliveryItems = sortBy(deliveryItems, ['goodsId']);
              if (!isEqual(sortReceivingItems, sortDeliveryItems)) {
                return '提货与卸货信息不一致';
              }
            }
            if ((!value || !value.length)) {
              if (deliveryType === 3) return '请添加未知提货点';
              return '请输入提货信息';
            }
            if (deliveryType === 1 && value?.length > 1) {
              const { length } = uniqBy(value, 'deliveryId');
              if (length > 1) return '该项目为单提项目';
            }
          }
        },
        options: Observer({
          watch: 'projectId',
          action: async (projectId) => {
            if (!projectId) return [];
            const { deliveryItems, goodsItems:_goodsItems, logisticsBusinessTypeEntity } = await getProjectDetailDebounce(projectId);
            const { location:{ query:{ goodsPlanId } }, goodsPlan:{ goodsCorrelationItems } } = this.props;
            // TODO 暂时使用window解决表单field传值问题
            let goodsItems = _goodsItems;
            if (goodsPlanId){
              goodsItems = goodsCorrelationItems.map(item=>({
                ...item.goodItems[0],
                deliveryUnitCN:item.goodsUnitCN,
                receivingUnitCN:item.goodsUnitCN,
                deliveryUnit:item.goodsUnit,
                receivingUnit:item.goodsUnit
              }));
            }
            window.goodsItems = goodsItems;
            window.deliveryItems = deliveryItems;
            return { deliveryItems, goodsItems, logisticsBusinessTypeEntity };
          }
        }),
        observer:Observer({
          watch:'receivingItems',
          action: (value, { form })=>{
            form.validateFields(['deliveryItems']);
            return {};
          }
        })
      },
      responsibleItems:{
        label: '合同负责人',
        component: 'input.text',
      },
      receivingItems:{
        component: ReceivingTable,
        rules:{
          validator: ({ formData, value }) => {
            // 卸货点(1.单卸,2.多卸,3.无卸货点)
            const { receivingType } = this.logisticsBusinessTypeEntity;
            if (formData.deliveryItems && formData.deliveryItems.length > 0 && value && value.length > 0) {
              const deliveryItems = formData.deliveryItems.map(item => ({ goodsId:item.goodsId, goodsNum:item.receivingNum }));
              const receivingItems = value.map(item => ({ goodsId:item.goodsId, goodsNum:item.receivingNum }));
              const sortReceivingItems = sortBy(receivingItems, ['goodsId']);
              const sortDeliveryItems = sortBy(deliveryItems, ['goodsId']);
              if (!isEqual(sortReceivingItems, sortDeliveryItems)) {
                return '提货与卸货信息不一致';
              }
            }
            if ((!value || !value.length) && receivingType !== 3 ) {
              return '请输入卸货信息';
            }
            if (receivingType === 1 && value?.length > 1) {
              const { length } = uniqBy(value, 'receivingId');
              if (length > 1) return '该项目为单卸项目';
            }
          }
        },
        options: Observer({
          watch: 'projectId',
          action: async (projectId) => {
            if (!projectId) return false;
            const { receivingItems:receiving, goodsItems:_goodsItems } = await getProjectDetailDebounce(projectId);
            const { location:{ query:{ goodsPlanId } }, goodsPlan:{ goodsCorrelationItems } } = this.props;
            let receivingItems = receiving;
            let goodsItems = _goodsItems;
            if (goodsPlanId){
              goodsItems = goodsCorrelationItems.map(item=>({
                ...item.goodItems[0],
                deliveryUnitCN:item.goodsUnitCN,
                receivingUnitCN:item.goodsUnitCN,
                deliveryUnit:item.goodsUnit,
                receivingUnit:item.goodsUnit
              }));
              receivingItems = uniqBy(goodsCorrelationItems.map(item=>item.receivingItems[0]), 'receivingId');
            }
            return { receivingItems, goodsItems };
          }
        }),
        observer:Observer({
          watch:'deliveryItems',
          action: (value, { form })=>{
            form.validateFields(['receivingItems']);
            return {};
          }
        })
      },
      consignmentType:{
        component: Observer({
          watch: '*mode',
          action: mode => ( mode === FORM_MODE.ADD ? 'radio' : 'radio.text' )
        }),
        label: '交易模式',
        options: [{
          key: 0,
          label: '直发',
          value: 0
        }, {
          key: 0,
          label: '代发',
          value: 1
        }]
      },
      cargoesName:{
        component: Observer({
          watch: '*mode',
          action: mode => ( mode === FORM_MODE.ADD ? 'input' : 'input.text' )
        }),
      },
      prebookingNo:{
        label: '预约单号',
        component: 'input',
        modifiable: false,
      },
      shipmentItems:{
        component: ShipmentTable,
        modifiable: false,
      },
      preBookingEvents:{
        component: PreBookingEvents,
        prebookingId: props.history.location.query.prebookingId
      }
    };

    this.state = {
      mode,
      schema,
      ready:false
    };
  }

  handleSaveBtnClick = async (value) => {
    const { mode } = this.state;
    const { location:{ query:{ goodsPlanId } }, patchPreBooking, commonStore } = this.props;
    const postMethod = this.releaseHall? postReleaseHallPrebooking : postPreBooking;
    const { shippingPrice } = value;
    const dele = commonStore.tabs.find(item => item.id === commonStore.activeKey);
    // maximumShippingPrice: shippingPrice, minimumShippingPrice: shippingPrice
    if (mode === FORM_MODE.ADD) {
      postMethod({ ...value, goodsPlanId, acceptanceTime: value.acceptanceTime.set({ hour: 23, minute: 59, second: 59 }).format(), maximumShippingPrice: shippingPrice, minimumShippingPrice: shippingPrice, receivingItems : value.receivingItems || [] })
        .then(() => {
          notification.success({
            message: '创建预约单成功',
            description: `创建预约单成功`,
          });
          router.goBack();
          window.g_app._store.dispatch({
            type: 'commonStore/deleteTab',
            payload: { id: dele.id }
          });
        });
    } else {
      patchPreBooking({ ...value, goodsPlanId, shipmentId:value.shipmentItems[0].shipmentId, prebookingId:this.props.preBooking.prebookingId, receivingItems : value.receivingItems || [], acceptanceTime: value.acceptanceTime.set({ hour: 23, minute: 59, second: 59 }).format() })
        .then(() => {
          notification.success({
            message: '修改预约单成功',
            description: `修改预约单成功`,
          });
          window.g_app._store.dispatch({
            type: 'commonStore/deleteTab',
            payload: { id: dele.id }
          });
          router.goBack();
        });
    }
  }

  componentDidMount () {
    const { location:{ query:{ goodsPlanId, prebookingId } }, detailGoodsPlan, detailPreBooking } = this.props;
    if (goodsPlanId && !prebookingId) {
      detailGoodsPlan({ goodsPlanId })
        .then(()=>{
          this.setState({
            ready:true
          });
        });
    } else if (!goodsPlanId && prebookingId){
      detailPreBooking({ prebookingId })
        .then(()=>{
          this.setState({
            ready:true
          });
        });
    } else if (goodsPlanId && prebookingId) {
      detailPreBooking({ prebookingId })
        .then(()=>detailGoodsPlan({ goodsPlanId }))
        .then(()=>{
          this.setState({
            ready:true
          });
        });
    } else {
      this.setState({
        ready:true
      });
    }
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabs').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData,
      }));
    }
  }

  renderProjectInfo = mode => {
    const { location:{ query:{ goodsPlanId } } } = this.props;
    if (mode === FORM_MODE.ADD && goodsPlanId) {
      return (
        <FormCard colCount="3" title="合同信息">
          <Item {...formLayout} field='goodsPlanName' />
          <Item {...formLayout} field='shipmentId' />
          <Item {...formLayout} field='acceptanceTime' />
          <Item {...formLayout} field='shippingPrice' />
          <Item {...formLayout} field='maxAvailableOrders' />
          <Item {...formLayout} field='prebookingRemark' />
        </FormCard>
      );
    } if (mode === FORM_MODE.ADD && !goodsPlanId) {
      return (
        <FormCard colCount="3" title="合同信息">
          <Item {...formLayout} field='projectId' />
          <Item {...formLayout} field='shipmentId' />
          <Item {...formLayout} field='acceptanceTime' />
          <Item {...formLayout} field='shippingPrice' />
          <Item {...formLayout} field='maxAvailableOrders' />
          <Item {...formLayout} field='prebookingRemark' />
        </FormCard>
      );
    } if (mode === FORM_MODE.DETAIL){
      return (
        <FormCard colCount="3" title="合同信息">
          <Item {...formLayout} field='goodsPlanName' />
          <Item {...formLayout} field='projectId' />
          <Item {...formLayout} field='responsibleItems' />
          <div>
            <Item {...formLayout} field='consignmentType' />
            <Item {...formLayout} field='cargoesName' />
          </div>
          <Item {...formLayout} field='prebookingNo' />
          <Item {...formLayout} field='shippingPrice' />
          <Item {...formLayout} field='prebookingRemark' />
        </FormCard>
      );
    } if (mode === FORM_MODE.MODIFY){
      return (
        <FormCard colCount="3" title="合同信息">
          <Item {...formLayout} field='goodsPlanName' />
          <Item {...formLayout} field='projectId' />
          <Item {...formLayout} field='responsibleItems' />
          <div>
            <Item {...formLayout} field='consignmentType' />
            <Item {...formLayout} field='cargoesName' />
          </div>
          <Item {...formLayout} field='acceptanceTime' />
          <Item {...formLayout} field='shippingPrice' />
          <Item {...formLayout} field='maxAvailableOrders' />
          <Item {...formLayout} field='prebookingRemark' />
        </FormCard>
      );
    }
  }

  render () {
    const { mode, ready } = this.state;
    const { goodsPlanName } = this.props.goodsPlan;
    const { location:{ query:{ projectId } }, preBooking:_preBooking } = this.props;
    const preBooking = mode === FORM_MODE.ADD
      ? { goodsPlanName, projectId }
      : { ..._preBooking, goodsPlanName, projectId:projectId||_preBooking.projectId };
    return (
      <>
        {ready&&
          <SchemaForm layout="vertical" mode={mode} data={Object.assign(preBooking, this.localData.formData || {})} schema={this.state.schema}>
            <div className={styles.contractMsg}>
              {this.renderProjectInfo(mode)}
            </div>
            <FormCard title="提货信息" colCount="1">
              <Item {...formLayout} field='deliveryItems' />
            </FormCard>
            <FormCard title="卸货信息" colCount="1" extra={<span className="fs-14 fw-normal color-darkGray" style={{ marginLeft: 20 }}>要求送达时间：{moment(preBooking.acceptanceTime).format('YYYY.MM.DD')}</span>}>
              <Item {...formLayout} field='receivingItems' />
            </FormCard>
            {mode === FORM_MODE.ADD
              ? null
              : <FormCard title="承运方信息" colCount="1"><Item {...formLayout} field='shipmentItems' /></FormCard>
            }
            {mode === FORM_MODE.DETAIL
              ? <FormCard title="预约单事件" colCount="1"><Item {...formLayout} field="preBookingEvents" /></FormCard>
              : null
            }
            <div style={{ paddingRight: '20px', textAlign: 'right' }}>
              {mode === FORM_MODE.DETAIL ?
                <Button onClick={() => { router.goBack(); }} className="mr-10">返回</Button>
                :
                <>
                  <Button onClick={() => { router.goBack(); }} className="mr-10">取消</Button>
                  <DebounceFormButton label="保存" onClick={this.handleSaveBtnClick} type="primary" />
                </>
              }
            </div>
          </SchemaForm>
        }
      </>
    );
  }
}

class ShippingPrice extends Component {
  render () {
    const { onChange, unit='元/吨', chargeMode='按签收数量计算', value } = this.props;
    return this.props.mode === 'detail'?
      <span>{value}{unit}</span>
      :
      <span>
        单价
        <InputNumber min={0} style={{ width:'150px' }} value={value} onChange={onChange} />
        {unit} 计量来源：{chargeMode}
      </span>;
  }
}

class MaxAvailableOrders extends Component {
  render (){
    const { onChange } = this.props;
    return (
      <span>
        <InputNumber style={{ width:'150px' }} onChange={onChange} value={this.props.formData && this.props.formData.maxAvailableOrders || ''} />
        辆
      </span>
    );
  }
}
