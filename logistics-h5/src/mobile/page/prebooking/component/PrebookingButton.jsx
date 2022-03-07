import React, { Component } from 'react'
import { Button, Modal, Toast } from 'antd-mobile'
import auth from '@/constants/authCodes'
import { connect } from 'dva'
import model from '@/models/mobilePrebooking'
import Authorized from '@/utils/Authorized'
import { PREBOOKING_STAUTS } from '@/constants/project/project'
import { FORM_MODE } from '@/components/MobileForm';
import router from 'umi/router'

const prompt = Modal.prompt
const alert = Modal.alert

const { actions: { getMobilePrebooking, patchMobilePrebooking } } = model

const {
  PREBOOKING_CREATE,
  PREBOOKING_MODIFY,
  PREBOOKING_DELETE,
  PREBOOKING_CANCEL,
  PREBOOKING_COMPLETE,
  DISPATCH_DISPATCHING,
  DISPATCH_DELETE,
  DISPATCH_REJECT
} = auth

@connect(null, { patchMobilePrebooking, getMobilePrebooking })
export default class PrebookingButton extends Component {

  constructor(props) {
    super(props)
  }

  renderOperations = (record, tab) => {
    const { prebookingStatus } = tab
    const operations = {
      [PREBOOKING_STAUTS.UNCERTAINTY]: [{
        title: '取消预约',
        className: 'ghost',
        onClick: (e) => {
          e.stopPropagation()
          alert('取消预约单', '您确认要取消该运单？', [
            { text: '再看看' },
            {
              text: '确认取消', onPress: () => {
                this.props.patchMobilePrebooking({ shipmentId: record.shipmentId, prebookingId: record.prebookingId, prebookingStatus: PREBOOKING_STAUTS.CANCELED })
                  .then(() => this.props.getMobilePrebooking({ prebookingStatus }))
                  .then(() => Toast.success('预约单取消成功', 1))
              }
            },
          ])
        },
        auth: [PREBOOKING_CANCEL]
      }, {
        title: '修改',
        className: 'primary',
        onClick: (e) => {
          e.stopPropagation()
          router.push(`createPrebooking?prebookingId=${record.prebookingId}&mode=${FORM_MODE.MODIFY}`)
        },
        auth: [PREBOOKING_MODIFY]
      }, {
        title: '调度',
        className: 'primary',
        onClick: (e) => {
          e.stopPropagation()
          router.push(`createDispatch?prebookingId=${record.prebookingId}`)
        },
        auth: [DISPATCH_DISPATCHING]
      }, {
        title: '拒绝',
        className: 'ghost',
        onClick: (e) => {
          e.stopPropagation()
          prompt('拒绝理由', '请填写拒绝理由', [
            { text: '取消' },
            {
              text: '确认提交', onPress: value => {
                this.props.patchMobilePrebooking({ shipmentId: record.shipmentId, prebookingId: record.prebookingId, prebookingStatus: PREBOOKING_STAUTS.REFUSE, rejectReason: value })
                  .then(() => this.props.getMobilePrebooking({ prebookingStatus }))
                  .then(() => Toast.success('预约单拒绝成功', 1))
              }
            }
          ])
        },
        auth: [DISPATCH_REJECT]
      }],
      [PREBOOKING_STAUTS.UNCOMPLETED]: [{
        title: '运单',
        className: 'ghost',
        onClick: (e) => {
          e.stopPropagation()
          router.push(`transportList?prebookingId=${record.prebookingId}`)
        },
      }, {
        title: '完结',
        className: 'primary',
        onClick: (e) => {
          e.stopPropagation()
          alert('', '已派车的货物将继续执行，剩余数量将不可再安排调度，确定要完结吗？', [
            { text: <span style={{ fontSize: '14px' }}>取消</span> },
            {
              text: <span style={{ fontSize: '14px' }}>确认完结</span>, onPress: () => {
                this.props.patchMobilePrebooking({ shipmentId: record.shipmentId, prebookingId: record.prebookingId, prebookingStatus: PREBOOKING_STAUTS.COMPLETE })
                  .then(() => this.props.getMobilePrebooking({ prebookingStatus }))
                  .then(() => Toast.success('预约单完结成功', 1))
              }
            },
          ])
        },
        auth: [PREBOOKING_COMPLETE]
      }, {
        title: '调度',
        className: 'primary',
        onClick: (e) => {
          e.stopPropagation()
          router.push(`createDispatch?prebookingId=${record.prebookingId}`)
        },
        auth: [DISPATCH_DISPATCHING]
      }],
      [PREBOOKING_STAUTS.COMPLETE]: [{
        title: '运单',
        className: 'primary',
        onClick: (e) => {
          e.stopPropagation()
          router.push(`transportList?prebookingId=${record.prebookingId}`)
        },
      }],
      [PREBOOKING_STAUTS.REFUSE]: [{
        title: '取消预约',
        className: 'ghost',
        onClick: (e) => {
          e.stopPropagation()
          alert('取消预约单', '您确认要取消该运单？', [
            { text: '再看看' },
            {
              text: '确认取消', onPress: () => {
                this.props.patchMobilePrebooking({ shipmentId: record.shipmentId, prebookingId: record.prebookingId, prebookingStatus: PREBOOKING_STAUTS.CANCELED })
                  .then(() => this.props.getMobilePrebooking({ prebookingStatus }))
                  .then(() => Toast.success('预约单取消成功', 1))
              }
            }
          ])
        },
        auth: [PREBOOKING_CANCEL]
      }, {
        title: '修改',
        className: 'primary',
        onClick: (e) => {
          e.stopPropagation()
          router.push(`createPrebooking?prebookingId=${record.prebookingId}&mode=${FORM_MODE.MODIFY}`)
        },
        auth: [PREBOOKING_MODIFY]
      }],
      [PREBOOKING_STAUTS.CANCELED]: [{
        title: '删除',
        className: 'primary',
        onClick: (e) => {
          e.stopPropagation()
          alert('删除预约单', '您确认要删除该预约单？', [
            { text: '再看看' },
            {
              text: '确认取消', onPress: () => {
                this.props.patchMobilePrebooking({ shipmentId: record.shipmentId, prebookingId: record.prebookingId, isEffect: 0 })
                  .then(() => this.props.getMobilePrebooking({ prebookingStatus }))
                  .then(() => Toast.success('预约单删除成功', 1))
              }
            }
          ])
        },
        auth: [PREBOOKING_DELETE]
      }]
    }[record.prebookingStatus] || []
    return operations.map((item, index) => (
      <Authorized key={index} authority={item.auth}>
        <Button className={item.className || ''} inline size="small" onClick={item.onClick} style={{ marginLeft: '15px' }}>{item.title}</Button>
      </Authorized>
    ))
  }

  render() {
    const { record, tab } = this.props
    return (
      <>
        {this.renderOperations(record, tab)}
      </>
    )
  }
}
