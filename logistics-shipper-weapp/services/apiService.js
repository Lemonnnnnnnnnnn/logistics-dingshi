const {request} = require('../utils/request.js')
const appId = 'wxc1da76d4f2be63de'
let state = {}
const getLoginInfo = () => new Promise((resolve, reject) => {
  wx.login({
    success: (res) => {
      resolve(request({
        url: `/auth/wx/user/${appId}/login`,
        data: {
          code: res.code,
          scope: 'CONSIGNMENT'
        },
        noAuth:true
      }))
    },
    fail: error => reject(error)
  })
})

// 其中iv，encryptedData 从微信的取微信绑定手机号的接口中获取 与bind的iv，encryptedData参数不同
const bindUser = (phone, scope, smsCode, unionId, openId, encryptedData, iv, rawData, signature, headImgUrl) => {
  return request({
    url: `/auth/wx/user/${appId}/binduser`,
    method: 'POST',
    data: {
      phone,
      scope,
      unionId,
      smsCode,
      openId,
      encryptedData,
      iv,
      rawData,
      signature,
      headImgUrl
    },
    noAuth: true
  })
}

// 其中iv，encryptedData 从wx的wx.getUserInfo()获取 与bindUser的iv，encryptedData参数不同
const bind = (openId, encryptedData, signature, rawData, iv) => {
  return request({
    url: `/auth/wx/user/${appId}/bind`,
    data: {
      openId,
      encryptedData,
      signature,
      rawData,
      iv
    },
    noAuth: true
  })
}

module.exports = {
  login: getLoginInfo,
  bindUser,
  bind
}