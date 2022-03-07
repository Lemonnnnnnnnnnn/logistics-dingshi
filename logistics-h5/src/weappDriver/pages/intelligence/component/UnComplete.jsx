import React from 'react'
import CSSModules from 'react-css-modules'
import { Button, NoticeBar } from 'antd-mobile'
import { Icon } from 'antd'
import { connect } from 'dva'
import router from 'umi/router'
import { getUrl } from '@/utils/utils'
import { getNowUser, getCertificationEvents } from '@/services/apiService'
import waiting from '@/assets/driver/waiting.png'
import styles from './UnComplete.less'

@connect(state => ({
  params: state.router.releaseHallParams
}))
@CSSModules(styles, { allowMultiple: true })
export default class UnComplete extends React.Component {
  state = {
    ready: false,
    remarks: null
  }

  componentDidMount () {
    getNowUser().then(info => {
      this.nowUser = info
      const authObjId = info.userId
      if (info.perfectStatus === 0) {
        getCertificationEvents({ authObjId, authObjType: 2 }).then(data => {
          const current = data.items.find(item => item.eventStatus === 4)
          this.setState({
            ready: true,
            remarks: current?.eventDetail || '认证资料有误'
          })
        })
      } else {
        this.setState({
          ready: true
        }, this.setTimer())
      }
    })
  }

  setTimer = () => {
    this.timer = setTimeout(() => {
      if (this.props.params) {
        router.push(getUrl('/WeappDriver/hallList?', this.props.params, true))
      } else {
        router.push('/WeappDriver/main/personalCenter')
      }
    }, 5000)
  }

  toOderHall = () => {
    if (this.props.params) {
      clearTimeout(this.timer)
      router.push(getUrl('/WeappDriver/hallList?', this.props.params, true))
    } else {
      clearTimeout(this.timer)
      router.push('/WeappDriver/main/hall')
    }
  }

  toAddCar = () => {
    clearTimeout(this.timer)
    router.push('/WeappDriver/carIntelligence')
  }

  componentWillUnmount () {
    clearTimeout(this.timer)
  }

  renderFunc = () => {
    const { nowUser } = this
    if (nowUser.perfectStatus === 3) {
      return (
        <div styleName='sub_container'>
          <img src={waiting} alt="加载失败" />
          <p styleName='status'>审核中</p>
          <p>您提交的资料正在审核，请您耐心等待</p>
          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', marginTop: '50px' }}>
            <Button type="ghost" inline size='small' style={{ width: '135px', fontSize: '17px', height: '40px', lineHeight: '40px' }} onClick={this.toOderHall}>去抢单</Button>
            <Button type="primary" inline size='small' style={{ width: '135px', fontSize: '17px', height: '40px', lineHeight: '40px' }} onClick={this.toAddCar}>注册车辆</Button>
          </div>
        </div>
      )
    }
    if (nowUser.perfectStatus === 0) {
      const { remarks } = this.state
      return (
        <div styleName='sub_container'>
          <Icon styleName='circle' type="close-circle" theme="filled" />
          <p styleName='status'>审核失败</p>
          <p styleName='red'>审核原因：{remarks}</p>
          <Button style={{ width: '100%' }} type='primary' onClick={this.toCertification}>重新完善</Button>
        </div>
      )
    }
  }

  toCertification = () => {
    clearTimeout(this.timer)
    router.push('Certification?type=modify')
  }

  render () {
    const { ready } = this.state
    return (
      ready
      &&
      <div styleName='container'>
        {this.renderFunc()}
      </div>
    )
  }
}
