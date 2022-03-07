import React, { Component } from 'react'
import { Card, WingBlank, WhiteSpace, List, Steps } from 'antd-mobile'
import WxImageViewer from 'react-wx-images-viewer'
import { connect } from 'dva'
import moment from 'moment'
import transportModel from '@/models/transports'
import { getTransportStatus } from '@/services/project'
import { TRANSPORT_ENVENT_STATUS } from '@/constants/project/project'
import 'react-imageview/dist/react-imageview.min.css'
import TransportInfoStep from './component/transportInfoStep/TransportInfoStep'
import { getOssImg } from '@/utils/utils'
import nativeApi from '@/utils/nativeApi'

const { Step } = Steps

const { actions: { detailTransports } } = transportModel

const { SingleImgView } = require('../component/ImageView')

function mapStateToProps (state) {
  return {
    transport: state.transports.entity
  }
}

@connect(mapStateToProps, { detailTransports })
export default class TransportDetail extends Component {

  state = {
    ready: false,
    index:0,
    isOpen:false,
    imagelist:[]
  }

  componentDidMount () {
    const { location: { query: { transportId } } } = this.props
    this.props.detailTransports({ transportId })
      .then(() => {
        this.setState({
          ready: true
        })
      })
  }

  renderEvent = items => {
    if (!items) return
    const itemConfig = {
      [TRANSPORT_ENVENT_STATUS.PUBLISHED]: { icon: 'finish', text: '发布运单' },
      [TRANSPORT_ENVENT_STATUS.ACCEPTED]: { icon: 'finish', text: '司机接单' },
      [TRANSPORT_ENVENT_STATUS.REFUSED]: { icon: 'error', text: '司机拒绝' },
      [TRANSPORT_ENVENT_STATUS.ACTION_START]: { icon: 'finish', text: '司机执行任务' },
      [TRANSPORT_ENVENT_STATUS.CAR_LOADING]: { icon: 'finish', text: '司机装车' },
      [TRANSPORT_ENVENT_STATUS.ARRIVE]: { icon: 'finish', text: '司机到站' },
      [TRANSPORT_ENVENT_STATUS.HANDLE_EXCEPTION]: { icon: 'wait', text: '提交异常' },
      [TRANSPORT_ENVENT_STATUS.EXCEPTION_PASS]: { icon: 'finish', text: '异常审核通过' },
      [TRANSPORT_ENVENT_STATUS.EXCEPTION_INGORE]: { icon: 'error', text: '异常审核不通过' },
      [TRANSPORT_ENVENT_STATUS.REDISPATCH]: { icon: 'wait', text: '重新调度' },
      [TRANSPORT_ENVENT_STATUS.SIGNED]: { icon: 'finish', text: '司机签收' },
      [TRANSPORT_ENVENT_STATUS.RESINGED]: { icon: 'wait', text: '重新签收' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_RECEIPT_PASS]: { icon: 'finish', text: '承运方回单审核通过' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_RECEIPT_REFUSE]: { icon: 'error', text: '承运方回单审核不通过' },
      [TRANSPORT_ENVENT_STATUS.CONSIGNMENT_RECEIPT_PASS]: { icon: 'finish', text: '托运方回单审核通过' },
      [TRANSPORT_ENVENT_STATUS.CONSIGNMENT_RECEIPT_REFUSE]: { icon: 'error', text: '托运方回单审核不通过' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_MODIFY_RECEIPT]: { icon: 'wait', text: '承运方修改回单' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_MODIFY_TRANSPORT]: { icon: 'wait', text: '承运方修改运单' },
      [TRANSPORT_ENVENT_STATUS.CUSTOMER_RECEIPT_PASS]: { icon: 'finish', text: '客户回单审核通过' },
      [TRANSPORT_ENVENT_STATUS.CUSTOMER_RECEIPT_REFUSE]: { icon: 'error', text: '客户回单审核不通过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_DELIVERY_OUT_OF_FENSE]:{ icon: 'wait', text: '司机围栏外提货' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_SIGN_OUT_OF_FENSE]:{ icon: 'wait', text: '司机围栏外签收' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_CANCEL_TRANSPORT]:{ icon: 'error', text: '作废运单' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_ACCEPT_AUDIT]:{ icon: 'wait', text: '司机接单待确认' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_ACCEPT_PASS]:{ icon: 'wait', role:'企', text: '司机接单审核通过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_ACCEPT_REFUSE]:{ icon: 'wait', role:'企', text: '司机接单审核不过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_AUTO_COMPLETE]:{ icon: 'wait', role:'企', text: '司机提货后超时自动转完成' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_CANCEL_APPLY]:{ icon: 'wait', text: '司机取消申请' },
      [TRANSPORT_ENVENT_STATUS.OVERTIME_CANCEL]:{ icon: 'wait', role:'企', text: '运单超时自动关闭' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_AUDIT]:{ icon: 'wait', text: '司机提货待审核' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_PASS]:{ icon: 'wait', role:'企', text: '司机提货审核通过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_REFUSE]:{ icon: 'wait', role:'企', text: '司机提货审核不通过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_MODIFY_LOAD_INFO]:{ icon: 'wait', text: '司机修改提货审核' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_APPLY_ACCEPT]:{ icon: 'wait', text: '司机申请接单' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_MODIFY_RECEIVING]:{ icon: 'wait', text: '修改卸货点' },
    }

    const renderDescription = item => (
      <>
        <div>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>
        <div>{`${item.nickName}(${item.organizationName}) ${item.eventDetail}`}</div>
        {item.pictureDentryid === null || item.pictureDentryid === ''
          ? item.pictureDentryid
          : <div>{this.renderPictures(item.pictureDentryid)}</div>
        }
      </>
    )

    return (
      <Steps size="small" current={items.length}>
        {
          items.map(item => {
            const stepStatus = itemConfig[item.eventStatus]
            return <Step title={`${stepStatus.text}`} status={`${stepStatus.icon}`} description={renderDescription(item)} />
          })
        }
      </Steps>
    )
  }

  renderPictures = pictureDentryid =>{
    const _pictureDentryid = pictureDentryid.split('<zf>').reverse() // [ 过磅单图片string, 签收单图片string ]
    const pictureArrays = _pictureDentryid.map(item => item.split(',')) // [ [过磅单图片数组], [签收单图片数组] ]
    return pictureArrays.map(pictureArray =>
      (
        <>
          {pictureArray.map((picture, index) =>
            <img onClick={()=>this.openImageview(pictureArray, index)} style={{ marginRight:'10px' }} key={picture} alt={getOssImg(picture, { width:'100', height:'100' })} src={getOssImg(picture, { width:'100', height:'100' })} />
          )}
          <br />
        </>
      )
    )
  }



  openImageview = (_imagelist, index) => {
    const imagelist = _imagelist.map(picture => getOssImg(picture))
    this.setState({
      isOpen: true,
      imagelist,
      index
    })
  }

  onClose = () => {
    this.setState({
      isOpen: false
    })
  }

  render () {
    const listNameStyle = { color: '#999', fontSize: '14px' }
    const listExtraStyle = { color: '#333', fontSize: '14px' }
    const { ready, isOpen, imagelist, index } = this.state
    const { projectName, responsiblerName, transportNo, createTime, expectTime, shipmentName, shipmentContactName, shipmentContactPhone,
      driverUserName, plateNumber, driverUserPhone, deliveryItems = [], receivingName, receivingAddress, contactName, contactPhone, exceptionItems,
      eventItems } = this.props.transport
    const dataSource = [].concat(deliveryItems, [{ receivingName, receivingAddress, contactName, contactPhone }])
    return (
      <>
        {ready &&
          <>
            {/* <Card>
          <Card.Body>
            <div style={{ color: '#333', fontSize: '20px', height: '60px', padding: '20px 0', fontWeight: 700 }}>
              司机拒绝
            </div>
            <div style={{ height: '60px' }}>
              没有空闲车辆，请重新安排没有空闲车辆，请重新安排没有空闲车辆，请重新安排没有空闲车辆，请重新安排
            </div>
            <div style={{ margin: '10px 0' }}>
              <img alt='remark' width='110' height='110' src="http://my-oss-bucket-epressarrive0c7c7eb2-959e-47f7-83a5-91a2559bd416.oss-cn-beijing.aliyuncs.com/images_KEY_1557646140775.jpg?x-oss-process=image/resize,w_110" />
              <img alt='remark' style={{ marginLeft: '7px' }} width='110' height='110' src="http://my-oss-bucket-epressarrive0c7c7eb2-959e-47f7-83a5-91a2559bd416.oss-cn-beijing.aliyuncs.com/images_KEY_1557646140775.jpg?x-oss-process=image/resize,w_110" />
              <img alt='remark' style={{ marginLeft: '7px' }} width='110' height='110' src="http://my-oss-bucket-epressarrive0c7c7eb2-959e-47f7-83a5-91a2559bd416.oss-cn-beijing.aliyuncs.com/images_KEY_1557646140775.jpg?x-oss-process=image/resize,w_110" />
            </div>
          </Card.Body>
          <Card.Footer content={<div style={{ margin: '10px 0', fontSize: '12px', color: '#999' }}>2019.02.02 10:30</div>} />
        </Card>
        <WhiteSpace size='lg' /> */}
            <Card full>
              <Card.Header
                title={<div style={{ color: '#333', fontSize: '16px' }}>运单信息</div>}
                extra={<span style={{ color: '#FD400F', fontSize: '14px' }}>{getTransportStatus(this.props.transport)[0].word}</span>}
              />
              <List class="list-line">
                <List.Item extra={<span style={listExtraStyle}>{projectName}</span>}><span style={listNameStyle}>项目名称</span></List.Item>
                <List.Item extra={<span style={listExtraStyle}>{responsiblerName}</span>}><span style={listNameStyle}>项目负责人</span></List.Item>
                <List.Item extra={<span style={listExtraStyle}>{transportNo}</span>}><span style={listNameStyle}>运单号</span></List.Item>
                <List.Item extra={<span style={listExtraStyle}>{moment(createTime).format('YYYY-MM-DD HH:mm')}</span>}><span style={listNameStyle}>下单时间</span></List.Item>
                <List.Item extra={<span style={listExtraStyle}>{moment(expectTime).format('YYYY-MM-DD HH:mm')}</span>}><span style={listNameStyle}>要求送达时间</span></List.Item>
              </List>
            </Card>
            <List class="list-line">
              <List.Item extra={<span style={listExtraStyle}>{shipmentName}</span>}><span style={listNameStyle}>承运方</span></List.Item>
              <List.Item extra={<span style={listExtraStyle}>{shipmentContactName}</span>}><span style={listNameStyle}>负责人</span></List.Item>
              <List.Item extra={<span style={listExtraStyle}>{shipmentContactPhone}</span>}><span style={listNameStyle}>联系电话</span></List.Item>
              <List.Item extra={<span style={listExtraStyle}>{driverUserName}</span>}><span style={listNameStyle}>司机</span></List.Item>
              <List.Item extra={<span style={listExtraStyle}>{plateNumber}</span>}><span style={listNameStyle}>车牌号</span></List.Item>
              <List.Item extra={<span style={listExtraStyle}>{driverUserPhone}</span>}><span style={listNameStyle}>司机联系电话</span></List.Item>
            </List>
            <WhiteSpace size='lg' />
            <TransportInfoStep dataSource={dataSource} />
            {/* <DeliveryList dataSource={deliveryItems} imgSrc='http://my-oss-bucket-epressarrive0c7c7eb2-959e-47f7-83a5-91a2559bd416.oss-cn-beijing.aliyuncs.com/images_KEY_1557646140775.jpg?x-oss-process=image/resize,w_40' /> */}
            {/* <ReceivingList dataSource={[{ receivingName, receivingAddress, contactName, contactPhone }]} imgSrc='http://my-oss-bucket-epressarrive0c7c7eb2-959e-47f7-83a5-91a2559bd416.oss-cn-beijing.aliyuncs.com/images_KEY_1557646140775.jpg?x-oss-process=image/resize,w_40' /> */}
            {exceptionItems && exceptionItems.length !== 0 &&
              <>
                <WhiteSpace size='lg' />
                <Card>
                  <Card.Header
                    title="异常信息"
                  />
                  {exceptionItems.map(item => (
                    <List>
                      <List.Item extra={`${item.exceptionReasonCN}`}>异常类型</List.Item>
                      <List.Item extra={`${moment(item.createTime).format('YYYY-MM-DD HH:mm')}`}>提交时间</List.Item>
                      <List.Item arrow='horizontal' multipleLine>异常描述<List.Item.Brief>{item.exceptionExplain}</List.Item.Brief></List.Item>
                      <List.Item multipleLine>异常图片
                        <List.Item.Brief>
                          <div style={{ margin: '10px 0' }}>{this.renderPictures(item.exceptionDentryid)}</div>
                        </List.Item.Brief>
                      </List.Item>
                      <List.Item extra={`${item.processingScheme ? item.processingScheme : '未处理'}`}>处理方案</List.Item>
                      <List.Item extra={`${item.processingName ? item.processingName : '未处理'}`}>处理人员</List.Item>
                      <List.Item extra={`${item.processingTime ? moment(item.processingTime).format('YYYY-MM-DD HH:mm') : '未处理'}`}>处理时间</List.Item>
                    </List>
                  ))}
                </Card>
              </>}
            <WhiteSpace size='lg' />
            <Card>
              <Card.Header
                title={<span style={{ color: '#333', fontSize: '16px', height: '56px', padding: '20px 0', lineHeight: '16px' }}>运输信息</span>}
              // extra={<span><span style={{ color: '#333', fontSize: '12px' }}>运输轨迹</span><Icon type='right' size='xs' style={{ display: 'inline-block', verticalAlign: 'middle' }} /></span>}
              />
              <WingBlank>
                {this.renderEvent(eventItems)}
              </WingBlank>
            </Card>
          </>}

        { isOpen && <WxImageViewer onClose={this.onClose} urls={imagelist} index={index} /> }
      </>
    )
  }
}
