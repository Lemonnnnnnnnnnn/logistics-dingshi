import React from 'react'
import { PullToRefresh, ListView } from 'antd-mobile';
import moment from 'moment'
import CSSModules from 'react-css-modules'
import { getFinanceCashOuts, getFinanceCashOutsMonth } from '@/services/apiService'
import Item from './Item'
import styles from './WithdrawalRecords.less'

@CSSModules(styles, { allowMultiple: true })
export default class Index extends React.Component{
  filter = {
    offset: 0,
    limit: 15
  }

  state = {
    refreshing: false,
    ready: false
  }

  oldItems = []

  checkMonth = (arr) => {
    arr = JSON.parse(JSON.stringify(arr))
    const _arr = arr.reduce((total, current, index) => {
      if (moment(current.createTime).format('YYYY年MM月') !== this.titleDate) {
        this.titleDate = moment(current.createTime).format('YYYY年MM月')
        const money = this.monthData.find(item => item.dates === this.titleDate).totalMoney
        if (index === 0) {
          return [{ isDate: true, date: this.titleDate, money }, current]
        }
        return [...total, { isDate: true, date: this.titleDate, money }, current]
      }
      return [...total, current]
    }, [])
    return _arr
  }

  componentDidMount () {
    Promise.all([getFinanceCashOutsMonth({ cashOutStatus: 1, limit: 10000, offset: 0 }), getFinanceCashOuts(this.filter)]).then(res => {
      const { offset, limit } = this.filter
      this.filter = {
        offset: offset + limit,
        limit: 15
      }
      this.monthData = res[0].items
      this.count = res[1].count
      const dataSource = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      })
      this.oldItems = this.checkMonth(res[1].items)
      this.setState({
        lists: dataSource.cloneWithRows(this.oldItems),
        ready: true
      })
    })
  }

  onEndReached = () => {
    if (this.filter.offset >= this.count) return
    getFinanceCashOuts(this.filter).then(data => {
      const { offset, limit } = this.filter
      this.filter = {
        offset: offset + limit,
        limit: 15
      }
      const dataSource = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      })
      this.oldItems = [...this.oldItems, ...this.checkMonth(data.items)]
      this.setState({
        lists: dataSource.cloneWithRows(this.oldItems),
      })
    })
  }

  onRefresh = () => {
    this.setState({
      refreshing: true
    })
    this.titleDate = ''
    Promise.all([getFinanceCashOutsMonth(), getFinanceCashOuts({ limit: 15, offset: 0 })]).then(res => {
      const { offset, limit } = this.filter
      this.filter = {
        offset: offset + limit,
        limit: 15
      }
      this.monthData = res[0].items
      const dataSource = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      })
      this.oldItems = this.checkMonth(res[1].items)
      this.setState({
        lists: dataSource.cloneWithRows(this.oldItems),
        ready: true,
        refreshing: false
      })
    })
  }

  renderListViewItem = item => {
    const { primaryKey = 'cashOutId', itemProps } = this.props
    return (
      <Item key={item[primaryKey]} {...itemProps} item={item} refresh={this.refresh} />
    )
  }

  renderSeparator = (sectionID, rowID) => <div key={`${sectionID}-${rowID}`} style={{ width: '100%', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }} />

  render () {
    const { lists, refreshing, ready } = this.state
    console.log(this.count)
    return (
      ready
      &&
      this.count === 0 || !this.count?
        <div styleName='noData'>暂无数据</div>
        :
        <div>
          <ListView
            key='1'
            ref={el => this.lv = el}
            dataSource={lists}
            renderRow={this.renderListViewItem}
            renderSeparator={this.renderSeparator}
            useBodyScroll={false}
            style={{
              height: '100vh',
              border: '1px solid #ddd',
            }}
            pullToRefresh={<PullToRefresh
              refreshing={refreshing}
              onRefresh={this.onRefresh}
            />}
            onEndReached={this.onEndReached}
            onEndReachedThreshold={200}
          />
        </div>
    )
  }
}
