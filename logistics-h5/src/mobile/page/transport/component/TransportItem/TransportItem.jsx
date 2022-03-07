import React from 'react'
import { WingBlank, WhiteSpace, Card, Modal, Button, Toast } from 'antd-mobile'
import router from 'umi/router'
import moment from 'moment'
import { connect } from 'dva'
import Authorized from '@/utils/Authorized'
import { find } from '@/utils/utils'
import orderPic from '@/assets/prebook_icon.png'
import { getTransportStatus, translateTransportStauts } from '@/services/project'
import LeftWhiteSpaceList from '@/mobile/page/component/LeftWhiteSpaceList'
import deliveryPic from '@/assets/delivery_icon.png'
import receivingPic from '@/assets/receiving_icon.png'
import { IS_EFFECTIVE_STATUS, EXECPTION_STATUS, TRANSPORT_FINAL_STATUS } from '@/constants/project/project'
import { changeTransportStatus, getExceptions, getTransportProcesses, getTransport as getTransportDetail } from '@/services/apiService'
import auth from '@/constants/authCodes'
import model from '@/models/mobileTransport'
import { getUserInfo } from '@/services/user'
import nativeApi from '@/utils/nativeApi'
import ReceivingInfo from './ReceivingInfo'
import DeliveryInfo from './DeliveryInfo'

const { actions: { getMobileTransport } } = model
const { alert } = Modal
const {
  TRANSPORT_MODIFY,
  TRANSPORT_DELETE,
  TRANSPORT_JUDGE_RECEIPT,
  TRANSPORT_JUDGE_EXCEPTION,
  TRANSPORT_SHIPMENT_MODIFY_RECEIPT
} = auth

function mapStateToProps (state) {
  return {
    goodsUnits: state.dictionaries.items
  }
}
@connect(mapStateToProps, { getMobileTransport })
export default class Item extends React.Component {


  organizationType = +getUserInfo().organizationType

  getPoint = async (transportId) => {
    const { items: pointArray } = await getTransportProcesses(transportId)
    // TODO 常量需要收入constants文件，pointType点位类型。1:接受点 2:装货点 3:到站点 4:签收点 5. 提货点 6.卸货点
    // return pointArray.filter(item => item.pointType !== 1)
    return pointArray
  }

  getTransportDetail = async (transportId) => {
    const transportDetail = await getTransportDetail(transportId)
    return transportDetail
  }

