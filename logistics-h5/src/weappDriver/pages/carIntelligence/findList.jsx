import React, { Component } from 'react';
import CSSModules from 'react-css-modules'
import { connect } from 'dva'
import router from 'umi/router';
import { Toast, Modal } from 'antd-mobile';
import { driverFindCar, driverBindCar, carBasicAuth } from '@/services/apiService'
import { DICTIONARY_TYPE } from '@/services/dictionaryService'
import iconAddBlue from '@/assets/driver/icon_add_blue.png'
import carHead from '@/assets/driver/car_head.png'
import carEmpty from '@/assets/driver/carEmpty.png'
import { getOssImg } from '@/utils/utils';
import styles from './index.less'

@connect(state => ({
  dictionaries: state.dictionaries.items,
}), null)
@CSSModules(styles, { allowMultiple: true })
class FindList extends Component {

  state = {
    ready:false
  }

  componentDidMount (){
    const { location:{ query:{ carNo } } } = this.props
    driverFindCar({ carNo })
      .then(res=>{
        this.setState({
          ready:true,
          data:res
        })
      })
  }

  addCar = () => {
    const { location:{ query:{ carNo, plat } } } = this.props
    Modal.alert('未检测到车辆', '是否注册并关联该车辆', [{
      text:'取消',
    }, {
      text:'注册',
      onPress:() => {
        carBasicAuth({ carNo })
          .then((res) => {
            Toast.success('关联成功', 2)
            setTimeout(() => {
              // router.replace(`carCongratulation?carId=${res.carId}`)
              if (plat !== 'undefined'){
                router.replace('/WeappDriver/collectionCode')
              } else {
                router.replace(`carCongratulation?carId=${res.carId}`)
              }
            }, 2000)
          })
      }
    }])
  }

  transformCarType = (type) => {
    const cars = this.props.dictionaries.filter(item => item.dictionaryType === DICTIONARY_TYPE.CAR_TYPE)
    const carType = cars.find(({ dictionaryCode }) => dictionaryCode === type)
    if (carType) return carType.dictionaryName
    return ''
  }

  bindCar = () => {
    const { location:{ query:{ plat } } } = this.props
    const { data } = this.state
    if (data.auditStatus === 1) {
      driverBindCar({ carId:data.carId })
        .then(()=> {
          Toast.success('关联成功', 2)
          window.setTimeout(()=>{
            if (plat !== 'undefined'){
              router.replace('/WeappDriver/collectionCode')
            } else {
              router.replace('carIntelligence')
            }
          }, 2000)
        })
    } else {
      Toast.fail('关联失败，车辆审核中', 2)
    }
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

  renderCarList = () => {
    const { data } = this.state
    if (data) {
      return (
        <div styleName='shadow bank_card'>
          <div style={{ display:'flex' }}>
            <img style={{ width:'60px', height:'60px' }} src={getOssImg(data.carFrontDentryid) || carHead} alt="" />
            <div>
              <div>
                <h3 styleName='car_no inline_block'>{data.carNo}</h3>
                {this.renderIsAvailable(data)}
              </div>
              <span styleName='car_type'>{this.transformCarType(data.carType)}</span>
            </div>
          </div>
          <div styleName='relation_button' onClick={this.bindCar}>关联</div>
        </div>
      )
    }
    return (
      <>
        <div style={{ textAlign:'center' }}>
          <img src={carEmpty} alt='' style={{ width:'88px', height:'88px', margin:'147px 0 10px 0' }} />
          <div styleName='no_car_word'>未检索到所搜车辆</div>
        </div>
        <div styleName='shadow' onClick={this.addCar}>
          <div styleName='add_box'>
            <img src={iconAddBlue} alt="图片加载失败" />
            <span>添加车辆</span>
          </div>
        </div>
      </>
    )
  }

  render () {
    const { ready } = this.state
    return (
      ready &&
      <div styleName='container'>
        {this.renderCarList()}
      </div>
    );
  }
}

export default FindList;
