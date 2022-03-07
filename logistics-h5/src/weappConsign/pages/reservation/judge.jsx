import React from 'react'
import { connect } from 'dva'
import CSSModules from 'react-css-modules'
import { getJsSDKConfig, scanCreateTransport } from '@/services/apiService'
import router from 'umi/router'
import { browser } from '@/utils/utils'
import heading from '@/assets/driver/heading.png'
import { Button, Card, Flex, Toast } from 'antd-mobile'
import { SchemaForm, Item, FormButton, Observer } from '@gem-mine/mobile-schema-form'
import model from '@/models/preBooking'
import DebounceFormButton from '@/components/DebounceFormButton'
import { Divider } from 'antd'
import UpLoadImage from '@/weapp/component/UpLoadImage'
import phoneCall from '@/assets/driver/phoneCall.png'
import styles from './judge.less'
import '@gem-mine/mobile-schema-form/src/fields'

const { actions: { detailPreBooking } } = model

function mapStateToProps (state) {
  return {
    nowUser: state.user.nowUser,
  }
}

@connect(mapStateToProps, { detailPreBooking })
@CSSModules(styles, { allowMultiple: true })
export default class ReservationJudge extends React.Component {
  state = {
    detail: {},
    schema: {},
  }

  allowClick = true

  componentDidMount () {
    const { location: { query: { prebookingId, openId } } } = this.props

    this.props.detailPreBooking({ prebookingId }).then(data => {
      const { logisticsBusinessTypeEntity: { billNumberType, billPictureType } } = data
      this.billPictureType = billPictureType

      const schema = {
        carryFare: {
          label: '运输费用',
          component: 'inputItem.text',
          defaultValue: data.maximumShippingPrice,
          disabled: true,
          props: {
            type: 'money',
            moneyKeyboardAlign: 'right',
            extra: `元/${data.deliveryItems[0].goodsUnitCN}`,
          },
        },
        deliveryNum: {
          label: '提货数量',
          component: 'inputItem',
          placeholder: '请填写提货数量',
          props: {
            type: 'money',
            moneyKeyboardAlign: 'right',
            autoAdjustHeight: true,
            extra: data.deliveryItems[0].goodsUnitCN,
          },
          rules: {
            required: [true, '请输入提货数量'],
          },
        },
        transportCost: {
          label: '总价',
          component: 'inputItem',
          placeholder : '请填写总价',
          props: {
            type: 'money',
            moneyKeyboardAlign: 'right',
            autoAdjustHeight: true,
          },
          value : Observer({
            watch: 'deliveryNum',
            action : num=> num ? Number(num * data.maximumShippingPrice) : 0
          }),
          rules: {
            required: [true, '请输入预估总价'],
          },
        },
        deliveryBillNumber: {
          label: '提货单号',
          component: 'inputItem',
          placeholder: '请填写提货单号',
          props: {
            type: 'money',
            moneyKeyboardAlign: 'right',
            autoAdjustHeight : true
          },
          rules: {
            required: ()=>{
              if (!billNumberType) return [true, '请输入提货单号']
              return [billNumberType.indexOf('1') === -1, '请输入提货单号']
            },
          },
        },
        deliveryBillDentryid: {
          component: UpLoadImage,
        },
      }
      this.setState({
        detail: data,
        ready: true,
        schema,
      })

    })


    if (browser.versions.android) {
      getJsSDKConfig({ url: encodeURIComponent(window.location.href.split('#')[0]) })
        .then(({ timestamp, nonceStr, signature }) => {
          wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx5b020341411ebf08', // 必填，公众号的唯一标识
            timestamp, // 必填，生成签名的时间戳
            nonceStr, // 必填，生成签名的随机串
            signature, // 必填，签名
            jsApiList: ['getLocation'], // 必填，需要使用的JS接口列表
          })
        })
    }
  }

  checkFormData = (formdata) =>{
    const { deliveryNum, deliveryBillNumber, deliveryBillDentryid = '', transportCost } = formdata
    if (!deliveryBillDentryid && !this.billPictureType) {
      Toast.fail('请上传提货单据')
      return false
    }
    if (!deliveryBillDentryid && this.billPictureType.indexOf('1') === -1){
      Toast.fail('请上传提货单据')
      return false
    }

    if (transportCost[0] === '.' || Number.isNaN(transportCost)){
      Toast.fail('请输入正确的数字格式')
      return false
    }

    if (deliveryNum[0] === '.' || Number.isNaN(deliveryNum)){
      Toast.fail('请输入正确的数字格式')
      return false
    }

    if (deliveryBillNumber && deliveryBillNumber[0] === '.' || Number.isNaN(deliveryBillNumber)){
      Toast.fail('请输入正确的数字格式')
      return false
    }
    return true

  }

  handleConfirm = (formdata) => {
    // 513381354587392  450454993728768
    // const { location: { query: { prebookingId, carId = '419985050985728', driverUserId = '450454993728768', openId = 123, paymentMethod = 1, avatar, nickName= '123' } } } = this.props
    const { location: { query: { prebookingId, carId, driverUserId, openId, paymentMethod, avatar, nickName } } } = this.props

    const { deliveryNum, deliveryBillNumber, deliveryBillDentryid = '', transportCost } = formdata

    if (!this.checkFormData(formdata)) return

    // 预约单号 detail.prebookingNo
    let params = {
      prebookingId, driverUserId, carId, openId, paymentMethod, deliveryNum, transportCost, wxNickName : nickName
    }
    if (deliveryBillNumber) {
      params = { ...params, deliveryBillNumber }
    }
    if (deliveryBillDentryid.length) {
      params = { ...params, deliveryBillDentryid : deliveryBillDentryid[0] }
    }
    // router.push(`/WeappConsign/reservation/payment?&prebookingId=${prebookingId}&avatar=${avatar}&nickName=${nickName}`)
    // return

    if (this.allowClick){
      this.allowClick = false
      Toast.loading('正在获取当前定位', 100)
      wx.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        success: res => {
          Toast.hide()
          params = { ...params, longitude: res.longitude, latitude: res.latitude }
          scanCreateTransport(params)
            .then(({ totalFreight, serviceCharge, orderId })=>{
              router.push(`/WeappConsign/reservation/payment?totalFreight=${totalFreight}&serviceCharge=${serviceCharge}&prebookingId=${prebookingId}&avatar=${avatar}&nickName=${nickName}&orderId=${orderId}`)
              this.allowClick = true
            })
            .catch(()=>{
              this.allowClick = true
            })
        },
        fail: () => {
          Toast.hide()
          params = { ...params, longitude: 0.0, latitude: 0.0 }
          scanCreateTransport(params)
            .then(({ totalFreight, serviceCharge, orderId })=>{
              router.push(`/WeappConsign/reservation/payment?totalFreight=${totalFreight}&serviceCharge=${serviceCharge}&prebookingId=${prebookingId}&avatar=${avatar}&nickName=${nickName}&orderId=${orderId}`)
              this.allowClick = true
            })
            .catch(()=>{
              this.allowClick = true
            })
        },
      })
    } else {
      Toast.info('请勿重复点击')
    }
  }

  renderBillMsg = () =>{
    const { detail } = this.state
    if ((!detail.logisticsBusinessTypeEntity.billNumberType || detail.logisticsBusinessTypeEntity.billNumberType.indexOf('1') === -1) || (!detail.logisticsBusinessTypeEntity.billPictureType || detail.logisticsBusinessTypeEntity.billPictureType.indexOf('1') === -1)){
      return (
        <Card>
          <Card.Body>
            <div className='fw-bold' style={{ fontSize : '1rem' }}>提货单据</div>
            <div className='color-gray mt-10' style={{ fontSize: '14px' }}>请填写提货单号和上传提货单</div>
            {(!detail.logisticsBusinessTypeEntity.billNumberType || detail.logisticsBusinessTypeEntity.billNumberType.indexOf('1') === -1) && <Item field='deliveryBillNumber' />}
            {(!detail.logisticsBusinessTypeEntity.billPictureType || detail.logisticsBusinessTypeEntity.billPictureType.indexOf('1') === -1) && <Item field='deliveryBillDentryid' />}
          </Card.Body>
        </Card>
      )
    }
  }

  toastError = (error) => {
    Toast.fail(error[0], 1.5)
  }


  render () {
    const { ready, schema } = this.state
    const { location: { query: { carNo, fixtureNumber, feedbackRate, phone, realName } } } = this.props
    return (ready &&
      <>
        <div styleName='userInfo_box'>
          <div styleName='info_box'>
            <img src={heading} alt='图片加载失败' />
            <div>
              <p>{carNo}</p>
              <Flex>
                <span style={{ marginRight: '8px' }}>{realName}</span>
                <span>成交：{fixtureNumber}</span>
                <span>| 好评率：{feedbackRate}</span>
              </Flex>
            </div>
          </div>
          <Button href={`tel:${phone}`} style={{ position: 'initial' }}>
            <img src={phoneCall} alt='图片加载失败' />
          </Button>
        </div>
        <SchemaForm schema={schema}>
          <Card>
            <Card.Body className='fw-14 mb-10'>
              <div className='fw-bold' style={{ fontSize : '1rem' }}>提货审核</div>
              <div className='color-gray mt-10' style={{ fontSize: '13px' }}>司机已提货，请确认提货数量和价格</div>
              <Divider />
              <div className='color-darkGray'>
                <Item field='carryFare' />
                <Item field='deliveryNum' />
                <Item field='transportCost' />
              </div>
            </Card.Body>
          </Card>
          {
            this.renderBillMsg()
          }
          <div style={{ position: 'fixed', bottom: '0', width: '100%', padding: '15px' }}>
            <Flex>
              <Button style={{ width: '30%', marginRight: '20px' }} type='ghost' onClick={()=>router.goBack()}>拒绝</Button>
              <DebounceFormButton disabled={!this.allowClick} onError={this.toastError} style={{ width: '70%' }} type='primary' label='确认' onClick={this.handleConfirm} />
            </Flex>
          </div>
        </SchemaForm>
      </>
    )
  }
}