  getEjdObject = async (item) => {
    const points = await this.getPoint(item.transportId)
    const entity = await this.getTransportDetail(item.transportId)
    const { serviceId, trackDentryid, terminalId, receivingTime } = item
    const _startTime = item.deliveryTime
    const startTime = _startTime? moment(_startTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ'): moment().subtract(1, 'seconds').format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    const noFencePoint = points.filter(item=>item.pointType!==5&&item.pointType!==6).map(({ longitude, latitude, pointType })=>({ longitude, latitude, pointType, isOpenFence:false, radius:0 }))
    const receivingPoint = entity.signItems.map(item=>({
      longitude:item.receivingLongitude,
      latitude:item.receivingLatitude,
      pointType:6,
      radius:item.radius||0,
      isOpenFence:item.isOpenFence||false }))
    const deliveryPoint = entity.deliveryItems.map(({ longitude, latitude, isOpenFence, radius })=>({
      longitude,
      latitude,
      isOpenFence:isOpenFence||false,
      radius:radius||0,
      pointType:5
    }))
    const _points = [ ...noFencePoint, ...receivingPoint, ...deliveryPoint ]
    let endTime
    if (receivingTime === null) {
      endTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    } else {
      endTime = moment(receivingTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    }
    const ejdObject = { serviceId, trackDentryid, terminalId, points:_points, startTime, endTime, carNo: item.plateNumber }
    console.log(ejdObject)
    return JSON.stringify(ejdObject)
  }

  getMobileTransport = () => {
    const { refresh } = this.props
    return refresh()
  }

  jumpToTransportDetail = () => {
    const { item: { transportId } } = this.props
    router.push(`transportDetail?transportId=${transportId}`)
  }

  renderCardTitle = () => {
    const { item } = this.props
    const { projectName } = item
    const transportStatus = getTransportStatus(item)[0] || { word: '' }
    return (
      <div style={{ width: '100%' }}>
        <span style={{ display: 'inline-block', width: '74%', fontSize: '16px' }}>{projectName}</span>
        <span style={{ marginTop: '2px', color: '#999', fontSize: '14px', float: 'right' }}>{transportStatus.word}</span>
      </div>
    )
  }

  renderOperations = () => {
    const { item, type } = this.props
    const { transportId } = item
    const status = translateTransportStauts(item)

    const operations = {
      [TRANSPORT_FINAL_STATUS.UNTREATED]: [
        {
          title: '取消运单',
          onClick: (e) => {
            e.stopPropagation()
            alert('取消运单', '您确认要取消该运单？', [
              { text: '再看看' },
              {
                text: '确认取消', onPress: () => {
                  changeTransportStatus({ transportId, iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_DELETE })
                    .then(() => this.getMobileTransport())
                    .then(() => Toast.success('运单取消成功', 1))
                }
              }
            ])
          },
          // TODO取消运单权限暂由删除权限代替
          auth: [TRANSPORT_DELETE]
        }
      ],
      [TRANSPORT_FINAL_STATUS.ACCEPT]: [],
      [TRANSPORT_FINAL_STATUS.DRIVER_REFUSE]: [],
      [TRANSPORT_FINAL_STATUS.CANCEL]: [],
      [TRANSPORT_FINAL_STATUS.CONSIGNMENT_REFUSE]: [
        {
          title: '运输轨迹',
          className: 'mr-10',
          onClick: (e) => {
            e.stopPropagation()
            this.getEjdObject(item)
              .then(ejdObject => {
                nativeApi.onShowTrack(ejdObject)
              })
          }
        },
        // {
        //   title: '拒绝',
        //   confirmMessage: () => `拒绝后单据由司机重新上传，确认拒绝吗？`,
        //   auth:[TRANSPORT_SHIPMENT_MODIFY_RECEIPT],
        //   onClick: async (e) =>{
        //     e.stopPropagation()
        //     const transportReject = await getTransportRejects(item.transportId)
        //     const { items } = transportReject
        //     const deliveryPointItem = items.filter(item=>item.pointType===2).map(item=>({ verifyObjectId:item.processPointId, verifyReason:item.verifyReason }))
        //     const receivingPointItem = items.filter(item=>item.pointType===4).map(item=>({ verifyObjectId:item.processPointId, verifyReason:item.verifyReason }))
        //     auditedReceipt({ transportId:item.transportId, deliveryPointItem, receivingPointItem, shipmentReceiptStatus:2, shipmentRejectStatus:item.consignmentRejectStatus })
        //       .then(()=>{
        //         Toast.success('已成功拒绝运单，后将由司机重新上传', 1)
        //       })
        //   }
        // },
        {
          title: '修改回单',
          auth:[TRANSPORT_SHIPMENT_MODIFY_RECEIPT],
          onClick: async (e) =>{
            e.stopPropagation()
            nativeApi.onShipmentResign(+item.transportId)
          }
        }
      ],
      [TRANSPORT_FINAL_STATUS.COMPLETE]: [
        {
          title: '运输轨迹',
          onClick: (e) => {
            e.stopPropagation()
            this.getEjdObject(item)
              .then(ejdObject => {
                nativeApi.onShowTrack(ejdObject)
              })
          }
        }
      ],
      [TRANSPORT_FINAL_STATUS.SHIPMENT_REFUSE]: [
        {
          title: '运输轨迹',
          onClick: (e) => {
            e.stopPropagation()
            this.getEjdObject(item)
              .then(ejdObject => {
                nativeApi.onShowTrack(ejdObject)
              })
          }
        }
      ],
      [TRANSPORT_FINAL_STATUS.UNDELIVERY]: [
        {
          title: '运输轨迹',
          onClick: (e) => {
            e.stopPropagation()
            this.getEjdObject(item)
              .then(ejdObject => {
                nativeApi.onShowTrack(ejdObject)
              })
          }
        }
      ],
      [TRANSPORT_FINAL_STATUS.TRANSPORTING]: [
        {
          title: '运输轨迹',
          onClick: (e) => {
            e.stopPropagation()
            this.getEjdObject(item)
              .then(ejdObject => {
                nativeApi.onShowTrack(ejdObject)
              })
          }
        }
      ],
      [TRANSPORT_FINAL_STATUS.RECEIVED]: [
        {
          title: '运输轨迹',
          onClick: (e) => {
            e.stopPropagation()
            this.getEjdObject(item)
              .then(ejdObject => {
                nativeApi.onShowTrack(ejdObject)
              })
          }
        }
      ],
      [TRANSPORT_FINAL_STATUS.SIGNED]: [
        {
          title: '审核',
          onClick: (e) => {
            e.stopPropagation()
            router.push(`transportAudited?transportId=${transportId}`)
          },
          // auth:(this.organizationType === 4)? [TRANSPORT_JUDGE_RECEIPT]:['hide']
        },
        {
          title: '运输轨迹',
          onClick: (e) => {
            e.stopPropagation()
            this.getEjdObject(item)
              .then(ejdObject => {
                nativeApi.onShowTrack(ejdObject)
              })
          }
        }
      ],
      // TODO 这里需要一个判断，是否已提货，5.15确认后不需判断，5.30再次核对需求，需要判断是否已提货，若多提，则可以通过修改来去除未提的提货点
      [TRANSPORT_FINAL_STATUS.TRANSPORT_EXECPTION]: [
        {
          title: '取消运单',
          onClick: (e) => {
            e.stopPropagation()
            alert('取消运单', '您确认要取消该运单？', [
              { text: '再看看' },
              {
                text: '确认取消', onPress: () => {
                  getExceptions({ transportId, isProcessing: true })
                    .then(data => changeTransportStatus({ transportId, transpotExceptionId: data.items[0].transpotExceptionId, iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_DELETE }))
                    .then(() => this.getMobileTransport({ type, limit: 500, offset: 0 }))
                    .then(() => Toast.success('运单取消成功', 1))
                }
              }
            ])
          },
          auth: [TRANSPORT_DELETE]
        },
        {
          title: '修改运单',
          onClick: (e) => {
            e.stopPropagation()
            router.push(`transportModify?transportId=${transportId}`)
          },
          auth: [TRANSPORT_MODIFY]
        },
        {
          title: '忽略',
          onClick: (e) => {
            e.stopPropagation()
            alert('忽略运单', '您确认要忽略该运单？', [
              { text: '再看看' },
              {
                text: '确认忽略', onPress: () => {
                  getExceptions({ transportId, isProcessing: true })
                    .then(data =>
                      changeTransportStatus({ transportId, transpotExceptionId: data.items[0].transpotExceptionId, exceptionStatus: EXECPTION_STATUS.EXECPTION_REFUSE })
                    )
                    .then(() => this.getMobileTransport({ type, limit: 500, offset: 0 }))
                    .then(() => Toast.success('运单忽略异常成功', 1))
                }
              }
            ])
          },
          auth: [TRANSPORT_JUDGE_EXCEPTION]
        }
      ],
      [TRANSPORT_FINAL_STATUS.SHIPMENT_AUDITED]: [
        {
          title: '运输轨迹',
          onClick: (e) => {
            e.stopPropagation()
            this.getEjdObject(item)
              .then(ejdObject => {
                nativeApi.onShowTrack(ejdObject)
              })
          }
        },
        {
          title: '审核',
          onClick: (e) => {
            e.stopPropagation()
            router.push(`transportAudited?transportId=${transportId}`)
          },
          auth: this.organizationType === 4 ? [TRANSPORT_JUDGE_RECEIPT] : ['hide']
        },
      ],
    }[status] || []
    return operations.map((item, index) => (
      <Authorized key={index} authority={item.auth}>
        <Button type="ghost" inline size="small" className={item.className} onClick={item.onClick} style={{ marginRight: '4px' }}>{item.title}</Button>
      </Authorized>
    ))
  }

  render () {
    const { item } = this.props
    const DeliveryList = LeftWhiteSpaceList(DeliveryInfo)
    const ReceivingList = LeftWhiteSpaceList(ReceivingInfo)
    return (
      <WingBlank size='lg'>
        <WhiteSpace size="md" />
        <Card className="card-block no-division" onClick={this.jumpToTransportDetail}>
          <Card.Header
            title={this.renderCardTitle()}
            thumb={<img width='18' height='18' src={orderPic} />}
          />
          <Card.Body>
            <div style={{ color:'gray', fontSize:'13px', marginBottom:'3px' }}>{`运单号：${item.transportNo}`}</div>
            <WhiteSpace size="lg" />
            <DeliveryList dataSource={item} imgSrc={<img src={deliveryPic} width="20" height="20" />} />
            <ReceivingList dataSource={item} imgSrc={<img src={receivingPic} width="20" height="20" />} />
          </Card.Body>
          <Card.Footer style={{ textAlign: 'right' }} content={this.renderOperations()} />
        </Card>
      </WingBlank>
    )
  }
}
