import React from 'react'
import { DatePicker, List, Modal, Toast } from 'antd-mobile'
import { Icon } from 'antd'
import moment from 'moment'
import router from 'umi/router'
import CSSModules from 'react-css-modules'
import { connect } from 'dva'
import zhCN from 'antd-mobile/lib/date-picker/locale/zh_CN';
import model from '@/models/preBooking'
import routerModel from '@/models/router'
import { getCarByShipment, patchGrabbingOrder, getJsSDKConfig } from '@/services/apiService'
import { DICTIONARY_TYPE } from '@/services/dictionaryService'
import loginCar from '@/assets/driver/loginCar.png'
import noAuditStatus from '@/assets/driver/noAuditStatus.png'
import ListContainer from '@/mobile/page/component/ListContainer'
import { browser } from '@/utils/utils'
import ListItem from './component/ListItem'
import styles from './ListIndex.less'

const { alert } = Modal

const { actions: { getPreBooking } } = model

const { actions: { addQuery, delQuery } } = routerModel

const ListPage = ListContainer(ListItem)

@connect(state => ({
  dictionaries: state.dictionaries.items,
  nowUser: state.user.nowUser,
  params: state.router.releaseHallParams
}), { getPreBooking, addQuery, delQuery })
@CSSModules(styles, { allowMultiple: true })
export default class ListIndex extends React.Component {
  componentDidMount () {
    if (browser.versions.android) {
      getJsSDKConfig({ url: encodeURIComponent(window.location.href.split('#')[0]) })
        .then(({ timestamp, nonceStr, signature }) => {
          wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx5b020341411ebf08', // 必填，公众号的唯一标识
            timestamp, // 必填，生成签名的时间戳
            nonceStr, // 必填，生成签名的随机串
            signature, // 必填，签名
            jsApiList: ['getLocation'] // 必填，需要使用的JS接口列表
          })
        })
    }
    let params = null;
    if (this.props.params) {
      // eslint-disable-next-line prefer-destructuring
      params = this.props.params
      this.props.delQuery('releaseHallParams')
    } else {
      const { location: { query } } = this.props
      if (!query.deliveryAddress) delete query.deliveryAddress
      if (!query.receivingAddress) delete query.receivingAddress
      params = query
    }
    getCarByShipment({ limit: 100, offset: 0, selectType: 4 })
      .then(data => {
        const index = data.items.findIndex(item => item.carDefault === 1)
        if (index !== -1) {
          const defaultCar = data.items.splice(index, 1)
          data.items.splice(0, 0, defaultCar[0])
          this.setState({
            date: new Date(params.deliveryDateStart),
            list: data.items,
            ready: true,
            activeCarId: data.items[0].carId,
            keywords: params
          })
        } else {
          this.setState({
            date: new Date(params.deliveryDateStart),
            list: data.items,
            ready: true,
            activeCarId: '',
            keywords: params
          })
        }
      })
  }

  state = {
    date: '',
    ready: false,
    remark: ''
  }

  transformCarType = (type) => {
    const cars = this.props.dictionaries.filter(item => item.dictionaryType === DICTIONARY_TYPE.CAR_TYPE)
    const carType = cars.find(({ dictionaryCode }) => dictionaryCode === type)
    if (carType) return carType.dictionaryName
    return ''
  }

  pickDate = (date) => {
    this.setState({
      date
    })
    const { keywords } = this.state
    keywords.deliveryDateStart = moment(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss')
    keywords.deliveryDateEnd = moment(date).set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss')
    this.setState({
      keywords
    })
  }

  onChangeRemarks = e => {
    this.setState({
      remark: e.target.value
    })
  }

  toIntelligence = () => {
    this.props.addQuery({ releaseHallParams: this.props.location.query })
    router.push('/WeappDriver/intelligence')
  }

  toCarIntelligence = () => {
    router.push('/WeappDriver/carIntelligence')
  }

  takeOrder = item => {
    // 在点击接单时，从子元素获取当前的预约单信息
    const { prebookingId } = item
    this.setState({ prebookings : item })
    this.prebookingId = prebookingId

    const { list } = this.state
    const { auditStatus } = this.props.nowUser
    if (auditStatus !== 1) {
      return alert(
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#222222' }}>还未进行实名认证哦</h3>,
        <>
          <p>为了保证您的合法权益，请先进行实名认证</p>
          <img style={{ width: '160px', margin: '20px 0' }} src={noAuditStatus} alt="图片加载失败" />
        </>,
        [
          { text: '暂不认证', onPress: () => console.log('cancel'), style: 'default' },
          { text: '去认证', onPress: this.toIntelligence },
        ]);
    }
    if (!list || list.length === 0) {
      alert(
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#222222' }}>还没有进行车辆注册</h3>,
        <>
          <p>只有车辆登记用户才可以使用该功能</p>
          <img style={{ width: '100%', margin: '20px 0' }} src={loginCar} alt="图片加载失败" />
        </>,
        [
          { text: '暂不注册', onPress: () => console.log('cancel'), style: 'default' },
          { text: '去注册', onPress: this.toCarIntelligence },
        ]);
    } else {
      this.setState({
        modal: true
      })
    }
  }

  confirmTakeOrder = () => {
    const { activeCarId, list, prebookings : { deliveryItems } } = this.state
    if (!activeCarId) return Toast.fail('请选择车辆')
    const current = list.find(item => item.carId === activeCarId)
    // 比较当前车辆可承接类型 和 预约单货品是否匹配

    const { carCategoryEntityList, isBusy, carNo } = current
    if (isBusy === 0) return Toast.fail('该车辆繁忙无法接单')

    const formData = {
      carId: activeCarId,
      prebookingId: this.prebookingId,
      remark: this.state.remark
    }

    // 如果提货单deliveryItems数组中的货品firstCategoryId 在可承接类型carCategoryEntityList中找不到，弹窗提示

    let categoryList = []
    if (carCategoryEntityList) categoryList = carCategoryEntityList.map(item => item.categoryId)

    const matchFailCategory = []

    deliveryItems.forEach(item => {
      if (!categoryList.find(_item => _item === item.firstCategoryId)) {
        matchFailCategory.push(item.firstCategoryName)
      }
    })

    if (matchFailCategory.length){
      alert('提示', (
        <div>
          <span>当前选择车辆可承接货品与该预约单货品</span>
          {
            matchFailCategory.map(item => <span style={{ color: "#369FFF", marginRight : '3px', marginLeft : '3px' }}>{item}</span>)
          }
          <span>不匹配，是否确认接单？</span>
        </div>
      ), [
        { text: '取消', onPress: () => console.log('cancel') },
        { text: '确认', onPress: () => {
          this.onPatchGrabbingOrder(formData)
        } },
      ])
    } else {
      this.onPatchGrabbingOrder(formData)
    }
  }

  onPatchGrabbingOrder = (formData) =>{
    Toast.loading('抢单中', 1000)
    const _this = this
    wx.getLocation({
      type: 'gcj02',
      success: res =>{
        if (!res) {
          Toast.hide()
          this.closeModal()
          return Toast.fail('定位信息获取失败，抢单失败')
        }
        const { latitude, longitude } = res
        formData.latitude = latitude
        formData.longitude = longitude
        patchGrabbingOrder(formData).then(res => {
          Toast.hide()
          _this.closeModal()
          Toast.success('抢单成功', 1, () => {
            router.push(`/WeappDriver/main/index/transportDetail?transportId=${res.transportId}`)
          })
        })
      },
      fail:()=> {
        Toast.hide()
        _this.closeModal()
        Toast.fail('定位信息获取失败，请打开定位')
      }
    })
  }


  closeModal = () => {
    this.setState({
      modal: false,
      remark: ''
    })
  }

  renderList = () => {
    const { keywords } = this.state
    const props = {
      action: this.props.getPreBooking,
      dataCallBack: this.dataCallBack,
      primaryKey: 'prebookingId',
      params: { ...keywords, isPosted: true, prebookingStatusArr: '0,1' },
      style: {
        height: 'calc(100vh - 44px)',
        width: '100%',
        padding: '15px 0'
      },
      itemProps: {
        takeOrder: this.takeOrder
      }
    }
    return <ListPage key={keywords.deliveryDateEnd} {...props} />
  }

  selectCar = e => {
    this.setState({
      activeCarId: Number(e.currentTarget.getAttribute('car-id'))
    })
  }

  render () {
    const { date, ready, list, activeCarId } = this.state
    return (
      ready
      &&
      <>
        <DatePicker
          mode='date'
          locale={zhCN}
          value={date}
          title='选择提货时间'
          extra='选择提货时间'
          minDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), 60)}
          minuteStep={60}
          format={(date) => moment(new Date(date)).format('MM月DD日')}
          onChange={this.pickDate}
        >
          <List.Item arrow="horizontal">用车时间</List.Item>
        </DatePicker>
        {this.renderList()}
        <Modal
          visible={this.state.modal}
          transparent
          maskClosable={false}
          onClose={this.closeModal}
          title="选择接单车辆"
          footer={[{ text: '取消', onPress: this.closeModal }, { text: '接单', onPress: this.confirmTakeOrder }]}
        >
          <div styleName='orderHall_car_list'>
            <div styleName='carList'>
              <ul>
                {list.map((item, index) => (
                  <li key={item.carId} onClick={item.isBusy === 1?this.selectCar: null} car-id={item.carId} styleName={activeCarId === item.carId? 'active': ''}>
                    <p>{item.carNo}</p>
                    <p>{item.carType && this.transformCarType(item.carType) || ''}</p>
                    {activeCarId === item.carId && index === 0?
                      <span styleName='defaultCar'>默认</span>
                      :
                      null
                    }
                    {activeCarId === item.carId && index !== 0?
                      <span styleName='defaultCar'>选中</span>
                      :
                      null
                    }
                    {
                      item.isBusy === 1?
                        <span styleName='free'>空闲</span>
                        :
                        <span styleName='busy'>忙碌</span>
                    }
                  </li>
                ))}
              </ul>
            </div>
            <div styleName='addCar' onClick={this.toCarIntelligence}>
              <Icon styleName='icon_plus' type="plus" />
              添加车辆
            </div>
            {/* <input value={this.state.remark} onChange={this.onChangeRemarks} placeholder='添加备注(选填)' /> */}
          </div>
        </Modal>
      </>
    )
  }
}
