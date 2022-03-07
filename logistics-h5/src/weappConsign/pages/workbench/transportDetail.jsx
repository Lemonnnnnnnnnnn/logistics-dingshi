import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import router from 'umi/router'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Toast, Button, WhiteSpace, List, InputItem, Tabs, div } from 'antd-mobile'
import TrackMap from '@/components/TrackMap/TrackMap'
import { getTransport, changeTransportStatus, auditDelivery } from '@/services/apiService'
import copyable from '@/assets/driver/copyable.png'
import phoneCall from '@/assets/driver/phoneCall.png'
import complete from '@/assets/driver/complete.png'
import heading from '@/assets/driver/heading.png'
import cancel from '@/assets/driver/cancel.png'
import {
  EXECPTION_STATUS,
  IS_EFFECTIVE_STATUS,
  TRANSPORT_ENVENT_STATUS,
} from '@/constants/project/project'
import { unit } from '@/constants/prebooking/prebooking'
import { sortBy, isFunction, unitPrice } from '@/utils/utils'
import { TRANSPORTIMMEDIATESTATUS } from '@/constants/transport/transport'
import UpLoadImage from '@/weapp/component/UpLoadImage'
import TransportListInfo from './component/step'
import styles from './transportDetail.less'
import SignAudit from './component/SignAudit'

const { Item } = List

@CSSModules(styles, { allowMultiple: true })
export default class TransportDetail extends Component {
  state = {
    isCopy: true,
    ready: false,
    initialPage: 0,
  }

  tabs = [
    { title: '运单事件', index: 0 },
    { title: '运单轨迹', index: 1 },
  ]

  componentDidMount () {
    const { location: { query: { transportId } } } = this.props
    getTransport(transportId).then(data => {
      if (`${data.consignmentOrganizationId}` !== `${JSON.parse(localStorage.getItem('token')).organizationId}`) {
        return Toast.fail('您无权限查看该运单', 1.5, () => {
          router.replace('/WeappConsign/main/personalCenter')
        })
      }
      this.setState({
        detail: data,
        ready: true,
      })
    })
      .catch(({ code }) => {
        if (code === 'LOGISTICS/TOKEN_ERROR') {
          router.replace('/WeappConsign/login')
        }
      })
  }

  onCopy = () => {
    Toast.success('已复制运单号到剪切板', 1)
    this.setState({
      isCopy: false,
    })
  }

  circle = (styleName) => (
    <div styleName='circle_container'>
      <div styleName={styleName} />
    </div>
  )

  stop = e => {
    e.stopPropagation()
  }

  renderStatusPicture = () => {
    const { detail } = this.state
    let dom
    switch (detail.transportImmediateStatus) {
      case TRANSPORTIMMEDIATESTATUS.CANCEL:
        dom = <img styleName='statusPic' src={cancel} alt='图片加载失败' />
        break
      case TRANSPORTIMMEDIATESTATUS.COMPLETE:
        dom = <img styleName='statusPic' src={complete} alt='图片加载失败' />
        break
      default:
        dom = <span />
    }
    return dom
  }

  refresh = () =>{
    const {
      detail: {
        transportId,
      },
    } = this.state
    getTransport(transportId).then(data =>{
      this.setState({
        detail: data,
        ready: true,
      })
    })
  }

