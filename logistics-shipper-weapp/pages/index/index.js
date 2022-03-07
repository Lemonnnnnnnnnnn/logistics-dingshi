//index.js
//获取应用实例
const app = getApp()
const apiService = require('../../services/apiService.js')
const wx_getUserInfo = () => {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({
      success: res => resolve(res)
    })
  })
}
Page({
  data: {
    disabled: true,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  //事件处理函数
  watchAgreement: function(){
    wx.navigateTo({
      url: '../agreement/agreement'
    })
  },

  onLoad: function (options) {
    console.log(app.globalData)
    wx.showLoading({ title: '加载中', mask: true })
    if (options.setIsLoggedFalse) {
      app.globalData.authToken = undefined
    }
    apiService.login()
      .then(res => {
        wx.hideLoading()
        const { authToken, openid } = res
        app.globalData.openId = openid
        if (authToken) {
          if (`${authToken.auditStatus}` === '2' || !authToken.auditStatus) {
            return wx.showToast({
              title: '该账号尚未认证成功，请联系平台管理员',
              icon: 'none',
              duration: 2000
            })
          }
          const { wxUserEntity: { headImgUrl, nickName } } = res
          authToken.avatar = headImgUrl
          authToken.nickName = authToken.nickName || nickName
          app.globalData.authToken = authToken
          this.toWeb()
        }
      })
      .catch(error => {
        wx.hideLoading()
        const { data: { message } = {} } = error
        if (message === '该账户已被禁用') {
          wx.showToast({
            title: message,
            icon: 'none'
          })
          app.globalData.authToken = undefined
          return
        }
        wx.showModal({
          title: '提示',
          content: JSON.stringify(error)
        })
      })
  },
  bindgetphonenumber: async function(e) {
    console.log(e)
    let { openId } = app.globalData
    if (!openId) {
      const res = await apiService.login()
        .catch((error) => {
          loginError = error
        })
      if (loginError) {
        const { data: { message } = {} } = loginError
        if (message === '该账户已被禁用') {
          wx.showToast({
            title: message,
            icon: 'none'
          })
          app.globalData.authToken = undefined
          return
        }
        wx.showModal({
          title: '提示',
          content: JSON.stringify(loginError)
        })
        return
      } else {
        openId = res.openid
      }
    }
    const { encryptedData: phone_encryptedData, iv: phone_iv, errMsg } = e.detail
    if (errMsg === "getPhoneNumber:fail:user deny" || errMsg === "getPhoneNumber:fail user deny") {
      wx.showToast({
        title: '获取手机号失败',
        icon: 'none',
        duration: 2000
      })
      return
    }
    // wx.showLoading({ title: '登录中', mask: true })
    let _signature
    let _rawData
    // 微信登录之前需要重新获取最新的encryptedData，以免encryptedData等信息过期（处理bind接口报错‘用户检查失败’）
    wx_getUserInfo()
      .then(res => {
        app.globalData.userInfo = res
        const { signature, rawData, encryptedData, iv } = app.globalData.userInfo
        _signature = signature
        _rawData = rawData
        return apiService.bind(openId, encryptedData, signature, rawData, iv)
      })
      .then(({ unionId }) => {
        const { userInfo: { avatarUrl: headImgUrl } } = app.globalData.userInfo
        return apiService.bindUser('', 'CONSIGNMENT', '', unionId, openId, phone_encryptedData, phone_iv, _rawData, _signature, headImgUrl)
      })
      .then(res => {
        const { authToken, wxUserEntity: { headImgUrl, nickName } } = res
        wx.hideLoading()
        // debugger
        if (!authToken) {
          return wx.showToast({
            title: '账号不存在，请在pc端注册认证',
            icon: 'none',
            duration: 2000
          })
        }
        if (`${authToken.auditStatus}` === '2' || !authToken.auditStatus) {
          return wx.showToast({
            title: '该账号尚未认证成功，请联系平台管理员',
            icon: 'none',
            duration: 2000
          })
        }
        authToken.avatar = headImgUrl
        authToken.nickName = authToken.nickName || nickName
        app.globalData.authToken = authToken
        this.toWeb()
      })
  },
  checkRead(e) {
    const { detail:{ value } } = e
    this.setData({
      disabled: !(value.some(item => item === 'checked'))
    })
  },
  toWeb() {
    let { authToken } = app.globalData
    const url = authToken ? `/pages/middleware/middleware?__mac=${JSON.stringify(authToken)}` : `/pages/middleware/middleware`
    // if (authToken) this.setData({ bindUserViewVisible: false })
    wx.redirectTo({ url })
  },
  appLogin() {
    this.toWeb()
  }
})
