// pages/web/web.js
const apiService = require('../../services/apiService.js')
const app = getApp()
// const baseURL = 'https://mobile.51ejd.cn' //测试
const baseURL = 'http://192.168.1.43:8000' //本地
// const baseURL = 'https://mobile.51ejd.com' //生产
Page({
  /**
   * 页面的初始数据
   * 
   */
  data: {
    url:``
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { __mac='' } = options
    const { id, type } = app.globalData
    const params = {
      id,
      type,
      __mac
    }
    let url
    this.setData({ url: `${baseURL}/WeappConsign/main/personalCenter?__mac=${__mac}` })
  }
})