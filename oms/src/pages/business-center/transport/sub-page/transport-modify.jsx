import React, { Component } from 'react';
import { connect } from 'dva';
import { notification } from 'antd';
import { SchemaForm, Item, FORM_MODE, FormCard, Observer } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import DebounceFormButton from '../../../../components/debounce-form-button';
import { getDriverByShipment, getCarByShipment } from '../../../../services/apiService';
import transportModel from '../../../../models/transports';
import prebookingModel from '../../../../models/preBooking';
import TransportDelivery from './transport-delivery';
import '@gem-mine/antd-schema-form/lib/fields';

const { actions: { detailPreBooking } } = prebookingModel;
const { actions: { detailTransports, patchTransports } } = transportModel;

function mapStateToProps (state) {
  const transport = state.transports.entity;
  transport.responsiblerName = (transport.responsibleItems||[]).map(item=>item.responsibleName).join('、');
  return {
    transport : state.transports.entity,
    preBooking : state.preBooking.entity
  };
}

@connect(mapStateToProps, { detailTransports, patchTransports, detailPreBooking })
export default class TransportModify extends Component{
  state={
    ready:false
  }

  schema = {
    projectName: {
      label: '项目名称',
      component: 'input.text'
    },
    responsiblerName: {
      label: '项目负责人',
      component: 'input.text'
    },
    createTime: {
      label: '下单时间',
      component: 'input.text'
    },
    statusWord: {
      label: '运单状态',
      component: StatusWord,
    },
    transportNo: {
      label: '运单号',
      component: 'input.text'
    },
    deliveryItems: {
      component: TransportDelivery,
      rules:{
        required:[true, '请填写提货信息']
      }
    },
    driverUserId: {
      label: '司机姓名',
      component: 'select',
      rules: {
        required:true
      },
      options: async () => {
        const { items: data } = await getDriverByShipment({ limit:1000, offset:0 });
        const items = data || [];
        const result = items
          .filter(item=>item.isBusy===1)
          .map(item => ({
            key: item.userId,
            value: item.userId,
            label: `${item.nickName}${item.isBusy ? '(空闲)' : '(忙碌)'}`,
          }));
        const { driverUserId, driverUserName } = this.props.transport;
        const own = { key: driverUserId, value: driverUserId, label:driverUserName };
        return [...result, own];
      },
    },
    carId: {
      label: '车牌号',
      component: 'select',
      rules: {
        required:true
      },
      options: async () => {
        const { items: data } = await getCarByShipment({ isPassShipments: true, isAvailable: true, limit:1000, offset:0 });
        const items = data || [];
        const result = items
          .filter(item=>item.isBusy===1)
          .map(item => ({
            key: item.carId,
            value: item.carId,
            label: `${item.carNo}(${item.carLoad}吨)${item.isBusy ? '(空闲)' : '(忙碌)'}`,
          }));
        const { carId, plateNumber } = this.props.transport;
        const own = { key: carId, value: carId, label:plateNumber };
        return [...result, own];
      }
    },
    receivingId: {
      label: '卸货点',
      component: 'select.text',
      placeholder: '请选择卸货点',
      rules: {
        required: [true, '请选择卸货点']
      },
      options: () => {
        const receiving = this.props.preBooking.receivingItems.reduce((receivingItems, current) => {
          const check = receivingItems.findIndex(item => item.receivingId === current.receivingId);
          if (check < 0) {
            const { receivingName, receivingId } = current;
            return [...receivingItems, { key: receivingId, value: `${receivingId}`, label: receivingName, receivingId }];
          }
          return receivingItems;
        }, []);
        return receiving;
      },
      observer: Observer({
        watch: 'deliveryItems',
        action: (deliveryItems) => {
          if (deliveryItems&&deliveryItems.length>0){
            const delivery = deliveryItems[0];
            const receiving = this.props.preBooking.receivingItems.find(item => item.goodsId === delivery.goodsId);
            return { value: `${receiving.receivingId}` };
          }
          return { value: '' };
        }
      })
    },
    shipmentName: {
      label: '所属承运方',
      component: 'input.text'
    },
    shipmentContactName: {
      label: '承运方联系人',
      component: 'input.text',
      readOnly:true
    },
    shipmentContactPhone: {
      label: '联系人电话',
      component: 'input.text',
      readOnly:true
    }
  }

  handleSaveBtnClick = (value) => {
    const { patchTransports, transport:{ transportId, exceptionItems=[] }, preBooking:{ acceptanceTime, prebookingId } } = this.props;
    const { transpotExceptionId:transportExceptionId } = exceptionItems.find(item=>item.processingTime===null);
    patchTransports({ transportId, prebookingId, ...value, receivingId:+value.receivingId, expectTime:acceptanceTime.format(), transportExceptionId })
      .then(()=>{
        notification.success({
          message: '修改成功',
          description: `修改运单成功`,
        });
        router.goBack();
      });
  }

  componentDidMount (){
    const { detailTransports, detailPreBooking, location: { query: { transportId } } } = this.props;
    detailTransports({ transportId })
      .then(data=>detailPreBooking({ prebookingId:data.prebookingId }))
      .then(()=>{
        this.setState({
          ready:true
        });
      });
  }

  render (){
    const { transport } = this.props;
    const { ready } = this.state;
    return (
      <>
        {ready&&
        <SchemaForm layout="vertical" schema={this.schema} mode={FORM_MODE.MODIFY} data={transport}>
          <FormCard title="运单信息" colCount={3}>
            <Item field="projectName" />
            <Item field="responsiblerName" />
            <Item field="createTime" />
            <Item field="statusWord" />
            <Item field="transportNo" />
          </FormCard>
          <FormCard title="运单详情" colCount={1}>
            <Item field="deliveryItems" wrapperCol={{ span: 24 }} />
          </FormCard>
          <FormCard title="承运信息" colCount={3}>
            <Item field="driverUserId" />
            <Item field="carId" />
            <Item field="receivingId" />
            <Item field="shipmentName" />
            <Item field="shipmentContactName" />
            <Item field="shipmentContactPhone" />
          </FormCard>
          <div style={{ paddingRight: '20px', textAlign: 'right' }}>
            <DebounceFormButton label="保存" type="primary" onClick={this.handleSaveBtnClick} />
          </div>
        </SchemaForm>
        }
      </>
    );
  }
}

class StatusWord extends Component{
  render (){
    return (
      <span style={{ color:'red' }}>运单异常</span>
    );
  }
}
