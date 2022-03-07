import React, { useEffect, useState } from 'react'
import { Map, Polyline, Marker, Circle } from 'react-amap'
import moment from 'moment'
import { connect } from 'dva'
import { Toast } from 'antd-mobile'
import { getTrackDentry, getTransportProcesses, getZhongJiaoTrace } from '@/services/apiService'
import { TRANSPORT_ENVENT_STATUS } from '@/constants/project/project'
import loadIcon from '@/assets/map_icon_load.png'
import arriveIcon from '@/assets/map_icon_arrive.png'
import receiptIcon from '@/assets/map_icon_receipt.png'
import deliveryIcon from '@/assets/map_icon_delivery.png'
import unloadIcon from '@/assets/map_icon_unload.png'
import carWithP from '@/assets/carWithP.svg'
import acceptIcon from '@/assets/map_icon_accept.png'
import car from '@/assets/car.svg'
import parkIcon from '@/assets/map_icon_park.svg'
import { isFunction } from '@/utils/utils'
import { TRANSPORTIMMEDIATESTATUS } from '@/constants/transport/transport'

const iconStyle = { width: '40px', height: '40px' }
const defaultCenter = {
  longitude: 104.07,
  latitude: 30.67
}

// 1:接受的 2:装货点 3:到站点 4:签收点 5. 提货点 6.卸货点
const ACCEPT_POINT = 1
const LOAD_POINT = 2
const ARRIVE_POINT = 3
const RECEIPT_POINT = 4
const DELIVERY_POINT = 5
const UNLOAD_POINT = 6
const STATUS_NO_TRACK = [TRANSPORTIMMEDIATESTATUS.UNTREATED, TRANSPORTIMMEDIATESTATUS.CANCEL, TRANSPORTIMMEDIATESTATUS.REFUSED]
// const POINT_TYPE_NOT_MARKED = ACCEPT_POINT // 不需要打点的类型

