import React from 'react'
import { Button, Tabs, Toast } from 'antd-mobile'
import { Tabs as AntdTabs } from 'antd'
import UpLoadImage from '@/weapp/component/UpLoadImage'
import { auditedReceipt } from '@/services/apiService'
import { CONSIGNMENT_RECEIPT_STATUS, } from '@/constants/project/project'
import MultipleCheckButton from './multipleCheckButton/index'

const statusDist = { unChose : 0, receive : 1, reject : 2 }

const { TabPane } = AntdTabs;

export default class SignAudit extends React.Component {

  componentDidMount () {
    this.generateTags()
  }

  state = {
    haveDelivery : true,
    haveWeigh : true,
    haveReceiving : true,
  }

  reasonDeliveryRefs = []


  generateTags = () =>{
    const { logisticsBusinessTypeEntity, signItems, consignmentRejectStatus } = this.props
    // 如果signItems的第一位的additionalTypeAll 不存在，过磅提货都存在，如果存在，根据值判断

    /*
    * consignmentRejectStatus   运单拒绝状态  0初始化，1 客户提货单未通过，2客户签收单未通过，3客户全部未通过【多个逗号隔开】
    *
    * 提货单： 如果拒绝状态 0、1、3 都说明有提货单审核
    * 签收单： 如果拒绝状态为0 有签收单审核
    *        如果拒绝状态为2或3，并且additionalTypeAll 等于1 有签收单审核
    * 过磅单：如果拒绝状态为0 有过磅单审核
    *       如果拒绝状态为2或3，并且additionalTypeAll 等于2 有过磅单审核
    * */

    let haveWeigh = false
    let haveReceiving = false
    const haveDelivery = logisticsBusinessTypeEntity.transportBill.indexOf('1') !== -1 && consignmentRejectStatus !== 2

    if (logisticsBusinessTypeEntity.transportBill.indexOf('2') !== -1){

      if (consignmentRejectStatus === 0) haveWeigh = true

      if (consignmentRejectStatus === 2 || consignmentRejectStatus === 3){
        if (signItems[0].additionalTypeAll && signItems[0].additionalTypeAll.indexOf('2') !== -1){
          haveWeigh = true
        }
      }
    } else {
      haveWeigh = false
    }

    if (logisticsBusinessTypeEntity.transportBill.indexOf('3') !== -1){

      if (consignmentRejectStatus === 0) haveReceiving = true

      if (consignmentRejectStatus === 2 || consignmentRejectStatus === 3){
        if (signItems[0].additionalTypeAll && signItems[0].additionalTypeAll.indexOf('1') !== -1){
          haveReceiving = true
        }
      }

    } else {
      haveReceiving = false
    }

    this.setState({
      haveDelivery,
      haveWeigh,
      haveReceiving,
    })
  }

  calculatePounddifference = (item) => {
    const Pounddifference = (item.deliveryNum - item.receivingNum) * 1000 / (item.deliveryNum)
    return Pounddifference.toFixed(1)._toFixed(1)
  }

  submit = () => {
    const { haveDelivery, haveWeigh, haveReceiving } = this.state
    const { transportId } = this.props
    const verifyStatus = this.checkStatus()

    // 检查结果不通过
    if (verifyStatus === 0) return

    // 如果审核全部通过
    if (verifyStatus === CONSIGNMENT_RECEIPT_STATUS.CONSIGNMENT_RECEIPT_AUDITED){
      return auditedReceipt({
        transportId,
        consignmentReceiptStatus: verifyStatus,
      }).then(()=> this.props.refresh())
    }

    // 如果审核未全部通过
    let deliveryPointItem = []
    let receivingPointItem = []

    if (haveDelivery){
      let verifyReason = ''
      this.reasonDeliveryRefs.forEach(item =>{
        const { props : { verifyObjectId }, state : { status, selectedTags, remark } } = item
        if (status === statusDist.reject){
          verifyReason = this.generateReasonStr(selectedTags, remark)
          deliveryPointItem = [...deliveryPointItem, { verifyObjectId, verifyReason }]
        }
      })
    }

    if (haveWeigh){
      let verifyReason = ''
      const { props : { verifyObjectId }, state : { status, selectedTags, remark } } = this.reasonWeighRef
      if (status === statusDist.reject){
        verifyReason = this.generateReasonStr(selectedTags, remark)
        receivingPointItem = [...receivingPointItem, { verifyObjectId, verifyReason, additionalType : 2 }]
      }
    }

    if (haveReceiving){
      let verifyReason = ''
      const { props : { verifyObjectId }, state : { status, selectedTags, remark } } = this.reasonReceivingRef
      if (status === statusDist.reject){
        verifyReason = this.generateReasonStr(selectedTags, remark)
        receivingPointItem = [...receivingPointItem, { verifyObjectId, verifyReason, additionalType : 1 }]
      }
    }

    auditedReceipt({
      transportId,
      deliveryPointItem,
      receivingPointItem,
      consignmentReceiptStatus: verifyStatus,
    }).then(()=> this.props.refresh())
  }

