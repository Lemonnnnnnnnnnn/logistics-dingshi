import React from 'react'
import { connect } from 'dva'
import { Toast, Steps, Modal } from 'antd-mobile'
import moment from 'moment'
import router from 'umi/router'
import { JSEncrypt } from 'jsencrypt'
import CSSModules from 'react-css-modules'
import CopyToClipboard from 'react-copy-to-clipboard'
import model from '@/models/order'
import transportsModel from '@/models/transports'
import { formatMoney, unitPrice, lodashDebounce } from '@/utils/utils'
import { getVirtualAccount, getPublicKey, postPayOrder } from '@/services/apiService'
import copyable from '@/assets/driver/copyable.png'
import heading from '@/assets/driver/heading.png'
import phoneCall from '@/assets/driver/phoneCall.png'
import styles from './detail.less'

const { Step } = Steps

const { actions: { detailTransports } } = transportsModel

const { actions: { detailOrders } } = model

function mapStateToProps (state) {
  return {
    detail: state.orders.entity,
    transport: state.transports.entity,
  }
}

@connect(mapStateToProps, { detailOrders, detailTransports })
@CSSModules(styles, { allowMultiple: true })
export default class Detail extends React.Component {
  state = {
    isCopy: true,
    modal: false,
  }

  allowClickPayOrder = true

  constructor (props) {
    super(props)
    this.payOrderDebounce = lodashDebounce(this._payOrder, 1000)
  }

  _payOrder = () => {

    Toast.loading('正在支付中...', 100)
    getVirtualAccount({ virtualAccountType: 1 }).then(moneyInfo => {
      this.setState({
        virtualAccountBalance: moneyInfo.virtualAccountBalance || 0,
      })
      if (!moneyInfo.virtualAccountBalance) {

        return Toast.fail('余额不足,请先充值！')
      }
      const { detail, location: { query: { completeBack } } } = this.props

      const payFreight = detail.orderInternalStatus !== 1 ?
        Number(detail.totalFreight || 0) - Number(detail.damageCompensation || 0) + Number(detail.serviceCharge || 0) :
        Number(detail.totalFreight || 0) - Number(detail.damageCompensation || 0)

      if (moneyInfo.virtualAccountBalance < payFreight) {

        return Toast.fail('余额不足,请先充值！')
      }
      if (this.allowClickPayOrder) {
        this.allowClickPayOrder = false
        getPublicKey().then(data => {
          const RSA = new JSEncrypt()
          RSA.setPublicKey(data.publicKeyString)
          const orderIdList = [RSA.encrypt(detail.orderId.toString())]
          const newParams = { orderIdList, key: data.key, payChannel: 2 }
          postPayOrder(newParams)
            .then(() => {
              if (completeBack) {
                return Toast.success('支付成功', 1.5, () => {
                  router.replace('/WeappConsign/main/staging?initialPage=1&transportPage=3')
                })
              }
              const { virtualAccountBalance } = this.state
              this.setState({
                virtualAccountBalance: virtualAccountBalance - payFreight,
              }, () => {
                Toast.success('支付成功', 1.5, () => {
                  this.closeModal()
                  this.refresh()
                })
              })
              this.allowClickPayOrder = true
            })
            .catch((error) => {
              this.allowClickPayOrder = true
              Toast.fail(error.tips)
            })
        })
      } else {
        Toast.info('请勿重复点击')
      }
    })
  }

  onChangeRouter = () =>{
    const { detail : { totalFreight, serviceCharge, orderId }, transport : { prebookingId, avatar = '', wxNickName : nickName } } = this.props
    router.push(`/WeappConsign/reservation/payment?totalFreight=${totalFreight}&serviceCharge=${serviceCharge}&prebookingId=${prebookingId}&avatar=${avatar}&nickName=${nickName}&orderId=${orderId}`)
  }

  componentDidMount () {
    this.refresh()
  }