export default connect(state=>({ transportDetail:state.transports.entity }), null)
((props) => {
  const { serviceId: sid, trackDentryid: trid, terminalId: tid, transportId, eventItems=[], plateNumber, transportImmediateStatus, deliveryItems:[delivery], signItems:[receiving] } = props.transportDetail
  window.amapkey = window.envConfig.mapWebKey
  const [type, setType] = useState('normal')
  const [center, setCenter] = useState(defaultCenter)
  const [distance, setDistance] = useState(0)
  const [locations, setLocations] = useState([])
  const [parkInfo, setParkInfo] = useState([])
  const [nowLocation, setNowLocation] = useState([])
  const [markers, setMarkers] = useState([])
  const [AMap, setAMap]= useState()
  const [requestLocationReady, setRequestLocationReady] = useState(false)
  const startDate = eventItems.find(item => item.eventStatus === TRANSPORT_ENVENT_STATUS.CAR_LOADING)?.createTime
  const endDate = eventItems.find(item => item.eventStatus === TRANSPORT_ENVENT_STATUS.SIGNED)?.createTime || moment()

  useEffect(() => {
    transportId && getTransportProcesses(transportId)
      .then(({ items }) => {
        items.forEach(item=>{
          if (item.pointType === DELIVERY_POINT){
            item.isOpenFence = delivery.isOpenFence
            item.radius = delivery.radius
          }
          switch (item.pointType) {
            case DELIVERY_POINT:
              item.isOpenFence = delivery.isOpenFence
              item.radius = delivery.radius
              break;
            case UNLOAD_POINT:
              item.isOpenFence = receiving.isOpenFence
              item.radius = receiving.radius
              break;
            default:
              break;
          }
        })
        setMarkers(items)
      })
  }, [transportId])

  useEffect(() => {
    let locations = []
    if (sid && trid && tid && type==='normal') {
      Toast.loading('加载中', 1000)
      const starttime = moment(startDate).valueOf()
      const endtime = moment(endDate).valueOf()
      const params = { sid, trid, tid, starttime, endtime }
      getTrackDentry(params)
        .then((data) => {
          locations = data.points
          data.points.length && setCenter(data.points[0])
          const lastPoint = locations[locations.length-1]
          const { latitude, longitude, direction, speed } = lastPoint
          setNowLocation([{ pointType:7, latitude, longitude, direction, speed }])
          setDistance(data.distance)
          setLocations(locations)
          setRequestLocationReady(true)
          Toast.hide()
        })
        .catch(()=>{
          Toast.hide()
          setRequestLocationReady(true)
        })
    } else if (startDate && type==='zhongjiao'){
      Toast.loading('加载中', 1000)
      getZhongJiaoTrace({ startDate:moment(startDate).format('YYYY/MM/DD HH:mm:ss'), endDate:moment(endDate).format('YYYY/MM/DD HH:mm:ss'), carNo:plateNumber,transportId })
      // getZhongJiaoTrace({ startDate:moment(startDate).format('2019/12/31 00:00:00'), endDate:'2019/12/31 23:59:59', carNo: plateNumber })
        .then((data) => {
          if (!data) return
          if (data.points !== null){
            locations = data.points
            GraspRoad( locations, (newLocations)=>{
              newLocations.length && setCenter(data.points[0])
              const lastPoint = newLocations[newLocations.length-1]
              const { latitude, longitude, direction, speed } = lastPoint
              setNowLocation([{ pointType:7, latitude, longitude, direction, speed }])
              setLocations(newLocations)
              setDistance(data.distance)
              setRequestLocationReady(true)
              Toast.hide()
            })
          }
          if (data.parkInfo !== null){
            setParkInfo(data.parkInfo)
          }
        })
        .catch(()=>{
          Toast.hide()
          setRequestLocationReady(true)
        })
    } else if (transportImmediateStatus === TRANSPORTIMMEDIATESTATUS.ACCEPT){
      setRequestLocationReady(true)
    }
  }, [sid, trid, tid, type])

  useEffect(()=>{
    setCenter(defaultCenter)
    setDistance(0)
    setLocations([])
    setParkInfo([])
    setNowLocation([])
    // setRequestLocationReady(false)
  }, [type]) // 切换类型轨迹来源初始化各参数

  useEffect(()=>Toast.hide, []) // 卸载组件时保证清除Toast

  const mapEvents = {
    created: (el)=>{
      setAMap(el)
      setTimeout(()=>{
        el && el.setFitView()
      }, 500)
      // if (!hasFormatLocations){
      //   GraspRoad( locations, (newLocations)=>{
      //     setLocations(newLocations)
      //     setHasFormatLocations(true)
      //   })
      // }
    },
    click:()=>{
      const newMarkers = parkInfo.map(item => {
        item.icon = undefined
        return item
      })
      setMarkers(newMarkers)
    }
  }

  const parkMarkerEvents = {
    click: (el)=>{
      const elLat = el.target.B.position.P
      const elLon = el.target.B.position.Q
      const newMarkers = parkInfo.map(item => {
        item.icon = undefined
        if (Math.abs(item.latitude - elLat) < 0.000000000001 && Math.abs(item.longitude - elLon) < 0.000000000001){
          const icon = (
            <div style={{ position:'relative', width: '500px' }}>
              <img src={parkIcon} alt='' style={iconStyle} />
              <div style={{ background: 'white', border: '1px solid black', top:'40px', zIndex: 100, position:"absolute" }}>{item.parkTimeDescribe}</div>
            </div>
          )
          item.icon = icon
        }
        return item
      })
      setMarkers(newMarkers)
    }
  }

  const polylineEvents = {
    created: ()=>{
      setTimeout(()=>{
        AMap && AMap.setFitView()
      }, 500)
    }
  }

  const GraspRoad = ( _originPath, callBack ) => {
    const originPath = removeDuplicatePoint(_originPath)
    const originPathlArrayLength = originPath.length
    // 分组纠偏 最大支持500个点/组, 点数量越大越容易报错
    const groupLength = 100
    const groupNum = Math.ceil(originPathlArrayLength / groupLength)
    let count = 0
    let beigin
    const newPathObject = {}
    for (let i = 0 ; i < groupNum ; i++ ){
      beigin = i * groupLength
      const end = (i+1) * groupLength > originPathlArrayLength ? originPathlArrayLength-1 : (i+1) * groupLength
      let beginTime
      const pendingArray = originPath.slice(beigin, end).map((item, index) => {
        if (index === 0) {
          beginTime = item.locatetime/1000
        }
        return {
          "x": parseFloat(item.longitude),
          "y": parseFloat(item.latitude),
          "sp": item.speed/10,
          "ag": item.direction,
          "tm": (index === 0) ? beginTime : item.locatetime/1000 - beginTime
        }
      })
      // eslint-disable-next-line no-loop-func
      window.AMap.plugin('AMap.GraspRoad', () => {
        const grasp = new window.AMap.GraspRoad();
        grasp.driving(pendingArray, (error, result)=>{
          count++
          if (!error){
            const { points } = result.data // 纠偏后的轨迹, 里程
            newPathObject[i]=points.map(item=>({ longitude: item.x, latitude: item.y }))
          } else {
            newPathObject[i]=pendingArray.map(item=>({ longitude: item.x, latitude: item.y }))
          }
          if (count === groupNum){
            const newPathArray = []
            for (let k = 0; k < groupNum; k++){
              newPathArray.push(...newPathObject[k])
            }
            isFunction(callBack) && callBack(newPathArray)
          }
        })
      })
    }
  }

  const removeDuplicatePoint = (locations) => {
    const objArrayToStrArray = (array)=>array.map(item=>JSON.stringify(item))
    const strArrayToObjArray = (array) => array.map(item=>JSON.parse(item))
    let _locations = JSON.parse(JSON.stringify(locations))
    _locations = locations.map(item=>{
      delete item.traceId
      delete item.locatetime
      return item
    })
    const strArray = objArrayToStrArray(_locations)
    const newStrArry = [...new Set(strArray)]
    const res = strArrayToObjArray(newStrArry)
    return res
  }

  const renderMap = () =>(
    <div style={{ width: '100%', height: '100%', }}>
      <div style={{ position: 'absolute', left: 0, right: 0, margin: '0 auto', zIndex: '100' }}>
        <div style={{ textAlign:'center', fontSize: '18px', fontWeight: 800 }}>本次运输里程：{distance / 1000}KM</div>
        <div style={{ textAlign:'center', fontWeight: 1000 }}>运输里程记录规则：从装车到签收的距离</div>
      </div>
      <Map amapkey={window.envConfig.mpaWebJsKey} zoom={14} events={mapEvents}>
        {locations.length && <Polyline style={{ strokeColor: '#1890FF' }} path={locations} events={polylineEvents} />}
        {markers.length && markers.map((marker) => {
          const icon = {
            [LOAD_POINT]: <img style={iconStyle} src={loadIcon} alt='' />,
            [ARRIVE_POINT]: <img style={iconStyle} src={arriveIcon} alt='' />,
            [RECEIPT_POINT]: <img style={iconStyle} src={receiptIcon} alt='' />,
            [DELIVERY_POINT]: <img style={iconStyle} src={deliveryIcon} alt='' />,
            [UNLOAD_POINT]: <img style={iconStyle} src={unloadIcon} alt='' />,
            [ACCEPT_POINT]: <img style={iconStyle} src={acceptIcon} alt='' />
          }[marker.pointType]
          return <Marker key={marker.pointType} position={marker} render={icon} />
        })}
        {nowLocation.length && nowLocation.map( item=>{
          const iconUrl = item.speed === 0?carWithP:car
          const icon = <img style={iconStyle} src={iconUrl} alt='' />
          return <Marker key={`${item.latitude}${item.longitude}`} offset={{ x:-20, y:-20 }} angle={item.direction} position={item} render={icon} />
        })}
        {markers.length && markers.map((marker)=> {
          if ([UNLOAD_POINT, DELIVERY_POINT].indexOf(marker.pointType) !== -1 && marker.isOpenFence ){
            return <Circle center={marker} radius={marker.radius} style={{ strokeColor:"#F33", strokeOpacity:1, strokeWeight:3, fillColor:"#ee2200", fillOpacity:0.35 }} />
          }
          return <></>
        })}
        {parkInfo.length && parkInfo.map((marker)=><Marker events={parkMarkerEvents} key='beginTime' position={marker} title={marker.parkTimeDescribe} offset={{ x:-20, y:-40 }} render={marker.icon || <img style={iconStyle} src={parkIcon} alt='' />} />)}
      </Map>
      <div style={{ width: '100px', position: 'absolute', right: '10px', bottom: '70px', border: '1px solid black' }}>
        <div style={{ height: '70px', lineHeight: '70px', textAlign:'center', borderBottom: '1px solid black', background: 'white', color: type==='zhongjiao'?'black':'#38ADFF' }} onClick={()=>{ setType('normal') }}>
        APP轨迹
        </div>
        <div style={{ height: '70px', textAlign:'center', background: 'white', color: type==='zhongjiao'?'#38ADFF':'black' }} onClick={()=>{ setType('zhongjiao') }}>
          <div style={{ width:0, height:'100%', display:'inline-block', verticalAlign: 'middle' }} />
          <div style={{ display:'inline-block', verticalAlign: 'middle' }}>
            <span style={{ display: 'block' }}>车辆轨迹</span>
            <span style={{ display: 'block' }}>(限时免费)</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNoDataTip = () => (
    <div style={{ height: '100px' }}>暂无轨迹数据</div>
  )

  const renderLoading = () => '加载中'

  if ( STATUS_NO_TRACK.indexOf(transportImmediateStatus)===-1){
    if (requestLocationReady){
      return renderMap()
    }
    return renderLoading()
  }

  return renderNoDataTip()

})