  generateReasonStr = (Tags, remark) =>{
    let verifyReasonStr = ''
    if (Tags) verifyReasonStr = Tags.join(',')
    if (remark) verifyReasonStr = `${verifyReasonStr },${ remark}`
    return verifyReasonStr
  }

  checkStatus = () =>{
    let resStatus = -1
    const { haveDelivery, haveWeigh, haveReceiving } = this.state
    // 有三个tabs时，跳过中间直接点最后一个，这时中间的tabs的ref为空，进行这种情况下的判断
    if ((haveDelivery && !this.reasonDeliveryRefs) || (haveWeigh && !this.reasonWeighRef) || (haveReceiving && !this.reasonReceivingRef)) {
      Toast.info('您还有未审核的信息')
      return 0
    }

    // 逐项读ref 判断其中的信息情况
    if (this.reasonDeliveryRefs){
      for (let i = 0 ; i < this.reasonDeliveryRefs.length ; i ++){
        const { state : { status, selectedTags, remark } } = this.reasonDeliveryRefs[i]

        if (status === statusDist.unChose){
          Toast.info('您还有未审核的信息')
          return 0
        } if (status === statusDist.reject){
          if (!selectedTags.length && !remark){
            Toast.info('请选择拒绝理由或者输入备注')
            return 0
          }
          resStatus = CONSIGNMENT_RECEIPT_STATUS.CONSIGNMENT_RECEIPT_REFUSE
        }
      }
    }

    if (this.reasonWeighRef){
      const { state : { status, selectedTags, remark } } = this.reasonWeighRef
      if (status === statusDist.unChose){
        Toast.info('您还有未审核的信息')
        return 0
      } if (status === statusDist.reject){
        if (!selectedTags.length && !remark){
          Toast.info('请选择拒绝理由或者输入备注')
          return 0
        }
        resStatus = CONSIGNMENT_RECEIPT_STATUS.CONSIGNMENT_RECEIPT_REFUSE
      }
    }

    if (this.reasonReceivingRef){
      const { state : { status, selectedTags, remark } } = this.reasonReceivingRef
      if (status === statusDist.unChose){
        Toast.info('您还有未审核的信息')
        return 0
      } if (status === statusDist.reject){
        if (!selectedTags.length && !remark){
          Toast.info('请选择拒绝理由或者输入备注')
          return 0
        }
        resStatus = CONSIGNMENT_RECEIPT_STATUS.CONSIGNMENT_RECEIPT_REFUSE
      }
    }

    if (resStatus === -1) return CONSIGNMENT_RECEIPT_STATUS.CONSIGNMENT_RECEIPT_AUDITED
    return resStatus
  }

