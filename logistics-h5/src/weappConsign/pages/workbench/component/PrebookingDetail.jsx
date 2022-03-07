import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import { connect } from 'dva'
import QRCode from 'qrcode.react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Toast, Steps, Modal } from 'antd-mobile'
import router from 'umi/router'
import copyable from '@/assets/driver/copyable.png'
import edit from '@/assets/consign/edit.png'
import cancel from '@/assets/consign/cancel.png'
import { patchPrebooking } from '@/services/apiService'
import model from '@/models/preBooking'
import { PREBOOKING_STAUTS } from '@/constants/project/project'
import styles from './PrebookingDetail.less'

const { Step } = Steps

const { alert } = Modal;

const { actions: { detailPreBooking } } = model

@connect(null, { detailPreBooking })
@CSSModules(styles, { allowMultiple: true })
export default class DetailItem extends Component{
  state = {
    isCopy: true,
    ready: false,
  }

  componentDidMount () {
    this.refresh()
  }

  refresh = () => {
    const { location: { query: { prebookingId } } } = this.props
    this.props.detailPreBooking({ prebookingId }).then(data => {
      this.setState({
        detail: data,
        ready: true,
      })
    })
  }

  onCopy = () => {
    Toast.success('已复制运单号到剪切板', 1)
    this.setState({
      isCopy: false
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

  deletePrebooking = () => {
    alert('删除', '是否删除该预约单', [
      { text: '暂不' },
      { text: '确定', onPress: () => {
        const { detail } = this.state
        patchPrebooking({ shipmentId: detail.shipmentId, prebookingId: detail.prebookingId, isEffect: 0 })
          .then(() => {
            Toast.success('删除成功', 2, router.replace('/WeappConsign/main/staging'))
          })
      } },
    ])
  }

  renderList = () => {
    const { detail } = this.state
    const addressArr = detail.deliveryItems.map(item => (
      <Step
        key={item.deliveryId}
        title={item.deliveryName}
        icon={this.circle('green')}
        description={
          <>
            <p styleName='description'>{`${item.deliveryAddress || ''}`}</p>
            <p styleName='description'>{`${item.categoryName}${item.goodsName},预约${item.receivingNum}${item.goodsUnitCN}`}</p>
          </>
        }
      />
    ))
    detail.receivingItems.map(item => (
      addressArr.push(<Step
        key={item.receivingId}
        title={item.receivingName}
        icon={this.circle('yellow')}
        description={
          <>
            <p styleName='description'>{`${item.receivingAddress}`}</p>
            <p styleName='description'>{`${item.categoryName}${item.goodsName},预约${item.receivingNum}${item.goodsUnitCN}`}</p>
          </>
        }
      />)
    ))
    return addressArr
  }

  editPrebooking = () => {
    const { detail } = this.state
    router.push(`/WeappConsign/editPrebooking?prebookingId=${detail.prebookingId}&projectId=${detail.projectId}`)
  }

  render () {
    const { isCopy, ready, detail } = this.state
    return (
      ready
      &&
      <div styleName='container'>
        <div styleName='detail_box'>
          {
            detail.prebookingStatus === PREBOOKING_STAUTS.UNCERTAINTY?
              <img styleName='operation_icon' onClick={this.editPrebooking} src={edit} alt="图片加载失败" />
              :
              null
          }
          {
            detail.prebookingStatus === PREBOOKING_STAUTS.REFUSE?
              <img styleName='operation_icon' onClick={this.deletePrebooking} src={cancel} alt="图片加载失败" />
              :
              null
          }
          <header>
            <span>预约单号：</span>
            <span>{detail.prebookingNo}</span>
            {
              isCopy ?
                <div onClick={this.stop}>
                  <CopyToClipboard onCopy={this.onCopy} text={detail.prebookingNo||''}>
                    <img src={copyable} alt="图片加载失败" />
                  </CopyToClipboard>
                </div>
                :
                null
            }
          </header>
          <div styleName='line' />
          <Steps className='prebooking_detailPage_item_step_colorful'>
            {this.renderList()}
          </Steps>
          <div styleName='line0' />
          <div styleName='itemBox'>
            <p>提货时间: {detail.acceptanceTime? moment(detail.acceptanceTime).format('YYYY/MM/DD HH点'): '无'}</p>
            <p>运输费用: {`￥${((detail.deliveryItems.reduce((total, current)=>total+current.receivingNum, 0)) * Number(detail.maximumShippingPrice || 0)).toFixed(2)._toFixed(2)}`}</p>
            <p>备注信息: {detail.prebookingRemark? detail.prebookingRemark: '无'}</p>
          </div>
          {
            detail.logisticsBusinessTypeEntity && detail.logisticsBusinessTypeEntity.releaseHall === 1 && (detail.prebookingStatus === 0 || detail.prebookingStatus === 1)?
              <div styleName='qrCode'>
                <QRCode
                  value={`${window.envConfig.QRCodeEntry}/driver/prebooking/${detail.prebookingId}`}
                  size={200}
                  fgColor="#000000"
                  style={{
                    margin: '0 auto'
                  }}
                />
                <p styleName='qrcode_word'>转发给司机微信扫码接单</p>
                <p styleName='qrcode_word'>（可长按图片识别二维码)</p>
              </div>
              :
              null
          }
        </div>
      </div>
    )
  }
}
