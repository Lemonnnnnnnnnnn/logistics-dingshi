import React from 'react'
import { connect } from 'dva'
import router from 'umi/router'
import { getJsSDKConfig } from '@/services/apiService'
import { Toast } from 'antd-mobile'
import { loadScript, round } from '@/utils/utils'
import { getUserInfo, getMac, setMac, clearUserInfo } from '@/services/user'

// eslint-disable-next-line no-extend-native
const _toFixed = Number.prototype.toFixed
// eslint-disable-next-line no-extend-native
Number.prototype._toFixed = _toFixed
// eslint-disable-next-line no-extend-native
Number.prototype.toFixed = function (len) {
  return round(this, len)
}

// FastClick.attach(document.body)
const routerConfig = {
  // transportInfo:`/weapp/transportDetail?transportId=`,
  // transportConfirm: `/weapp/transportDetail?transportId=`,
  // goodsPlanInfo: `/weapp/goodsplansDetail?goodsPlanId=`,
  // project: `/weapp/personalCenter/contractList/contractDetail?projectId=`
}

@connect(null, dispatch => ({
  login: payload => dispatch({ type: 'user/login', payload }),
  saveMac: payload => dispatch({ type: 'user/saveMac', payload }),
  getDictionaries: (payload) => dispatch({ type: 'dictionaries/getDictionaries', payload }),
  setWXSdk: payload => dispatch({ type: 'common/setWXSdk', payload }),
  getNowUser: () => dispatch({ type: 'user/getNowUser' })
}))

class WeappLayout extends React.PureComponent {
  constructor (props) {
    super(props)
    window.envConfig.envType = 'miniProgram'
    const { location: { query: { shouldClearUserInfo } } } = props
    if (shouldClearUserInfo){
      clearUserInfo()
    }
    this.setTitle()
    this.getToken()
  }

  state = {
    init: false,
    ready:false
  }

  componentDidMount () {
    const { location: { query: { qrCode, id } } } = this.props
    if (qrCode) {
      const index = qrCode.indexOf('transport')
      if (index !== -1) {
        const transportId = qrCode.split('/').splice(-1, 1)[0]
        router.push(`/WeappConsign/main/staging/transportDetail?transportId=${transportId}`)
      }
    }
    this.timeouter = setTimeout(() => {
      const { accessToken } = getUserInfo()
      this.registerWeChatSDK()
      if (accessToken) {
        this.props.getDictionaries()
        this.props.getNowUser()
          .then(()=>{
            this.setState({
              ready:true
            })
          })
      } else {
        this.setState({
          ready:true
        })
      }
    }, 300);
    // document.body.addEventListener('touchmove', (e) => {
    //   if (e._isScroller) return;
    //   e.preventDefault();
    // }, {
    //   passive: false
    // });
  }

  componentWillUnmount () {
    this.timeouter && clearTimeout(this.timeouter)
  }

  registerWeChatSDK = () => {
    loadScript('https://res.wx.qq.com/open/js/jweixin-1.6.0.js')
      .then(() => {
        getJsSDKConfig({ url: encodeURIComponent(window.location.href.split('#')[0]) })
          .then(({ timestamp, nonceStr, signature }) => {
            wx.config({
              debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
              appId: 'wx5b020341411ebf08', // 必填，公众号的唯一标识
              timestamp, // 必填，生成签名的时间戳
              nonceStr, // 必填，生成签名的随机串
              signature, // 必填，签名
              jsApiList: ['scanQRCode'] // 必填，需要使用的JS接口列表
            })
            this.setState({ init: true })
          })
      })
  }

  getToken = () => {
    const { login, location: { query: { __mac } } } = this.props
    const mac = __mac || getMac("CONSIGNMENT")
    if (mac) {
      setMac(mac)
      const token = JSON.parse(mac)
      login({ ...token, mobileToken: true })
    } else {
      router.replace('/WeappConsign/login')
    }
  }

  componentDidUpdate () {
    this.setTitle()
  }

  setTitle = () => {
    const { route: { routes }, location: { pathname } } = this.props
    const matchedRoute = routes.find(({ path }) => path === pathname)
    const title = matchedRoute ? matchedRoute.name : '易键达托运端'
    document.title = title
  }

  // getDefaultActiveTab = () => {
  //   const { location: { pathname } } = this.props
  //   const currentTab = this.tabs.find(tab => pathname.includes(tab.to)) || this.tabs[0]
  //   return currentTab.key
  // }

  render () {
    const { children } = this.props
    const { init, ready } = this.state

    return init && ready ? children : ''
  }
}

export default WeappLayout
