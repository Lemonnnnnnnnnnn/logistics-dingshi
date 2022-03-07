import React from 'react'
import moment from 'moment'
import router from 'umi/router'
import CSSModules from 'react-css-modules'
import styles from './Item.less'

@CSSModules(styles, { allowMultiple: true })
export default class Index extends React.Component{
  renderStatus = () => {
    const { cashOutStatus } = this.props.item
    switch (cashOutStatus) {
      case 0:
        return <span styleName='status_red'>提现失败</span>
      case 1:
        return <span styleName='status_gray'>提现成功</span>
      case 2:
        return <span styleName='status_yellow'>正在提现中…</span>
      default: return <span styleName='status_red'>提现失败</span>
    }
  }

  toDetail = () => {
    router.push(`WithdrawalRecords/detail?cashOutId=${this.props.item.cashOutId}`)
  }

  renderFailReason = () => {
    const { cashOutStatus, paySelfFail } = this.props.item
    if (cashOutStatus === 1) return false
    if (cashOutStatus === 0 && paySelfFail) return <p styleName='payRemarks'>资料未完善导致提现失败，请先完善相关资料</p>
    if (cashOutStatus === 0) return <p styleName='payRemarks'>由于系统升级导致无法提现，请耐心等待</p>
  }

  render () {
    const { bankName, driverBankAccount, cashOutStatus, createTime, isDate = false, date, money, cashOutMoney } = this.props.item
    return (
      isDate?
        <div styleName='itemCard_title'>
          <h3>
            <span styleName='title'>{date}</span>
          </h3>
          <span styleName='date'>已提现 ￥{money && money.toFixed(2)._toFixed(2) || 0}</span>
        </div>
        :
        <div styleName='itemCard' onClick={this.toDetail}>
          <h3>
            {
              cashOutStatus === 0 && !driverBankAccount?
                <span styleName='account status_red'>提现-未绑定银行卡</span>
                :
                <span styleName='account'>提现-到{bankName || ''}{driverBankAccount && `(${driverBankAccount.substr(-4)})` || ''}</span>
            }
            <span styleName='gray'>- ￥{cashOutMoney && cashOutMoney.toFixed(2)._toFixed(2) || 0}</span>
          </h3>
          {this.renderFailReason()}
          <div styleName='date_container'>
            <span styleName='date'>{createTime && moment(createTime).format('YYYY-MM-DD HH:mm:ss') || ''}</span>
            {this.renderStatus()}
          </div>
        </div>
    )
  }
}