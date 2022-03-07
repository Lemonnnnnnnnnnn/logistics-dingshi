import React from 'react'
import { connect } from 'dva'
// import FastClick from 'fastclick'
import router from 'umi/router'
import { DICTIONARY_TYPE } from '@/services/dictionaryService'
import { loadScript } from '@/utils/utils'
import { getUserInfo, getMac, setMac, clearUserInfo } from '@/services/user'


// FastClick.attach(document.body)
const routerConfig = {
  transportInfo:`/weapp/transportDetail?transportId=`,
  transportConfirm: `/weapp/transportDetail?transportId=`,
  goodsPlanInfo: `/weapp/goodsplansDetail?goodsPlanId=`,
  project: `/weapp/personalCenter/contractList/contractDetail?projectId=`
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
    init: false
  }

  componentDidMount () {
    const { location: { query: { type, id } } } = this.props
    if (type) router.push(`${routerConfig[type]}${id}`)
    this.timeouter = setTimeout(() => {
      const { accessToken } = getUserInfo()
      this.registerWeChatSDK()
      if (accessToken) {
        this.props.getDictionaries({ dictionaryType: DICTIONARY_TYPE.GOODS_UNIT })
        this.props.getNowUser()
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
    loadScript('https://res.wx.qq.com/open/js/jweixin-1.4.0.js')
      .then(() => this.setState({ init: true }))
  }

  getToken = () => {
    const { login, location: { query: { __mac } } } = this.props
    const mac = __mac || getMac()
    if (mac) {
      setMac(mac)
      const token = JSON.parse(mac)
      login({ ...token, mobileToken: true })
    } else {
      // todo 设置游客模式
    }
  }

  componentDidUpdate () {
    this.setTitle()
  }

  setTitle = () => {
    const { route: { routes }, location: { pathname } } = this.props
    const matchedRoute = routes.find(({ path }) => path === pathname)
    const title = matchedRoute ? matchedRoute.name : '易键达'
    document.title = title
  }

  getDefaultActiveTab = () => {
    const { location: { pathname } } = this.props
    const currentTab = this.tabs.find(tab => pathname.includes(tab.to)) || this.tabs[0]
    return currentTab.key
  }

  render () {
    const { children } = this.props
    const { init } = this.state

    return init ? children : ''
  }
}

export default WeappLayout
