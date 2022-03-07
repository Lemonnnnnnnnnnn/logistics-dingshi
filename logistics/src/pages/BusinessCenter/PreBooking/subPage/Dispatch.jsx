import React, { Component } from 'react';
import { connect } from 'dva';
import { SchemaForm, Item, FormCard, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import { notification, Button } from 'antd';
import router from 'umi/router';
import moment from 'moment';
import DebounceFormButton from '@/components/DebounceFormButton';
import { getLocal } from '@/utils/utils';
import { getUserInfo } from '@/services/user';
import { unit, source } from '@/constants/prebooking/prebooking';
import prebookingModel from '@/models/preBooking';
import transportModel from '@/models/transports';
import { getProject } from '@/services/apiService';
import DeliveryTable from './components/DeliveryTable';
import ReceivingTable from './components/ReceivingTable';
import ShipmentTable from './components/ShipmentTable';
import TransportTable from './components/TransportTable';
import PreBookingEvents from './components/PreBookingEvents';
import '@gem-mine/antd-schema-form/lib/fields';

const { actions: { detailPreBooking } } = prebookingModel;
const { requests: { postTransports: postTransportsPromise }, actions: { postTransports } } = transportModel;
let errorArr = [];

function mapStateToProps (state) {
  const { shipmentId, shipmentContactName, shipmentContactPhone, shipmentName, responsibleItems } = state.preBooking.entity;
  return {
    commonStore: state.commonStore,
    preBooking: { ...state.preBooking.entity,
      shipmentItems: [{ shipmentId, contactName: shipmentContactName, contactPhone: shipmentContactPhone, shipmentName }],
      responsiblerName: responsibleItems && responsibleItems.map(item => item.responsibleName).join('、')
    }
  };
}

@connect(mapStateToProps, { detailPreBooking, postTransports })
class Dispatch extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = this.currentTab && getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  organizationType = getUserInfo().organizationType

  constructor (props) {
    super(props);
    errorArr = [];
    this.selfSupportRef = React.createRef();
    this.netFreightRef = React.createRef();
    const schema = {
      projectId: {
        label: '选择项目',
        component: Observer({
          watch: '*mode',
          action: ()=>('select.text')
        }),
        rules:{
          required: true,
        },
        placeholder: '请选择项目',
        options: async () => {
          const { items: data } = await getProject( { offset:0, limit:1000 } );
          const items = data || [];
          const result = items.map(item => ({
            key: item.projectId,
            value: item.projectId,
            label: item.projectName
          }));
          return result;
        },
      },
      projectName:{
        label: '选择项目',
        component: 'input.text',
        placeholder: '请选择选择项目',
        rules:{
          required: true
        }
      },
      responsiblerName:{
        label: '项目负责人',
        component: 'input.text',
        placeholder: '请选择项目负责人',
        rules:{
          required: true
        }
      },
      consignmentType:{
        component: Observer({
          watch: '*mode',
          action: ()=>('radio.text')
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
        }],
        readOnly: true
      },
      cargoesName:{
        component: Observer({
          watch: '*mode',
          action: ()=>('input.text')
        }),
        readOnly: true
      },
      prebookingNo: {
        label: '预约单号',
        component: Observer({
          watch: '*mode',
          action: ()=>('input.text')
        })
      },
      maximumShippingPrice:{
        label: '货主发单价',
        component:ShippingPrice,
        observer:Observer({
          watch:['logisticsBusinessTypeEntity', 'logisticsTradingSchemeEntity'],
          action:([logisticsBusinessTypeEntity, logisticsTradingSchemeEntity], { value }) => {
            const { shipmentServiceRate } = logisticsTradingSchemeEntity || {};
            if (logisticsBusinessTypeEntity) {
              const { measurementUnit, measurementSource } = logisticsBusinessTypeEntity;
              return {
                unit:unit[measurementUnit]?.label,
                chargeMode:source[measurementSource]?.label,
                price:this.organizationType === 4?value : ((value || 0)*(1-((shipmentServiceRate || 0)))).toFixed(2)
              };
            }
            return { unit:undefined, chargeMode:undefined, price:this.organizationType === 4?value:((value || 0)*(1-((shipmentServiceRate || 0)))).toFixed(2) };
          }
        })
      },
      logisticsBusinessTypeEntity:{
        component:'hide'
      },
      logisticsTradingSchemeEntity:{
        component:'hide'
      },
      prebookingRemark: {
        label: '备注',
        component: Observer({
          watch: '*mode',
          action: ()=>('input.textArea.text')
        }),
        placeholder: '请输入备注'
      },
      selfSupportItems: {
        component: TransportTable,
        _ref:this.selfSupportRef,
        transportType:1
      },
      netFreightItems: {
        component: TransportTable,
        _ref:this.netFreightRef,
        transportType:2
      },
      deliveryItems: {
        component: DeliveryTable,
        options: () => false,
        props: {
          mode: FORM_MODE.DETAIL
        }
      },
      receivingItems:{
        component: ReceivingTable,
        options: () => false,
        props: {
          mode: FORM_MODE.DETAIL
        }
      },
      shipmentItems: {
        component: ShipmentTable,
        observer: Observer({
          watch: '*localData',
          action: (itemValue, { form }) => {
            if (this.form !== form) {
              this.form = form;
            }
            return { };
          }
        }),
        props: {
          mode: FORM_MODE.DETAIL
        }
      },
      preBookingEvents: {
        component: PreBookingEvents,
        prebookingId: props.history.location.query.prebookingId
      }
    };

    this.state = {
      schema,
      mode: this.props.location.query.mode,
      ready:false
    };
  }

  componentDidMount () {
    if ('prebookingId' in this.props.location.query) {
      this.props.detailPreBooking({ prebookingId: this.props.location.query.prebookingId })
        .then(()=>{
          this.setState({
            ready: true
          });
        });
    }
  }

  componentDidUpdate(p) {
    if ('prebookingId' in this.props.location.query && p.location.query.prebookingId !== this.props.location.query.prebookingId) {
      this.props.detailPreBooking({ prebookingId: this.props.location.query.prebookingId })
        .then(()=>{
          this.setState({
            ready:true
          });
        });
    }
  }

  componentWillReceiveProps(p) {
    if (p.commonStore.activeKey !== this.props.commonStore.activeKey){ // 相同路由参数不同的时候存一次本地
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      // const netFreightItems = this.form ? this.form.getFieldValue('netFreightItems') : null;
      // const selfSupportItems = this.form ? this.form.getFieldValue('selfSupportItems') : null;
      let data = this.props.preBooking;
      if (this.form){
        data = Object.assign(this.props.preBooking, this.form.getFieldsValue());
      }

      localStorage.removeItem(this.currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(this.currentTab.id, JSON.stringify({
          formData: { ...data },
        }));
      }
    }
  }

  componentWillUnmount() {
    // const netFreightItems = this.form ? this.form.getFieldValue('netFreightItems') : null;
    // const selfSupportItems = this.form ? this.form.getFieldValue('selfSupportItems') : null;
    let data = this.props.preBooking;
    if (this.form){
      data = Object.assign(this.props.preBooking, this.form.getFieldsValue());
    }

    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...data },
      }));
    }
  }

  countAgain = () => {
    errorArr = [];
    this.selfSupportRef.current.countAgain();
    this.netFreightRef.current.countAgain();
  }

  createTransport = async (items) => {
    let transport;
    items.forEach(async (item, index) => {
      try {
        transport = await postTransportsPromise({ expectTime: this.props.preBooking.acceptanceTime.format(), prebookingId: this.props.preBooking.prebookingId, ...item });
        this.goBack();
        notification.success({
          message: '调度成功',
          description: `调度派车单成功`,
        });
      } catch (error){
        console.log(error);
      }
      if (!transport){
        errorArr.push(index + 1);
      }
    });
    if (errorArr.length > 0){
      notification.error({
        message: '存在创建失败运单',
        description: `第${errorArr.join(',')}条运单创建失败`,
      });
      this.props.detailPreBooking({ prebookingId: this.props.location.query.prebookingId })
        .then(()=>{
          this.countAgain();
        });
    }
  }

  goBack = () => {
    router.replace('/buiness-center/preBookingList/preBooking');
    window.g_app._store.dispatch({
      type: 'commonStore/deleteTab',
      payload: { id: this.currentTab.id }
    });
  }

  handleSaveBtnClick = formData => {
    const { numError:selfNumError } = this.selfSupportRef.current;
    const { numError:netNumError } = this.netFreightRef.current;
    if (!selfNumError && !netNumError) {
      const selfSupportItems = formData.selfSupportItems && formData.selfSupportItems.filter(item=>item.dirty !== true);
      const netFreightItems = formData.netFreightItems && formData.netFreightItems.filter(item=>item.dirty !== true);
      // if  (!netFreightItems.length){
      //   return notification.error({
      //     message: '保存失败',
      //     description: `添加网络货运运单`,
      //   });
      // }
      this.createTransport([...selfSupportItems, ...netFreightItems]);
    }
    if (selfNumError) {
      notification.error({
        message: '调度失败',
        description: `自营调度【${selfNumError}】超出重量`,
      });
    }
    if (netNumError) {
      notification.error({
        message: '调度失败',
        description: `网络货运调度【${netNumError}】超出重量`,
      });
    }
  }

  render () {
    const { mode, ready } = this.state;
    const { preBooking, location } = this.props;
    const dispatchLayOut = {
      labelCol:{
        xs: { span: 24 }
      },
      wrapperCol: {
        xs: { span: 24 }
      }
    };
    const data = Object.assign(preBooking, this.localData.formData || {});

    return (
      <>
        {ready&&
          <SchemaForm layout="vertical" {...dispatchLayOut} mode={mode} data={data} schema={this.state.schema}>
            <FormCard colCount="3" title="项目信息">
              {
                'prebookingId' in this.props.location.query ?
                  <Item field='projectName' /> :
                  <Item field='projectId' />
              }
              <Item field='responsiblerName' />
              <div>
                <Item field='consignmentType' />
                <Item field='cargoesName' />
              </div>
              <Item field='prebookingNo' />
              <Item field='maximumShippingPrice' />
              <Item field='prebookingRemark' />
            </FormCard>
            <FormCard colCount="1" title="派车信息-自营">
              <Item field='selfSupportItems' />
            </FormCard>
            <FormCard colCount="1" title="派车信息-网络货运">
              <Item field='netFreightItems' />
            </FormCard>
            <FormCard colCount="1" title="提货信息">
              <Item field='deliveryItems' />
            </FormCard>
            <FormCard colCount="1" title="卸货信息" extra={<span className="fs-14 fw-normal color-darkGray">要求送达时间: {moment(preBooking.acceptanceTime).format('YYYY.MM.DD')}</span>}>
              <Item field='receivingItems' />
            </FormCard>
            <FormCard colCount="1" title="承运方信息">
              <Item field='shipmentItems' />
            </FormCard>
            <FormCard colCount="1" title="预约单事件">
              <Item field="preBookingEvents" />
            </FormCard>
            <div style={{ paddingRight: '20px', textAlign: 'right' }}>
              { mode === FORM_MODE.DETAIL ?
                <Button onClick={this.goBack}>返回</Button>
                :
                <>
                  <Button className="mr-10" onClick={this.goBack}>取消</Button>
                  <DebounceFormButton debounce={5000} label="保存" type="primary" onClick={this.handleSaveBtnClick} />
                </>
              }

            </div>
          </SchemaForm>}
      </>
    );
  }
}

class ShippingPrice extends Component {
  render (){
    const { price, unit='元/吨', chargeMode='按照签收重量计算' } = this.props;
    return (
      <span>
        {`${price || '--'}${unit} 计量来源：${chargeMode}`}
      </span>
    );
  }
}

export default Dispatch;
