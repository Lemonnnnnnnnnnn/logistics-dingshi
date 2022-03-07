import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import { connect } from 'dva'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Toast, Steps, Modal, Icon } from 'antd-mobile'
import router from 'umi/router'
import QRCode from 'qrcode.react'
import copyable from '@/assets/driver/copyable.png'
import { getJsSDKConfig, getCarByShipment, patchGrabbingOrder } from '@/services/apiService'
import { DICTIONARY_TYPE } from '@/services/dictionaryService'
import heading from '@/assets/driver/heading.png'
import phoneCall from '@/assets/driver/phoneCall.png'
import model from '@/models/preBooking'
import { browser } from '@/utils/utils'
import loginCar from '@/assets/driver/loginCar.png'
import noAuditStatus from '@/assets/driver/noAuditStatus.png'
import { PREBOOKING_STAUTS } from '@/constants/project/project'
import styles from './Detail.less'

const { Step } = Steps

const { alert } = Modal;

const { actions: { detailPreBooking } } = model

@connect(state => ({
  dictionaries: state.dictionaries.items,
  nowUser: state.user.nowUser
}), { detailPreBooking })
@CSSModules(styles, { allowMultiple: true })
export default class DetailItem extends Component{
  state = {
    isCopy: true,
    ready: false,
    modal: false
  }

