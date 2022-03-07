import React from 'react'
import CSSModules from 'react-css-modules'
import router from 'umi/router'
import { connect } from 'dva'
import { Toast } from 'antd-mobile'
import iconAdd from '@/assets/driver/icon_add.png'
import iconAddBlue from '@/assets/driver/icon_add_blue.png'
import iconRt from '@/assets/driver/icon_rt.png'
import service from '@/assets/driver/line_service.png'
import noBank from '@/assets/driver/no_bank.png'
import iconBank from '@/assets/driver/icon_bank.png'
import { getWeAppBankList } from '@/services/apiService'
import { getUserInfo } from '@/services/user'
import styles from './index.less'

function mapStateToProps (state) {
  return {
    nowUser: state.user.nowUser
  }
}

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Index extends React.Component {
  state = {
    ready: false,
    list : []
  }

  addBankCard = () => {
    if (this.props.nowUser.auditStatus !== 1) return Toast.fail('请先进行资质认证', 1.5, () => { router.push('/WeappDriver/intelligence') })
    router.push('addBankCard')
  }

  componentDidMount () {
    getWeAppBankList({ offset: 0, limit: 1000 }).then(data => {
      const { nickName } = getUserInfo()
      const list = data.items.filter(item=>item.nickName === nickName)
      // const renderItem = list.find(item=>item.isAvailable) || list[Math.floor(Math.random() * list.length)] || {}

      this.setState({
        list,
        ready: true
      })
    })
  }

  toBankManager = e => {
    const bankAccountId = e.currentTarget.getAttribute('id')
    router.replace(`bankManager?bankAccountId=${bankAccountId}`)
  }

  renderCardList = () => {
    const { list } = this.state

    if (list.length === 0 || !list) {
      return (
        <div>
          <div styleName='noBankCard'>
            <img src={noBank} alt="图片加载失败" />
            <p>您还没有绑定银行卡</p>
          </div>
          {/* <div styleName='shadow' onClick={this.addBankCard}> */}
          {/*  <div styleName='add_box'> */}
          {/*    <img src={iconAddBlue} alt="图片加载失败" /> */}
          {/*    <span>添加银行卡</span> */}
          {/*  </div> */}
          {/* </div> */}
        </div>
      )
    }
    // onClick={this.toBankManager} 司机不能点击详情
    return list.map(item =>
      <div styleName='shadow bank_card' id={item.bankAccountId} key={item.bankAccountId}>
        {
          item.isAvailable?
            <div styleName='cardType'>
              <span styleName='receive'>收款</span>
            </div>
            :
            null
        }
        {/* <img src={iconBank} alt="图片加载失败" /> */}
        <div styleName='maxWidth'>
          <h3 styleName='bank_name'>{item.bankName}</h3>
          <span styleName='bank_account'><span>{item.nickName}</span><span>{`**** **** ${item.bankAccount.substr(-3)}`}</span></span>
          {/* <span styleName='bank_account'>{`${item.bankAccount.substring(0, 4)} **** **** **** ${item.bankAccount.substr(-3)}`}</span> */}
        </div>
      </div>
    )
  }

  renderCardAdd = () => {
    const { list } = this.state
    if (list.length === 0 || !list) {
      return (<img src={iconAdd} alt="图片加载失败" onClick={this.addBankCard} />)
    }
    return (<span />)
  }

  toService = () => {
    router.push('/WeappDriver/customerService')
  }

  render () {
    const { ready, list } = this.state
    return (
      ready
      &&
      <div styleName='container'>
        <div styleName='title'>
          <div>
            <span styleName='title_text'>我的银行卡</span>
            <span styleName='count'>共{list.length}张</span>
          </div>
          {/* { this.renderCardAdd() } */}
        </div>
        {/* <div styleName='shadow bank_card'>
          <div styleName='cardType'>
            <span styleName='receive'>收款</span>
            <span styleName='pay'>付款</span>
          </div>
          <img src={iconBank} alt="图片加载失败" />
          <div>
            <h3 styleName='bank_name'>中国建设银行</h3>
            <span styleName='bank_account'>6232 **** **** *** 8567</span>
          </div>
        </div> */}
        {this.renderCardList()}
        <div styleName='shadow pad15'>
          <div styleName='tip_box'>
            <div styleName='left_box'>
              <img src={service} alt="图片加载失败" />
              <span onClick={this.toService}>绑定银行卡常见问题</span>
            </div>
            <img src={iconRt} alt="图片加载失败" />
          </div>
        </div>
      </div>
    )
  }
}
