import React from 'react'
import { connect } from 'dva'
import {
  getJsSDKConfig,
  checkIsSetPayPassword,
  getPaymentAuthorizationPhone,
  getVirtualAccount,
  scanPayOrder,
  getPublicKey,
} from '@/services/apiService'
import { Button, Card, Flex, Modal, Toast } from 'antd-mobile'
import { Radio, Divider } from 'antd'
import { SchemaForm, Item } from '@gem-mine/mobile-schema-form'
import router from 'umi/router'
import DebounceFormButton from '@/components/DebounceFormButton'
import CSSModules from 'react-css-modules'
import { browser } from '@/utils/utils'
import { getUserInfo } from '@/services/user'
import heading from '@/assets/driver/heading.png'
import wechat from '@/assets/consign/wechat.png'
import tick from '@/assets/consign/tick.png'
import { JSEncrypt } from 'jsencrypt'
import SmsCode from './component/smsCode'
import styles from './payment.less'
import PaymentModal from './component/paymentModal'

function mapStateToProps (state) {
  return {
    nowUser: state.user.nowUser,
  }
}

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ReservationPayment extends React.Component {
  state = {
    showModal: false,
    payWay: 1, // 1： 验证码 ， 2 ： 密码
    IsSetPayPassword: false,
    haveTryNumber: 0,
    ready : false,
  }

  isAllowPay = true

  userInfo = getUserInfo()

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
            jsApiList: ['getLocation'], // 必填，需要使用的JS接口列表
          })
        })
    }

    Promise.all([checkIsSetPayPassword(), getPaymentAuthorizationPhone(), getVirtualAccount({ virtualAccountType : '1' })])
      .then(res=>{
        this.paymentAuthorizationPhone = res[1].paymentAuthorizationPhone
        this.paymentAuthorizationName = res[1].paymentAuthorizationName
        this.schema = {
          smsCode: {
            label: '验证码',
            component: SmsCode,
            props: {
              smsType: 'SMS_189621738',
              // TODO: 开放自动发送验证码
              sendAtStart : true,
              phoneNumber: this.paymentAuthorizationPhone,
            },
            sendButtonWord: '发送验证码',
            sendButtonStyle: {
              color: 'rgba(46,122,245,1)',
              fontSize: '15px',
              lineHeight: '18px',
            },
            placeholder: '请输入手机验证码',
          },
        }

        this.setState({
          showPayMethod : !res[0].set || res[0].number >= 3,
          virtualAccount : res[2].virtualAccountBalance
        })
      })
      .then(()=>this.setState({ ready : true }))

  }

  handleConfirmPay = formData => {
    let { location: { query: { orderId } } } = this.props
    const { location: { query: { nickName } } } = this.props
    const { payWay, showPayMethod } = this.state
    // 如果不展示支付选择模块，则一定是用密码支付
    if (!showPayMethod){
      checkIsSetPayPassword().then(({ set, number }) =>{
        this.setState({ IsSetPayPassword: set, haveTryNumber: number }, ()=> this.onOpenModal())
      })
    } else {
      // 如果不展示支付选择模块，说明没有密码，则分两种情况讨论
      if (payWay === 1) {
        const { smsCode } = formData
        if (!smsCode){
          Toast.fail('请输入验证码')
        } else if (this.isAllowPay){
          this.isAllowPay = false
          getPublicKey().then(data => {
            const RSA = new JSEncrypt()
            RSA.setPublicKey(data.publicKeyString)
            orderId = RSA.encrypt(orderId.toString())
            const newParams = { orderId, key: data.key, securityCode : smsCode, phone : this.paymentAuthorizationPhone, weChatNickName :nickName, payChannel : '2' }

            // 用验证码进行支付操作
            scanPayOrder(newParams).then(()=>{
              // this.isAllowPay = true
              Toast.info('支付成功！')
              setTimeout(()=>{
                router.go(-2)
              }, 1000)
            })
              .catch(()=> this.isAllowPay = true)
          })
        }
      } else {
        checkIsSetPayPassword().then(({ set, number }) =>{
          this.setState({ IsSetPayPassword: set, haveTryNumber: number }, ()=> this.onOpenModal())
        })
      }
    }
  }

  onSelectPayWay = (e) => {
    this.setState({ payWay: e.target.value })
  }

  onOpenModal = () => {
    this.setState({ showModal: true })
  }

  onCloseModal = () => {
    this.setState({ showModal: false })
    checkIsSetPayPassword().then(({ set, number }) =>{
      this.setState({ showPayMethod : !set || number >= 3 })
    })
  }

  toastError = (error) => {
    Toast.fail(error[0], 1.5)
  }


  render () {
    const { showModal, IsSetPayPassword, ready, virtualAccount, haveTryNumber, showPayMethod } = this.state
    const { location: { query: { totalFreight = 0, serviceCharge = 0, prebookingId, avatar, nickName, orderId } } } = this.props
    const haveEnoughMoney = virtualAccount >= Number(totalFreight) + Number(serviceCharge)

    return (ready &&
      <>
        <Modal
          transparent
          style={{ width: '85%' }}
          onClose={this.onCloseModal}
          visible={showModal}
        >
          <div style={{ padding: '5px' }}>
            <PaymentModal
              totalFreight={totalFreight}
              nickName={nickName}
              orderId={orderId}
              prebookingId={prebookingId}
              IsSetPayPassword={IsSetPayPassword}
              haveTryNumber={haveTryNumber}
              paymentAuthorizationPhone={this.paymentAuthorizationPhone}
              paymentAuthorizationName={this.paymentAuthorizationName}
              onCloseModal={this.onCloseModal}
            />
          </div>
        </Modal>

        <Card className='mb-10'>
          <Card.Body>
            <div className='fw-bold'>请向对方付款</div>
            <div style={{ fontSize: '40px', textAlign: 'center' }}>
              ￥{totalFreight}
            </div>
            <Divider />
            <Flex justify='between'>
              <Flex>
                <img style={{ width : '24px', height : '24px' }} src={tick} alt='图片加载失败' />
                <div className='ml-10'>运费</div>
              </Flex>
              <div>￥{totalFreight}</div>
            </Flex>
          </Card.Body>
        </Card>

        <Card style={{ padding : '10px' }} className='mb-10'>
          <Card.Header title='微信' thumb={wechat} />
          <Card.Body>
            <Flex className='mt-10 mb-10 color-gray'>
              <img src={avatar || heading} alt='' style={{ borderRadius: '24px', width: '48px', height: '48px' }} />
              <div style={{ marginLeft: '10px' }}>{nickName}</div>
            </Flex>
          </Card.Body>
        </Card>

        <SchemaForm schema={this.schema}>
          {
            showPayMethod &&
            <Card className='mb-10'>
              <Card.Body>
                <Radio.Group defaultValue={1} onChange={this.onSelectPayWay}>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */}
                  <label>
                    <Flex>
                      <Radio value={1} />
                      <Item style={{ paddingLeft: 0 }} field='smsCode' />
                    </Flex>
                  </label>
                  <Flex className='mb-10 color-gray' justify='between'>
                    <span>验证码已发送到手机</span>
                    <span>{this.paymentAuthorizationPhone}</span>
                    <span>{this.paymentAuthorizationName}</span>
                  </Flex>
                  <Radio value={2}>支付密码支付</Radio>
                </Radio.Group>
              </Card.Body>
            </Card>
          }
          <Card style={{ position: 'fixed', bottom: '0', width: '100%', padding: '10px' }}>
            <Flex justify='between' className='mb-10'>
              <div className='color-gray '>账户余额:{virtualAccount}</div>
              {!haveEnoughMoney && <div onClick={()=>Modal.alert('温馨提示', '请在电脑端登录https://51ejd.com/user/login进行充值')} style={{ color: 'red' }}>余额不足，请充值</div>}
            </Flex>
            <Flex>
              <Button
                onClick={() => router.go(-2)}
                style={{ width: '30%', marginRight: '20px' }}
                type='ghost'
              >暂不支付
              </Button>
              <DebounceFormButton
                style={{ width: '70%' }}
                type='primary'
                onError={this.toastError}
                onClick={this.handleConfirmPay}
                disabled={!haveEnoughMoney || !this.isAllowPay}
              >确认支付
              </DebounceFormButton>
            </Flex>
          </Card>
        </SchemaForm>


      </>
    )
  }
}
