import React, { useEffect, useState } from 'react'
import Amap, { Map, Polyline, Marker } from 'react-amap'
import { getTrackDentry, getTransportProcesses } from '@/services/apiService'
import loadIcon from '@/assets/map_icon_load.png'
import arriveIcon from '@/assets/map_icon_arrive.png'
import receiptIcon from '@/assets/map_icon_receipt.png'
import deliveryIcon from '@/assets/map_icon_delivery.png'
import unloadIcon from '@/assets/map_icon_unload.png'

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

const POINT_TYPE_NOT_MARKED = ACCEPT_POINT // 不需要打点的类型

export default function TrackMap ({ serviceId: sid, trackDentryid: trid, terminalId: tid, transportId }) {
  const [center, setCenter] = useState(defaultCenter)
  const [distance, setDistance] = useState(0)
  const [locations, setLocations] = useState([])
  const [markers, setMarkers] = useState([])

  useEffect(() => {
    transportId && getTransportProcesses(transportId)
      .then(({ items }) => {
        setMarkers(items.filter(item => item.pointType !== POINT_TYPE_NOT_MARKED))
      })
  }, [transportId])

  useEffect(() => {
    let locations = []
    if (sid && trid && tid) {
      getTrackDentry({ sid, trid, tid })
        .then((data) => {
          locations = data.points
          data.points.length && setCenter(data.points[0])
          setDistance(data.distance)
          setLocations(locations)
        })

    }
  }, [sid, trid, tid])
  return (locations.length||markers.length)
    ? (
      <div style={{ width: '100%', height: '600px' }}>
        <div>本次运输里程：{distance / 1000}KM</div>
        <br />
        <Map amapkey={window.envConfig.mapWebKey} zoom={14} center={center}>
          <Polyline style={{ strokeColor: '#1890FF' }} path={locations} />
          {markers.map((marker, index) => {
            const icon = {
              [LOAD_POINT]: <img style={iconStyle} src={loadIcon} />,
              [ARRIVE_POINT]: <img style={iconStyle} src={arriveIcon} />,
              [RECEIPT_POINT]: <img style={iconStyle} src={receiptIcon} />,
              [DELIVERY_POINT]: <img style={iconStyle} src={deliveryIcon} />,
              [UNLOAD_POINT]: <img style={iconStyle} src={unloadIcon} />
            }[marker.pointType]
            return <Marker key={index} position={marker} render={icon} />
          })}
        </Map>
      </div>
    )
    : <div style={{ height: '100px' }}>暂无轨迹数据</div>
}