  refresh = () => {
    const { location: { query: { orderId } }, detailOrders, detailTransports } = this.props
    Promise.all([getVirtualAccount({ virtualAccountType: 1 }), detailOrders({ orderId })]).then(res => {
      detailTransports({ transportId: res[1].orderDetailItems[0].transportId }).then((transport => {
        this.item = {
          label: '运单号',
          content: transport.transportNo,
        }
        this.setState({
          virtualAccountBalance: res[0].virtualAccountBalance,
          ready: true,
        })
      }))
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

  renderList = () => {
    const { transport } = this.props
    const detail = transport
    const addressArr = detail.deliveryItems.map(item => (
      <Step
        key={item.deliveryId}
        title={item.deliveryName}
        icon={this.circle('green')}
        description={
          <>
            <p styleName='description'>{`${item.deliveryAddress || ''}`}</p>
            <p styleName='description'>{`${item.goodsName},预约${item.goodsNum}${item.goodsUnitCN}`}</p>
          </>
        }
      />
    ))
    if (!detail.receivingItems) return addressArr
    detail.receivingItems.map(item => (
      addressArr.push(<Step
        key={item.receivingId}
        title={item.receivingName}
        icon={this.circle('yellow')}
        description={
          <>
            <p styleName='description'>{`${item.receivingAddress}`}</p>
            {
              detail.deliveryItems.map(item => (
                <p styleName='description'>{`${item.goodsName},预约${item.receivingNum}${item.goodsUnitCN}`}</p>
              ))
            }
          </>
        }
      />)
    ))
    return addressArr
  }

  stop = e => {
    e.stopPropagation()
  }

  confirmPaymentBill = () => {
    this.setState({
      modal: true,
    })
  }

  closeModal = () => {
    this.setState({
      modal: false,
    })
  }

  payOrder = () => {
    this.payOrderDebounce()
  }

  getOrderState = () => {
    const { detail: { orderState } } = this.props
    const stateConfig = {
      0: { tips: '未支付', class: 'unpaid' },
      1: { tips: '未支付', class: 'unpaid' },
      2: { tips: '已支付', class: 'paid' },
      3: { tips: '已作废', class: 'unpaid' },
      4: { tips: '未支付', class: 'unpaid' },
      5: { tips: '已支付', class: 'paid' },
    }[orderState] || { tips: '未支付', class: 'unpaid' }
    return (
      <span styleName={stateConfig.class}>{stateConfig.tips}</span>
    )
  }

  render () {
    const { detail, transport } = this.props
    const { isCopy, ready, virtualAccountBalance } = this.state
    return (
      ready
      &&
      <div>
        <div styleName='order_title'>
          <span>
            支付单号：{detail.orderNo}
          </span>
          {this.getOrderState()}
        </div>
        <div styleName='line_box'>
          <div />
        </div>
        <div styleName='userInfo_box'>
          <div styleName='info_box'>
            <img src={heading} alt='图片加载失败' />
            <div>
              <p>{transport.driverUserName}</p>
              <p>
                <span>成交：{transport.driverFixtureNumber || '0'}</span>
                <span />
                <span>好评率：{transport.driverFeedbackRate || '0%'}</span>
              </p>
            </div>
          </div>
          <a href={`tel: ${transport.driverUserPhone}`}>
            <img src={phoneCall} alt='图片加载失败' />
          </a>
        </div>
        <div styleName='detail_box'>
          <header>
            <span>运单号：</span>
            <span>{transport.transportNo}</span>
            {
              isCopy ?
                <div onClick={this.stop}>
                  <CopyToClipboard onCopy={this.onCopy} text={this.item.content || this.item.label}>
                    <img src={copyable} alt='图片加载失败' />
                  </CopyToClipboard>
                </div>
                :
                null
            }
          </header>
          <div styleName='line' />
          <Steps className='paymentBill_detailPage_item_step_colorful'>
            {this.renderList()}
          </Steps>
          <div styleName='line0' />
          <div styleName='itemBox'>
            <p>提货时间: {transport.deliveryTime ? moment(transport.deliveryTime).format('YYYY-MM-DD HH点') : '无'}</p>
            <p>运输费用: {unitPrice(transport, 4)}</p>
          </div>
        </div>
        {
          detail.orderState === 1 ?
            <div styleName='btn_box'>
              {detail.orderInternalStatus !== 1 ?
                <span>{`￥${formatMoney((Number(detail.totalFreight || 0) + Number(detail.damageCompensation || 0) + Number(detail.serviceCharge || 0)).toFixed(2)._toFixed(2))}`}</span> :
                <span>{`￥${formatMoney((Number(detail.totalFreight || 0) - Number(detail.damageCompensation || 0)).toFixed(2)._toFixed(2))}`}</span>
              }

              <button styleName='btn_blue' type='button' onClick={this.confirmPaymentBill}>结算</button>
            </div>
            :
            null
        }
        <Modal
          visible={this.state.modal}
          transparent
          maskClosable={false}
          onClose={this.closeModal}
          title='运输费用'
          footer={[
            { text: '取消', onPress: this.closeModal },
            { text: '支付', onPress: this.onChangeRouter },
          ]}
        >
          <p styleName='info_p'>
            <span>运输费用</span>
            <span>￥{formatMoney((Number(detail.totalFreight || 0)).toFixed(2)._toFixed(2))}</span>
          </p>
          {detail.orderInternalStatus !== 1 &&
          <p styleName='info_p'>
            <span>托运手续费</span>
            <span>￥{formatMoney((Number(detail.serviceCharge || 0)).toFixed(2)._toFixed(2))}</span>
          </p>}
          <p styleName='info_p total'>
            <span>托运总费用</span>
            {detail.orderInternalStatus !== 1 ?
              <span>￥{formatMoney((Number(detail.totalFreight || 0) - Number(detail.damageCompensation || 0) + Number(detail.serviceCharge || 0)).toFixed(2)._toFixed(2))}</span> :
              <span>￥{formatMoney((Number(detail.totalFreight || 0) - Number(detail.damageCompensation || 0)).toFixed(2)._toFixed(2))}</span>}
          </p>
          <p
            styleName='virtualAccountBalance'
          >账户剩余金额：￥{formatMoney((virtualAccountBalance || 0).toFixed(2)._toFixed(2))}
          </p>
        </Modal>
      </div>
    )
  }
}