  componentDidMount () {
    if (browser.versions.android) {
      getJsSDKConfig({ url: encodeURIComponent(window.location.href.split('#')[0]) })
        .then(({ timestamp, nonceStr, signature }) => {
          wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx5b020341411ebf08', // 必填，公众号的唯一标识
            timestamp, // 必填，生成签名的时间戳
            nonceStr, // 必填，生成签名的随机串
            signature, // 必填，签名
            jsApiList: ['getLocation'] // 必填，需要使用的JS接口列表
          })
        })
    }
    this.refresh()
  }

  transformCarType = (type) => {
    const cars = this.props.dictionaries.filter(item => item.dictionaryType === DICTIONARY_TYPE.CAR_TYPE)
    const carType = cars.find(({ dictionaryCode }) => dictionaryCode === type)
    if (carType) return carType.dictionaryName
    return ''
  }

  closeModal = () => {
    this.setState({
      modal: false,
    })
  }

  confirmTakeOrder = () => {
    const { activeCarId, list, detail } = this.state
    if (!activeCarId) return Toast.fail('请选择车辆')
    const current = list.find(item => item.carId === activeCarId)
    if (current.isBusy === 0) return Toast.fail('该车辆繁忙无法接单')
    const formData = {
      carId: activeCarId,
      prebookingId: detail.prebookingId,
      remark: this.state.remark
    }
    Toast.loading('抢单中', 1000)
    const _this = this
    wx.getLocation({
      type: 'gcj02',
      success (res) {
        console.log(res)
        if (!res.latitude) {
          Toast.hide()
          this.closeModal()
          return Toast.fail('定位信息获取失败，抢单失败')
        }
        const { latitude, longitude } = res
        formData.latitude = latitude
        formData.longitude = longitude
        patchGrabbingOrder(formData).then(res => {
          Toast.hide()
          _this.closeModal()
          Toast.success('抢单成功', 1, () => {
            router.push(`/WeappDriver/main/index/transportDetail?transportId=${res.transportId}`)
          })
        })
      },
      fail () {
        Toast.hide()
        _this.closeModal()
        Toast.fail('定位信息获取失败，请打开定位')
      }
    })
  }

  unitPrice = () => {
    const { detail } = this.state
    let price = detail.maximumShippingPrice
    if (!detail.logisticsTradingSchemeEntity) return price.toFixed(2)._toFixed(2)
    if (detail.shipmentType === 0) {
      price *= (1 - (detail.logisticsTradingSchemeEntity.shipmentServiceRate))
      if (detail.logisticsTradingSchemeEntity.driverServiceStandard === 3) return price
      price *= (1 - (detail.logisticsTradingSchemeEntity.driverServiceRate))
    }
    if (detail.shipmentType === 1) {
      if (detail.logisticsTradingSchemeEntity.driverServiceStandard === 3) return price
      price *= (1 - (detail.logisticsTradingSchemeEntity.driverServiceRate))
    }
    return price.toFixed(2)._toFixed(2)
  }

  selectCar = e => {
    this.setState({
      activeCarId: Number(e.currentTarget.getAttribute('car-id'))
    })
  }

  refresh = () => {
    const { location: { query: { prebookingId } } } = this.props
    Promise.all([this.props.detailPreBooking({ prebookingId }), getCarByShipment({ limit: 100, offset: 0, selectType: 4 })]).then(res => {
      if (res[0].prebookingStatus !== 0 && res[0].prebookingStatus !== 1) {
        return Toast.fail('该预约单已关闭', 1.5, () => {
          router.replace('/WeappDriver/main/personalCenter')
        })
      }
      const index = res[1].items.findIndex(item => item.carDefault === 1)
      if (index !== -1) {
        const defaultCar = res[1].items.splice(index, 1)
        res[1].items.splice(0, 0, defaultCar[0])
        this.setState({
          list: res[1].items,
          ready: true,
          detail: res[0],
          activeCarId: res[1].items[0].carId,
        })
      } else {
        this.setState({
          list: res[1].items,
          ready: true,
          activeCarId: '',
          detail: res[0],
        })
      }
    })
      .catch(({ code }) => {
        if (code === 'LOGISTICS/TOKEN_ERROR') {
          router.replace('/WeappDriver/joinUs')
        }
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

  toCarIntelligence = () => {
    router.push('/WeappDriver/carIntelligence')
  }

  toIntelligence = () => {
    router.push('/WeappDriver/intelligence')
  }

  takeOrder = () => {
    const { auditStatus } = this.props.nowUser
    if (auditStatus !== 1) {
      return alert(
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#222222' }}>还未进行实名认证哦</h3>,
        <>
          <p>为了保证您的合法权益，请先进行实名认证</p>
          <img style={{ width: '160px', margin: '20px 0' }} src={noAuditStatus} alt="图片加载失败" />
        </>,
        [
          { text: '暂不认证', onPress: () => console.log('cancel'), style: 'default' },
          { text: '去认证', onPress: this.toIntelligence },
        ]);
    }
    const { list } = this.state
    if (!list || list.length === 0) {
      alert(
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#222222' }}>还没有进行车辆注册</h3>,
        <>
          <p>只有车辆登记用户才可以使用该功能</p>
          <img style={{ width: '100%', margin: '20px 0' }} src={loginCar} alt="图片加载失败" />
        </>,
        [
          { text: '暂不认证', onPress: () => console.log('cancel'), style: 'default' },
          { text: '去认证', onPress: this.toCarIntelligence },
        ]);
    } else {
      this.setState({
        modal: true
      })
    }
  }

  stop = e => {
    e.stopPropagation()
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

  render () {
    const { isCopy, ready, detail, activeCarId, list } = this.state
    return (
      ready
      &&
      <div styleName='container' onClick={this.toDetail}>
        <div styleName='userInfo_box'>
          <div styleName='info_box'>
            <img src={heading} alt="图片加载失败" />
            <div>
              <p>{detail.nickName}</p>
              <p>
                <span>成交：{detail.fixtureNumber || '0'}</span>
                <span />
                <span>好评率：{detail.feedbackRate || '0%'}</span>
              </p>
            </div>
          </div>
          <a href={`tel: ${detail.logisticsUserEntity && detail.logisticsUserEntity.phone || 0}`}>
            <img src={phoneCall} alt="图片加载失败" />
          </a>
        </div>
        <div styleName='detail_box'>
          <header>
            <span>预约单号：</span>
            <span>{detail.prebookingNo}</span>
            {
              isCopy ?
                <div onClick={this.stop}>
                  <CopyToClipboard onCopy={this.onCopy} text={detail.text||detail.content}>
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
            <p>运输单价: {this.unitPrice()}元</p>
            {/* <p>运输费用: {`￥${((detail.deliveryItems.reduce((total, current)=>total+current.receivingNum, 0)) * Number(detail.maximumShippingPrice || 0)).toFixed(2)._toFixed(2)}`}</p> */}
            <p>备注信息: {detail.prebookingRemark? detail.prebookingRemark: '无'}</p>
          </div>
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
        </div>
        <div styleName='padding_box' />
        <div styleName='btn_box'>
          <button styleName='btn_blue' type='button' onClick={this.takeOrder}>接单</button>
        </div>
        <Modal
          visible={this.state.modal}
          transparent
          maskClosable={false}
          onClose={this.closeModal}
          title="选择接单车辆"
          footer={[{ text: '取消', onPress: this.closeModal }, { text: '接单', onPress: this.confirmTakeOrder }]}
        >
          <div styleName='orderHall_car_list'>
            <div styleName='carList'>
              <ul>
                {list.map((item, index) => (
                  <li key={item.carId} onClick={item.isBusy === 1?this.selectCar: null} car-id={item.carId} styleName={activeCarId === item.carId? 'active': ''}>
                    <p>{item.carNo}</p>
                    <p>{item.carType && this.transformCarType(item.carType) || ''}</p>
                    {activeCarId === item.carId && index === 0?
                      <span styleName='defaultCar'>默认</span>
                      :
                      null
                    }
                    {activeCarId === item.carId && index !== 0?
                      <span styleName='defaultCar'>选中</span>
                      :
                      null
                    }
                    {
                      item.isBusy === 1?
                        <span styleName='free'>空闲</span>
                        :
                        <span styleName='busy'>忙碌</span>
                    }
                  </li>
                ))}
              </ul>
            </div>
            <div styleName='addCar' onClick={this.toCarIntelligence}>
              <Icon styleName='icon_plus' type="plus" />
              添加车辆
            </div>
            {/* <input value={this.state.remark} onChange={this.onChangeRemarks} placeholder='添加备注(选填)' /> */}
          </div>
        </Modal>
      </div>
    )
  }
}
