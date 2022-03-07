import React, { Component } from 'react';
import { connect } from 'dva';
import { Tabs, Button, message } from "antd";
import { SchemaForm, FormCard, Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import transportModel from '@/models/transports';
import { getUserInfo } from '@/services/user';
import TrackMap from '@/components/TrackMap/TrackMap';
import { pick, getOssImg } from '@/utils/utils';
import DeliveryInfo from '../component/DeliveryInfo';
import TransportEvent from '../component/TransportEvent';
import AccountEvent from '../component/AccountEvent';
import '@gem-mine/antd-schema-form/lib/fields';
import Detail from '../component/Detail';
import { ACCOUNT_MANAGE_ROUTER } from "@/constants/account";

const { TabPane } = Tabs;
const { actions: { detailTransports } } = transportModel;
const mapPropKeys = ['receivingLongitude', 'completedTime', 'receivingTime', 'receivingLatitude', 'transportId', 'transportImmediateStatus', 'deliveryItems', 'eventItems', 'serviceId', 'trackDentryid', 'terminalId', 'plateNumber', 'signItems'];

function mapStateToProps (state) {
  const transport = state.transports.entity;
  transport.responsiblerName = transport.responsibleItems && transport.responsibleItems.map(item=>item.responsibleName).join('、');
  transport.accountNo = transport.transportInfoResp?.map(item => item.accountTransportNo).join(',');
  return {
    transport: state.transports.entity,
    commonStore: state.commonStore,
  };
}

@connect(mapStateToProps, { detailTransports })

class TransportDetail extends Component {

  state = {
    organizationType: getUserInfo().organizationType,
    ready:false
  }

  formLayout = {
    labelCol: {
      xs: { span: 24 }
    },
    wrapperCol: {
      xs: { span: 24 }
    }
  }

  schema = {
    orderNo: {
      label: getUserInfo().organizationType === 1? '收款单号': '付款单号',
      component: SkipTo,
      visible: getUserInfo().organizationType !== 3,
      props: Observer({
        watch: '*detail',
        action: detail => ({ detail })
      }),
    },
    invoiceNo: {
      label: '发票号码',
      component: SkipTo,
      visible: getUserInfo().organizationType !== 3,
      props: Observer({
        watch: '*detail',
        action: detail => ({ detail })
      }),
    },
    transportInfoResp: {
      label: '对账单号',
      component: SkipTo,
      visible: getUserInfo().organizationType !== 3,
      props: Observer({
        watch: '*detail',
        action: detail => ({ detail })
      }),
    },
    trackMap: {
      component: TrackMap,
      props: Observer({
        watch: '*mapProps',
        action: mapProps => ({ ...mapProps })
      })
    },
    zhongjiaoMap: {
      component: TrackMap,
      props: Observer({
        watch: '*mapProps',
        action: mapProps => ({ ...mapProps })
      }),
      type:'zhongjiao'
    },
    errorStatus: {
      component: 'input',
    },
    refuseReason: {
      label: '拒绝理由',
      component: 'input',
      rules:{
        max: 100
      }
    },
    handleTime: {
      label: '提交时间',
      component: 'input',
    },
    errorPicture: {
      component: 'input',
      label: '异常图片',
    },
    transportNo:{
      component: 'input',
      label: '运单号',
    },
    projectName: {
      component: 'input',
      label: '所属项目',
    },
    responsiblerName:{
      component: 'input',
      label: '项目负责人',
    },
    createTime:{
      component: 'input',
      label: '派单时间',
    },
    processPointCreateTime: {
      component: 'input',
      label: '签收时间',
    },
    deliveryItems: {
      component: DeliveryInfo,
    },
    driverUserName: {
      component: Detail,
      label: '司机姓名',
      where: 'driver'
    },
    driverUserPhone: {
      component: 'input',
      label: '联系电话',
    },
    plateNumber: {
      component: Detail,
      label: '车牌号',
      where: 'license'
    },
    shipmentName: {
      component: 'input',
      label: '所属承运方',
    },
    shipmentContactName: {
      component: 'input',
      label: '承运方联系人'
    },
    shipmentContactPhone: {
      component: 'input',
      label: '联系人电话',
    },
    freightPrice: {
      component: 'input',
      label: '运价'
    },
    eventItems: {
      component: TransportEvent,
    }
  }

  componentDidMount () {
    const { detailTransports, location: { query: { transportId } } } = this.props;
    detailTransports({ transportId })
      .then(() => {
        this.setState({
          ready:true
        });
      });
  }

  render () {
    const { transport: entity = {} } = this.props;
    const { ready, organizationType } = this.state;
    const { deliveryItems = [] } = entity;
    const mapProps = pick(entity, mapPropKeys);
    deliveryItems.map(item => {
      item.receivingName = entity.receivingName;
      item.receivingAddress = entity.receivingAddress;
      return item;
    });
    return (
      ready &&
      <SchemaForm layout="vertical" schema={this.schema} mode={FORM_MODE.DETAIL} data={{ ...entity, deliveryItems }} trigger={{ mapProps, detail: entity }}>
        {/* <FormCard title="运单信息">
          <Row>
            <Col span={24}>
              <FormItem fields="errorStatus" />
            </Col>
            <Col span={8}>
              <FormItem fields="refuseReason" />
            </Col>
            <Col span={16}>
              <FormItem fields="handleTime" />
            </Col>
            <Col>
              <FormItem fields="errorPicture" />
            </Col>
          </Row>
        </FormCard> */}
        <FormCard colCount="3">
          <Item {...this.formLayout} field="transportNo" />
          <Item {...this.formLayout} field="projectName" />
          <Item {...this.formLayout} field="responsiblerName" />
          <Item {...this.formLayout} field="createTime" />
          <Item {...this.formLayout} field='processPointCreateTime' />
          <Item {...this.formLayout} field='transportInfoResp' />
          <Item {...this.formLayout} field='orderNo' />
          <Item {...this.formLayout} field='invoiceNo' />
        </FormCard>
        <FormCard title="运单详情" colCount="1">
          <Item {...this.formLayout} field="deliveryItems" />
        </FormCard>
        <FormCard title="承运信息">
          <Item {...this.formLayout} field="driverUserName" />
          <Item {...this.formLayout} field="driverUserPhone" />
          <Item {...this.formLayout} field="plateNumber" />
          <Item {...this.formLayout} field="shipmentName" />
          <Item {...this.formLayout} field="shipmentContactName" />
          <Item {...this.formLayout} field="shipmentContactPhone" />
          {this.state.organizationType === 5
            ? <Item {...this.formLayout} field="freightPrice" />
            : null
          }
        </FormCard>
        <Tabs defaultActiveKey="1">
          <TabPane tab="运单事件" key="1">
            <Item {...this.formLayout} field="eventItems" />
          </TabPane>
          <TabPane tab="app轨迹" key="2">
            <Item {...this.formLayout} field="trackMap" />
          </TabPane>
          <TabPane tab="车辆轨迹" key="3">
            <Item {...this.formLayout} field="zhongjiaoMap" />
          </TabPane>
          {organizationType === 1 &&
          <TabPane tab="对账结算事件" key="4">
            <AccountEvent detail={entity} />
          </TabPane>
          }
        </Tabs>
        <div style={{ paddingRight: '20px', textAlign: 'right' }}>
          <Button onClick={()=>{ router.goBack(); }}>返回</Button>
        </div>
      </SchemaForm>
    );
  }
}

export default TransportDetail;

function SkipTo (props) {
  const textArr = [];
  const pathArr = [];
  let pushTo;
  const { organizationType } = JSON.parse(localStorage.getItem('token_storage'));
  const { id, detail } = props;
  if (!detail) return '--';
  switch (id) {
    case 'transportInfoResp':
      if (!detail.transportInfoResp?.length) break;
      detail?.transportInfoResp?.forEach(element => {
        const { accountTransportId, accountOrgType, accountTransportNo } = element;

        textArr.push(accountTransportNo);
        pathArr.push({
          pathname : `${ACCOUNT_MANAGE_ROUTER[organizationType]}`,
          query : { accountTransportId, accountOrgType }
        });
      });
      pushTo = (path) => router.push(path);
      break;
    case 'invoiceNo':
      detail?.invoiceIdItems?.forEach(element => {
        textArr.push(element.invoiceNo);
        pathArr.push(element.invoiceDentryid);
      });
      pushTo = (path) => window.open(getOssImg(path));
      break;
    case 'orderNo':
      if (detail.orderNo) textArr.push(detail.orderNo);
      if (organizationType === 5) pathArr.push(`/net-transport/paymentBillWrap/paymentBill/detail?orderId=${detail.orderId}`);
      if (organizationType === 4) pathArr.push(`/logistics-management/paymentBillWrap/paymentBill/detail?orderId=${detail.orderId}`);
      if (organizationType === 1) pathArr.push(`/bill-account/paymentBillWrap/paymentBill/detail?orderId=${detail.orderId}`);
      pushTo = (path) => router.push(path);
      break;
    default:
      break;
  }

  const routerTo = (e) => {
    const index = e.target.getAttribute('data-Index');
    const path = pathArr[index];
    if (!path) message.error('无此详情');
    pushTo(path);
  };

  if (textArr.length === 0) return '--';

  return (textArr.map((text, index) => (
    text? <><a key={index} data-index={index} onClick={routerTo}>{text}</a>{index < textArr.length - 1?"，": null}</>: '--'
  )));
}
