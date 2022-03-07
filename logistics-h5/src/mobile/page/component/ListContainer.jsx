import React from 'react'
import { ListView, Toast, WhiteSpace, PullToRefresh, SearchBar, WingBlank } from 'antd-mobile'
import { isFunction } from 'util'

const Content = ({ children }) => (
  <div style={{ background: 'inherit', minHeight: '50px', position:'relative' }}>
    {children}
  </div>
)

export default function (ItemComponent) {
  return class List extends React.Component {

    constructor (props) {
      super(props)
      const dataSource = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2
      })

      this.state = {
        offset: props.offset || 0,
        limit: props.limit || 15,
        allDataLoaded: undefined,
        dataSource,
        items: [],
        count: 0,
        value:'',
        refreshing: false
      }
    }

    componentDidMount () {
      const { searchDefaultValue } = this.props
      this.setState({
        value:searchDefaultValue || ""
      }, ()=>{
        this.fetchData()
      })
    }

    // static getDerivedStateFromProps (props) {
    //   const dataSource = dataSource.cloneWithRows(props.dataSource)
    //   return { dataSource }
    // }

    loadMoreData = () => {
      const { allDataLoaded, value } = this.state
      if (allDataLoaded) return false
      this.fetchData(false, value)
    }

    refresh = () => {
      const { limit } = this.state
      const { afterRefresh } = this.props
      this.setState({
        offset: 0,
        limit,
        value:''
      }, () => {
        if (isFunction(afterRefresh)){
          afterRefresh()
        }
        this.fetchData(true)
      })

    }

    serarchData = (value) => {
      let searchKey = value
      const { formatSearchValue } = this.props
      if (isFunction(formatSearchValue)){
        searchKey = formatSearchValue(value)
      }
      this.setState({
        value:searchKey,
        offset: 0
      }, ()=>{
        this.fetchData(true)
      })

    }

    fetchData = (refresh) => {
      const { offset, limit, value } = this.state
      const { action, params, searchParams, keyName, dataCallBack, dealWithData, showSearchBar, SearchBarClearOther, searchDefaultValue } = this.props
      let mergedParams = { ...params, offset, limit }
      if (showSearchBar){
        if (value===searchDefaultValue){
          mergedParams = { ...params, ...searchParams, offset, limit }
        } else {
          mergedParams = { ...params, [keyName]:value, offset, limit }
        }
        if (SearchBarClearOther&&value===''){
          mergedParams = { ...params, [keyName]:value, offset, limit, ...SearchBarClearOther }
        }
      }

      Toast.loading('加载中...', 100)

      action(mergedParams)
        .then(({ items, count } = {}) => {
          Toast.hide()
          isFunction(dataCallBack) && dataCallBack({ items, count })
          const { dataSource, items: oldItems } = this.state
          const nextItems = refresh ? (items || []) : [...oldItems, ...(items || [])]
          const allDataLoaded = count <= nextItems.length
          allDataLoaded && Toast.show('已加载全部数据', 2, null, false)
          const _nextItems = isFunction(dealWithData)? dealWithData(nextItems) : nextItems
          this.setState({
            count,
            allDataLoaded,
            items: nextItems,
            offset: nextItems.length,
            dataSource: dataSource.cloneWithRows(_nextItems),
            refreshing: false
          })
        })
    }

    renderListViewItem = item => {
      const { primaryKey, itemProps, wingBlank = false } = this.props
      const { value } = this.state
      return (
        wingBlank ?
          <WingBlank>
            <ItemComponent key={item[primaryKey]} {...itemProps} item={item} refresh={this.refresh} keyword={value} />
          </WingBlank>
          :
          <ItemComponent key={item[primaryKey]} {...itemProps} item={item} refresh={this.refresh} keyword={value} params={this.props.params} />
      )
    }

    renderSeparator = (sectionID, rowID) => <WhiteSpace key={`${sectionID}-${rowID}`} />

    renderEmpty = () => {
      const { style = {}, className, showSearchBar=false, searchBarProps={} } = this.props
      return (
        <>
          { showSearchBar && <SearchBar {...searchBarProps} onSubmit={this.serarchData} showCancelButton cancelText='搜索' onCancel={this.serarchData} /> }
          <div className={className} style={{ padding: '30px', textAlign: 'center', color: '#aaa', ...style }}>暂无数据</div>
        </>
      )
    }


    onChange= (value) => {
      this.setState({ value });
    };


    render () {
      const { dataSource, limit, refreshing, value } = this.state
      const { useBodyScroll = false, whiteSpace = true, style = {}, showSearchBar=false, searchBarProps={}, className } = this.props
      const ListViewStyle = showSearchBar ?
        {
          overflowY: 'scroll',
          width: '100%',
          position: 'absolute',
          top: '50px',
          bottom: '0px',
          height: 'calc(100% - 93.5px) !important',
          ...style
          // height: 'auto'
        }
        :
        {
          height: 'calc(100% - 43.5px)',
          backgroundColor: '#f5f5f9',
          ...style
        }

      return (
        <>
          { showSearchBar && <SearchBar {...searchBarProps} value={value} onChange={this.onChange} onSubmit={this.serarchData} showCancelButton cancelText='搜索' onCancel={this.serarchData} /> }
          <ListView
            className={className}
            initialListSize={limit}
            onEndReachedThreshold={200}
            onEndReached={this.loadMoreData}
            dataSource={dataSource}
            useBodyScroll={useBodyScroll}
            pageSize={limit}
            style={{ ...ListViewStyle }}
            renderBodyComponent={() => <Content />}
            renderSeparator={whiteSpace ? this.renderSeparator : () => { }}
            renderRow={this.renderListViewItem}
            pullToRefresh={<PullToRefresh
              refreshing={refreshing}
              onRefresh={this.refresh}
            />}
          />
        </>
      )
    }
  }
}
