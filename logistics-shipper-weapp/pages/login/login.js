//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad: function () {
    wx.getSetting({
      success:res => {
        if(res.authSetting['scope.userInfo']){
          wx.showLoading({ title: '加载中', mask: true })
          wx.getUserInfo({
            success:res => {
              console.log(res)
              app.globalData.userInfo = res
              this.toIndex()
            }
          })
        }
      }
    })
  },
  getUserInfo: function (e) {
    const { errMsg } = e.detail
    if (errMsg === "getUserInfo:fail auth deny") {
      wx.showToast({
        title: '登录失败',
        icon: 'none',
        duration: 2000
      })
      return
    }
    app.globalData.userInfo = e.detail
    this.toIndex()
  },
  toIndex() {
    wx.redirectTo({
      url: '../index/index'
    })
  }
})
