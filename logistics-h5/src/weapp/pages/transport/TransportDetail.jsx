import React, { Component } from 'react'
import { Item, SchemaForm, Observer, FormButton, FORM_MODE } from '@gem-mine/mobile-schema-form'
import { Modal, TextareaItem, Button, Toast } from 'antd-mobile'
import router from 'umi/router'
import '@gem-mine/mobile-schema-form/src/fields'
import { connect } from 'dva'
import styles from './TrasportDetail.css'
import { _getTransport, modifyTransportStatus, getProjectDetail } from '@/services/apiService'
import TransportInformCard from './components/TransportInformCard'
import GoodsDetail from './components/GoodsDetail'
import { getUserInfo } from '@/services/user'
import { TRANSPORTIMMEDIATESTATUS, transportImmediateStatusConfig } from '@/constants/transport/transport'
import UpLoadImage from '@/weapp/component/UpLoadImage'
import TransportEvents from './components/TransportEvents'

@connect((state)=>({
  transportDetailData: state.transports.entity,
  nowUser: state.user.nowUser
}), dispatch =>({
  setTransportDetail: payload => dispatch({ type: 'transports/transportDetail', payload })
}))

export default class TransportDetail extends Component{

  accountType = getUserInfo().accountType

  state={
    visible: false,
    verifyReason:''
  }

  schemaForm = {
    transportImmediateStatus:{ // ok
      label: '运单状态',
      component: 'inputItem',
      format:{
        input: (value)=>transportImmediateStatusConfig[value]
      },
      props:{
        style:{
          textAlign: 'right',
          color: 'rgba(155,155,155,1)'
        }
      }
    },
    billNumber: { // ok
      label: '签收单编号',
      component: 'inputItem',
      visible: Observer({
        watch: 'transportImmediateStatus',
        action: transportImmediateStatus => {
          const array = [TRANSPORTIMMEDIATESTATUS.CUSTOMER_REFUSE,
            TRANSPORTIMMEDIATESTATUS.CUSTOMER_AUDITED,
            TRANSPORTIMMEDIATESTATUS.CONSIGNMENT_REFUSE,
            TRANSPORTIMMEDIATESTATUS.SIGNED,
            TRANSPORTIMMEDIATESTATUS.RESINGED
          ]
          return array.filter(item=> item===transportImmediateStatus).length!==0
        }
      }),
      props:{
        style:{
          textAlign: 'right',
          color: 'rgba(155,155,155,1)'
        }
      }
    },
    processPointCreateTime: {
      label: '签收时间',
      component: 'calender',
      visible: Observer({
        watch: 'transportImmediateStatus',
        action: transportImmediateStatus => {
          const array = [TRANSPORTIMMEDIATESTATUS.CUSTOMER_REFUSE,
            TRANSPORTIMMEDIATESTATUS.CUSTOMER_AUDITED,
            TRANSPORTIMMEDIATESTATUS.CONSIGNMENT_REFUSE,
            TRANSPORTIMMEDIATESTATUS.SIGNED,
            TRANSPORTIMMEDIATESTATUS.RESINGED
          ]
          return array.indexOf(transportImmediateStatus) !== -1
        }
      }),
      props:{
        style:{
          textAlign: 'right',
          color: 'rgba(155,155,155,1)'
        }
      }
    },
    receivingName: { // ok
      label: '卸货点',
      component: 'inputItem',
      props:{
        style:{
          textAlign: 'right',
          color: 'rgba(155,155,155,1)'
        }
      }
    },
    deliveryItems: {
      label: '货品详情',
      component: GoodsDetail
    },
    billDentryid: {
      label: '签收单详情',
      component: UpLoadImage,
      props:{
        imgsMaxFileLength:3
      }
    },
    transportInfrom: {
      label: '运单信息',
      component: TransportInformCard
    },
    eventItems:{
      label: '运单事件',
      component: TransportEvents
    }
  }

  componentDidMount (){
    const { location: { query: { transportId, isEnterByMessage } }, setTransportDetail } = this.props
    let detailData
    setTransportDetail(detailData)
    if (!isEnterByMessage){
      _getTransport(transportId)
        .then(data=>{
          setTransportDetail(data)
        })
    } else {
      _getTransport(transportId)
        .then(data=>{
          detailData = data
          return getProjectDetail(data.projectId)
        })
        .then(data=>{
          const { customerResponsibleItems } = data
          const isAvailable = (customerResponsibleItems||[]).find( item => item.responsibleId === this.props.nowUser.userId)?.isAvailable
          if (isAvailable || isAvailable === undefined || this.accountType === 1) {
            setTransportDetail(detailData)
          } else {
            router.replace(`/Weapp/bindContract/error?error=noSameOrganization&word=查看失败`)
          }
        })

    }
  }

  RejectTransport = () => {
    const { location: { query: { transportId } }, transportDetailData } = this.props
    const { verifyReason } = this.state
    const verifyObjectId = transportDetailData.signItems[0].processPointId
    if (!verifyReason || !verifyReason.length){
      Toast.fail("拒绝理由不得为空", 2, null, false)
      return
    }

    modifyTransportStatus({ transportId, shipmentReceiptStatus:2, receivingPointItem:[{ verifyObjectId, verifyReason }], deliveryPointItem:[] }).then(()=>{
      Toast.success("已拒绝", 2, router.goBack, false)
    })
  }

  confirmReceipt = () => {
    const { location: { query: { transportId } } } = this.props
    modifyTransportStatus({ transportId, shipmentReceiptStatus:3 })
      .then(()=>{
        Toast.success("收货成功", 2, router.goBack, false)
      })
  }

  renderButton = () =>
    (
      <Button className={styles.goBackBtn} type="primary" onClick={router.goBack}>返回</Button>
    )

  render (){
    const { transportDetailData } = this.props
    if (!transportDetailData) return <></>
    const { transportImmediateStatus } = transportDetailData
    return (
      <div style={{ height: '100%', position: 'relative' }}>
        <Modal
          visible={this.state.visible}
          title="请输入拒绝原因"
          transparent
          footer={[
            { text: '确定',
              onPress: () => {
                this.RejectTransport()
                this.setState({ visible:false })
              }
            },
            { text: '取消',
              onPress: () => {
                this.setState({ visible:false })
              } }
          ]}
        >
          <TextareaItem onChange={(value)=>{ this.setState({ verifyReason:value }) }} rows={2} clear count={100} />
        </Modal>
        <SchemaForm schema={this.schemaForm} className={(transportImmediateStatus === TRANSPORTIMMEDIATESTATUS.SIGNED || transportImmediateStatus === TRANSPORTIMMEDIATESTATUS.RESINGED) ? styles.detail : null} mode={FORM_MODE.DETAIL} data={transportDetailData} onChange={() => this.setState({ errors: [] })}>
          <Item field="transportImmediateStatus" />
          <Item field="billNumber" />
          <Item field="processPointCreateTime" />
          <Item field="receivingName" />
          <Item field="deliveryItems" />
          <Item field="billDentryid" />
          <Item field="transportInfrom" />
          <Item field="eventItems" />
          { this.renderButton(transportImmediateStatus) }
        </SchemaForm>
      </div>

    )
  }
}

