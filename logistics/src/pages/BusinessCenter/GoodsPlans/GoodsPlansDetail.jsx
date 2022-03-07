import React, { Component } from 'react';
import { Item, SchemaForm, FORM_MODE, Observer, FormCard } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import router from 'umi/router';
import '@gem-mine/antd-schema-form/lib/fields';
import { Button } from 'antd';
import ReceivingAndGoodsTable from './components/ReceivingAndGoodsTable';
import { getGoodsPlanDetail } from '@/services/apiService';
import { PLANSTATUSARRAY, PLANSTATUS } from '@/constants/goodsPlans/planStatus';
import TRANSPORTIMMEDIATESTATUS from '@/constants/transport/transportImmediateStatus';
import TransportCorrelationCnItems from './components/TransportCorrelationCnItems';
import ConsignmentInfo from './components/consignmentInfo';
import { classifyGoodsWeight } from '@/utils/utils';


export default class GoodsPlansDetail extends Component{
  state={
    data: {}
  }

  schema = {
    transportCorrelationCnItems:{
      component: TransportCorrelationCnItems,
      visible: Observer({
        watch:'planStatus',
        action: planStatus => {
          if (planStatus===PLANSTATUS.GOINGON || planStatus===PLANSTATUS.CANCEL || planStatus===PLANSTATUS.FINISH){
            return true;
          }
          return false;
        }
      })
    },
    planStatus:{
      label:'计划单状态',
      component: 'input.text',
      format:{
        input:(planStatus)=>PLANSTATUSARRAY[planStatus].words
      }
    },
    verifyItems:{
      label:'拒绝理由',
      component: 'input.textArea.text',
      format:{
        input:(verifyItems)=>verifyItems[verifyItems.length-1]?.verifyReason
      },
      visible:Observer({
        watch:'planStatus',
        action: planStatus => {
          if (planStatus=== PLANSTATUS.CONSIGNMENT_REFUSED) return true;
          return false;
        }
      })
    },
    projectName:{
      label: '合同名称',
      component: 'input.text'
    },
    goodsPlanNo: {
      label: '要货计划单编号',
      component: 'input.text'
    },
    customerName: {
      label: '客户',
      component: 'input.text'
    },
    arrivalTime: {
      label:'到货时间日期',
      component: 'datePicker.text',
      type: 'moment'
    },
    remarks: {
      label: '备注',
      component: 'input.textArea.text',
    },
    goodsCorrelationItems: {
      component: ReceivingAndGoodsTable
    },
    consignmentInfo:{
      component: ConsignmentInfo
    }
  }

  componentDidMount (){
    const { location: { query: { goodsPlanId } } } = this.props;
    this.setGoodsPlanDetailData(goodsPlanId);
    this.nowTime = new Date().toString();
  }

  setGoodsPlanDetailData = (goodsPlanId) => {
    getGoodsPlanDetail( goodsPlanId )
      .then( data => {
        // 处理后端返回的数据,将goodsCorrelationItems中元素的receivingItems[0]和goodItems[0]对象的属性添加到对应的将goodsCorrelationItems的元素中
        data.goodsCorrelationItems = data.goodsCorrelationItems.map(item => {
          Object.keys(item.receivingItems[0]).forEach(keyName => {
            item[keyName] = item.receivingItems[0][keyName];
          });
          Object.keys(item.goodItems[0]).forEach(keyName => {
            if (keyName!=='goodsNum'){
              item[keyName] = item.goodItems[0][keyName];
            }
          });
          // ${item.categoryName}-${item.goodsName}
          item.goodsName = `${item.categoryName}-${item.goodsName}`;
          return item;
        });
        data.consignmentInfo = {
          consignmentName: data.consignmentName,
          responsibleName: data.consignmentResponsibleItems[0].responsibleName,
          responsiblePhone: data.consignmentResponsibleItems[0].responsiblePhone
        };
        // TODO 数据还要处理一下做统计  暂未知
        data = this.calculatingGoodsTotalNum(data);
        this.setState({
          data
        });
      });
  }

