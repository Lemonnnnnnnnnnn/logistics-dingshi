import React, { Component } from 'react'
import { Item, SchemaForm } from '@gem-mine/mobile-schema-form'
import { setPayPassword, checkPayCode, scanPayOrder, getPublicKey } from '@/services/apiService'
import { Button, Flex, Toast, Icon } from 'antd-mobile'
import DebounceFormButton from '@/components/DebounceFormButton'
import tick2 from '@/assets/consign/tick2.png'
import { JSEncrypt } from 'jsencrypt'
import router from 'umi/router'
import SmsCode from './smsCode'
import PasswordField from './passwordField'


class PaymentModal extends Component {
  state = {
    password: '',
    PWRight: true,
    modalState: 1,
    haveTryNumber: 0,
  }

  isAllowPay = true

  isAllowJudgeCode = true

  componentDidMount () {
    const { paymentAuthorizationPhone, IsSetPayPassword, haveTryNumber } = this.props
    // 如果没有设过密码，直接进入忘记密码页面
    if (!IsSetPayPassword) {
      this.setState({ modalState: 2 })
    }
    // 将进入弹窗时已尝试过的密码次数保存到state中，避免重复请求
    this.setState({ haveTryNumber })

    this.schema = {
      smsCode: {
        label: '验证码',
        component: SmsCode,
        props: {
          smsType: 'SMS_189621738',
          // TODO: 开启自动发送验证码
          sendAtStart : true,
          phoneNumber: paymentAuthorizationPhone,
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
  }

  handleSetPassword = () => {
    const { password } = this.state
    if (password.length === 4) {
      setPayPassword({ password })
        .then(() => {
          // 设置密码成功，可尝试次数清空，记录密码的状态值清空
          this.setState({ modalState: 4, password: '', haveTryNumber: 0 })
        })
    } else {
      Toast.info('请输入密码')
    }

  }

  handleInputPW = (v) => {
    const { nickName } = this.props
    let { orderId } = this.props
    const { modalState } = this.state

    this.setState({ password: v })
    // 如果为窗口1，输入支付密码，否则只进行存储密码操作，用于设置密码
    if (modalState === 1) {
      if (v.length === 4) {
        if (this.isAllowPay){
          this.isAllowPay = false
          getPublicKey().then(data => {
            const RSA = new JSEncrypt()
            RSA.setPublicKey(data.publicKeyString)
            orderId = RSA.encrypt(orderId.toString())
            const newParams = {
              orderId,
              key: data.key,
              password: v,
              phone: this.paymentAuthorizationPhone,
              weChatNickName: nickName,
              payChannel: '2',
            }

            // 用密码进行支付操作
            Toast.loading('正在支付...')
            scanPayOrder(newParams)
              .then(() => {
                this.isAllowPay = true
                Toast.hide()
                Toast.info('支付成功！')
                setTimeout(() => {
                  router.go(-2)
                }, 1000)
                // }
              })
              .catch(({ message }) => {
                this.isAllowPay = true
                Toast.hide()
                if (message.indexOf(':') !== -1){
                  this.setState({ PWRight: false, haveTryNumber: message.split(':')[1] })
                  setTimeout(() => {
                    this.setState({ PWRight: true })
                  }, 2000)
                } else {
                  Toast.info(message)
                }
              })
          })
        } else {
          Toast.info('请勿重复点击支付')
        }
      }
    }
  }

  next = (value) => {
    const { paymentAuthorizationPhone } = this.props
    const { smsCode } = value
    if (!smsCode) {
      Toast.info('请输入验证码')
      return false
    }
    const params = {
      phone: paymentAuthorizationPhone,
      code: smsCode,
    }

    // this.setState({ modalState: 3 })

    if (this.isAllowJudgeCode){
      this.isAllowJudgeCode = false
      checkPayCode(params)
        .then((res) => {
          if (res) {
            this.setState({ modalState: 3 })
          }
        })
        .catch(()=>{
          this.isAllowJudgeCode = true
        })
    } else {
      Toast.fail('请勿重复点击')
    }

  }


  renderModal = () => {
    const { modalState, PWRight, password = '', haveTryNumber } = this.state
    const { totalFreight } = this.props
    const caryTryNumber = 3 - haveTryNumber
    switch (modalState) {
      case 1 :
        return (
          <div style={{ position: 'relative' }}>
            <div style={{ textAlign: 'center', fontSize: '16px', color: '#000' }} className='fw-bold'>支付密码</div>
            <div
              style={{ position: 'absolute', top: 0, right: 0 }}
              className='color-gray'
              onClick={() => this.setState({ modalState: 2, password: '' })}
            >忘记支付密码
            </div>
            <div style={{ textAlign: 'center', marginTop: '35px' }}>
              <div style={{ fontSize: '13px' }}>易键达司机运费</div>
              <div
                className='fw-bold'
                style={{ fontSize: '30px', color: caryTryNumber <= 0 ? '#989898' : '#000' }}
              >￥{totalFreight}
              </div>
            </div>
            {caryTryNumber > 0 && <PasswordField onChange={this.handleInputPW} PWRight={PWRight} value={password} />}
            <div style={{
              color: '#E03147',
              visibility: caryTryNumber === 3 ? 'hidden' : 'visible',
              marginTop: '5px',
              fontSize: '13px',
            }}
            >
              {caryTryNumber > 0 ? `支付密码错误，还可尝试${caryTryNumber}次，如忘记密码可通过点击忘记支付密码进行重置支付密码` : '支付密码已错误3次，请点击忘记支付密码进行修改或选择验证码支付'}
            </div>
            {caryTryNumber <= 0 &&
            <div
              className='color-gray'
              onClick={this.props.onCloseModal}
              style={{ marginTop: '30px', textAlign: 'center' }}
            >
              验证码支付
            </div>}
          </div>

        )
      case 2 :
        return (
          <SchemaForm schema={this.schema}>
            <div style={{ textAlign: 'center', color: '#000', fontSize: '18px' }} className='fw-bold'>忘记支付密码</div>
            <Item style={{ paddingLeft: 0 }} field='smsCode' />
            <Flex className='mb-10 color-gray' justify='between'>
              <span>验证码已发送到手机</span>
              <span>{this.props.paymentAuthorizationPhone}</span>
              <span>{this.props.paymentAuthorizationName}</span>
            </Flex>
            <Flex style={{ marginTop: '40px' }}>
              <Button style={{ width: '50%' }} onClick={this.props.onCloseModal}>取消</Button>
              <DebounceFormButton
                style={{ width: '50%', overflow: 'visible' }}
                type='ghost'
                disabled={!this.isAllowJudgeCode}
                onClick={this.next}
              >下一步
              </DebounceFormButton>
            </Flex>

          </SchemaForm>
        )
      case 3 :
        return (
          <div>
            <div style={{ textAlign: 'center', color: '#000', fontSize: '18px' }} className='fw-bold '>设置支付密码</div>
            <div style={{ textAlign: 'center' }} className='color-gray mt-20'>该支付密码仅限当天有效</div>
            <PasswordField onChange={this.handleInputPW} PWRight={PWRight} value={password} />
            <Flex style={{ marginTop: '20px' }}>
              <Button style={{ width: '50%' }} onClick={this.props.onCloseModal}>取消</Button>
              <Button
                style={{ width: '50%', overflow: 'visible' }}
                type='ghost'
                onClick={this.handleSetPassword}
              >确定
              </Button>
            </Flex>
          </div>
        )
      case 4 :
        return (
          <div>
            <Flex style={{ height: '150px' }} justify='center'>
              <div>
                <Flex justify='center' className='mb-10'>
                  <img src={tick2} alt='图片显示失败' />
                </Flex>
                <div style={{ color: 'green' }}>支付密码设置成功</div>
              </div>
            </Flex>
            <Flex style={{ marginTop: '20px' }}>
              <Button style={{ width: '50%' }} onClick={() => router.go(-2)}>取消</Button>
              <Button
                style={{ width: '50%', overflow: 'visible' }}
                type='ghost'
                onClick={() => this.setState({ modalState: 1 })}
              >继续支付
              </Button>
            </Flex>
          </div>
        )
      default:
        null
    }
  }


  render () {
    return (
      <>
        <Icon
          onClick={this.props.onCloseModal}
          type='cross'
          style={{
            position: 'absolute',
            width: '3rem',
            height: '3rem',
            top: '0.5rem',
            left: '0.5rem',
            zIndex: '100',
            padding: '0.5rem',
          }}
        />
        {this.renderModal()}
      </>
    )
  }
}

export default PaymentModal
