import React, { Component } from 'react'
import { Map, Marker } from 'react-amap'
import { Toast, InputItem, Button, ActivityIndicator, Modal } from 'antd-mobile';
import router from 'umi/router';
import request from '@/utils/request'
import mapIcon from '@/assets/driver/mapIcon.png'
import mapCheck from '@/assets/driver/map_check.png'
import { addDelivery } from '@/services/apiService'
import { isFunction, isEmpty, isString } from '@/utils/utils'
import styles from './deliveryMap.less'

class DeliveryMap extends Component {

  constructor (props) {
    super(props)
    this.state = {
      mounted: false,
      poiList: [],
      mapConfig: {
        zoom: 10,
        center: {
          longitude: 104.07,
          latitude: 30.67
        }
      },
      position: {},
      searchValue: '',
      loading:false,
      visible:false
    }
    window.amapkey=window.envConfig.mapWebJsKey
    this.autoCompleteDom = undefined
    this.hasAddedListener = false
  }

  componentDidMount () {
    const { long, lat } = this.props
    const self = this
    this.mapEvents = {
      created: map => {
        self.map = map
        //  扩展插件 自动补全信息
        window.AMap.plugin('AMap.Autocomplete', () => {
          this.autoCompleteDom = new window.AMap.Autocomplete({ input: 'searchinput', outPutDirAuto: false })
        })

        // 扩展插件 地理编码和逆地理编码
        window.AMap.plugin(["AMap.Geocoder"], () => {
          self.geocoder = null
          self.geocoder = new window.AMap.Geocoder({
            radius:1000, // 以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
            extensions: 'all' // 返回地址描述以及附近兴趣点和道路信息，默认"base"
          })
        })

        window.AMap.plugin('AMap.Geolocation', () => {
          this.geolocation = new window.AMap.Geolocation();
          Toast.loading('正在获取当前定位', 100)
          this.geolocation.getCurrentPosition((status, result)=> {
            Toast.hide()
            console.log(status, result)
            if (status === 'complete') {
              const { position:{ lat:latitude, lng:longitude }, formattedAddress } = result
              this.getPOIAddress(longitude, latitude, formattedAddress)
            } else {
              Toast.fail('获取定位失败', 2)
            }
          })
        });
      },
      click: info => {
        const lnglat = [info.lnglat.lng, info.lnglat.lat]
        self.geocoder.getAddress(lnglat, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            // result为对应的地理位置详细信息
            if (result && result.regeocode && result.regeocode.formattedAddress) {
              // 是否有获取当前的地理位置
              isFunction(this.props.onMarkerAddress) && this.props.onMarkerAddress(lnglat.join(), result.regeocode.formattedAddress)
              this.setState({
                position: {
                  longitude: info.lnglat && info.lnglat.lng,
                  latitude: info.lnglat && info.lnglat.lat,
                  address:result.regeocode.formattedAddress
                },
                loading:false
              })
            } else {
              Toast.fail('获取当前位置信息失败')
            }
          }
        })
        this.setState({
          position: {
            longitude: info.lnglat && info.lnglat.lng,
            latitude: info.lnglat && info.lnglat.lat
          },
          loading:true
        })
      }
    }
    this.setState({ mounted: true })
    if (long && lat) {
      this.refreshMarker(long, lat)
    }
  }

  // componentWillReceiveProps (nextProps) {
  //   if (!isEqual(this.props.long, nextProps.long) || !isEqual(this.props.lat, nextProps.lat)) {
  //     if (nextProps.long && nextProps.lat) {
  //       this.refreshMarker(nextProps.long, nextProps.lat)
  //     }
  //   }
  // }

  /**
   * 刷新标记点
   * @memberof CustomMap
   */
  refreshMarker = (long, lat) => {
    this.setState({
      position: {
        longitude: long,
        latitude: lat
      }
    }, () => this.getAddress(long, lat))
  }

  /**
   * 解析地址
   * @memberof CustomMap
   */
  getAddress = (long, lat) => {
    const location = `${long},${lat}`
    request.post(`https://restapi.amap.com/v3/geocode/regeo?output=json&location=${location}&key=b81544224ed3cba7532d10d0da5b153a&radius=3000&extensions=all`, { noAuth: true })
      .then(async results => {
        if (results && results.info === 'OK') {
          this.setState({
            mapConfig: {
              zoom: 10,
              center : {
                longitude: long,
                latitude:lat
              }
            },
            position: {
              longitude: long,
              latitude: lat,
              address:results.regeocode.formatted_address
            }
          })
          isFunction(this.props.onMarkerAddress) && this.props.onMarkerAddress(location, results.regeocode.formatted_address)
        }
      })
  }

  getPOIAddress = (long, lat, address) => {
    const location = `${long},${lat}`
    request.get(`https://restapi.amap.com/v3/place/around?output=json&key=ced94847bdada548321638e1a12f1fdc&location=${location}&offset=5`, { noAuth: true })
      .then(results => {
        if (results && results.info === 'OK') {
          const poiList = results.pois.filter(item => isString(item.name) && isString(item.address))
            .map(item => ({ name:item.name, address:item.address, location:item.location, distance:item.distance, id:item.id }))
          this.setState({
            poiList,
            mapConfig: {
              zoom: 15,
              center: {
                longitude: long,
                latitude: lat,
              }
            },
            position: {
              longitude: long,
              latitude: lat,
              address
            }
          })
        }
      })
  }

  /**
   * 搜索框
   * @memberof CustomMap
   */
  fetchPlaceSearch = () => {
    const { searchValue } = this.state
    return (
      <InputItem
        id='searchinput'
        value={searchValue}
        // style={{ width: "300px" }}
        onChange={this.inputChange}
        placeholder='请输入需要搜索的地址'
        onFocus={this.addListener}
      >
        搜索地址
      </InputItem>
    )
  }

  addListener = () => {
    if (!this.hasAddedListener){
      // 绑定监听搜索选择信息事件
      window.AMap.event.addListener(this.autoCompleteDom, 'select', e => {
        if (e.poi.location) { // 如果存在当前地理位置的坐标
          const { poi: { location: { lng :longitude, lat: latitude }, name, address } } = e
          const center = {
            longitude,
            latitude,
            address,
            name
          }
          isFunction(this.props.onMarkerAddress) && this.props.onMarkerAddress(`${longitude},${latitude}`, address)
          this.setState({
            searchValue: name,
            mapConfig: {
              zoom: 15,
              center
            },
            position: center
          })
        } else { // 不存在进行地址位置解析然后获取对应的坐标点
          this.geocoder.getLocation(e.poi.name, (status, result) => {
            if (status === 'complete' && result.info === 'OK') { // 解析数据返回成功
              const message = result && result.geocodes && result.geocodes[0]
              message ? this.setState({
                mapConfig: {
                  zoom: 15,
                  center : {
                    longitude: message.location.lng,
                    latitude: message.location.lat
                  }
                },
                position: {
                  longitude: message.location.lng,
                  latitude: message.location.lat,
                  address:message.formattedAddress
                }
              }, () => {
                isFunction(this.props.onMarkerAddress) && this.props.onMarkerAddress(`${message.location.lng},${message.location.lat}`, message.formattedAddress)
              }) : Toast.fail('获取当前位置解析失败')
            }
          })
        }
      })
      this.hasAddedListener=true
    }
  }

  /**
   * 输入值改变
   * @memberof CustomMap
   */
  inputChange = value => {
    this.setState({ searchValue: value })
  }

  changeLocation = ({ address, location, name }) => {
    console.log(address, location)
    const [longitude, latitude] = location.split(',')
    this.setState({
      position: {
        longitude,
        latitude,
        address,
        name
      },
      mapConfig:{
        zoom: 15,
        center: {
          longitude,
          latitude
        }
      },
    })
  }

  checkDelivery = () => {
    this.setState({
      visible:true
    })
  }

  renderPOIInfo = () => {
    const { poiList, position:{ address }, loading } = this.state
    const _poiList = poiList.slice(0, 2)
    const list = _poiList.map(item => (
      <div onClick={() => this.changeLocation(item)} key={item.id} className={styles.list_item}>
        <img alt='' className={styles.map_icon} src={mapIcon} />
        <div className={styles.list_info}>
          <div style={{ fontSize:'17px', color:'#222222', width:'230px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</div>
          <div style={{ fontSize:'14px', color:'#999999', width:'230px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.address}</div>
        </div>
        <div style={{ position:'absolute', right:'15px', bottom:'16px', fontSize:'14px', color:'#999999' }}>{`${(item.distance/1000).toFixed(2)._toFixed(2)}km`}</div>
      </div>
    ))
    // white-space:nowrap;
    // overflow:hidden;
    // text-overflow:ellipsis;
    return (
      <div style={{ width:'100%', height:'344px', borderRadius:'16px 16px 0px 0px', background:'white', padding:'15px' }}>
        <div className={styles.now_location}>
          {loading
            ? <ActivityIndicator text='Loading...' />
            :
            <div style={{ display:'flex', alignItems:'center' }}>
              <div style={{ display:'inline-block', width:'10px', height:'10px', background:'#35D12F', borderRadius:'50%', margin:'8px 10px 8px 0' }} />
              <div style={{ fontSize:'20px', color:'#555555', width:'250px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{address}</div>
            </div>
          }
          <div style={{ margin:'5px 20px', fontSize:'14px', color:'#999999' }}>为你推荐最佳提货点</div>
          <img alt='' src={mapCheck} style={{ width:'24px', height:'24px', position:'absolute', right:'15px', top:'29px' }} />
        </div>
        {list}
        <Button className={styles.submit_delivery} onClick={this.checkDelivery}>确认提货点</Button>
      </div>
    )
  }

  renderMarker = () => (
    <div style={{ display:'flex', position:'relative', left:'-48%', top:'-38px', flexDirection:'column', alignItems:'center' }}>
      <div className={styles.mark_head}>这里提货</div>
      <div className={styles.mark_stick} />
      <div className={styles.mark_circle} />
    </div>
  )

  changeName = (value) => {
    this.contactName = value
  }

  changePhone = (value) => {
    this.contactPhone = value
  }

  closeModal = () => {
    this.setState({
      visible:false
    })
  }

  addDelivery = () => {
    const { props:{ location: { query: { transportId } } }, contactName, contactPhone, state:{ position: { address, name, longitude, latitude } } } = this
    const reg = /^1\d{10}$/
    if (reg.test(contactPhone) || !contactPhone) {
      addDelivery({
        deliveryAddress:address,
        deliveryName:name || address,
        deliveryLongitude:longitude,
        deliveryLatitude:latitude,
        contactName,
        contactPhone,
        transportId
      })
        .then(() => {
          this.closeModal()
          router.goBack()
        })
    } else {
      Toast.fail('请输入正确的手机号')
    }
  }

  render () {
    const { mapConfig, position, mounted, visible } = this.state
    return (
      mounted &&
      <>
        {this.fetchPlaceSearch()}
        <div style={{ width: '100%', height: 'calc(100vh - 344px - 44px)' }} className={styles.diy_delivery_map}>
          <Map events={this.mapEvents} {...mapConfig} amapkey="f5230ee3a560bd0cb5f5cef45b9c24c8">
            <Marker
              visible={!isEmpty(position)}
              render={this.renderMarker}
              position={position}
            />
          </Map>
        </div>
        {this.renderPOIInfo()}
        <Modal
          visible={visible}
          onClose={this.closeModal}
          closable
          maskClosable={false}
          footer={[{ text: '取消', onPress: () => { this.closeModal() } }, { text: '确认', onPress: () => { this.addDelivery() } }]}
          transparent
        >
          <div style={{ fontSize:'20px', fontWeight:'bold', color:'#222222', marginBottom:'20px' }}>添加联系信息</div>
          <InputItem maxLength={20} labelNumber={6} style={{ textAlign:'left' }} onChange={this.changeName}>联系人(选填)</InputItem>
          <InputItem labelNumber={6} style={{ textAlign:'left' }} onChange={this.changePhone}>联系电话(选填)</InputItem>
        </Modal>
      </>
    )
  }
}

export default DeliveryMap;
