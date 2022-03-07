import React from 'react'
import CSSModules from 'react-css-modules'
import { Grid, Modal, Toast, NoticeBar, Icon, Badge } from 'antd-mobile';
import router from 'umi/router'
import { connect } from 'dva'
import history from '@/assets/driver/history.png'
import income from '@/assets/driver/income.png'
import clientele from '@/assets/driver/clientele.png'
import car from '@/assets/driver/car.png'
import bankCard from '@/assets/driver/bank_card.png'
import customerService from '@/assets/driver/customer_service.png'
import feedback from '@/assets/driver/feedback.png'
import heading from '@/assets/driver/heading.png'
import setting from '@/assets/driver/setting.png'
import instrumentRent from '@/assets/driver/instrumentRent.png'
import ExpiredTag from '@/weappDriver/components/ExpiredTag'
import moment from 'moment'

import { getNowUser, getCarsList, getUsefulCarList } from '@/services/apiService'
import { getUserInfo, clearUserInfo } from '@/services/user'
import styles from './index.less'

function mapStateToProps (state) {
  return {
    nowUser: state.user.nowUser
  }
}

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class PersonalIndex extends React.Component {
  userInfo = getUserInfo()

  state = {
    ready: false,
    auditStatus: 0,
    business: []
  }

  service = [
    // {
    //   icon: bankCard,
    //   text: `银行卡`,
    //   router: 'bankCard'
    // },
    {
      icon: customerService,
      text: `在线客服`,
      router: 'customerService'
    },
    {
      icon: feedback,
      text: `意见反馈`,
      router: 'feedback'
    },
    {
      icon: setting,
      text: `设置`,
      router: 'setting'
    },
    {
      icon: instrumentRent,
      text: '设备租赁',
      router: 'instrument'
    }
  ]

  // business = []

  showTitle = false

  clienteleExpire = false

  routerPush = (e, index) => {
    router.push(`/WeappDriver/${e.router}`)
  }

  setBusiness = (showIncomeMsg) => {
    const business = [
      {
        icon: history,
        text: `运单历史`,
        router: 'history'
      },
      {
        icon: clientele,
        text: `资质`,
        router: 'intelligence'
      },
      {
        icon: car,
        text: `车辆`,
        router: 'carIntelligence'
      },
    ]
    if (showIncomeMsg) {
      business.push({
        icon: income,
        text: `收益`,
        router: 'income'
      })
    }
    this.setState({ business })
  }

  componentDidMount () {
    Promise.all([getNowUser(), getCarsList({ offset: 0, limit: 100, selectType: 4 }), getUsefulCarList()]).then((res) => {
      const { auditStatus, perfectStatus, bankAccountItems = [], nickName, licenseValidityDate, qualificationValidityDate, licenseValidityType } = res[0]

      if (auditStatus !== 1 || perfectStatus !== 1 || bankAccountItems.length === 0) this.showTitle = true
      if (auditStatus === 1 && perfectStatus === 1) { // 如果资质状态为已认证
        const licenseValidityExpired = licenseValidityType !== 2 && moment(licenseValidityDate).diff(moment()) < 0
        const qualificationValidityExpired = moment(qualificationValidityDate).diff(moment()) < 0

        if (licenseValidityExpired || qualificationValidityExpired) { // 如果驾驶证和从业资格证有一个过期
          this.clienteleExpire = true;
        }
      }

      // 如果收款卡名字和当前用户一致，或者未绑定任何银行卡，展示收益明细按钮
      let showIncomeMsg = false
      if (!bankAccountItems.length) {
        showIncomeMsg = true
      } else {
        const enabledBankCard = bankAccountItems.find(item => item.isAvailable) || {}
        if (enabledBankCard.nickName === nickName) showIncomeMsg = true
      }
      this.setBusiness(showIncomeMsg)


      if (res[2] && res[2].length > 0) this.showTitle = true
      const { items = [] } = res[1]
      if (items.find(item => item.perfectStatus !== 1)) this.showUncomplete = true

      this.setState({
        ready: true,
        auditStatus,
      })
    })
      .catch(() => {
        Toast.fail('登录信息已过期', 1)
        clearUserInfo()
        setTimeout(() => {
          this.userLogin()
        }, 1000)
      })
  }

  userLogin = () => {
    wx.miniProgram.reLaunch({
      url: '/pages/index/index?setIsLoggedFalse=true'
    })
  }

  toCertification = () => {
    router.push('/WeappDriver/intelligence')
  }


  renderItem = (el, index) => (
    <div className='personalCenter_item_container'>
      <Badge text={index === 3 && this.showUncomplete ? '未完善' : ''}>
        {el.text === '资质' && this.clienteleExpire && <ExpiredTag /> || null}

        <div className='item'>
          <img src={el.icon} alt="图片加载失败" />
          <span>{el.text}</span>
        </div>
      </Badge>
    </div>
  )

  render () {
    const { avatar } = this.userInfo
    const { ready, auditStatus, business } = this.state
    const { nowUser } = this.props

    return (
      ready
      &&
      <>
        {
          this.showTitle ?
            <NoticeBar icon={<Icon type="exclamation-circle" />} styleName='abc'>
              <span>资料未完善会导致无法提现</span><span styleName='tips' onClick={() => { router.push('/WeappDriver/income/withdrawalQualification') }}>完善资料</span>
            </NoticeBar>
            :
            null
        }
        {auditStatus === 1 &&
          <div
            styleName='block'
            onClick={() => {
              router.push('/WeappDriver/collectionCode')
            }}
          >
            <img alt='图片显示失败' src={history} />
            <div>收款码</div>
          </div>
        }
        <div styleName="personalBox">
          <div styleName="personalDiv">
            <div styleName='avatarContainer'>
              {
                avatar ?
                  <img src={avatar} alt="" styleName='avatar' />
                  :
                  <img src={heading} alt="" styleName='avatar' />
              }
            </div>
            <div styleName='userContainer'>
              {
                auditStatus === 1 ?
                  <div>
                    <div styleName="nickName">{nowUser.nickName}</div>
                    <div className='color-gray'>{nowUser.phone.substring(0, 3)}*****{nowUser.phone.substr(-3)}</div>
                  </div> :
                  <div>
                    <div styleName="nickName">你好，{nowUser.phone}</div>
                    <div className='color-gray'>为了更好的接单体验，请先进行 <a onClick={this.toCertification}>实名认证</a></div>
                  </div>
              }
              <div styleName='status_container'>
                {
                  auditStatus === 1 ?
                    <div styleName='identify_green'>
                      <Icon type='check-circle-o' style={{ width: '15px', height: '15px', color: 'rgba(53, 209, 47, 1)' }} />
                      <span>实名认证</span>
                    </div>
                    :
                    <div styleName='identify_gray'>
                      <Icon type='check-circle-o' style={{ width: '15px', height: '15px', color: '#aaa' }} />
                      <span>实名认证</span>
                    </div>
                }
                {
                  this.showTitle || this.showUncomplete ?
                    <div styleName="identify_gray">
                      <Icon type='check-circle-o' style={{ width: '15px', height: '15px', color: '#aaa' }} />
                      <span>资格认证</span>
                    </div>
                    :
                    <div styleName="identify_green">
                      <Icon type='check-circle-o' style={{ width: '15px', height: '15px', color: 'rgba(53, 209, 47, 1)' }} />
                      <span>资格认证</span>
                    </div>
                }
              </div>
            </div>
            <div>
              <Grid prefixCls='business' onClick={this.routerPush} activeStyle={false} className='driver_weapp_personalCenter_business' hasLine={false} data={business} renderItem={this.renderItem} columnNum={4} />
            </div>
          </div>
        </div>
        <div styleName="service">
          <h3>我的服务</h3>
          <Grid prefixCls='service' onClick={this.routerPush} activeStyle={false} className='driver_weapp_personalCenter_service' hasLine={false} data={this.service} columnNum={4} />
        </div>
      </>
    )
  }
}
