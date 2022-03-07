import React, { Component } from 'react'
import { Button } from 'antd-mobile'
import { loadScript, browser } from '@/utils/utils'
import { getJsSDKConfig } from '@/services/apiService'

export default class Index extends Component {

  list = React.createRef()

  componentDidMount () {
    if (browser.versions.android) {
      getJsSDKConfig({ url: encodeURIComponent(window.location.href.split('#')[0]) })
        .then(({ timestamp, nonceStr, signature }) => {
          wx.config({
            debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx5b020341411ebf08', // 必填，公众号的唯一标识
            timestamp, // 必填，生成签名的时间戳
            nonceStr, // 必填，生成签名的随机串
            signature, // 必填，签名
            jsApiList: ['getLocation'] // 必填，需要使用的JS接口列表
          })
        })
    }
  }

  getSetting = () => {
    wx.getSetting({
      success (res) {
        console.log(res)
        // res.authSetting = {
        //   "scope.userInfo": true,
        //   "scope.userLocation": true
        // }
        console.log(res)
        // res.subscriptionsSetting = {
        //   mainSwitch: true, // 订阅消息总开关
        //   itemSettings: {   // 每一项开关
        //     SYS_MSG_TYPE_INTERACTIVE: 'accept', // 小游戏系统订阅消息
        //     SYS_MSG_TYPE_RANK: 'accept'
        //     zun-LzcQyW-edafCVvzPkK4de2Rllr1fFpw2A_x0oXE: 'reject', // 普通一次性订阅消息
        //     ke_OZC_66gZxALLcsuI7ilCJSP2OJ2vWo2ooUPpkWrw: 'ban',
        //   }
        // }
      }
    })
  }

  getLocation = () => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        alert('调用成功')
        console.log(res)
      },
      fail: (res) => {
        alert('调用失败')
        console.log(res)
      }
    })
  }

  render () {
    return (
      <>
        <Button onClick={this.getSetting}>获取设置</Button>
        <Button onClick={this.getLocation}>获取定位</Button>
      </>
    )
  }
}