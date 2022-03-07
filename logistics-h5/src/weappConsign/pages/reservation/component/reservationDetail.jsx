import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import { connect } from 'dva'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Flex, Modal, Steps, Toast } from 'antd-mobile'
import router from 'umi/router'
import copyable from '@/assets/driver/copyable.png'
import edit from '@/assets/consign/edit.png'
import cancel from '@/assets/consign/cancel.png'
import { getJsSDKConfig, modifyUserInfo, patchPrebooking } from '@/services/apiService'
import model from '@/models/preBooking'
import { PREBOOKING_STAUTS } from '@/constants/project/project'
import scan from '@/assets/consign/scan.png'
import { ACCOUNT_TYPE } from '@/constants/user/accountType'
import { getUserInfo, setUserInfo } from '@/services/user'
import styles from './reservationDetail.less'

const { Step } = Steps

const { alert } = Modal

const { actions: { detailPreBooking } } = model

@connect(null, { detailPreBooking })
@CSSModules(styles, { allowMultiple: true })
export default class DetailItem extends Component {
  state = {
    isCopy: true,
    ready: false,
  }

  componentDidMount () {
    this.refresh()
    getJsSDKConfig({ url: encodeURIComponent(window.location.href.split('#')[0]) })
      .then(({ timestamp, nonceStr, signature }) => {
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: 'wx5b020341411ebf08', // 必填，公众号的唯一标识
          timestamp, // 必填，生成签名的时间戳
          nonceStr, // 必填，生成签名的随机串
          signature, // 必填，签名
          jsApiList: ['scanQRCode'], // 必填，需要使用的JS接口列表
        })
      })
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

  deletePrebooking = () => {
    alert('删除', '是否删除该预约单', [
      { text: '暂不' },
      {
        text: '确定', onPress: () => {
          const { detail } = this.state
          patchPrebooking({ shipmentId: detail.shipmentId, prebookingId: detail.prebookingId, isEffect: 0 })
            .then(() => {
              Toast.success('删除成功', 2, router.replace('/WeappConsign/main/staging'))
            })
        },
      },
    ])
  }


  goScanQRCode = () => {
    const { location: { query: { prebookingId } } } = this.props
    const {
      detail: {
        deliveryItems,
        logisticsTradingSchemeEntity: { salesTransactionMode },
      },
    } = this.state
    const paymentMethod = salesTransactionMode === 4 ? 1 : 2
    wx.scanQRCode({
      needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
      scanType: ['qrCode'], // 可以指定扫二维码还是一维码，默认二者都有 barCode
      success: (res) => {
        const { alert } = Modal
        const { carId, carNo, carType, isBusy, openId, nickName, phone, userId, feedbackRate, fixtureNumber, avatar, realName, carCategoryEntityListStr } = JSON.parse(res.resultStr)
        if (!isBusy){
          return Toast.info('对方有运输中的运单，暂不支持')
        }

        const carCategoryEntityList = carCategoryEntityListStr.split(',')
        // 如果提货单deliveryItems数组中的货品firstCategoryId 在可承接类型carCategoryEntityList中找不到，弹窗提示

        let categoryList = []
        if (carCategoryEntityList) categoryList = carCategoryEntityList.map(item => item)

        const matchFailCategory = []

        deliveryItems.forEach(item => {
          if (!categoryList.find(_item => _item === (item.firstCategoryId).toString())) {
            matchFailCategory.push(item.firstCategoryName)
          }
        })

        if (matchFailCategory.length){
          alert('提示', (
            <div>
              <span>当前选择车辆可承接货品与该预约单货品</span>
              {
                matchFailCategory.map(item => <span style={{ color: "#369FFF", marginRight : '3px', marginLeft : '3px' }}>{item}</span>)
              }
              <span>不匹配，是否确认派单？</span>
            </div>
          ), [
            { text: '取消', onPress: () => console.log('cancel') },
            { text: '确认', onPress: () => {
              setTimeout(()=>{
                router.push(`/WeappConsign/reservation/judge?prebookingId=${prebookingId}&carId=${carId}&carNo=${carNo}&carType=${carType}&openId=${openId}&nickName=${nickName}&realName=${realName}&avatar=${avatar}&feedbackRate=${feedbackRate}&fixtureNumber=${fixtureNumber}&phone=${phone}&driverUserId=${userId}&paymentMethod=${paymentMethod}`)
              }, 1000)
            } },
          ])
        } else {
          // 如果匹配，直接跳转
          setTimeout(()=>{
            router.push(`/WeappConsign/reservation/judge?prebookingId=${prebookingId}&carId=${carId}&carNo=${carNo}&carType=${carType}&openId=${openId}&nickName=${nickName}&realName=${realName}&avatar=${avatar}&feedbackRate=${feedbackRate}&fixtureNumber=${fixtureNumber}&phone=${phone}&driverUserId=${userId}&paymentMethod=${paymentMethod}`)
          }, 1000)
        }

      },
      fail: (e) => {
        Toast.info(e.errMsg)
        // const catId = '496437691581696'
        // const catNo = '鄂J8D002'
        // const driverUserId = '514411516708096'
        // const carType = 'H09'
        // const realName = '雷永斌'
        // const avatar = 'https://img.ivsky.com/img/tupian/li/202012/29/meiwei_jiankang_niuyouguo_liaoli-009.jpg'
        // const phone = 18506032413
        // // // TODO: 注释测试语句
        // router.push(`/WeappConsign/reservation/judge?prebookingId=${prebookingId}&openId=123&carId=${catId}&carNo=${catNo}&carType=${carType}&nickName=123&realName=${realName}&avatar=${avatar}&feedbackRate=95&fixtureNumber=123&phone=${phone}&driverUserId=${driverUserId}&paymentMethod=${paymentMethod}`)
      },
    })
  }

  renderDeliveryMsg = () => {
    const { detail } = this.state
    const { deliveryItems, transportItems } = detail
    return deliveryItems.map(item => {
      let remainNum = item.receivingNum
      return (
        <Flex style={{ marginTop: '10px' }} justify='between' key={item.deliveryId}>
          <Flex.Item>{item.categoryName.split(',', 1)}</Flex.Item>
          <Flex.Item style={{ fontWeight : 'bold' }}>{item.receivingNum} {item.goodsUnitCN}</Flex.Item>
          <Flex.Item style={{ fontWeight : 'bold' }}>
            <span>
              {
                transportItems.reduce((total, current) => {
                  current.transportDeliveryItems.forEach(i => {
                    if (i.deliveryId === item.deliveryId) {
                      total += i.loadingNum
                      remainNum -= i.loadingNum
                    }
                  })
                  return total.toFixed(2)
                }, 0)
              }
            </span>
            <span>{item.goodsUnitCN}</span>
          </Flex.Item>
          <Flex.Item style={{ fontWeight : 'bold' }}>{remainNum.toFixed(3)} {item.goodsUnitCN}</Flex.Item>
        </Flex>
      )
    })
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
            <p
              styleName='description'
            >{`${item.categoryName}${item.goodsName},预约${item.receivingNum}${item.goodsUnitCN}`}
            </p>
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
            <p
              styleName='description'
            >{`${item.categoryName}${item.goodsName},预约${item.receivingNum}${item.goodsUnitCN}`}
            </p>
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
    const { location: { query: { type } } } = this.props
    return (
      ready
      &&
      <div styleName='container'>
        <div styleName='detail_box'>
          <div style={{ marginBottom : '30px' }}>
            <Flex justify='between' className='color-gray' style={{ fontSize: '13px' }}>
              <Flex.Item />
              <Flex.Item>预约</Flex.Item>
              <Flex.Item>已提</Flex.Item>
              <Flex.Item>待提</Flex.Item>
            </Flex>
            {this.renderDeliveryMsg()}
          </div>
          <div className='mt-20' />
          <header>
            <span>预约单号：</span>
            <span>{detail.prebookingNo}</span>
            {
              isCopy ?
                <div onClick={this.stop}>
                  <CopyToClipboard onCopy={this.onCopy} text={detail.prebookingNo || ''}>
                    <img src={copyable} alt='图片加载失败' />
                  </CopyToClipboard>
                </div>
                :
                null
            }
            {
              detail.prebookingStatus === PREBOOKING_STAUTS.UNCERTAINTY ?
                <img styleName='operation_icon' onClick={this.editPrebooking} src={edit} alt='图片加载失败' />
                :
                null
            }
            {
              detail.prebookingStatus === PREBOOKING_STAUTS.REFUSE ?
                <img styleName='operation_icon' onClick={this.deletePrebooking} src={cancel} alt='图片加载失败' />
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
            <p>提货时间: {detail.acceptanceTime ? moment(detail.acceptanceTime).format('YYYY/MM/DD HH点') : '无'}</p>
            <p>运输费用: {`￥${((detail.deliveryItems.reduce((total, current) => total + current.receivingNum, 0)) * Number(detail.maximumShippingPrice || 0)).toFixed(2)._toFixed(2)}`}</p>
            <p>备注信息: {detail.prebookingRemark ? detail.prebookingRemark : '无'}</p>
          </div>
          {type === '1' &&
          <div styleName='scan'>
            <div styleName='content'>
              <Flex justify='center'>
                <img src={scan} onClick={this.goScanQRCode} alt='图片加载失败' />
              </Flex>
              <div>
                接单扫描
              </div>
            </div>
          </div>}
        </div>
      </div>
    )
  }
}
