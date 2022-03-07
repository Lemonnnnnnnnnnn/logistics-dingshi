import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { connect } from 'dva'
import styles from './history.less'
import model from '@/models/transports'
import Detail from './component/DetailItem'
import noTransports from '@/assets/driver/noTransports.png'
import ListContainer from '@/mobile/page/component/ListContainer'

const { actions: { getTransports } } = model

const List = ListContainer(Detail)

@connect(null, { getTransports })
@CSSModules(styles, { allowMultiple: true })
export default class History extends Component{
  state = {
    status: '4,11,16',
    refresh: false
  }

  changeStatus = (e) => {
    const status = e.currentTarget.getAttribute('status')
    this.setState({
      status
    }, () => {
      this.listRef.current.refresh()
    })
  }

  listRef = React.createRef()

  dataCallBack = (data = {}) => {
    const { refresh } = this.state
    this.setState({
      count: data.count
    })
    if (refresh) {
      this.setState({
        refresh:false,
        count: data.count
      })
    }
  }

  renderList = () => {
    const { status, count } = this.state
    const props = {
      action: this.props.getTransports,
      dataCallBack: this.dataCallBack,
      primaryKey: 'transportId',
      params: {
        transportImmediateStatus: status
      },
      style:{
        display: !count || count === 0? 'none': 'block',
        height:'calc(100vh - 44px)',
        width: '100%',
        padding: '15px 0'
      },
    }
    return <List ref={this.listRef} {...props} />
  }

  render () {
    const { status, count } = this.state
    return (
      <>
        <div styleName='tab_header'>
          <ul>
            <li status='4,11,16' styleName={status === '4,11,16'? 'active': ''} onClick={this.changeStatus}>已完成</li>
            <li status='3' styleName={status === '3'? 'active': ''} onClick={this.changeStatus}>已取消</li>
          </ul>
        </div>
        {count === 0?
          <div styleName='noData'>
            <img src={noTransports} alt="图片加载失败" />
            <h3>暂无数据</h3>
            <h4>快去接单吧</h4>
          </div>
          :
          null
        }
        {this.renderList()}
      </>
    )
  }
}