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
      title: '取消预约',
      className: 'ghost',
      onClick: (e) => {
        e.stopPropagation()
        alert('取消预约单', '您确认要取消该运单？', [
          { text: '再看看' },
          {
            text: '确认取消', onPress: () => {
              this.patchMobilePrebooking({ shipmentId, prebookingId, prebookingStatus: PREBOOKING_STAUTS.CANCELED })
                .then(() => this.refresh())
                .then(() => Toast.success('预约单取消成功', 1))
            }
          },
        ])
      },
      auth: [PREBOOKING_CANCEL]
    }

    const modify = {
      title: '修改',
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
      title: '拒绝',
      className: 'ghost',
      onClick: (e) => {
        e.stopPropagation()
        prompt('拒绝理由', '请填写拒绝理由', [
          { text: '取消' },
          {
            text: '确认提交', onPress: value => {
              this.patchMobilePrebooking({ shipmentId, prebookingId, prebookingStatus: PREBOOKING_STAUTS.REFUSE, rejectReason: value })
                .then(() => this.refresh())
                .then(() => Toast.success('预约单拒绝成功', 1))
            }
          }
        ])
      },
      auth: [DISPATCH_REJECT]
    }

    const dispatch = {
      title: '调度',
      className: 'primary',
      onClick: (e) => {
        e.stopPropagation()
        router.push(`createDispatch?prebookingId=${prebookingId}`)
      },
      auth: releaseHall?['hide']:[DISPATCH_DISPATCHING]
    }

    const over = {
      title: '完结',
      className: 'primary',
      onClick: (e) => {
        e.stopPropagation()
        alert('', '已派车的货物将继续执行，剩余数量将不可再安排调度，确定要完结吗？', [
          { text: <span style={{ fontSize: '14px' }}>取消</span> },
          {
            text: <span style={{ fontSize: '14px' }}>确认完结</span>, onPress: () => {
              this.patchMobilePrebooking({ shipmentId, prebookingId, prebookingStatus: PREBOOKING_STAUTS.COMPLETE })
                .then(() => this.refresh())
                .then(() => Toast.success('预约单完结成功', 1))
            }
          },
        ])
      },
      auth: [PREBOOKING_COMPLETE]
    }

    const filterTransport = {
      title: '运单',
      className: 'ghost',
      onClick: (e) => {
        e.stopPropagation()
        router.push(`transportList?prebookingId=${prebookingId}`)
      },
    }

    const deletePrebooking = {
      title: '删除',
      className: 'primary',
      onClick: (e) => {
        e.stopPropagation()
        alert('删除预约单', '您确认要删除该预约单？', [
          { text: '再看看' },
          {
            text: '确认删除', onPress: () => {
              this.patchMobilePrebooking({ shipmentId, prebookingId, isEffect: 0 })
                .then(() => this.refresh())
                .then(() => Toast.success('预约单删除成功', 1))
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
            <div style={{ color: 'gray', fontSize: '13px', marginBottom: '3px' }}>{`预约单号：${item.prebookingNo}`}</div>
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
