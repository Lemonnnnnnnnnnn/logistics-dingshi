import React from 'react'
import { WingBlank, InputItem, Toast, Button } from 'antd-mobile'
import Link from 'umi/link'
import router from 'umi/router'
import img from '@/assets/todo_list.png'
import { getContractFromAuthCode, getJsSDKConfig } from '@/services/apiService'
import styles from './bindContract.css'


export default class BindContractMain extends React.Component {
  state = {
    code: undefined
  }

  componentDidMount () {
    getJsSDKConfig()
      .then(({ timestamp, nonceStr, signature }) => {
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: 'wx5b020341411ebf08', // 必填，公众号的唯一标识
          timestamp, // 必填，生成签名的时间戳
          nonceStr, // 必填，生成签名的随机串
          signature, // 必填，签名
          jsApiList: ['scanQRCode'] // 必填，需要使用的JS接口列表
        })
      })
  }

  getContract = () => {
    const { code } = this.state
    getContractFromAuthCode(code)
      .then(() => {
        // if (qrUserId) return router.push(`bindContract/error?error=isUsed`)
        router.replace(`/Weapp/personalCenter/contractList/contractDetail?qrCodeValue=${code}`)
      })
      .catch(({ code }) => {
        if (code === 'LOGISTICS/PROJECT_QRCODE_ERROR') {
          Toast.hide()
          router.push(`bindContract/error?error=notFound`)
        }
        if (code === 'CUSTOMER_ORGANIZATION_NOT_PROJECT_SAME') {
          Toast.hide()
          router.push(`bindContract/error?error=noSameOrganization`)
        }
      })
  }

  changeCode = code => this.setState({ code })

  scanCode = () => {
    wx.scanQRCode({
      needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
      scanType: ["qrCode"], // 可以指定扫二维码还是一维码，默认二者都有 barCode
      success: ({ resultStr }) => {
        this.changeCode(resultStr, () => this.getContract())
      }
    })
  }

  render () {
    const { code } = this.state
    return (
      <div className={styles.layout}>
        <div className={styles.imgWrap}><img src={img} alt="" /></div>
        <h3 className={styles.title}>添加合同信息</h3>
        <h4 className={styles.description}>请输入授权码添加合同</h4>
        <WingBlank>
          <InputItem
            className={styles.qrCode}
            value={code}
            type="text"
            placeholder="请输入8位授权码"
            onChange={this.changeCode}
            clear
            extra={<span>确认</span>}
            onExtraClick={this.getContract}
          />
        </WingBlank>
        <div><Button className={styles.scanBtn} size="small" type="ghost" inline onClick={this.scanCode}>扫描二维码</Button></div>
        <Link to="main/index">跳过，稍后可在合同管理中输入</Link>
      </div>
    )
  }
}
