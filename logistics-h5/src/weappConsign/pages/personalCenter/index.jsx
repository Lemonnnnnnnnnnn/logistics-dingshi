import React from 'react'
import CSSModules from 'react-css-modules'
import { Card, Flex, List, WingBlank, Toast } from 'antd-mobile'
import router from 'umi/router'
import { connect } from 'dva'
import scan from '@/assets/consign/scan.png'
import data from '@/assets/consign/data.png'
import accountBill from '@/assets/consign/accountBill.png'
import service from '@/assets/consign/service.png'
import { getJsSDKConfig, getSelfTotalData } from '@/services/apiService'
import payBill from '@/assets/consign/payBill.png'
import heading from '@/assets/driver/heading.png'
import setting from '@/assets/consign/setting.png'
import { getUserInfo } from '@/services/user'
import styles from './index.less'

const { Item } = List

function mapStateToProps (state) {
  return {
    nowUser: state.user.nowUser,
  }
}

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class PersonalIndex extends React.Component {
  userInfo = getUserInfo()

  state = {}

  componentDidMount () {

    getJsSDKConfig({ url: encodeURIComponent(window.location.href.split('#')[0]) })
      .then(({ timestamp, nonceStr, signature }) => {
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: 'wx5b020341411ebf08', // 必填，公众号的唯一标识
          timestamp, // 必填，生成签名的时间戳
          nonceStr, // 必填，生成签名的随机串
          signature, // 必填，签名
          jsApiList: [ 'scanQRCode'], // 必填，需要使用的JS接口列表
        })
      })
    getSelfTotalData().then(res=>this.setState({ ...res }))

  }

  goScanQRCode = () => {
    wx.scanQRCode({
      needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
      scanType: ["qrCode"], // 可以指定扫二维码还是一维码，默认二者都有 barCode
      success: (res) => {
        const transportId = res.resultStr.split('/').splice(-1, 1)[0]
        router.push(`/WeappConsign/main/staging/transportDetail?transportId=${transportId}`)
      }
    })
  }

  render () {
    const { avatar } = this.userInfo
    const { notInvoicedMoney, balance, projectCount } = this.state
    return (
      <>
        <div styleName='personalBox'>
          <div styleName='personalDiv'>
            <div styleName='avatarContainer'>
              <img src={avatar || heading} alt='' styleName='avatar' />
            </div>
            <div styleName='userContainer'>
              <span
                styleName='nickName'
              >{this.props.nowUser.phone.substring(0, 3)}*****{this.props.nowUser.phone.substr(-3)}
              </span>
              <div styleName='identify_green'>
                <span>已认证</span>
              </div>
            </div>
          </div>
          <WingBlank size='lg'>
            <Card styleName='data_display_card'>
              <Card.Body>
                <Flex style={{ marginTop: '10px' }}>
                  <Flex.Item>
                    <div styleName='number'>{notInvoicedMoney}</div>
                    <div styleName='description'>待开票(元)</div>
                  </Flex.Item>
                  <Flex.Item>
                    <div styleName='number'>{balance}</div>
                    <div styleName='description'>余额(元)</div>
                  </Flex.Item>
                  <Flex.Item>
                    <div styleName='number'>{projectCount}</div>
                    <div styleName='description'>项目</div>
                  </Flex.Item>
                </Flex>
              </Card.Body>
            </Card>
          </WingBlank>
        </div>
        <List className='weApp_consignment_list'>
          <Item thumb={scan} arrow='horizontal' multipleLine onClick={this.goScanQRCode}>
            扫描签收
          </Item>
          {/* TODO: 修改预约单图标 */}
          <Item
            thumb={scan}
            arrow='horizontal'
            multipleLine
            onClick={() => router.push('/WeappConsign/reservation')}
          >
            预约单
          </Item>
        </List>
        <div styleName='separate_div' />
        <List className='weApp_consignment_list'>
          <Item
            thumb={data}
            arrow='horizontal'
            multipleLine
            onClick={() => {
              router.push('/WeappConsign/dataOverview')
            }}
          >
            数据总览
          </Item>
          <Item
            thumb={payBill}
            arrow='horizontal'
            multipleLine
            onClick={() => {
              router.push('/WeappConsign/paymentBill')
            }}
          >
            支付单
          </Item>
          <Item
            thumb={accountBill}
            arrow='horizontal'
            multipleLine
            onClick={() => {
              router.push('/WeappConsign/accountBill')
            }}
          >
            对账单
          </Item>
        </List>
        <div styleName='separate_div' />
        <List className='weApp_consignment_list'>
          <Item
            thumb={setting}
            arrow='horizontal'
            multipleLine
            onClick={() => {
              router.push('/WeappConsign/setting')
            }}
          >
            设置
          </Item>
          <Item
            thumb={service}
            arrow='horizontal'
            multipleLine
            onClick={() => {
              router.push('/WeappConsign/customerService')
            }}
          >
            在线客服
          </Item>
        </List>
      </>
    )
  }
}
