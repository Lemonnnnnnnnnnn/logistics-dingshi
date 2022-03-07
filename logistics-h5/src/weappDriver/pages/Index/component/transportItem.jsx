import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Toast, Button, Flex } from 'antd-mobile'
import router from 'umi/router'
import { TRANSPORTIMMEDIATESTATUS } from '@/constants/transport/transport'
import { changeTransportStatus, getJsSDKConfig, postTransportProcess, getTransportRejects } from '@/services/apiService'
import { unitPrice, browser } from '@/utils/utils'
import copyable from '@/assets/driver/copyable.png'
import styles from './transportItem.less'
import TransportListInfo from './step'

@CSSModules(styles, { allowMultiple: true })
export default class DetailItem extends Component {
  state = {
    isCopy: true,
  }

  allowClickBtn = true

  onCopy = () => {
    Toast.success('已复制运单号到剪切板', 1)
    this.setState({
      isCopy: false,
    })
  }

  componentDidMount = () => {
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

  toDetail = () => {
    router.push(`index/transportDetail?transportId=${this.props.item.transportId}`)
  }

  stop = e => {
    e.stopPropagation()
  }

  getTransport = () => {
    const { refresh } = this.props
    return refresh()
  }

  renderButton = () => {
    const { item } = this.props
    const { transportImmediateStatus, transportId } = item
    const { transportBill } = item.logisticsBusinessTypeEntity || {}
    const billArray = (transportBill || '').split(',')
    const isArriveImage = billArray.some(item => `${item}` === '4')
    const accept = {
      title: '接单',
      className: 'default_button',
      onClick: (e) => {
        e.stopPropagation()
        Toast.loading('正在获取定位信息', 1000)

        wx.getLocation({
          type: 'gcj02',
          isHighAccuracy: true,
          success: res => {
            Toast.hide()
            const { longitude, latitude } = res
            postTransportProcess({ longitude, latitude, pointType: 1, transportId })
              .then(() => this.getTransport())
          },
          fail: () => {
            Toast.hide()
            postTransportProcess({ longitude: 0.0, latitude: 0.0, pointType: 1, transportId })
              .then(() => this.getTransport())
            // Toast.fail('获取定位信息失败，请开启定位', 1)
          },
        })
      },
    }
    const _accept = {
      title: '接单',
      className: 'default_button',
      onClick: (e) => {
        e.stopPropagation()
        Toast.loading('接单待确认中', 2)
      },
    }
    const refuse = {
      title: '拒绝',
      className: 'color_red_background_white',
      onClick: (e) => {
        e.stopPropagation()
        if (this.allowClickBtn) {
          this.allowClickBtn = false
          changeTransportStatus({ transportId, iseffectiveStatus: -1, verifyReason: '司机不干' })
            .then(() => {
              this.allowClickBtn = true
              this.getTransport()
            })
            .catch(()=> this.allowClickBtn = true)
        } else {
          Toast.info('请勿重复点击')
        }
      },
    }
    const withdraw = {
      title: '取消申请',
      className: 'color_red_background_white',
      onClick: (e) => {
        e.stopPropagation()
      },
    }
    const carryOut = {
      title: '执行任务',
      className: 'default_button',
      onClick: (e) => {
        e.stopPropagation()
        if (this.allowClickBtn) {
          this.allowClickBtn = false
          changeTransportStatus({ transportId, processStatus: 5 })
            .then(() => {
              this.allowClickBtn = true
              this.getTransport()
            })
            .catch(()=> this.allowClickBtn = true)
        } else {
          Toast.info('请勿重复点击')
        }
      },
    }
    const handleAbnormal = {
      title: '提交异常',
      className: 'color_red_background_white',
      onClick: (e) => {
        e.stopPropagation()
        router.push(`/WeappDriver/feedback/transportException?transportId=${transportId}`)
      },
    }
    const arrived = {
      title: '已到站',
      className: 'default_button',
      onClick: (e) => {
        e.stopPropagation()
        if (isArriveImage) {
          return router.push(`/WeappDriver/driverReceive?transportId=${transportId}`)
        }
        Toast.loading('正在获取定位信息', 1000)
        wx.getLocation({
          type: 'gcj02',
          isHighAccuracy: true,
          success: res => {
            Toast.hide()
            const { longitude, latitude } = res
            postTransportProcess({ longitude, latitude, pointType: 3, transportId })
              .then(() => this.getTransport())
          },
          fail: () => {
            postTransportProcess({ longitude: 0.0, latitude: 0.0, pointType: 3, transportId })
              .then(() => this.getTransport())
            // Toast.fail('获取定位信息失败，请开启定位', 1)
          },
        })
      },
    }
    const sign = {
      title: '签收',
      className: 'default_button',
      onClick: (e) => {
        e.stopPropagation()
        router.push(`/WeappDriver/driverSign?transportId=${transportId}`)
      },
    }
    const resign = {
      title: '重新签收',
      className: 'default_button',
      onClick: (e) => {
        e.stopPropagation()
        router.push(`/WeappDriver/driverResign?transportId=${transportId}`)
      },
    }

    const rePickup = {
      title: '重新提货',
      className: 'default_button',
      onClick: async (e) => {
        e.stopPropagation()
        const { items } = await getTransportRejects(transportId, 2)
        const [reject = {}] = items || []
        const { billDentryid, billNumber, deliveryNum, transportCorrelationId, processPointId } = reject
        router.push({
          pathname: '/WeappDriver/driverPickup',
          query: {
            transportId,
            repick: 1,
            transpotCorrelationId: transportCorrelationId,
          },
          state: {
            rejectInfo: {
              billDentryid: billDentryid.split(','),
              billNumber,
              deliveryNum,
              processPointId,
            },
          },
        })
      },
    }
    const operations = {
      [TRANSPORTIMMEDIATESTATUS.UNTREATED]: [refuse, accept],
      [TRANSPORTIMMEDIATESTATUS.ACCEPT]: [handleAbnormal, carryOut],
      [TRANSPORTIMMEDIATESTATUS.CANCEL]: [],
      [TRANSPORTIMMEDIATESTATUS.COMPLETE]: [],
      [TRANSPORTIMMEDIATESTATUS.UNDELIVERY]: [handleAbnormal],
      [TRANSPORTIMMEDIATESTATUS.RECEIVED]: [handleAbnormal, sign],
      [TRANSPORTIMMEDIATESTATUS.TRANSPORTING]: [handleAbnormal, arrived],
      [TRANSPORTIMMEDIATESTATUS.CUSTOMER_REFUSE]: [resign],
      [TRANSPORTIMMEDIATESTATUS.CUSTOMER_AUDITED]: [],
      [TRANSPORTIMMEDIATESTATUS.CONSIGNMENT_REFUSE]: [resign],
      [TRANSPORTIMMEDIATESTATUS.SIGNED]: [],
      [TRANSPORTIMMEDIATESTATUS.RESINGED]: [],
      [TRANSPORTIMMEDIATESTATUS.REFUSED]: [],
      [TRANSPORTIMMEDIATESTATUS.TRANSPORT_EXECPTION]: [],
      [TRANSPORTIMMEDIATESTATUS.CUSTOMER_UNAUDITED]: [],
      [TRANSPORTIMMEDIATESTATUS.CONSIGNMENT_UNAUDITED]: [],
      [TRANSPORTIMMEDIATESTATUS.UNJUDGE]: [withdraw, _accept],
      [TRANSPORTIMMEDIATESTATUS.JUDGE_REFUCE]: [],
      [TRANSPORTIMMEDIATESTATUS.CANCEL_APPLY]: [],
      [TRANSPORTIMMEDIATESTATUS.TRANSPORT_TIMEOUT]: [],
      [TRANSPORTIMMEDIATESTATUS.DELIVERY_UNAUDITED]: [],
      [TRANSPORTIMMEDIATESTATUS.DELIVERY_AUDITED_REFUSE]: [rePickup],
    }[transportImmediateStatus] || []
    return operations.map((item, index) => (
      <Button
        key={index}
        inline
        size='small'
        styleName={`${item.className} list_button`}
        onClick={item.onClick}
        style={{ marginRight: '15px' }}
      >
        {item.title}
      </Button>
    ))
  }

  renderStatus = () => {
    const { item: { transportImmediateStatus } } = this.props
    switch (transportImmediateStatus) {
      case TRANSPORTIMMEDIATESTATUS.DELIVERY_UNAUDITED:
        return <span styleName='tab'>提货待审</span>
      case TRANSPORTIMMEDIATESTATUS.UNTREATED:
        return <span styleName='tab'>待接单</span>
      case TRANSPORTIMMEDIATESTATUS.DELIVERY_AUDITED_REFUSE:
        return <span styleName='tab'>审核已拒绝</span>
      case TRANSPORTIMMEDIATESTATUS.SIGNED || TRANSPORTIMMEDIATESTATUS.CUSTOMER_UNAUDITED || TRANSPORTIMMEDIATESTATUS.CONSIGNMENT_UNAUDITED:
        return <span styleName='tab'>待审核</span>
      default:
        return null
    }
  }

  render () {
    const { isCopy } = this.state
    const { item: { deliveryTime, transportNo, isTitle, titleText, projectName } } = this.props
    return (
      isTitle
        ? <div styleName='section_title'>{titleText}</div>
        :
        <div styleName='container' onClick={this.toDetail}>
          {this.renderStatus()}
          <header>
            <Flex>
              <div>
                <span>运单号：</span>
                <span>{this.props.item.transportNo}</span>
              </div>
              {
                isCopy ?
                  <div onClick={this.stop}>
                    <CopyToClipboard onCopy={this.onCopy} text={transportNo}>
                      <img src={copyable} alt='复制' />
                    </CopyToClipboard>
                  </div>
                  :
                  null
              }
            </Flex>
            <div>
              <span>项目名称：</span>
              <span>{projectName}</span>
            </div>
          </header>
          <div styleName='line' />
          <TransportListInfo item={this.props.item} />
          <div styleName='line0' />
          <div styleName='dateBox'>
            {
              deliveryTime ? <span>提货时间：{moment(deliveryTime).format('YYYY/MM/DD HH:mm:ss')}</span> :
              <span>装货时间：无</span>
            }
            <span>{unitPrice(this.props.item)}</span>
          </div>
          <div styleName='text_align_right'>
            {this.renderButton()}
          </div>
        </div>
    )
  }
}