  renderButton = (planStatus) => {
    switch (planStatus){
      case PLANSTATUS.CONSIGNMENT_UNTREATED:
        return (
          <>
            <Button>返回</Button>
          </>
        );
      case PLANSTATUS.CONSIGNMENT_REFUSED:
        return (
          <>
            <Button>预约单列表</Button>
            <Button>运单列表</Button>
            <Button>返回</Button>
          </>
        );
      case PLANSTATUS.GOINGON:
        return (
          <>
            <Button>返回</Button>
          </>
        );
      case PLANSTATUS.COMPLETE:
        return (
          <>
            <Button>预约单列表</Button>
            <Button>运单列表</Button>
            <Button>返回</Button>
          </>
        );
      case PLANSTATUS.CANCEL:
        return (
          <>
            <Button>返回</Button>
          </>
        );
      case PLANSTATUS.FINISH:
        return (
          <>
            <Button>预约单列表</Button>
            <Button>运单列表</Button>
            <Button>返回</Button>
          </>
        );
      default: return <></>;
    }
  }


  calculatingGoodsTotalNum = (data) => {
    data.transportCorrelationCnItems.forEach((item, index) => {
      data.transportCorrelationCnItems[index].exception = 0;
    });
    data.transportCorrelationCnItems = classifyGoodsWeight(data.transportCorrelationCnItems, 'goodsId',
      [
        'goodsUnit', 'transportCorrelationId', 'goodsId', 'goodsNum', 'deliveryNum', 'receivingNum', 'goodsUnitCN', 'categoryName',
        'deliveryUnitCN', 'receivingUnitCN', 'transportImmediateStatus', 'goodsName', 'transportImmediateStatus', 'exception'
      ],
      (summary, current) => {
        // TODO这里需要添加运单状态的判断条件
        summary.goodsNum += current.goodsNum; // 调度数量
        if (current.transportImmediateStatus === TRANSPORTIMMEDIATESTATUS.TRANSPORTING) summary.deliveryNum += current.deliveryNum; // 运输中重量
        if (current.transportImmediateStatus === TRANSPORTIMMEDIATESTATUS.TRANSPORT_EXECPTION) summary.exception += current.exception; // 运单异常重量
        summary.receivingNum += current.receivingNum; // 卸货重量
      });
    // 计算要货数量
    data.transportCorrelationCnItems.forEach(transportCorrelationCnItem=>{
      transportCorrelationCnItem.goodTotalNum=0;
      data.goodsCorrelationItems.forEach(goodsCorrelationItem=>{
        if (transportCorrelationCnItem.goodsId === goodsCorrelationItem.goodsId){
          transportCorrelationCnItem.goodTotalNum += goodsCorrelationItem.goodsNum;
        }
      });
    });
    return data;
  }


  render (){
    const { data } = this.state;
    // const { planStatus } = data
    const formLayout = {
      labelCol:{
        xs: { span: 24 }
      },
      wrapperCol: {
        xs: { span: 24 }
      }
    };
    return (
      <>
        <SchemaForm schema={this.schema} layout="vertical" mode={FORM_MODE.DETAIL} {...formLayout} data={data}>
          <FormCard title="计划单统计" colCount={1}>
            <Item field="transportCorrelationCnItems" />
          </FormCard>
          <FormCard title="要货计划单状态说明" colCount={3}>
            <Item field="planStatus" />
            <Item field="verifyItems" />
          </FormCard>
          <FormCard title="要货计划单信息" colCount={3}>
            <Item field="projectName" />
            <Item field="goodsPlanNo" />
            <Item field="customerName" />
            <Item field="arrivalTime" />
            <Item field="remarks" />
          </FormCard>
          <FormCard title="卸货点和商品信息" colCount={1}>
            <Item field="goodsCorrelationItems" />
          </FormCard>
          <FormCard title="托运方信息" colCount={1}>
            <Item field="consignmentInfo" />
          </FormCard>
          <div style={{ textAlign: 'right' }}><Button className="mr-20" onClick={router.goBack}>返回</Button></div>
        </SchemaForm>
      </>
    );
  }
}