  renderOperation = () => {
    const {
      detail: {
        transportImmediateStatus,
        exceptionItems,
        transportId,
        deliveryItems,
        signItems,
        logisticsBusinessTypeEntity,
        consignmentRejectStatus
      },
    } = this.state
    // eventsData.sort(event=>moment(event.createTime)-moment(event.createTime))
    const exceptions = () => {
      const item = sortBy(exceptionItems, 'createTime')[0]
      const refuseException = () => {
        changeTransportStatus({
          transportId,
          transpotExceptionId: item.transpotExceptionId,
          exceptionStatus: EXECPTION_STATUS.EXECPTION_REFUSE,
        })
          .then(() => getTransport(transportId))
          .then(data => {
            this.setState({
              detail: data,
              ready: true,
            })
          })
      }
      const agreeException = () => {
        changeTransportStatus({
          transportId,
          transpotExceptionId: item.transpotExceptionId,
          iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_DELETE,
        })
          .then(() => getTransport(transportId))
          .then(data => {
            this.setState({
              detail: data,
              ready: true,
            })
          })
      }
      return (
        <div styleName='shadow modal_box'>
          <div styleName='cardType'>
            <span styleName='exception_audit'>异常审核</span>
          </div>
          <div>
            <h3 styleName='exception_title'>{item.exceptionReasonCN}</h3>
            <div styleName='exception_content'>{item.exceptionExplain}</div>
          </div>
          <div styleName='exception_operation'>
            <Button inline size='small' onClick={refuseException} styleName='list_button refuse'>拒绝</Button>
            <Button inline size='small' onClick={agreeException} styleName='list_button agree'>同意</Button>
          </div>
        </div>
      )
    }

    const signAudit = () =>
      <SignAudit
        transportId={transportId}
        signItems={signItems}
        deliveryItems={deliveryItems}
        logisticsBusinessTypeEntity={logisticsBusinessTypeEntity}
        consignmentRejectStatus={consignmentRejectStatus}
        refresh={this.refresh}
      />

    const deliveryAudit = () => {
      const { measurementUnit } = logisticsBusinessTypeEntity || {}
      const numChange = (value, processPointId) => {
        // const reg = /^\d+(\.\d+)?$/
        this[processPointId] = value
      }
      const totalChange = (total) => {
        this.totalPrice = total
      }
      const info = deliveryItems.map(item => (
        <List renderHeader={() => `${item.categoryName}${item.goodsName}`}>
          <InputItem
            style={{ textAlign: 'right' }}
            onChange={value => numChange(value, item.processPointId)}
            defaultValue={item.deliveryNum}
            extra={`${item.deliveryUnitCN}`}
          >
            提货重量
          </InputItem>
          <Item extra={`${item.freightPriceConsignment}${unit[measurementUnit]?.label}`}>
            运输费用
          </Item>
        </List>
      ))
      const totalPrice = deliveryItems.reduce((tatal, current) => {
        const { deliveryNum, freightPriceConsignment } = current
        return tatal + deliveryNum * freightPriceConsignment
      }, 0)
      const agreeAudit = () => {
        let check = true
        const reg = /^\d+(\.\d+)?$/
        const deliveryPointItem = deliveryItems.map(item => {
          console.log(this[item.processPointId], this.totalPrice, this)
          if (this[item.processPointId] && !reg.test(this[item.processPointId])) {
            check = false
          }
          if (this.totalPrice && !reg.test(this.totalPrice)) {
            check = false
          }
          return {
            verifyObjectId: item.processPointId,
            deliveryNum: +this[item.processPointId] || item.deliveryNum,
            freightPrice: item.freightPriceConsignment,
          }
        })
        if (!check) return Toast.fail('请输入正确的价格')
        auditDelivery({
          consignmentReceiptStatus: 3,
          deliveryPointItem,
          transportId,
          transportCost: this.totalPrice || totalPrice,
        })
          .then((orderId) => {
            if (orderId) {
              router.push(`/WeappConsign/paymentBill/detail?orderId=${orderId}&completeBack=1`)
              return false
            }
            return getTransport(transportId)
          })
          .then(data => {
            if (!data) return
            this.setState({
              detail: data,
              ready: true,
            })
          })
      }
      const refuseAudit = () => {
        const deliveryPointItem = deliveryItems.map(item => ({
          verifyObjectId: item.processPointId,
          deliveryNum: item.deliveryNum,
          freightPrice: item.freightPriceConsignment,
          verifyReason: '审核不通过',
        }))
        auditDelivery({ consignmentReceiptStatus: 2, deliveryPointItem, transportId })
          .then(() => getTransport(transportId))
          .then(data => {
            this.setState({
              detail: data,
              ready: true,
            })
          })
      }
      return (
        <div styleName='shadow modal_box'>
          <div styleName='cardType'>
            <span styleName='sign_audit'>提货签收</span>
          </div>
          <div className='detail_delivery_info_list'>
            <h3 styleName='exception_title'>提货签收</h3>
            {info}
            <InputItem
              onChange={value => totalChange(value)}
              style={{ textAlign: 'right' }}
              defaultValue={totalPrice}
              extra='元'
            >
              预估总价
            </InputItem>
          </div>
          <div styleName='exception_operation flex_content' style={{ marginTop: '10px' }}>
            <Button inline size='small' onClick={refuseAudit} styleName='list_button half_width refuse'>拒绝</Button>
            <Button inline size='small' onClick={agreeAudit} styleName='list_button half_width agree'>同意</Button>
          </div>
        </div>
      )
    }
    const operations = {
      [TRANSPORTIMMEDIATESTATUS.UNTREATED]: [],
      [TRANSPORTIMMEDIATESTATUS.ACCEPT]: [],
      [TRANSPORTIMMEDIATESTATUS.CANCEL]: [],
      [TRANSPORTIMMEDIATESTATUS.COMPLETE]: [],
      [TRANSPORTIMMEDIATESTATUS.UNDELIVERY]: [],
      [TRANSPORTIMMEDIATESTATUS.RECEIVED]: [],
      [TRANSPORTIMMEDIATESTATUS.TRANSPORTING]: [],
      [TRANSPORTIMMEDIATESTATUS.CUSTOMER_REFUSE]: [],
      [TRANSPORTIMMEDIATESTATUS.CUSTOMER_AUDITED]: [],
      [TRANSPORTIMMEDIATESTATUS.CONSIGNMENT_REFUSE]: [],
      [TRANSPORTIMMEDIATESTATUS.SIGNED]: [],
      [TRANSPORTIMMEDIATESTATUS.RESINGED]: [],
      [TRANSPORTIMMEDIATESTATUS.REFUSED]: [],
      [TRANSPORTIMMEDIATESTATUS.TRANSPORT_EXECPTION]: exceptions,
      [TRANSPORTIMMEDIATESTATUS.CUSTOMER_UNAUDITED]: [],
      [TRANSPORTIMMEDIATESTATUS.CONSIGNMENT_UNAUDITED]: signAudit,
      [TRANSPORTIMMEDIATESTATUS.UNJUDGE]: [],
      [TRANSPORTIMMEDIATESTATUS.JUDGE_REFUCE]: [],
      [TRANSPORTIMMEDIATESTATUS.CANCEL_APPLY]: [],
      [TRANSPORTIMMEDIATESTATUS.TRANSPORT_TIMEOUT]: [],
      [TRANSPORTIMMEDIATESTATUS.DELIVERY_UNAUDITED]: deliveryAudit,
      [TRANSPORTIMMEDIATESTATUS.DELIVERY_AUDITED_REFUSE]: [],
    }[transportImmediateStatus] || []
    return (
      <div styleName='operation_container'>
        {isFunction(operations) && operations()}
      </div>
    )
  }

