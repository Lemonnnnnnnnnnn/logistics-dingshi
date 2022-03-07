import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import QRCode from 'qrcode.react'
import router from 'umi/router';
import CopyToClipboard from 'react-copy-to-clipboard'
import { Toast, Button, Flex } from 'antd-mobile'
import { getTransport, postTransportProcess, changeTransportStatus, getTransportRejects, getJsSDKConfig } from '@/services/apiService'
import copyable from '@/assets/driver/copyable.png'
import heading from '@/assets/driver/heading.png'
import phoneCall from '@/assets/driver/phoneCall.png'
import complete from '@/assets/driver/complete.png'
import cancel from '@/assets/driver/cancel.png'
import { unitPrice, browser } from '@/utils/utils'
import { TRANSPORTIMMEDIATESTATUS } from '@/constants/transport/transport'
import TransportListInfo from './component/step'
import styles from './transportDetail.less'

@CSSModules(styles, { allowMultiple: true })
export default class TransportDetail extends Component{
  state = {
    isCopy: true,
    ready: false
  }

  componentDidMount () {
    const { location: { query: { transportId } } } = this.props
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
    getTransport(transportId).then(data => {
      this.setState({
        detail: data,
        ready: true
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

  renderStatusPicture = () => {
    const { detail } = this.state
    let dom
    switch (detail.transportImmediateStatus) {
      case TRANSPORTIMMEDIATESTATUS.CANCEL:
        dom = <img styleName='statusPic' src={cancel} alt="图片加载失败" />
        break
      case TRANSPORTIMMEDIATESTATUS.COMPLETE:
        dom = <img styleName='statusPic' src={complete} alt="图片加载失败" />
        break
      default: dom = <span />
    }
    return dom
  }

  renderPickupTime = () => {
    const { detail } = this.state
    const deliveryTime = detail.eventItems.find(item => item.eventStatus === 5 || item.eventStatus === 30)?.createTime
    const tips = deliveryTime ?moment(deliveryTime).format('YYYY-MM-DD HH:mm:ss') : '无'
    return tips
  }

  getTransport = () => {
    const { location: { query: { transportId } } } = this.props
    getTransport(transportId).then(data => {
      this.setState({
        detail: data,
        ready: true
      })
    })
  }

  renderButton = () => {
    const { detail:item } = this.state
    const { transportImmediateStatus, transportId } = item
    const accept = {
      title: '接单',
      className:'default_button',
      onClick: (e) => {
        e.stopPropagation()
        Toast.loading('正在获取定位信息', 1000)
        wx.getLocation({
          type:'gcj02',
          isHighAccuracy:true,
          success:res => {
            Toast.hide()
            const { longitude, latitude } = res
            postTransportProcess({ longitude, latitude, pointType:1, transportId })
              .then(() => this.getTransport())
          },
          fail: () => {
            Toast.hide()
            // Toast.fail('获取定位信息失败，请开启定位', 1)
            postTransportProcess({ longitude:0.0, latitude:0.0, pointType:1, transportId })
              .then(() => this.getTransport())
          }
        })
      },
    }
    const _accept = {
      title: '接单',
      className:'default_button',
      onClick: (e) => {
        e.stopPropagation()
        Toast.loading('接单待确认中', 2)
      },
    }
    const refuse = {
      title: '拒绝',
      className:'color_red_background_white',
      onClick: (e) => {
        e.stopPropagation()
        changeTransportStatus({ transportId, iseffectiveStatus:-1, verifyReason:'司机不干' })
          .then(() => this.getTransport())
      },
    }
    const withdraw = {
      title: '取消申请',
      className:'color_red_background_white',
      onClick: (e) => {
        e.stopPropagation()
      },
    }
    const carryOut = {
      title: '执行任务',
      className:'default_button',
      onClick: (e) => {
        e.stopPropagation()
        changeTransportStatus({ transportId, processStatus:5 })
          .then(() => this.getTransport())
      },
    }
    const handleAbnormal = {
      title: '提交异常',
      className:'color_red_background_white',
      onClick: (e) => {
        e.stopPropagation()
        router.push(`/WeappDriver/feedback/transportException?transportId=${transportId}`)
      },
    }
    const arrived = {
      title: '已到站',
      className:'default_button',
      onClick: (e) => {
        e.stopPropagation()
        Toast.loading('正在获取定位信息', 1000)
        wx.getLocation({
          type:'gcj02',
          isHighAccuracy:true,
          success:res => {
            Toast.hide()
            const { longitude, latitude } = res
            postTransportProcess({ longitude, latitude, pointType:3, transportId })
              .then(() => this.getTransport())
          },
          fail: () => {
            // const { longitude, latitude } = res
            postTransportProcess({ longitude :0.0, latitude:0.0, pointType:3, transportId })
              .then(() => this.getTransport())
            // Toast.fail('获取定位信息失败，请开启定位', 1)
          }
        })
      },
    }
    const sign = {
      title: '签收',
      className:'default_button',
      onClick: (e) => {
        e.stopPropagation()
        router.push(`/WeappDriver/driverSign?transportId=${transportId}`)
      },
    }
    const resign = {
      title: '重新签收',
      className:'default_button',
      onClick: (e) => {
        e.stopPropagation()
        router.push(`/WeappDriver/driverResign?transportId=${transportId}`)
      },
    }

    const rePickup = {
      title: '重新提货',
      className:'default_button',
      onClick: async (e) => {
        e.stopPropagation()
        const { items } = await getTransportRejects(transportId, 2)
        const [reject={}] = items || []
        const { billDentryid, billNumber, deliveryNum, transportCorrelationId, processPointId } = reject
        router.push({
          pathname:'/WeappDriver/driverPickup',
          query:{
            transportId,
            repick:1,
            transpotCorrelationId:transportCorrelationId
          },
          state:{
            rejectInfo:{
              billDentryid:billDentryid.split(','),
              billNumber,
              deliveryNum,
              processPointId
            }
          }
        })
      },
    }
    const operations = {
      [TRANSPORTIMMEDIATESTATUS.UNTREATED]:[refuse, accept],
      [TRANSPORTIMMEDIATESTATUS.ACCEPT]:[handleAbnormal, carryOut],
      [TRANSPORTIMMEDIATESTATUS.CANCEL]:[],
      [TRANSPORTIMMEDIATESTATUS.COMPLETE]:[],
      [TRANSPORTIMMEDIATESTATUS.UNDELIVERY]:[handleAbnormal],
      [TRANSPORTIMMEDIATESTATUS.RECEIVED]:[handleAbnormal, sign],
      [TRANSPORTIMMEDIATESTATUS.TRANSPORTING]:[handleAbnormal, arrived],
      [TRANSPORTIMMEDIATESTATUS.CUSTOMER_REFUSE]:[resign],
      [TRANSPORTIMMEDIATESTATUS.CUSTOMER_AUDITED]:[],
      [TRANSPORTIMMEDIATESTATUS.CONSIGNMENT_REFUSE]:[resign],
      [TRANSPORTIMMEDIATESTATUS.SIGNED]:[],
      [TRANSPORTIMMEDIATESTATUS.RESINGED]:[],
      [TRANSPORTIMMEDIATESTATUS.REFUSED]:[],
      [TRANSPORTIMMEDIATESTATUS.TRANSPORT_EXECPTION]:[],
      [TRANSPORTIMMEDIATESTATUS.CUSTOMER_UNAUDITED]:[],
      [TRANSPORTIMMEDIATESTATUS.CONSIGNMENT_UNAUDITED]:[],
      [TRANSPORTIMMEDIATESTATUS.UNJUDGE]:[withdraw, _accept],
      [TRANSPORTIMMEDIATESTATUS.JUDGE_REFUCE]:[],
      [TRANSPORTIMMEDIATESTATUS.CANCEL_APPLY]:[],
      [TRANSPORTIMMEDIATESTATUS.TRANSPORT_TIMEOUT]:[],
      [TRANSPORTIMMEDIATESTATUS.DELIVERY_UNAUDITED]:[],
      [TRANSPORTIMMEDIATESTATUS.DELIVERY_AUDITED_REFUSE]:[rePickup],
    }[transportImmediateStatus] || []
    return operations.map((item, index) => (
      <Button key={index} styleName={`${item.className} list_button`} onClick={item.onClick}>{item.title}</Button>
    ))
  }

  render () {
    const { isCopy, ready, detail } = this.state
    return (
      ready
      &&
      <div styleName='container'>
        <div styleName='userInfo_box'>
          <div styleName='info_box'>
            <img src={heading} alt="图片加载失败" />
            <div>
              <p>{detail.createUserName}</p>
              <p>
                <span>成交：{detail.fixtureNumber || 0}</span>
                <span />
                <span>好评率：{detail.feedbackRate || '0%'}</span>
              </p>
            </div>
          </div>
          <a
            href={`tel: ${detail.logisticsBusinessTypeEntity.releaseHall === 1 ? detail.createPreUserPhone : detail.createUserPhone}`}
          >
            <img src={phoneCall} alt="图片加载失败" />
          </a>
        </div>
        <div styleName='detail_box'>
          {this.renderStatusPicture()}
          <header>
            <Flex>
              <div>
                <span>运单号：</span>
                <span>{detail.transportNo}</span>
              </div>
              {
                isCopy ?
                  <div onClick={this.stop}>
                    <CopyToClipboard onCopy={this.onCopy} text={detail.transportNo}>
                      <img src={copyable} alt="图片加载失败" />
                    </CopyToClipboard>
                  </div>
                  :
                  null
              }
            </Flex>
            <div>
              <span>项目名称：</span>
              <span>{detail.projectName}</span>
            </div>

          </header>
          <div styleName='line' />
          <TransportListInfo type='detail' item={detail} />
          <div styleName='line0' />
          <div styleName='itemBox'>
            <p>装货时间: {this.renderPickupTime()}</p>
            <p>运输费用: {`${unitPrice(detail)}`}</p>
          </div>
          <div styleName='qrCode'>
            {
              detail.transportImmediateStatus === 21?
                <>
                  <QRCode
                    value={`${window.envConfig.QRCodeEntry}/consign/transport/${detail.transportId}`}
                    size={200}
                    fgColor="#000000"
                    style={{
                      margin: '0 auto'
                    }}
                  />
                  <p styleName='qrcode_word'>展示给发货方微信扫码</p>
                  <p styleName='qrcode_word'>（可长按图片识别二维码)</p>
                </>
                :
                null
            }
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-around', position:'fixed', bottom:'80px', width:'100%' }}>
          {this.renderButton()}
        </div>
      </div>
    )
  }
}
