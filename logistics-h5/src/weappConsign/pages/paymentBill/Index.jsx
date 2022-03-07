import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Picker, List } from 'antd-mobile'
import { connect } from 'dva'
import styles from './Index.less'
import Detail from './components/Item'
import noTransports from '@/assets/driver/noTransports.png'
import model from '@/models/order'
import { getProjectList } from '@/services/apiService'
import ListContainer from '@/mobile/page/component/ListContainer'
import { getAuthority } from '@/utils/authority'
import auth from '@/constants/authCodes'

const { actions: { getOrders } } = model

const Lists = ListContainer(Detail)

@connect(null, { getOrders })
@CSSModules(styles, { allowMultiple: true })
export default class Index extends Component{
  state = {
    refresh: false,
    ready: false,
    selectedName: ''
  }

  componentDidMount () {
    const { ACCOUNT } = auth
    const ownedPermissions = getAuthority()
    const spacialAuthes = [ACCOUNT]  // 能够查看全部项目预约单运单的权限
    const check = spacialAuthes.some(auth => ownedPermissions.indexOf(auth) > -1)
    getProjectList({ limit: 1000, offset: 0, order: 'desc', isExistOrder: true, isPermissonSelectAll:check||undefined }).then(data => {
      // ES6根据一维对象数组某个属性去重且该属性的值为简单数据类型，比较实用的一种的方法，也基本没有什么性能影响
      this.unique = (arr, key) => {
        const map = new Map()
        return arr.filter((item) => !map.has(`${item[key] }`) && map.set(`${item[key] }`, 1))
      }
      const options = data.items && data.items.map(item => ({ key: item.projectId, label: item.projectName, value: item.projectName })) || []
      this.options = this.unique(options, 'label')
      this.setState({
        ready: true
      })
    })
  }

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

  changeProject = value => {
    const selectedName = value[0]
    this.setState({
      selectedName
    })
  }

  renderList = () => {
    const { count, selectedName } = this.state
    const props = {
      action: this.props.getOrders,
      dataCallBack: this.dataCallBack,
      primaryKey: 'orderId',
      params: {
        createMode: 1,
        projectName: selectedName
      },
      style:{
        display: !count || count === 0? 'none': 'block',
        height:'calc(100vh - 44px)',
        width: '100%',
        padding: '15px 0'
      },
    }
    return <Lists key={selectedName} ref={this.listRef} {...props} />
  }

  render () {
    const { ready, count } = this.state
    return (
      ready
      &&
      <>
        <Picker
          data={this.options}
          title="选择项目"
          cols={1}
          extra="请选择项目"
          value={[this.state.selectedName]}
          onOk={this.changeProject}
        >
          <List.Item arrow="horizontal">选择项目</List.Item>
        </Picker>
        {
          count !== 0?
            null
            :
            <div styleName='noData'>
              <img src={noTransports} alt="图片加载失败" />
              <h3>暂无数据</h3>
            </div>
        }
        {this.renderList()}
      </>
    )
  }
}
