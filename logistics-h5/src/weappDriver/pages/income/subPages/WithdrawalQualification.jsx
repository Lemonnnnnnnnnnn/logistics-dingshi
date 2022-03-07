import React from 'react'
import CSSModules from 'react-css-modules'
import { Button, NoticeBar } from 'antd-mobile'
import { connect } from 'dva'
import router from 'umi/router'
import { getNowUser, getCertificationEvents, getCarsList, getUsefulCarList } from '@/services/apiService'
import grayOk from '@/assets/driver/gray_ok.png'
import status0 from '@/assets/driver/status0.png'
import status1 from '@/assets/driver/status1.png'
import status2 from '@/assets/driver/status2.png'
import { DRIVER_STATUS } from '@/constants/driver/driver'
import styles from './WithdrawalQualification.less'


function mapStateToProps (state) {
  return {
    nowUser: state.user.nowUser
  }
}


function mapDispatchToProps (dispatch) {
  return {
    getNowUser: () => dispatch({ type: 'user/getNowUser' })
  }
}

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class WithdrawalQualification extends React.Component {
  state = {
    ready: false,
    remarks: null
  }

  async componentDidMount () {
    // let status1 // 司机实名认证
    // let status2 // 司机资质认证
    // let status3 // 车辆注册
    // let status4 // 车辆完善
    // let status5 // 银行卡认证
    // 0,1,2,3 失败，成功，未填写，待审核
    const { getNowUser } = this.props
    const res = await Promise.all([getNowUser(), getCarsList({ offset: 0, limit: 100, selectType: 4 }), getUsefulCarList()])
    const { auditStatus, perfectStatus, bankAccountItems = [] } = res[0]
    const status1 = auditStatus === 1? 1: 2
    const status2 = perfectStatus
    const status5 = bankAccountItems.length === 0? 2: 1
    const { items = [], count } = res[1]
    let status4
    let status3
    if (count === 0) {
      status3 = 2
    } else {
      status3 = 1
    }
    if (res[2].length === 0) status4 = 1
    if (res[2].length > 0) {
      status4 = 2
      this.setState({
        carRejectRemark: '避免提现失败，请完善下列车辆信息'
      })
    }
    this.status = { status1, status2, status3, status4, status5 }
    if (status2 === 0) {
      getCertificationEvents({ authObjId: res[0].userId, authObjType: 2 }).then(data => {
        const event = data.items.find(item => item.authObjType === 2 && item.eventStatus === 4)
        this.setState({
          rejectRemark: event && event.eventDetail,
          ready: true
        })
      })
    } else {
      this.setState({
        ready: true
      })
    }
  }

  renderStatus = (status) => {
    switch (status) {
      case 0:
        return (
          <>
            <img src={status0} alt="加载失败" />
            <span styleName='red_result'>审核失败</span>
          </>
        )
      case 1:
        return (
          <>
            <img src={status1} alt="加载失败" />
            <span styleName='green_result'>已完成</span>
          </>
        )
      case 3:
        return (
          <>
            <img src={status2} alt="加载失败" />
            <span styleName='yellow_result'>审核中</span>
          </>
        )
      default:
        return (
          <>
            <img src={grayOk} alt="加载失败" />
            <span styleName='gray_result'>未完成</span>
          </>
        )
    }
  }

  renderDesc = (status, title, remarks) => {
    switch (status) {
      case 0:
        return <p styleName='red_desc'>{remarks || '您提交的资料未通过审核，请重新提交'}</p>
      case 1:
        return <p styleName='gray_desc'>已完成{title}</p>
      case 3:
        return <p styleName='yellow_desc'>您提交的资料正在审核，请耐心等待</p>
      default: return <p styleName='gray_desc'>请完成{title}</p>
    }
  }

  toIntelligence = () => {
    router.push('/WeappDriver/intelligence')
  }

  toBankCard = () => {
    router.push('/WeappDriver/bankCard')
  }

  toCarIntelligence = () => {
    router.push('/WeappDriver/carIntelligence')
  }

  toCarComplete = () => {
    router.push('/WeappDriver/carComplete')
  }

  renderCard = (title, status, func, remarks) => (
    <div styleName='card' onClick={func}>
      <div styleName='card_width'>
        <h3 styleName='title'>{title}</h3>
        {
          status === 0?
            this.renderDesc(status, title, remarks)
            :
            this.renderDesc(status, title)
        }
      </div>
      <div styleName='result'>
        {this.renderStatus(status)}
      </div>
    </div>
  )

  renderFunc = () => {
    const { rejectRemark, carRejectRemark } = this.state
    const { status1, status2, status3, status4, status5 } = this.status
    return (
      <>
        {this.renderCard('实名认证', status1, this.toIntelligence)}
        {this.renderCard('资质认证', status2, this.toIntelligence, rejectRemark)}
        {this.renderCard('车辆注册', status3, this.toCarIntelligence)}
        {this.renderCard('车辆完善', status4, this.toCarComplete, carRejectRemark)}
        {/* {this.renderCard('银行卡认证', status5, this.toBankCard)} */}
      </>
    )
  }

  render () {
    const { ready, remarks } = this.state
    return (
      ready
      &&
      <div styleName='container'>
        {/* {
          remarks ?
            <NoticeBar className='unComplete_remarks' marqueeProps={{ loop: true, style: { padding: '0 7.5px', color: 'red' } }}>
              {remarks}
            </NoticeBar>
            :
            null
        } */}
        {this.renderFunc()}
      </div>
    )
  }
}
