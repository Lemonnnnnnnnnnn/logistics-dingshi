import React from 'react'
// import { Toast } from 'antd-mobile'
import { connect } from 'dva'
import { Base64 } from 'js-base64'
// import { FastClick } from '@/utils/utils'
import defaultImage from '@/assets/error_load_image.png'

// FastClick.attach(document.body)
@connect(null, dispatch => ({
  login: payload => dispatch({ type: 'user/login', payload })
}))
class MobileLayout extends React.PureComponent {
  setTitle = () => {
    const { route: { routes }, location: { pathname } } = this.props
    const matchedRoute = routes.find(({ path }) => path === pathname)
    const title = matchedRoute ? matchedRoute.name : '易键达'

    document.title = title
  }

  componentWillMount () {
    const { login, location: { query: { __mac } } } = this.props
    this.setTitle()
    if (!__mac) return
    const tokenStr = Base64.decode(__mac)
    const token = JSON.parse(tokenStr)
    login({ ...token, mobileToken: true })
    window.removeEventListener('error', this.setDefaultImage, true)
  }

  componentDidMount () {
    window.addEventListener('error', this.setDefaultImage, true)
  }


  setDefaultImage = (e) => {
  // 当前异常是由图片加载异常引起的
    if ( e.target.tagName && e.target.tagName.toUpperCase() === 'IMG' ){
      e.target.src = defaultImage
      e.target.style.width = '40px'
      e.target.style.height = '40px'
    }
  }

  componentDidUpdate () {
    this.setTitle()
  }

  render () {
    const { children } = this.props
    return children
  }
}

export default MobileLayout
