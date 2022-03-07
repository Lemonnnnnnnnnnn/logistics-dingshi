import React, { useEffect, useState } from 'react'
import { Map, Polyline, Marker, Circle } from 'react-amap'
import { Toast } from 'antd-mobile'
import moment from 'moment'
import { getTrackDentry, getTransportProcesses, getZhongJiaoTrace } from '@/services/apiService'
import { TRANSPORT_ENVENT_STATUS } from '@/constants/project/project'
import loadIcon from '@/assets/map_icon_load.png'
import arriveIcon from '@/assets/map_icon_arrive.png'
import receiptIcon from '@/assets/map_icon_receipt.png'
import deliveryIcon from '@/assets/map_icon_delivery.png'
import unloadIcon from '@/assets/map_icon_unload.png'
import acceptIcon from '@/assets/map_icon_accept.png'
import carWithP from '@/assets/carWithP.svg'
import car from '@/assets/car.svg'
import parkIcon from '@/assets/map_icon_park.svg'
import { isFunction, pick, sortBy } from '@/utils/utils'
import TRANSPORTIMMEDIATESTATUS from '@/constants/transport/transportImmediateStatus'

const iconStyle = { width: '40px', height: '40px' }

// 1:接受的 2:装货点 3:到站点 4:签收点 5. 提货点 6.卸货点 7.停车点
const ACCEPT_POINT = 1
const LOAD_POINT = 2
const ARRIVE_POINT = 3
const RECEIPT_POINT = 4
const DELIVERY_POINT = 5
const UNLOAD_POINT = 6
const NOW_POINT = 7
const PARK_POINT = 8
const STATUS_NO_TRACK = [TRANSPORTIMMEDIATESTATUS.UNTREATED, TRANSPORTIMMEDIATESTATUS.CANCEL, TRANSPORTIMMEDIATESTATUS.DRIVER_REFUSE] // 不显示轨迹的几种状态
// const POINT_TYPE_NOT_MARKED = ACCEPT_POINT // 不需要打点的类型

