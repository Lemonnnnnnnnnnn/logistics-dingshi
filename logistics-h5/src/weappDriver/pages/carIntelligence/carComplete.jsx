import React from 'react'
import { Badge, Toast } from 'antd-mobile'
import CSSModules from 'react-css-modules'
import router from 'umi/router'
import { connect } from 'dva'
import styles from './index.less'
import { DICTIONARY_TYPE } from '@/services/dictionaryService'
import { getCertificationStatus, AUDIT_STATUS_OPTIONS } from '@/services/carService'
import carHead from '@/assets/driver/car_head.png'
import carEmpty from '@/assets/driver/carEmpty.png'
import { noCompleteCarList, driverBindCar } from '@/services/apiService'
import { getOssImg } from '@/utils/utils'

@connect(state => ({
  dictionaries: state.dictionaries.items,
}), null)
@CSSModules(styles, { allowMultiple: true })
export default class Index extends React.Component {
  state = {
    ready: false,
    list: []
  }

  componentDidMount () {
    noCompleteCarList()
      .then(data => {
        this.setState({
          list: data || [],
          ready: true
        })
      })
  }

  renderCarStatus = (status, carFrontDentryid) => {
    const config = AUDIT_STATUS_OPTIONS[status]
    return (
      <Badge
        text={config.text}
        style={{ left: '10px', backgroundColor:config.color }}
      >
        <img style={{ width:'60px', height:'60px' }} src={getOssImg(carFrontDentryid) || carHead} alt="" />
      </Badge>
    )
  }

  renderIsAvailable = item => {
    const config = {
      true:{
        text:'启用',
        color:'#35D12F'
      },
      false:{
        text:'已禁用',
        color:'#F54040'
      }
    }[item.isAvailable] || {}
    return (
      <span style={{ color:config.color, marginLeft:'5px' }}>{config.text}</span>
    )
  }

  renderCardList = () => {
    const { list } = this.state
    if (list.length === 0 || !list) {
      return (
        <div style={{ textAlign: 'center' }}>
          <img src={carEmpty} alt='' style={{ width: '88px', height: '88px', margin: '147px 0 10px 0' }} />
          <div styleName='no_car_word'>暂无车辆</div>
        </div>
      )
    }
    return list.map(item =>
      <div key={item.carId} styleName='shadow bank_card no_top'>
        <div styleName='cardType'>
          {item.auditStatus === 2 && <span styleName='no_audit'>待认证</span>}
          {item.auditStatus === 0 && <span styleName='no_audit'>认证失败</span>}
        </div>
        <div style={{ display:'flex' }}>
          {this.renderCarStatus(getCertificationStatus(item), item.carFrontDentryid)}
          <div>
            <div>
              <h3 styleName='car_no inline_block'>{item.carNo}</h3>
              {this.renderIsAvailable(item)}
            </div>
            <span styleName='car_type'>{this.transformCarType(item.carType)}</span>
          </div>
        </div>
        {this.renderButton(item)}
      </div>
    )
  }

  renderButton = item => {
    const { relation, perfectStatus, carId } = item
    if (relation ) {
      if (!perfectStatus || perfectStatus === 2) {
        return <div styleName='relation_button width_auto' onClick={() => this.toCertification(carId)}>完善资料</div>
      }
    }
    if (!perfectStatus || perfectStatus === 2) {
      return <div styleName='relation_button width_auto' onClick={() => this.bindCar(carId)}>关联并完善</div>
    }
    return <div styleName='relation_button width_auto'>资料审核中</div>
  }

  bindCar = carId => {
    driverBindCar({ carId })
      .then(()=> {
        Toast.success('关联成功', 2)
        window.setTimeout(()=>{
          this.toCertification(carId)
        }, 2000)
      })
  }

  toCertification = carId => {
    router.replace(`carCertification?carId=${carId}`)
  }

  transformCarType = (type) => {
    const cars = this.props.dictionaries.filter(item => item.dictionaryType === DICTIONARY_TYPE.CAR_TYPE)
    const carType = cars.find(({ dictionaryCode }) => dictionaryCode === type)
    if (carType) return carType.dictionaryName
    return ''
  }

  render () {
    const { ready } = this.state
    return (
      ready
      &&
      <div styleName='container'>
        {this.renderCardList()}
      </div>
    )
  }
}
