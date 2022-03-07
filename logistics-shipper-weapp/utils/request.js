const baseUrl = 'https://wx.51ejd.cn'
// const baseUrl = 'http://192.168.1.251:9009'
// const baseUrl = 'https://www.51ejd.cn' // 生产
const util = require('../utils/util.js')
const getDefaultHeader = () => ({'content-type': 'application/json'})
const request = ({url, header = getDefaultHeader(), noAuth, ...config}) => {
  const fullUrlPattern = /^https?:\/\//
  const finalUrl = fullUrlPattern.test(url) ? url : `${baseUrl}${url}`
  if(!noAuth && !header.Authorization) {
    const { accessToken } = util.getUserInfo()
    header.Authorization = `Bearer ${accessToken}`
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: finalUrl,
      header,
      ...config,
      complete: (res) => {
        // console.log(res)
        if (res.statusCode !== 200 || res.errMsg != 'request:ok' || typeof res.data != 'object'){
          reject({...res, url })
        }
        resolve(res.data)
      }
    })
  })
}
module.exports = { 
  request
}