import React, { Component } from 'react';
import moment from 'moment'
import { Steps } from 'antd-mobile'
import { TRANSPORT_ENVENT_STATUS } from '@/constants/project/project'
import UpLoadImage from '@/weapp/component/UpLoadImage'

const { Step } = Steps

class TransportEvents extends Component {

  sortEventsByTime=(eventsData)=>eventsData.sort(event=>moment(event.createTime)-moment(event.createTime))

  renderEvents = items => {
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
        {(item.pictureDentryid === null || item.pictureDentryid === '')
          ? item.pictureDentryid
          : renderPictures(item.pictureDentryid)
        }
      </>
    )

    const renderPictures = pictureDentryid =>{
      const _pictureDentryid = pictureDentryid.split('<zf>').reverse() // [ 过磅单图片string, 签收单图片string ]
      const pictureArrays = _pictureDentryid.map(item => item.split(',')) // [ [过磅单图片数组], [签收单图片数组] ]
      return pictureArrays.map((pictureArray, index) =>
        (
          <>
            <UpLoadImage key={index} mode="detail" value={pictureArray} />
            <br />
          </>
        )
      )
    }
    return (
      <Steps size="small" current={items.length} style={{ padding: '0 10px 0 20px' }}>
        {
          items.map(item => {
            const stepStatus = itemConfig[item.eventStatus]
            return <Step title={`${stepStatus.text}`} status={`${stepStatus.icon}`} description={renderDescription(item)} />
          })
        }
      </Steps>
    )
  }

  render () {
    const { field: { label }, value } = this.props
    return (
      <div style={{ background:'white' }}>
        <div className="formLabel" style={{ marginBottom: '10px' }}>{label}</div>
        { this.renderEvents(value)}
      </div>
    );
  }
}

export default TransportEvents;