export default function TrackMap ({ serviceId: sid, completedTime, receivingTime, trackDentryid: trid, terminalId: tid, transportId, eventItems=[], type='normal', deliveryItems=[], signItems=[], transportImmediateStatus, plateNumber }) {
  const delivery = deliveryItems[0] || {}
  const receiving = signItems[0] || {}
  window.amapkey = window.envConfig.mapWebKey
  const [distance, setDistance] = useState(0)
  const [locations, setLocations] = useState([])
  const [nowLocation, setNowLocation] = useState([])
  const [markers, setMarkers] = useState([])
  const [parkInfo, setParkInfo] = useState([])
  // const [hasFormatLocations, setHasFormatLocations] = useState(false)
  const startDate = eventItems.find(item => item.eventStatus === TRANSPORT_ENVENT_STATUS.CAR_LOADING)?.createTime
  // const endDate = eventItems.find(item => item.eventStatus === TRANSPORT_ENVENT_STATUS.SIGNED)?.createTime
  const endDate = eventItems.find(item => item.eventStatus === TRANSPORT_ENVENT_STATUS.SIGNED)?.createTime ||
    receivingTime || completedTime ||
    eventItems.find(item => item.eventStatus === TRANSPORT_ENVENT_STATUS.ARRIVE)?.createTime || moment();
  const getAllMarkers = (transportId) =>{
    if (!transportId) return Promise.resolve()
    return getTransportProcesses(transportId)
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
        const usefulItems = items.filter(item=> item.longitude && item.latitude && item.latitude < 90 )
        usefulItems.forEach(item => {
          item.createTime = item.createTime? moment(item.createTime).format('YYYY.MM.DD HH:mm:ss') : null
        })
        setMarkers(usefulItems)
        return usefulItems.filter(item => item.createTime)
      })
  }

  useEffect(() => {
    getAllMarkers(transportId)
      .then((markers)=>{
        if (!markers) return
        let locations = []
        if (sid && trid && tid && type==='normal') {
          const starttime = startDate
          const endtime= endDate
          const params = { sid, trid, tid, starttime, endtime, params }
          _getTrackDentry(params)
            .then((data) => {
              locations = data.points
              if (data.points.length){
                const lastPoint = locations[locations.length-1]
                const firstPoint = locations[0]
                const { locatetime:firstTime } = firstPoint
                const { latitude, longitude, direction, speed, locatetime:lastTime } = lastPoint
                // 补充第一个轨迹点之前的操作点
                const beforeFirst = sortBy(markers.filter(item => {
                  const time = new Date(item.createTime).getTime()
                  return time < firstTime
                }), item=> new Date(item.createTime).getTime())
                const afterLast = sortBy(markers.filter(item => {
                  const time = new Date(item.createTime).getTime()
                  return time > lastTime
                }), item=> new Date(item.createTime).getTime())
                locations = [...beforeFirst, ...locations, ...afterLast]
                setNowLocation([{ pointType:7, latitude, longitude, direction, speed }])
                setLocations(locations)
              } else {
                const all = sortBy(markers, item=> new Date(item.createTime).getTime())
                setLocations(all)
              }
              setDistance(data.distance)
            })
        } else if (plateNumber && startDate && type==='zhongjiao'){
          // getZhongJiaoTrace({ startDate:'2020/01/07 00:00:00', endDate:'2020/01/07 23:59:59', carNo:'川F98802' })
          getZhongJiaoTrace({ startDate:moment(startDate).format('YYYY/MM/DD HH:mm:ss'), endDate:moment(endDate).format('YYYY/MM/DD HH:mm:ss'), carNo: plateNumber, transportId })
            .then((data) => {
              if (!data) return
              if (data.points !== null){
                locations = data.points
                GraspRoad( locations, (newLocations)=>{
                  const lastPoint = newLocations[newLocations.length-1]
                  const { latitude, longitude, direction, speed } = lastPoint
                  setNowLocation([{ pointType:7, latitude, longitude, direction, speed }])
                  setLocations(newLocations)
                  setDistance(data.distance)
                })
                if (data.parkInfo !== null){
                  setParkInfo(data.parkInfo)
                }
              }
            })
        }
      })
  }, [sid, trid, tid, type])

  const _getTrackDentry = (params) =>{
    const { starttime, endtime } = params
    const restRequest = new Array(Math.ceil(moment(endtime).diff(moment(starttime), 'day', true))).fill(0)
      .map((item, index, array)=> getTrackDentry({
        ...params,
        starttime:moment(starttime).add(index, 'days').valueOf(),
        endtime:array.length>index+1? moment(starttime).add(index+1, 'days') : moment(endtime).valueOf()
      }))
    return Promise.all(restRequest)
      .then(responce => {
        const data = responce.reduce((final, current)=>({
          distance:final.distance + (current.distance || 0),
          points:[...final.points, ...current.points]
        }), { distance:0, points:[] })
        return data
      })
  }

  useEffect(()=>{
    setLocations([])
    setParkInfo([])
    setNowLocation([])
    // setRequestLocationReady(false)
  }, [type]) // 切换类型轨迹来源初始化各参数

  const mapEvents = {
    created: (el)=>{
      setTimeout(()=>{
        el && el.setFitView()
      }, 1000)
    }
  }

  // const polylineEvents = {
  //   created: ()=>{
  //     setTimeout(()=>{
  //       AMap && AMap.setFitView()
  //     }, 500)
  //   }
  // }

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
      const end = (i+1) * groupLength > originPathlArrayLength ? originPathlArrayLength : (i+1) * groupLength
      let tm
      const pendingArray = originPath.slice(beigin, end).map((item, index) => {
        if (index === 0) {
          tm = 30
        }
        tm += 30
        return {
          "x": parseFloat(item.longitude),
          "y": parseFloat(item.latitude),
          "sp": item.speed/10,
          "ag": item.direction,
          "tm": tm
        }
      })
      if (window.AMap){
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
      isFunction(callBack) && callBack(_originPath)
    }
  }

  /*
    @param {array} locations 原轨迹点数组
    @returns {array} 去重后的轨迹点数组（traceId，locatetime不为去重条件）
  */
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

  const formatTime = (time) => moment(time).format('YYYY.MM.DD HH:mm:ss')

  const renderMap = () => (
    <div style={{ width: '100%', height: '300px' }}>
      <div>本次运输里程：{distance / 1000}KM</div>
      <br />
      <Map amapkey={window.envConfig.mpaWebJsKey} events={mapEvents}>
        {(locations.length || false) && <Polyline style={{ strokeColor: '#1890FF', strokeWeight: 6, showDir:true }} path={locations} />}
        {(markers.length || false) && markers.map((marker) => {
          const icon = {
            [LOAD_POINT]: <img style={iconStyle} src={loadIcon} alt='' />,
            [ARRIVE_POINT]: <img style={iconStyle} src={arriveIcon} alt='' />,
            [RECEIPT_POINT]: <img style={iconStyle} src={receiptIcon} alt='' />,
            [DELIVERY_POINT]: <img style={iconStyle} src={deliveryIcon} alt='' />,
            [UNLOAD_POINT]: <img style={iconStyle} src={unloadIcon} alt='' />,
            [ACCEPT_POINT]: <img style={iconStyle} src={acceptIcon} alt='' />
          }[marker.pointType]
          return <Marker key={`${marker.pointType}${marker.latitude}${marker.longitude}`} title={marker.createTime} position={pick(marker, ['latitude', 'longitude'])} render={icon} offset={{ x:-20, y:-40 }} />
        })}
        {(nowLocation.length || false) && nowLocation.map( item=>{
          const iconUrl = item.speed === 0?carWithP:car
          const icon = <img style={iconStyle} src={iconUrl} alt='' />
          return <Marker key={`${item.latitude}${item.longitude}`} offset={{ x:-20, y:-20 }} angle={item.direction} position={item} render={icon} />
        })}
        {(markers.length || false) && markers.map((marker)=> {
          if ([UNLOAD_POINT, DELIVERY_POINT].indexOf(marker.pointType) !== -1 && marker.isOpenFence ){
            return <Circle key={`${marker.pointType}${marker.latitude}${marker.longitude}`} center={marker} radius={marker.radius} style={{ strokeColor:"#aedbf9", strokeOpacity:1, strokeWeight:3, fillColor:"#aedbf9", fillOpacity:0.35 }} />
          }
          return <></>
        })}
        {(parkInfo.length || false)
          &&
          parkInfo.map((marker) => <Marker
            key={`${marker.latitude}${marker.longitude}`}
            position={marker}
            render={<img style={iconStyle} src={parkIcon} alt='' />}
            offset={{ x:-20, y:-40 }}
            events={{
              click: () => {
                Toast.info(`${formatTime(marker.beginTime)} ~ ${formatTime(marker.endTime)} 停车时间：${marker.parkTimeDescribe}`, 5, null, false)
              }
            }}
          />
          )
        }
      </Map>
    </div>
  )

  // const renderLoading = () => <div style={{ height: '100px' }}>加载中...</div>

  const renderNoDataTip = () => <div style={{ height: '100px' }}>暂无轨迹数据</div>
  // if(requestLocationReady){
  //   if ( STATUS_NO_TRACK.indexOf(transportImmediateStatus)===-1){
  //     return (markers.length || locations.length) ?
  //       renderMap()
  //       :
  //       renderLoading()
  //   }else{
  //     return renderNoDataTip()
  //   }
  // }
  // return renderLoading()

  if ( STATUS_NO_TRACK.indexOf(transportImmediateStatus)===-1){
    return renderMap()
  }
  return renderNoDataTip()
}
