import React from 'react'
import router from 'umi/router'
import { WingBlank, WhiteSpace, Card, Modal, Button, Toast } from 'antd-mobile'
import { connect } from 'dva'
import { getPreBookingStauts } from '@/services/project'
import orderPic from '@/assets/prebook_icon.png'
import { FORM_MODE } from '@/components/MobileForm'
import LeftWhiteSpaceList from '@/mobile/page/component/LeftWhiteSpaceList'
import deliveryPic from '@/assets/delivery_icon.png'
import receivingPic from '@/assets/receiving_icon.png'
import Authorized from '@/utils/Authorized'
import { PREBOOKING_STAUTS } from '@/constants/project/project'
import model from '@/models/mobilePrebooking'
import auth from '@/constants/authCodes'
import ReceivingInfo from './ReceivingInfo'
import DeliveryInfo from './DeliveryInfo'

const { actions: { getMobilePrebooking, patchMobilePrebooking } } = model
const { prompt } = Modal
const { alert } = Modal
const {
  PREBOOKING_MODIFY,
  PREBOOKING_DELETE,
  PREBOOKING_CANCEL,
  PREBOOKING_COMPLETE,
  DISPATCH_DISPATCHING,
  DISPATCH_REJECT
} = auth

@connect(null, { patchMobilePrebooking, getMobilePrebooking })
export default class PrebookingItem extends React.Component {

  patchMobilePrebooking = params => this.props.patchMobilePrebooking(params)

  refresh = () => {
    const { refresh } = this.props
    return refresh()
  }

  jumpToDetail = () => {
    const { item: { prebookingId } } = this.props
    router.push(`prebookingDetail?prebookingId=${prebookingId}`)
  }

  renderCardTitle = () => {
    const { item: { projectName, prebookingStatus } } = this.props
    const { _word } = getPreBookingStauts(prebookingStatus)[0] || { _word: '' }

    return (
      <div style={{ width: '100%' }}>
        <span style={{ display: 'inline-block', width: '75%', fontSize: '16px' }}>{projectName}</span>
        <span style={{ marginTop: '2px', color: '#999', fontSize: '14px', float: 'right' }}>{_word}</span>
      </div>
    )
  }

  renderOperations = () => {
    const { item: { prebookingStatus, shipmentId, prebookingId, goodsPlanId, logisticsBusinessTypeEntity } = {} } = this.props
    const { releaseHall } = logisticsBusinessTypeEntity || {}

    const cancel = {
      title: '????????????',
      className: 'ghost',
      onClick: (e) => {
        e.stopPropagation()
        alert('???????????????', '??????????????????????????????', [
          { text: '?????????' },
          {
            text: '????????????', onPress: () => {
              this.patchMobilePrebooking({ shipmentId, prebookingId, prebookingStatus: PREBOOKING_STAUTS.CANCELED })
                .then(() => this.refresh())
                .then(() => Toast.success('?????????????????????', 1))
            }
          },
        ])
      },
      auth: [PREBOOKING_CANCEL]
    }

    const modify = {
      title: '??????',
      className: 'primary',
      onClick: (e) => {
        e.stopPropagation()
        if (goodsPlanId){
          router.push(`createPrebookingByGoodsPlan?prebookingId=${prebookingId}&goodsPlanId=${goodsPlanId}&mode=${FORM_MODE.MODIFY}`)
        } else {
          router.push(`createPrebooking?prebookingId=${prebookingId}&mode=${FORM_MODE.MODIFY}`)
        }
      },
      auth: [PREBOOKING_MODIFY]
    }

    const refuse = {
      title: '??????',
      className: 'ghost',
      onClick: (e) => {
        e.stopPropagation()
        prompt('????????????', '?????????????????????', [
          { text: '??????' },
          {
            text: '????????????', onPress: value => {
              this.patchMobilePrebooking({ shipmentId, prebookingId, prebookingStatus: PREBOOKING_STAUTS.REFUSE, rejectReason: value })
                .then(() => this.refresh())
                .then(() => Toast.success('?????????????????????', 1))
            }
          }
        ])
      },
      auth: [DISPATCH_REJECT]
    }

    const dispatch = {
      title: '??????',
      className: 'primary',
      onClick: (e) => {
        e.stopPropagation()
        router.push(`createDispatch?prebookingId=${prebookingId}`)
      },
      auth: releaseHall?['hide']:[DISPATCH_DISPATCHING]
    }

    const over = {
      title: '??????',
      className: 'primary',
      onClick: (e) => {
        e.stopPropagation()
        alert('', '????????????????????????????????????????????????????????????????????????????????????????????????', [
          { text: <span style={{ fontSize: '14px' }}>??????</span> },
          {
            text: <span style={{ fontSize: '14px' }}>????????????</span>, onPress: () => {
              this.patchMobilePrebooking({ shipmentId, prebookingId, prebookingStatus: PREBOOKING_STAUTS.COMPLETE })
                .then(() => this.refresh())
                .then(() => Toast.success('?????????????????????', 1))
            }
          },
        ])
      },
      auth: [PREBOOKING_COMPLETE]
    }

    const filterTransport = {
      title: '??????',
      className: 'ghost',
      onClick: (e) => {
        e.stopPropagation()
        router.push(`transportList?prebookingId=${prebookingId}`)
      },
    }

    const deletePrebooking = {
      title: '??????',
      className: 'primary',
      onClick: (e) => {
        e.stopPropagation()
        alert('???????????????', '?????????????????????????????????', [
          { text: '?????????' },
          {
            text: '????????????', onPress: () => {
              this.patchMobilePrebooking({ shipmentId, prebookingId, isEffect: 0 })
                .then(() => this.refresh())
                .then(() => Toast.success('?????????????????????', 1))
            }
          }
        ])
      },
      auth: [PREBOOKING_DELETE]
    }

    const operations = {
      [PREBOOKING_STAUTS.UNCERTAINTY]: [cancel, modify, refuse, dispatch],
      [PREBOOKING_STAUTS.UNCOMPLETED]: [filterTransport, over, dispatch],
      [PREBOOKING_STAUTS.COMPLETE]: [filterTransport],
      [PREBOOKING_STAUTS.REFUSE]: [cancel, modify],
      [PREBOOKING_STAUTS.CANCELED]: [deletePrebooking]
    }[prebookingStatus] || []
    return operations.map((item, index) => (
      <Authorized key={index} authority={item.auth}>
        <Button className={item.className || ''} inline size="small" onClick={item.onClick} style={{ marginLeft: '15px' }}>{item.title}</Button>
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
        <Card className="card-block no-division" onClick={this.jumpToDetail}>
          <Card.Header
            title={this.renderCardTitle()}
            thumb={<img width='18' height='18' alt='' src={orderPic} />}
          />
          <Card.Body>
            <div style={{ color: 'gray', fontSize: '13px', marginBottom: '3px' }}>{`???????????????${item.prebookingNo}`}</div>
            <WhiteSpace size="lg" />
            <DeliveryList dataSource={item} imgSrc={<img src={deliveryPic} width="20" alt='' height="20" />} />
            <ReceivingList dataSource={item} imgSrc={<img src={receivingPic} width="20" alt='' height="20" />} />
          </Card.Body>
          <Card.Footer style={{ textAlign: 'right' }} content={this.renderOperations()} />
        </Card>
      </WingBlank>
    )
  }
}