  renderTransportEven = () => {
    const { detail: { eventItems } } = this.state
    const _eventItems = sortBy(eventItems, 'createTime')
    const eventDetailText = ({ eventStatus, eventDetail }) => {
      if (eventStatus !== TRANSPORT_ENVENT_STATUS.CAR_LOADING && eventStatus !== TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_AUDIT) return eventDetail || ''
      const keyIndex = eventDetail.indexOf('交货单号：')
      const firstRow = eventDetail.substr(0, keyIndex)
      const secondRow = eventDetail.substring(keyIndex)
      return (
        [
          <div>{firstRow}</div>,
          <div>{secondRow}</div>,
        ]
      )
    }
    const eventConfig = {
      [TRANSPORT_ENVENT_STATUS.PUBLISHED]: { icon: 'finish', role: '企', text: '发布运单' },
      [TRANSPORT_ENVENT_STATUS.ACCEPTED]: { icon: 'finish', text: '司机接单' },
      [TRANSPORT_ENVENT_STATUS.REFUSED]: { icon: 'error', text: '司机拒绝' },
      [TRANSPORT_ENVENT_STATUS.ACTION_START]: { icon: 'finish', text: '司机执行任务' },
      [TRANSPORT_ENVENT_STATUS.CAR_LOADING]: { icon: 'finish', text: '司机装车' },
      [TRANSPORT_ENVENT_STATUS.ARRIVE]: { icon: 'finish', text: '司机到站' },
      [TRANSPORT_ENVENT_STATUS.HANDLE_EXCEPTION]: { icon: 'wait', text: '提交异常' },
      [TRANSPORT_ENVENT_STATUS.EXCEPTION_PASS]: { icon: 'finish', role: '企', text: '异常审核通过' },
      [TRANSPORT_ENVENT_STATUS.EXCEPTION_INGORE]: { icon: 'error', role: '企', text: '异常审核不通过' },
      [TRANSPORT_ENVENT_STATUS.REDISPATCH]: { icon: 'wait', role: '企', text: '重新调度' },
      [TRANSPORT_ENVENT_STATUS.SIGNED]: { icon: 'finish', text: '司机签收' },
      [TRANSPORT_ENVENT_STATUS.RESINGED]: { icon: 'wait', text: '重新签收' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_RECEIPT_PASS]: { icon: 'finish', role: '企', text: '承运方回单审核通过' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_RECEIPT_REFUSE]: { icon: 'error', role: '企', text: '承运方回单审核不通过' },
      [TRANSPORT_ENVENT_STATUS.CONSIGNMENT_RECEIPT_PASS]: { icon: 'finish', role: '企', text: '托运方回单审核通过' },
      [TRANSPORT_ENVENT_STATUS.CONSIGNMENT_RECEIPT_REFUSE]: { icon: 'error', role: '企', text: '托运方回单审核不通过' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_MODIFY_RECEIPT]: { icon: 'wait', role: '企', text: '承运方修改回单' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_MODIFY_TRANSPORT]: { icon: 'wait', role: '企', text: '承运方修改运单' },
      [TRANSPORT_ENVENT_STATUS.CUSTOMER_RECEIPT_PASS]: { icon: 'finish', role: '企', text: '客户回单审核通过' },
      [TRANSPORT_ENVENT_STATUS.CUSTOMER_RECEIPT_REFUSE]: { icon: 'error', role: '企', text: '客户回单审核不通过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_DELIVERY_OUT_OF_FENSE]: { icon: 'wait', text: '司机围栏外提货' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_SIGN_OUT_OF_FENSE]: { icon: 'wait', text: '司机围栏外签收' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_CANCEL_TRANSPORT]: { icon: 'error', role: '企', text: '作废运单' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_ACCEPT_AUDIT]: { icon: 'wait', text: '司机接单待确认' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_ACCEPT_PASS]: { icon: 'wait', role: '企', text: '司机接单审核通过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_ACCEPT_REFUSE]: { icon: 'wait', role: '企', text: '司机接单审核不过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_AUTO_COMPLETE]: { icon: 'wait', role: '企', text: '司机提货后超时自动转完成' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_CANCEL_APPLY]: { icon: 'wait', text: '司机取消申请' },
      [TRANSPORT_ENVENT_STATUS.OVERTIME_CANCEL]: { icon: 'wait', role: '企', text: '运单超时自动关闭' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_AUDIT]: { icon: 'wait', text: '司机提货待审核' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_PASS]: { icon: 'wait', role: '企', text: '司机提货审核通过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_LOAD_REFUSE]: { icon: 'wait', role: '企', text: '司机提货审核不通过' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_MODIFY_LOAD_INFO]: { icon: 'wait', text: '司机修改提货审核' },
      [TRANSPORT_ENVENT_STATUS.DRIVER_APPLY_ACCEPT]: { icon: 'wait', text: '司机申请接单' },
      [TRANSPORT_ENVENT_STATUS.SHIPMENT_MODIFY_RECEIVING]: { icon: 'wait', text: '修改卸货点' },
    }
    return _eventItems.reverse().map(item => (
      <React.Fragment key={item.transportEventId}>
        <div>
          <span className='event_role'>{eventConfig[item.eventStatus].role || '司'}</span>
          <span className='event_time'>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
        </div>
        <div className='event_detail'>
          <div>{`${item.nickName || ''} ${item.organizationName || ''} ${eventConfig[item.eventStatus].text}`}</div>
          <div>{eventDetailText(item)}</div>
          {(item.pictureDentryid === null || item.pictureDentryid === '')
            ? item.pictureDentryid
            : this.renderPictures(item.pictureDentryid)
          }
        </div>
      </React.Fragment>
    ))
  }

  renderPictures = pictureDentryid => {
    const _pictureDentryid = pictureDentryid.split('<zf>').reverse() // [ 过磅单图片string, 签收单图片string ]
    const pictureArrays = _pictureDentryid.map(item => item.split(',')) // [ [过磅单图片数组], [签收单图片数组] ]
    return pictureArrays.map((pictureArray, index) =>
      (
        <React.Fragment key={index}>
          <UpLoadImage mode='detail' value={pictureArray} />
          <br />
        </React.Fragment>
      ),
    )
  }

  renderPickupTime = () => {
    const { detail } = this.state
    const deliveryTime = detail.eventItems.find(item => item.eventStatus === 5 || item.eventStatus === 30)?.createTime
    const tips = deliveryTime ? moment(deliveryTime).format('YYYY-MM-DD HH:mm:ss') : '无'
    return tips
  }

  renderTabsContent = (current) => {
    const { index = 0 } = current
    if (index === 0) {
      return (
        <div className='transport_detail_event_box'>
          <div styleName='line' />
          {this.renderTransportEven()}
        </div>
      )
    }
    if (index === 1) {
      const { detail } = this.state
      return (
        <div className='transport_detail_event_box'>
          <div styleName='line' />
          <TrackMap type='zhongjiao' {...detail} />
        </div>
      )
    }
  }

  render () {
    const { isCopy, ready, detail, initialPage } = this.state
    // const { logisticsBusinessTypeEntity: { releaseHall } } = detail
    return (
      ready
      &&
      <div styleName='container'>
        <div styleName='userInfo_box'>
          <div styleName='info_box'>
            <img src={heading} alt='图片加载失败' />
            <div>
              <p>{detail.driverUserName}</p>
              <p>
                <span>{detail.plateNumber}</span>
              </p>
              <p>
                <span>成交：{detail.driverFixtureNumber || 0}</span>
                <span />
                <span>好评率：{detail.driverFeedbackRate || '0%'}</span>
              </p>
            </div>
          </div>
          <Button
            href={`tel:${detail.logisticsBusinessTypeEntity.releaseHall === 1 ? detail.driverUserPhone : detail.createUserPhone}`}
            style={{ position: 'initial' }}
          >
            <img src={phoneCall} alt='图片加载失败' />
          </Button>
        </div>
        {this.renderOperation()}
        <div styleName='detail_box'>
          {this.renderStatusPicture()}
          <header>
            <span>运单号：</span>
            <span>{detail.transportNo}</span>
            {
              isCopy ?
                <div onClick={this.stop}>
                  <CopyToClipboard onCopy={this.onCopy} text={detail.transportNo}>
                    <img src={copyable} alt='图片加载失败' />
                  </CopyToClipboard>
                </div>
                :
                null
            }
          </header>
          <div styleName='line' />
          <TransportListInfo item={detail} />
          <div styleName='line0' />
          <div styleName='itemBox'>
            <p>装货时间: {this.renderPickupTime()}</p>
            <p>运输费用: {`${unitPrice(detail, 4)}`}</p>
          </div>
          {/* <div styleName='qrCode'>
            <img src={copyable} alt="二维码加载失败" />
          </div> */}
        </div>
        <WhiteSpace />
        <div styleName='detail_box'>
          <Tabs
            tabs={this.tabs}
            swipeable={false}
            // onChange={this.onChange}
            initialPage={initialPage}
            prerenderingSiblingsNumber={0}
            // renderTabBar={this.renderTabBar}
          >
            {this.renderTabsContent}
          </Tabs>
        </div>
      </div>
    )
  }
}