  renderTabs = () => {
    const { signItems, deliveryItems, consignmentRejectStatus } = this.props
    const { haveDelivery, haveWeigh, haveReceiving } = this.state
    // 多提单卸
    const {
      weighDentryid = '',
      billDentryid = '',
      weighNumber,
      receivingAddress,
      receivingName,
      customerOrgName,
      billNumber,
      processPointId,
    } = signItems[0]
    const pictureArrayWeigh = weighDentryid.split(',')
    const pictureReceiving = billDentryid.split(',')

    // 提货有两种规则： 如果consignmentRejectStatus 为0 代表未审，取全部项
    //              如果consignmentRejectStatus 为 1 或者3 代表已审未通过，取item.auditStatus === 0的项

    return (
      <AntdTabs>
        {haveDelivery &&
        <TabPane tab='提货单' key='1'>
          {consignmentRejectStatus === 0 ? deliveryItems.map((item, key) =>
            <div key={item.transportCorrelationId} style={{ padding: '1rem' }}>
              <div className='color-gray fs-11'>
                <div>审核要求：</div>
                <div>1. 单据图片是否清晰完整</div>
                <div>2.「货品数量和规格」的一致性</div>
              </div>
              <UpLoadImage mode='detail' value={item.billDentryid.split(',')} />
              <div>
                <span>提货地址：</span>
                <span>{item.deliveryAddress}</span>
              </div>
              <div className='mt-10'>
                <span>提货数量：</span>
                <span>{`${item.categoryName}-${item.goodsName} ${item.deliveryNum}${item.deliveryUnitCN}`}</span>
              </div>
              <div styleName='exception_title' className='fw-bold'> 审核：</div>

              <MultipleCheckButton ref={ref => this.reasonDeliveryRefs[key] = ref} verifyObjectId={item.processPointId} type='delivery' />
            </div>)
          :
          deliveryItems.map((item, key) => item.auditStatus === 0 &&
          <div key={item.transportCorrelationId} style={{ padding: '1rem' }}>
            <div className='color-gray fs-11'>
              <div>审核要求：</div>
              <div>1. 单据图片是否清晰完整</div>
              <div>2.「货品数量和规格」的一致性</div>
            </div>
            <UpLoadImage mode='detail' value={item.billDentryid.split(',')} />
            <div>
              <span>提货地址：</span>
              <span>{item.deliveryAddress}</span>
            </div>
            <div className='mt-10'>
              <span>提货数量：</span>
              <span>{`${item.categoryName}-${item.goodsName} ${item.deliveryNum}${item.deliveryUnitCN}`}</span>
            </div>
            <div styleName='exception_title' className='fw-bold'> 审核：</div>

            <MultipleCheckButton ref={ref => this.reasonDeliveryRefs[key] = ref} verifyObjectId={item.processPointId} type='delivery' />
          </div>,
          )}
        </TabPane>}
        {haveWeigh &&
        <TabPane tab='过磅单' key='2'>
          <div style={{ padding: '1rem' }}>
            <div className='color-gray fs-11'>
              <div>审核要求：</div>
              <div>1. 单据图片是否清晰完整</div>
              <div>2.「过磅单号」的一致性</div>
            </div>
            <UpLoadImage mode='detail' value={pictureArrayWeigh} />
            <div className='mt-10'>
              <span>过磅单号：</span>
              <span>{weighNumber}</span>
            </div>
            <div styleName='exception_title' className='fw-bold'>审核：</div>
            <MultipleCheckButton ref={ref=>this.reasonWeighRef = ref} verifyObjectId={processPointId} type='weigh' />
          </div>
        </TabPane>
        }
        {haveReceiving &&
        <TabPane tab='签收单' key='3'>
          <div style={{ padding: '1rem' }}>
            <div className='color-gray fs-11'>
              <div>审核要求：</div>
              <div>1. 单据图片是否清晰完整</div>
              <div>2.「签收单位」「签收单号」「货品数量和规格」的一致性</div>
            </div>
            <UpLoadImage mode='detail' value={pictureReceiving} />
            <div>
              <span>签收单位：</span>
              <span>{customerOrgName}</span>
            </div>
            <div className='mt-10'>
              <span>签收单号：</span>
              <span>{billNumber}</span>
            </div>
            <div className='mt-10'>
              <span>卸货点：</span>
              <span>{receivingName}</span>
            </div>
            <div className='mt-10'>
              <span>卸货地址：</span>
              <span>{receivingAddress}</span>
            </div>
            <div className='mt-10'>
              <span>签收数量：</span>
              <span>
                {
                  deliveryItems.map(item =>
                    <div key={item.goodsId}>
                      {`${item.categoryName}-${item.goodsName} ${item.receivingNum}${item.receivingUnitCN} `}<br />磅差：{this.calculatePounddifference(item)}‰
                    </div>)
                }
              </span>
            </div>
            <div styleName='exception_title' className='fw-bold'>审核：</div>
            <MultipleCheckButton ref={ref=>this.reasonReceivingRef = ref} verifyObjectId={processPointId} type='receiving' />
          </div>
        </TabPane>}
      </AntdTabs>
    )
  }


  render () {
    return (
      <div styleName='shadow modal_box' style={{ padding : '1rem' }}>
        <div styleName='cardType'>
          <span styleName='sign_audit' className='fw-bold'>回单审核</span>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <span styleName='exception_title'>回单审核</span>
          <span styleName='exception_content' className='color-gray'>(司机已到站，签收完成等待审核)</span>
        </div>
        {this.renderTabs()}
        <div styleName='exception_operation flex_content'>
          <Button type='primary' styleName='list_button half_width agree' onClick={this.submit}>保存</Button>
        </div>
      </div>
    )
  }
}
