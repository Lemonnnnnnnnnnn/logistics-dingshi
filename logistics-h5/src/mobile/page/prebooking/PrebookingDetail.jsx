import React, { Component } from 'react'
import { Card, WingBlank, WhiteSpace, Steps } from 'antd-mobile'
import { connect } from 'dva'
import moment from 'moment'
import prebookingModel from '@/models/preBooking'
import List from '@/mobile/page/component/ListNoUnderLine.jsx'
import { PREBOOKING_EVENT_STATUS } from '@/constants/project/project'
import { getPreBookingStauts } from '@/services/project'
import PrebookingInfoStep from './component/PrebookingInfoStep/PrebookingInfoStep'

const { Step } = Steps

const { actions: { detailPreBooking } } = prebookingModel

function mapStateToProps (state) {
  return {
    preBooking: state.preBooking.entity
  }
}

@connect(mapStateToProps, { detailPreBooking })
export default class PrebookingDetail extends Component {

  state={
    ready:false
  }

  componentDidMount () {
    this.props.detailPreBooking({ prebookingId: this.props.location.query.prebookingId })
      .then(()=>{
        this.setState({
          ready:true
        })
      })
  }

  renderEvent = eventItems => {
    const itemConfig = {
      [PREBOOKING_EVENT_STATUS.PUBLISHED]: { icon: 'finish', text: '发布预约单' },
      [PREBOOKING_EVENT_STATUS.ACCEPT_TIME_OUT]: { icon: 'error', text: '接单超时' },
      [PREBOOKING_EVENT_STATUS.ACCEPTED]: { icon: 'finish', text: '已接单' },
      [PREBOOKING_EVENT_STATUS.REFUSED]: { icon: 'error', text: '已拒绝' },
      [PREBOOKING_EVENT_STATUS.START_DISPATCH]: { icon: 'wait', text: '开始调度' },
      [PREBOOKING_EVENT_STATUS.DISPATCHED]: { icon: 'finish', text: '调度完成' },
      [PREBOOKING_EVENT_STATUS.AUTO_DISPATCHED]: { icon: 'finish', text: '自动完成' },
      [PREBOOKING_EVENT_STATUS.CANCELED]: { icon: 'error', text: '已取消' }
    }
    const renderDescription = item => {
      if (item.nickName === null || item.organizationName === null) {
        return (
          <>
            <div>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>
            <div>{`${item.eventDetail}`}</div>
          </>
        )
      }
      return (
        <>
          <div>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>
          <div>{`${item.nickName}(${item.organizationName})`}</div>
        </>
      )
    }
    return (
      <Steps size="small" current={eventItems.length}>
        {
          eventItems.map(item => {
            const stepStatus = itemConfig[item.eventStatus]
            return <Step key={item.prebookingEventId} title={`${stepStatus.text}`} status={`${stepStatus.icon}`} description={renderDescription(item)} />
          })
        }
      </Steps>
    )
  }

  mapResponsibler = responsibleItems =>{
    let word = ''
    if (responsibleItems){
      word = responsibleItems.map(item=>item.responsibleName).join('、')
    }
    return word
  }

  render () {
    const { ready } = this.state
    const { projectName, createTime, prebookingRemark, prebookingNo, responsibleItems=[], acceptanceTime, prebookingStatus,
      shipmentName, shipmentContactName, shipmentContactPhone, deliveryItems = [], receivingItems = [], eventItems = [] } = this.props.preBooking
    const goodInfo = [...deliveryItems, ...receivingItems]

    return (
      <>
        {ready&&
          <>
            <Card full>
              <Card.Header
                title="预约单信息"
                extra={<span style={{ color: '#FD400F', fontSize: '14px' }}>{getPreBookingStauts(prebookingStatus)[0]._word}</span>}
              />
              <Card.Body>
                <List className="pick-list">
                  <List.Item extra={`${projectName}`}>项目名称</List.Item>
                  <List.Item extra={this.mapResponsibler(responsibleItems)}>项目负责人</List.Item>
                  <List.Item extra={`${prebookingNo}`}>预约单号</List.Item>
                  <List.Item extra={`${moment(createTime).format('YYYY-MM-DD')}`}>下单时间</List.Item>
                  <List.Item extra={`${moment(acceptanceTime).format('YYYY-MM-DD')}`}>要求送达时间</List.Item>
                  <List.Item multipleLine>备注<List.Item.Brief>{`${prebookingRemark||'无'}`}</List.Item.Brief></List.Item>
                </List>
              </Card.Body>
            </Card>
            <List className="pick-list">
              <List.Item extra={`${shipmentName}`}>承运方</List.Item>
              <List.Item extra={`${shipmentContactName}`}>负责人</List.Item>
              <List.Item extra={`${shipmentContactPhone}`}>联系电话</List.Item>
            </List>
            <WhiteSpace size='lg' />
            <PrebookingInfoStep dataSource={goodInfo} />
            <WhiteSpace size="lg" />
            <Card full>
              <Card.Header
                title="预约单事件"
              />
              <Card.Body>
                {this.renderEvent(eventItems)}
              </Card.Body>
            </Card>
          </>
        }
      </>
    )
  }
}
/* <WhiteSpace size='lg' />
<Card full>
  <Card.Header
    title="异常信息"
  />
  <Card.Body>
    <List>
      <List.Item extra='司机拒绝运单'>异常类型</List.Item>
      <List.Item extra='2019.02.02 10：30'>提交时间</List.Item>
      <List.Item multipleLine>异常描述<List.Item.Brief>备注信息备注信息备注信息备注信息备注信息备</List.Item.Brief></List.Item>
      <List.Item extra='需求运单'>处理方案</List.Item>
      <List.Item extra='赵鑫'>处理人员</List.Item>
      <List.Item extra='2019.02.02 10：30'>处理时间</List.Item>
    </List>
  </Card.Body>
</Card> */
