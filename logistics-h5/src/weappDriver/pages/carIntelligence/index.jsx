import React from 'react'
import { Badge } from 'antd-mobile'
import CSSModules from 'react-css-modules'
import router from 'umi/router'
import { connect } from 'dva'
import styles from './index.less'
import iconAdd from '@/assets/driver/icon_add.png'
import { DICTIONARY_TYPE } from '@/services/dictionaryService'
import { getCertificationStatus, AUDIT_STATUS_OPTIONS } from '@/services/carService'
import iconAddBlue from '@/assets/driver/icon_add_blue.png'
import carHead from '@/assets/driver/car_head.png'
import loginCar from '@/assets/driver/loginCar.png'
import { getCars } from '@/services/apiService'
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

  addCard = () => {
    router.push('findCar')
  }

  componentDidMount () {
    getCars({ limit:100, offset:0, selectType:4 })
      .then(data => {
        this.setState({
          list: data.items,
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
        <div styleName='noBindCar'>
          <img src={loginCar} alt="图片加载失败" />
          <p>还没有注册的车辆哦</p>
        </div>
      )
    }
    return list.map(item =>
      <div key={item.carId} onClick={this.clickCard(item)} styleName='shadow bank_card'>
        <div styleName='cardType'>
          {!!item.carDefault && <span styleName='default'>默认</span>}
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
      </div>
    )
  }

  clickCard = item => () => {
    router.push(`carSetting?carId=${item.carId}&carDefault=${item.carDefault}`)
  }

  transformCarType = (type) => {
    const cars = this.props.dictionaries.filter(item => item.dictionaryType === DICTIONARY_TYPE.CAR_TYPE)
    const carType = cars.find(({ dictionaryCode }) => dictionaryCode === type)
    if (carType) return carType.dictionaryName
    return ''
  }

  render () {
    const { ready, list } = this.state
    return (
      ready
      &&
      <div styleName='container'>
        <div styleName='title'>
          <div>
            <span styleName='title_text'>我的车辆</span>
            <span styleName='count'>共{list.length}辆</span>
          </div>
          <img src={iconAdd} alt="图片加载失败" onClick={this.addCard} />
        </div>
        {this.renderCardList()}
        <div styleName='shadow' onClick={this.addCard}>
          <div styleName='add_box'>
            <img src={iconAddBlue} alt="图片加载失败" />
            <span>添加车辆</span>
          </div>
        </div>
      </div>
    )
  }
}
