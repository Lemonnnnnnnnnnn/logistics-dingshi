import React, { Component } from 'react';
import CSSModules from 'react-css-modules'
import { List, Switch, Modal, WhiteSpace } from 'antd-mobile';
import { connect } from 'dva'
import router from 'umi/router';
import { getCars, driverUnbindCar, setDefaultCar } from '@/services/apiService'
import { DICTIONARY_TYPE } from '@/services/dictionaryService'
import carHead from '@/assets/driver/car_head.png'
import { getOssImg } from '@/utils/utils';
import styles from './index.less'

const { alert } = Modal

@connect(state => ({
  dictionaries: state.dictionaries.items,
}), null)
@CSSModules(styles, { allowMultiple: true })
class CarSetting extends Component {

  state = {
    ready: false,
    data: {}
  }

  componentDidMount () {
    const { location: { query: { carId, carDefault } } } = this.props
    getCars({ carId })
      .then(res => {
        this.setState({
          ready: true,
          data: res,
          checked: !!(+carDefault)
        })
      })
  }

  transformCarType = (type) => {
    const cars = this.props.dictionaries.filter(item => item.dictionaryType === DICTIONARY_TYPE.CAR_TYPE)
    const carType = cars.find(({ dictionaryCode }) => dictionaryCode === type)
    if (carType) return carType.dictionaryName
    return ''
  }

  setDefault = () => {
    const { location: { query: { carId } } } = this.props
    const { checked } = this.state
    this.setState({
      checked: !checked
    }, () => {
      setDefaultCar({ carId })
    })
  }

  unbindCar = () => {
    const { location: { query: { carId } } } = this.props
    alert('解除车辆绑定', '解除车辆绑定后不能享受更多服务哦', [
      { text: '暂不解除' },
      {
        text: '解除绑定', onPress: () => {
          driverUnbindCar({ carId })
            .then(() => {
              router.goBack()
            })
        }
      },
    ])
  }

  renderIsAvailable = item => {
    const config = {
      true: {
        text: '启用',
        color: '#35D12F'
      },
      false: {
        text: '已禁用',
        color: '#F54040'
      }
    }[item.isAvailable] || {}
    return (
      <span style={{ color: config.color, marginLeft: '5px' }}>{config.text}</span>
    )
  }

  completeInfo = () => {
    const { location: { query: { carId } } } = this.props
    router.push(`carCertification?carId=${carId}`)
  }

  shouldComplete = () => {
    const { data } = this.state
    if (data.perfectStatus === 0 || data.perfectStatus === 2 || data.perfectStatus === 4) {
      return <div styleName='relation_button' onClick={this.completeInfo}>编辑</div>
    }
    // if (data.perfectStatus === 3) {
    //   return <div styleName='relation_button' style={{ width:'auto', fontSize:'14px' }}>审核中</div>
    // }
    return null
  }

  renderTitle = () => {
    const { data } = this.state
    if (data.perfectStatus === 0 || data.perfectStatus === 2) {
      return <div style={{ backgroundColor: 'rgba(245, 64, 64, 0.06)', height: '40px', color: '#F54040', lineHeight: '40px', paddingLeft: '15px' }}>● 未完善</div>
    }
    return null
  }

  render () {
    const { data, ready, checked } = this.state
    return (
      ready &&
      <div styleName='weapp_driver_car_setting'>
        {this.renderTitle()}
        <div styleName='shadow bank_card background_white'>
          <div style={{ display: 'flex' }}>
            <img style={{ width: '60px', height: '60px' }} src={getOssImg(data.carFrontDentryid) || carHead} alt="" />
            <div>
              <div>
                <h3 styleName='car_no inline_block'>{data.carNo}</h3>
                {this.renderIsAvailable(data)}
              </div>
              <span styleName='car_type'>{this.transformCarType(data.carType)}</span>
            </div>
          </div>
          {this.shouldComplete()}
        </div>
        <WhiteSpace />
        <List.Item
          extra={<Switch
            checked={checked}
            color='rgba(76,217,100,1)'
            onChange={this.setDefault}
          />}
        >
          默认车辆
        </List.Item>
        <WhiteSpace />
        <List.Item
          arrow="horizontal"
          onClick={this.unbindCar}
        >
          解除绑定
        </List.Item>
      </div>
    );
  }
}

export default CarSetting;
