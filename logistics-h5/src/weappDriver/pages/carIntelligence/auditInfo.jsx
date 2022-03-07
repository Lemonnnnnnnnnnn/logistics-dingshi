import React from 'react'
import CSSModules from 'react-css-modules'
import { Button, NoticeBar } from 'antd-mobile'
import router from 'umi/router'
import { getCars } from '@/services/apiService'
import styles from './auditInfo.less'
import { CAR_STATUS } from '@/constants/driver/driver'

@CSSModules(styles, { allowMultiple: true })
export default class UnComplete extends React.Component {
  state = {
    remarks: null,
    ready:false,
    data:{}
  }

  componentDidMount (){
    const { location:{ query:{ carId } } } = this.props
    getCars({ carId })
      .then(res=>{
        this.setState({
          data:res,
          ready:true,
          remarks:!res.auditStatus && (res.remarks || '车辆资料有误')
        })
      })
  }

  renderStatus = () => {
    const { data } = this.state
    if (data.auditStatus === 2) {
      return (
        <span styleName='yellow_result'>审核中</span>
      )
    }
    return (
      <span styleName='red_result'>审核失败</span>
    )
  }

  renderFunc = () => (
    <>
      <div styleName='card'>
        <div>
          <h3 styleName='title'>基础信息</h3>
          <p styleName='gray_desc'>请按照提示编辑车辆信息</p>
        </div>
        <div styleName='result'>
          <span styleName='red_result'>认证成功</span>
        </div>
      </div>
      <div styleName='card'>
        <div>
          <h3 styleName='title'>完善信息</h3>
          <p styleName='gray_desc'>请按照提示完善车辆信息</p>
        </div>
        <div styleName='result'>
          {this.renderStatus()}
        </div>
      </div>
    </>
  )

  toCertification = () => {
    const { location:{ query:{ carId } } } = this.props
    router.push(`/WeappDriver/carCertification?carId=${carId}`)
  }

  toService = () => {
    router.push('/WeappDriver/customerService')
  }

  renderFooter = () => {
    const { auditStatus } = this.state.data
    switch (auditStatus) {
      case CAR_STATUS[0].value:
        return (
          <div styleName='footer_box'>
            <div styleName='footer_container'>
              <p styleName='chat'>认证出现问题，立即<span onClick={this.toService}>联系客服</span></p>
              <Button type='primary' onClick={this.toCertification}>重新认证</Button>
            </div>
          </div>
        )
      case CAR_STATUS[2].value:
        return (
          <div styleName='footer_box'>
            <div styleName='footer_container'>
              <p styleName='chat'>认证出现问题，立即<span onClick={this.toService}>联系客服</span></p>
            </div>
          </div>
        )
      default: return null
    }
  }

  render () {
    const { ready, remarks } = this.state
    return (
      ready
      &&
      <div styleName='container'>
        {
          remarks?
            <NoticeBar className='unComplete_remarks' marqueeProps={{ loop: true, style: { padding: '0 7.5px', color: 'red' } }}>
              {remarks}
            </NoticeBar>
            :
            null
        }
        {this.renderFunc()}
        {this.renderFooter()}
      </div>
    )
  }
}
