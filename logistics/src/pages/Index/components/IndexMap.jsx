import React, { Component } from 'react'
import { Map, Marker } from 'react-amap'
import CssModule from 'react-css-modules'
import { isEqual, isEmpty } from '@/utils/utils'
import MarkerIcon from '@/assets/map_icon_marker.png'
import MarkerErrorIcon from '@/assets/map_icon_error_marker.png'
import ArrowUpIcon from '@/assets/map_icon_arrow_up.png'
import ArrowUpErrorIcon from '@/assets/map_icon_arrow_up_error.png'
import ArrowUpSelectIcon from '@/assets/map_icon_arrow_up_select.png'
import styles from './IndexMap.css'

@CssModule(styles, { allowMultiple: true })
export default class IndexMap extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mapConfig: {
        zoom: 5,
        center: {
          longitude: 104.07,
          latitude: 30.67
        }
      },
      markerData: [] // 标记点数据
    }
    window.amapkey = window.envConfig.mpaWebJsKey
  }

  componentDidMount () {
    const { showMarkerList, selectKey = '' } = this.props
    this.loadMarker(showMarkerList, selectKey)
  }

  componentWillReceiveProps (nextProps) {
    if (!isEqual(this.props.showMarkerList, nextProps.showMarkerList) || !isEqual(this.props.selectKey, nextProps.selectKey)) {
      this.loadMarker(nextProps.showMarkerList, nextProps.selectKey)
    }
  }

  loadMarker = (data = [], selectKey = '') => {
    let key = ''
    if (selectKey) {
      [, key] = selectKey.split('-')
    }
    const markerData = data.map(item => ({
      ...item,
      isSelect: +key === +item.receivingId
    }))
    const { mapConfig, mapConfig: { center } } = this.state
    const _mapConfig = {
      ...mapConfig,
      center: isEmpty(data) ? center : data[0].position
    }
    this.setState({ markerData, mapConfig: _mapConfig })
  }

  render () {
    const { mapConfig, markerData } = this.state
    return (
      <div style={{ width: '100%', height: '500px' }}>
        <Map {...mapConfig}>
          {markerData.map(item => {
            const { position, receivingId, projectName, receivingName,
              preBookingTotal, isAvailable, isSelect } = item
            const content = isAvailable
              ? <div>
                <img src={MarkerIcon} alt='标记点' />
                <div styleName='markerBox'>
                  <img src={isSelect ? ArrowUpSelectIcon : ArrowUpIcon} alt='上箭头' />
                  <div styleName='markerTextBox' style={{ background: isSelect ? 'rgb(230, 238, 246)' : 'rgb(212, 233, 214)' }}>
                    <span styleName='markerProjectName' title={projectName}>{projectName}</span>
                    <span styleName='markerReceivingName' title={`${receivingName}(${preBookingTotal})`}>{receivingName}（{preBookingTotal}）</span>
                  </div>
                </div>
              </div>
              : <div>
                <img src={MarkerErrorIcon} alt='禁用标记点' />
                <div styleName='markerBox'>
                  <img src={isSelect ? ArrowUpSelectIcon : ArrowUpErrorIcon} alt='错误上箭头' />
                  <span styleName='markerDisabled'>禁</span>
                  <div styleName='markerTextBox' style={{ background: isSelect ? 'rgb(230, 238, 246)' : 'rgb(251, 212, 208)' }}>
                    <span styleName='markerProjectName' title={projectName}>{projectName}</span>
                    <span styleName='markerReceivingName' title={`${receivingName}(${preBookingTotal})`}>{receivingName}（{preBookingTotal}）</span>
                  </div>
                </div>
              </div>
            return (
              <Marker
                key={receivingId}
                title={`${projectName}${receivingName}(${preBookingTotal})`}
                position={position}
                render={content}
              />
            )
          })}
        </Map>
      </div>
    )
  }
}
