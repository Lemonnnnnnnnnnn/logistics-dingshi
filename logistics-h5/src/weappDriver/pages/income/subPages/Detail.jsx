import React from 'react'
import CSSModules from 'react-css-modules'
import { NoticeBar, Steps } from 'antd-mobile'
import moment from 'moment'


import { getFinanceCashOutsDetail } from '@/services/apiService'
import styles from './Detail.less'

const { Step } = Steps

@CSSModules(styles, { allowMultiple: true })
export default class Detail extends React.Component{
  state = {
    ready: false
  }

  componentDidMount () {
    const { location: { query: { cashOutId } } } = this.props
    getFinanceCashOutsDetail(cashOutId).then(detail => {
      let current
      switch (detail.cashOutStatus) {
        case 0:
          current = 2
          break
        case 1:
          current = 3
          break
        case 2:
          current = 1
          break
        default: current = 2
      }
      this.setState({
        detail,
        ready: true,
        current
      })
    })
  }

  renderStatus = () => {
    const { cashOutStatus } = this.state.detail
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

  renderProcess = () => {
    const { detail } = this.state
    if (detail.cashOutStatus !== 0) return <Step title="银行处理中" description={`预计到账时间${moment(detail.createTime).add(2, 'h').format('YYYY-MM-DD HH:mm:ss')}`} />
    if (!detail.paySelfFail) return <Step title="银行处理中" description={`预计到账时间${moment(detail.createTime).add(2, 'h').format('YYYY-MM-DD HH:mm:ss')}`} />
    return false
  }

  render () {
    const { ready, detail, current } = this.state
    return (
      ready
      &&
      <div styleName='container'>
        {
          detail.cashOutStatus === 0?
            <NoticeBar style={{ backgroundColor: 'rgba(255, 191, 18, 1)', color: 'white' }} marqueeProps={{ loop: true, style: { padding: '0 7.5px' } }}>
              {
                detail.paySelfFail?
                  '资料未完善导致提现失败，请先完善相关资料'
                  :
                  '由于系统升级导致无法提现，请耐心等待'
              }
            </NoticeBar>
            :
            null
        }
        <div styleName='header'>
          {
            detail.cashOutStatus === 0 && !detail.driverBankAccount?
              <h3 styleName='red'>提现-未绑定银行卡</h3>
              :
              <h3>提现-至{detail.bankName}({detail.driverBankAccount.substr(-4)})</h3>
          }
          <p>-￥{detail.cashOutMoney}</p>
          {this.renderStatus()}
        </div>
        <div styleName='process'>
          <Steps current={current}>
            <Step title="发起提现申请" description={moment(detail.createTime).format('YYYY-MM-DD HH:mm:ss')} />
            {this.renderProcess()}
            {
              detail.cashOutStatus === 0?
                <Step title='到账失败' status='error' description={detail.accountTime && moment(detail.createTime).format('YYYY-MM-DD HH:mm:ss') || ''} />
                :
                <Step title='到账成功' description={detail.accountTime && moment(detail.createTime).format('YYYY-MM-DD HH:mm:ss') || ''} />
            }
          </Steps>
        </div>
        <div styleName='info_card'>
          <p>
            <span>提现金额</span><span>￥{detail.cashOutMoney && detail.cashOutMoney.toFixed(2)._toFixed(2) || '--'}</span>
          </p>
          <p>
            <span>手续费</span><span>￥0.00</span>
          </p>
          <p>
            <span>申请时间</span><span>{moment(detail.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
          </p>
          <p>
            <span>到账时间</span><span>{detail.accountTime && moment(detail.createTime).format('YYYY-MM-DD HH:mm:ss') || '--'}</span>
          </p>
          <p>
            <span>提现银行</span><span>{detail.bankName || '--'}</span>
          </p>
          <p>
            <span>交易编号</span><span>{detail.cashOutNo || '--'}</span>
          </p>
        </div>
      </div>
    )
  }
}