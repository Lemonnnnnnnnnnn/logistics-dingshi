import React from 'react'
import { Card, WingBlank, WhiteSpace, List } from 'antd-mobile'
import { isString, isArray } from '@/utils/utils'

export default Component => // type是提货点卸货点的展示形式，list为多提货点多条list形式，info为集中展示以逗号隔开,若type为info的话则需要contentType，contentType为内容风格
  class LeftWhiteSpaceList extends React.Component {

    renderDataSource = () => {
      const { dataSource = [] } = this.props
      const finalSource = isArray(dataSource) ? dataSource : [dataSource]

      return finalSource.map((item, index) => <Component key={index} item={item} />)
    }

    renderImg = () => {
      const { imgSrc } = this.props

      return isString(imgSrc)
        ? (
          <div style={{ flex: 1, overflow: 'hidden', borderRadius: '20px', width: '40px', height: '40px' }}>
            <img style={{ width: '100%', height: '100%' }} src={imgSrc} />
          </div>
        )
        : imgSrc
    }

    render() {
      return (
        <Card>
          <div style={{ display: 'flex' }}>
            {this.renderImg()}
            <div style={{ flex: 9 }}>
              {this.renderDataSource()}
            </div>
          </div>

        </Card>
      )
    }
  }


