import React from 'react';
import { Timeline, Modal } from 'antd';
import moment from 'moment';
import { TRANSPORT_ENVENT_STATUS } from '@/constants/project/project';
import ImageDetail from '@/components/ImageDetail';
import { getOssImg } from '@/utils/utils';

export default class TransportEvents extends React.PureComponent{

  state={
    visible:false,
    imgSrc:[],
    index:0
  }

  renderPrebookingEvent = ({ nickName, organizationName, eventStatus, createTime, eventDetail, pictureDentryid }, index) => {
    // todo 预约单事件与原先不一致？各事件color值？
    const eventDetailText = (eventStatus) => {
      if (eventStatus !== TRANSPORT_ENVENT_STATUS.CAR_LOADING && eventStatus !== TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_AUDIT) return eventDetail||'';
      const keyIndex = eventDetail.indexOf('提货单号：');
      const firstRow = eventDetail.substr(0, keyIndex);
      const secondRow = eventDetail.substring(keyIndex);
      return (
        [
          <div>{firstRow}</div>,
          <div>{secondRow}</div>
        ]
      );
    };

    const itemConfig = {
      [TRANSPORT_ENVENT_STATUS.PUBLISHED]: { color: 'orange', text: '发布运单' },
      [TRANSPORT_ENVENT_STATUS.ACCEPTED]: { color: 'green', text: '司机接单' },
      [TRANSPORT_ENVENT_STATUS.REFUSED]: { color: 'red', text: '司机拒绝' },
      [TRANSPORT_ENVENT_STATUS.ACTION_START]: { color: 'green', text: '执行任务' },
      [TRANSPORT_ENVENT_STATUS.CAR_LOADING]: { color: 'orange', text: '装车' },
      [TRANSPORT_ENVENT_STATUS.ARRIVE]: { color: 'green', text: '到站' },
      [TRANSPORT_ENVENT_STATUS.HANDLE_EXCEPTION]: { color: 'orange', text: '提交异常' },
      [TRANSPORT_ENVENT_STATUS.EXCEPTION_PASS]: { color: 'red', text: '异常审核通过' },
      [TRANSPORT_ENVENT_STATUS.EXCEPTION_INGORE]: { color: 'green', text: '异常审核不通过' },
      [TRANSPORT_ENVENT_STATUS.REDISPATCH]: { color: 'orange', text: '重新调度' },
      [TRANSPORT_ENVENT_STATUS.SIGNED]: { color: 'green', text: '签收' },
      [TRANSPORT_ENVENT_STATUS.RESINGED]: { color: 'green', text: '重新签收' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_RECEIPT_PASS]: { color: 'green', text: '承运方回单审核通过' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_RECEIPT_REFUSE]: { color: 'red', text: '承运方回单审核不通过' },
      [TRANSPORT_ENVENT_STATUS.CONSIGNMENT_RECEIPT_PASS]: { color: 'green', text: '托运方回单审核通过' },
      [TRANSPORT_ENVENT_STATUS.CONSIGNMENT_RECEIPT_REFUSE]: { color: 'red', text: '托运方回单审核不通过' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_MODIFY_RECEIPT]: { color: 'green', text: '承运方修改回单' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_MODIFY_TRANSPORT]: { color: 'green', text: '承运方修改运单' },
      [TRANSPORT_ENVENT_STATUS.CUSTOMER_RECEIPT_PASS]: { color: 'green', text: '客户回单审核通过' },
      [TRANSPORT_ENVENT_STATUS.CUSTOMER_RECEIPT_REFUSE]: { color: 'red', text: '客户回单审核不通过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_DELIVERY_OUT_OF_FENSE]:{ color: 'red', text: '司机围栏外提货' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_SIGN_OUT_OF_FENSE]:{ color: 'red', text: '司机围栏外签收' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_CANCEL_TRANSPORT]:{ color: 'red', text: '作废运单' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_ACCEPT_AUDIT]:{ color: 'orange', text: '司机接单待确认' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_ACCEPT_PASS]:{ color: 'green', text: '司机接单审核通过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_ACCEPT_REFUSE]:{ color: 'red', text: '司机接单审核不过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_AUTO_COMPLETE]:{ color: 'green', text: '司机提货后超时自动转完成' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_CANCEL_APPLY]:{ color: 'red', text: '司机取消申请' },
      [TRANSPORT_ENVENT_STATUS.OVERTIME_CANCEL]:{ color: 'red', text: '运单超时自动关闭' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_AUDIT]:{ color: 'orange', text: '司机提货待审核' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_PASS]:{ color: 'green', text: '司机提货审核通过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_REFUSE]:{ color: 'red', text: '司机提货审核不通过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_MODIFY_LOAD_INFO]:{ color: 'orange', text: '司机修改提货审核' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_APPLY_ACCEPT]:{ color: 'orange', text: '司机申请接单' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_MODIFY_RECEIVING]:{ color: 'green', text: '修改卸货点' },
    }[eventStatus]||{ color: 'red', text: 'bug' };
    return (
      <Timeline.Item key={index} color={itemConfig.color}>
        <>
          <div className="color-gray">{moment(createTime).format('YYYY-MM-DD HH:mm')}</div>
          <div>{`${nickName || ''} ${organizationName || ''} ${itemConfig.text}`}</div>
          <div>{eventDetailText(eventStatus)}</div>
          {pictureDentryid&&<div>{this.renderPictures(pictureDentryid)}</div>}
        </>
      </Timeline.Item>
    );
  }

  renderPictures = pictureDentryid =>{
    const _pictureDentryid = pictureDentryid.split('<zf>'); // [ 过磅单图片string, 签收单图片string ]
    const pictureArrays = _pictureDentryid.map(item => item.split(',')).reverse(); // [ [过磅单图片数组], [签收单图片数组] ]
    return pictureArrays.map((pictureArray) =>
      (
        <React.Fragment key={Math.random()}>
          {pictureArray.map((picture, key) =>
            <img onClick={()=>this.openImageDetail(pictureArray, key)} style={{ marginRight:'10px', marginBottom:'10px' }} key={picture} alt={picture} src={getOssImg(picture, { width:'200', height:'200' })} />
          )}
          <br />
        </React.Fragment>
      )
    );
  }

  openImageDetail = (pictureArray=[], index ) =>{
    const imgSrc = pictureArray.map(item=>getOssImg(item));
    this.setState({
      imgSrc,
      index,
      visible:true
    });
  }

  render () {
    const { value = [] } = this.props;
    const { visible, imgSrc=[], index=0 } = this.state;
    value.sort((prev, next) => moment(next.createTime) > moment(prev.createTime) ? 1 : -1);
    return (
      <>
        <Modal
          title='图片'
          footer={null}
          width={648}
          maskClosable={false}
          destroyOnClose
          visible={visible}
          onCancel={() => this.setState({ visible: false, index:0, imgSrc:[] })}
        >
          <ImageDetail index={index} imageData={imgSrc} />
        </Modal>
        <Timeline>
          {value.map(this.renderPrebookingEvent)}
        </Timeline>
      </>
    );
  }
}
