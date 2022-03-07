import React from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import { getNowUser } from '@/services/apiService'
import { DRIVER_LICENSE_TYPE } from '@/constants/driver/driver'
import ExpiredTag from '@/weappDriver/components/ExpiredTag'
import router from 'umi/router'
import styles from './complete.less'

@CSSModules(styles, { allowMultiple: true })
export default class Complete extends React.Component {
  state = {
    ready: false
  }

  componentDidMount () {
    getNowUser().then(info => {
      this.setState({
        info,
        ready: true
      })
    })
  }

  edit = (type) =>{
    if (type === 'licenseValidity'){
      router.push('/WeappDriver/LicenseValidityEdit')
    }
    if (type === 'qualificationValidity'){
      router.push('/WeappDriver/QualificationValidityEdit')
    }
  }

  renderInfo = () => {
    const { info } = this.state
    const { nickName, idcardNo, licenseType, licenseValidityDate, qualificationValidityDate, licenseValidityType } = info
    const licenseValidityExpired = licenseValidityType !== 2 && moment(licenseValidityDate).diff(moment()) < 0
    const qualificationValidityExpired = moment(qualificationValidityDate).diff(moment()) < 0
    return (
      <div style={{ padding: '15px 0 0' }}>
        <div styleName='info_card'>
          <h3 styleName='user_name'>{nickName}</h3>
          <h3 styleName='id_card_no'>{`${idcardNo.substring(0, 3)} **** **** **** ${idcardNo.substr(-3)}`}</h3>
          <div styleName='check_tips'><span>已认证</span></div>
        </div>
        <div styleName='info_card'>
          {licenseValidityExpired && <ExpiredTag style={{ top: '-10px', fontSize: '12px', left: '-7px' }} /> || null}
          <h3 styleName='title'>驾驶证</h3>
          <h3 styleName='body'>{DRIVER_LICENSE_TYPE.find(item => item.value === licenseType).text}</h3>
          {licenseValidityType === 2 && <h3 styleName='footer'>有效日期：长期</h3> || null}
          {(licenseValidityType === 1 || licenseValidityType ===null) && <h3 styleName='footer'>有效日期：{moment(licenseValidityDate).format('YYYY/MM/DD HH:mm:ss')}</h3> || null}
          {licenseValidityExpired && <div styleName='modify_tips' onClick={()=>this.edit('licenseValidity')}><span>编辑</span></div> || null}

          <div styleName='check_tips'><span>已认证</span></div>
        </div>
        <div styleName='info_card'>
          {qualificationValidityExpired && <ExpiredTag style={{ top: '-10px', fontSize: '12px', left: '-7px' }} /> || null}
          <h3 styleName='title'>从业资格证</h3>
          <h3 styleName='body'>{nickName}</h3>
          <h3 styleName='footer'>有效日期：{qualificationValidityDate ? moment(qualificationValidityDate).format('YYYY/MM/DD HH:mm:ss') : '--'}</h3>
          <div styleName='check_tips'><span>已认证</span></div>
          {qualificationValidityExpired && <div styleName='modify_tips' onClick={()=>this.edit('qualificationValidity')}><span>编辑</span></div> || null}
        </div>
      </div>
    )
  }

  render () {
    const { ready } = this.state
    return (
      ready
      &&
      this.renderInfo()
    )
  }
}