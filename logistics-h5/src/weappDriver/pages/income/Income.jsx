import React from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import { connect } from 'dva'
import router from 'umi/router'
import zhCN from 'antd-mobile/lib/date-picker/locale/zh_CN';
import zhCNCalendar from 'antd-mobile/lib/calendar/locale/zh_CN'
import { DatePicker, Button } from 'antd'
import { PullToRefresh, Toast, Calendar, DatePicker as MobileDatePicker, List, Modal, NoticeBar, Icon } from 'antd-mobile'
import styles from './income.less'
import { formatMoney, lodashDebounce } from '@/utils/utils'
import { getIncomeDetails, getIncomeDetailsTotal, getUsefulCarList, getWithdrawalTotal, getNowUser } from '@/services/apiService'
import Card from './component/Card'

const { alert } = Modal

function mapStateToProps (state) {
  return {
    nowUser: state.user.nowUser
  }
}

function mapDispatchToProps (dispatch) {
  return {
    getNowUser: () => dispatch({ type: 'user/getNowUser' })
  }
}

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Income extends React.Component{
  state = {
    total: 0.00,
    _total: 0.00,
    ready: false,
    refreshing: false,
    down: true,
    height: document.documentElement.clientHeight,
    dataList: [],
    count: 0,
    pickStartTime: undefined,
    pickEndTime: undefined,
    today: undefined,
    show: false,
    title: '今日',
  }

  dateIndex = 1

  filter = {
    limit: 10,
    nowPage: 1,
    offset: 0
  }

  ptr = React.createRef()

  data = [
    {
      key: 1,
      text: '今日',
      createDateStart: moment(new Date()).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
    }, {
      key: 2,
      text: '近1周',
      createDateStart: moment(new Date()).subtract(7, 'days').startOf('day').format('YYYY/MM/DD HH:mm:ss'),
    }, {
      key: 3,
      text: '近1月',
      createDateStart: moment(new Date()).subtract(1, 'months').startOf('day').format('YYYY/MM/DD HH:mm:ss'),
    }, {
      key: 4,
      text: '近3月',
      createDateStart: moment(new Date()).subtract(3, 'months').startOf('day').format('YYYY/MM/DD HH:mm:ss'),
    }, {
      key: 5,
      text: '近6月',
      createDateStart: moment(new Date()).subtract(6, 'months').startOf('day').format('YYYY/MM/DD HH:mm:ss'),
    }
  ]

  createDateEnd = moment(new Date()).endOf('day').format('YYYY/MM/DD HH:mm:ss')

  constructor (props) {
    super(props)
    this.listRef = React.createRef()
    this._turnPage = lodashDebounce(this.turnPage, 300)
  }

  componentDidMount () {
    Toast.loading('正在加载中...', 0)
    const createDateStart = this.createDateStart = moment(new Date()).startOf('day').format('YYYY/MM/DD HH:mm:ss')
    const createDateEnd = this.createDateEnd = moment(new Date()).endOf('day').format('YYYY/MM/DD HH:mm:ss')
    const { getNowUser } = this.props
    Promise.all([getIncomeDetails({ ...this.filter, createDateStart, createDateEnd, transactionType : 4 }), getIncomeDetailsTotal({ transactionType : 4 }), getIncomeDetailsTotal({ createDateStart, createDateEnd, transactionType : 4 }), getNowUser(), getUsefulCarList(), getWithdrawalTotal()]).then((res) => {
      const { auditStatus, perfectStatus, bankAccountItems = [] } = res[3]
      if (auditStatus !== 1 || perfectStatus !== 1 || bankAccountItems.length === 0) this.showTitle = true
      if (res[4] && res[4].length > 0) this.showTitle = true
      const { dataList } = this.state
      this.setState({
        dataList: [...dataList, ...res[0].items],
        hadWithdrawal: res[5] && res[5].toFixed(2) || 0,
        notWithdrawal: (res[1] - res[5]).toFixed(2),
        total: res[1].toFixed(2),
        _total: res[2],
        ready: true,
        count: res[0].count
      }, () => {
        this.toastHide()
      })
    })
  }

  toastHide = () => {
    setTimeout(() => {
      Toast.hide()
    }, 300);
  }

  searchButton = () => (
    <ul styleName='search_ul'>
      {this.data.map(item => (
        <li key={item.key} starttime={item.createDateStart} dateindex={item.key} onClick={this.searchDetail} styleName='search_li'>{item.text}</li>
      ))}
    </ul>
  )

  searchDetail = (e) => {
    this.setState({
      today: undefined,
      pickStartTime: undefined,
      pickEndTime: undefined,
    })
    this.dateIndex = Number(e.currentTarget.getAttribute('dateindex'))
    this.setState({
      title: this.data.find(item => item.key === this.dateIndex).text
    })
    const createDateStart = this.createDateStart = e.currentTarget.getAttribute('starttime')
    this.getFreshData(createDateStart)
  }

  getFreshData = (createDateStart, createDateEnd) => {
    Toast.loading('正在加载中...', 0)
    this.filter = {
      nowPage: 1,
      limit: 10,
      offset: 0
    }
    this.createDateEnd = createDateEnd || moment(new Date()).endOf('day').format('YYYY/MM/DD HH:mm:ss')
    Promise.all([
      getIncomeDetailsTotal({
        createDateStart,
        createDateEnd: this.createDateEnd,
        transactionType : 4
      }),
      getIncomeDetails({
        ...this.filter,
        createDateStart,
        createDateEnd: this.createDateEnd,
        transactionType : 4
      })])
      .then(res => {
        this.setState({
          _total: res[0],
          count: res[1].count,
          dataList: res[1].items
        }, () => {
          this.toastHide()
        })
      })
  }

  turnPage = () => {
    const { count } = this.state
    if (Number(count) !== 0 && this.filter.nowPage * this.filter.limit < count) {
      const { createDateStart } = this
      const { createDateEnd } = this
      this.filter = {
        nowPage: this.filter.nowPage + 1,
        offset: this.filter.offset + this.filter.limit,
        limit: 10
      }
      Promise.all([getIncomeDetailsTotal({ createDateStart, createDateEnd, transactionType : 4 }), getIncomeDetails({ ...this.filter, createDateStart, createDateEnd, transactionType : 4 })]).then(res => {
        const { dataList } = this.state
        this.setState({
          _total: res[0],
          count: res[1].count,
          dataList: [...dataList, ...res[1].items]
        }, () => {
          this.toastHide()
        })
      })
    }
  }

  renderList = () => {
    const { dataList } = this.state
    return (
      <>
        {dataList.map(item => (
          <Card key={item.transactionId} item={item} />
        ))}
      </>
    )
  }

  showCalendar = () => {
    this.setState({
      show:true
    })
  }

  cancelCalendar = () => {
    this.setState({
      show:false
    })
  }

  checkData = (start, end) => {
    const pickStartTime = moment(start).startOf('day')
    const pickEndTime = moment(end).endOf('day')
    this.createDateStart = pickStartTime.format('YYYY/MM/DD HH:mm:ss')
    this.dateIndex = 6
    this.setState({
      today: undefined,
      title: `${moment(start).format('MM/DD')}-${moment(end).format('MM/DD')}`,
      pickStartTime,
      pickEndTime,
      show:false
    })
    this.getFreshData(pickStartTime.format('YYYY/MM/DD HH:mm:ss'), pickEndTime.format('YYYY/MM/DD HH:mm:ss'))
  }

  pickDate = (date) => {
    this.setState({
      today: date,
      title: moment(date).format('MM月DD日'),
      pickStartTime: undefined,
      pickEndTime: undefined
    })
    this.dateIndex = 7
    const createDateStart = this.createDateStart = moment(date).startOf('day').format('YYYY/MM/DD HH:mm:ss')
    this.createDateEnd = moment(date).endOf('day').format('YYYY/MM/DD HH:mm:ss')
    this.getFreshData(createDateStart, this.createDateEnd)
  }

  toWithdraw = async () => {
    router.push('income/withdrawalRecords')
  }

  alert () {
    alert(<h3 style={{ color: 'rgba(34, 34, 34, 1)', fontSize: '20px', fontWeight: 'bold' }}>提现资格认证</h3>, <p style={{ color: 'rgba(153, 153, 153, 1)', fontSize: '14px', marginBottom: '5px' }}>为了您的合法权益，请完善认证信息</p>, [
      { text: '稍后认证' },
      {
        text: '去认证',
        onPress: () => router.push('income/withdrawalQualification')
      },
    ])
  }

  render () {
    const { total, _total, count, ready, pickStartTime, pickEndTime, show, today, title, hadWithdrawal, notWithdrawal } = this.state
    const now = new Date()
    return (
      ready
      &&
      <>
        {
          this.showTitle?
            <NoticeBar icon={<Icon type="exclamation-circle" />} styleName='abc'>
              <span>未满足提现资格，请</span><span styleName='tips' onClick={() => { router.push('income/withdrawalQualification') }}>完善资料</span>
            </NoticeBar>
            :
            null
        }
        <PullToRefresh
          damping={60}
          ref={el => this.ptr = el}
          style={{
            height: this.state.height,
            overflow: 'auto',
          }}
          indicator={this.state.down ? {} : { deactivate: '上拉可以刷新' }}
          direction={this.state.down ? 'down' : 'up'}
          refreshing={this.state.refreshing}
          onRefresh={() => {
            this.setState({ refreshing: true })
            Toast.loading('正在加载中...', 0)
            const { createDateStart } = this
            const { createDateEnd } = this
            this.filter = {
              nowPage: 1,
              offset: 0,
              limit: 10
            }
            Promise.all([getIncomeDetails({ ...this.filter, createDateStart, createDateEnd, transactionType : 4 }), getIncomeDetailsTotal({ transactionType : 4 }), getIncomeDetailsTotal({ transactionType : 4, createDateStart, createDateEnd }), getNowUser(), getUsefulCarList(), getWithdrawalTotal()]).then(res => {
              const { auditStatus, perfectStatus, bankAccountItems = [] } = res[3]
              this.showTitle = (auditStatus !== 1 || perfectStatus !== 1 || bankAccountItems.length === 0) || (res[4] && res[4].length > 0)
              this.setState({
                hadWithdrawal: res[5] && res[5].toFixed(2) || 0,
                notWithdrawal: (res[1] - res[5]).toFixed(2),
                total: res[1].toFixed(2),
                _total: res[2],
                count: res[0].count,
                dataList: res[0].items || []
              }, () => {
                setTimeout(() => {
                  Toast.hide()
                  this.setState({ refreshing: false })
                }, 300)
              })
            })
          }}
        >
          <div styleName='bg_white'>
            <div>
              <div styleName='sum_money'>
                <p styleName='money_des'>总收益</p>
                <p styleName='money'>￥{formatMoney(total.toFixed(2)._toFixed(2))}</p>
                <span styleName='right-btn' onClick={this.toWithdraw}>提现记录</span>
              </div>
              <div styleName='money_container'>
                <div>
                  <span>可提现</span>
                  <span>￥{notWithdrawal && notWithdrawal._toFixed(2) || 0}</span>
                </div>
                <div>|</div>
                <div>
                  <span>已提现</span>
                  <span>￥{hadWithdrawal && hadWithdrawal._toFixed(2) || 0}</span>
                </div>
              </div>
            </div>
            <div styleName='searchBox'>
              <h3>收益流水</h3>
              {this.searchButton()}
              <DatePicker.RangePicker style={{ width: '210px' }} value={[pickStartTime, pickEndTime]} onOpenChange={this.showCalendar} open={false} />
              <div className='weapp_driver_income_date'>
                <MobileDatePicker
                  locale={zhCN}
                  value={today}
                  extra='选择日期'
                  title='选择日期'
                  mode="date"
                  format={(date)=> moment(date).format('MM月DD日')}
                  onChange={this.pickDate}
                >
                  <List.Item arrow="horizontal">Date</List.Item>
                </MobileDatePicker>
              </div>
            </div>
            <div styleName='money_circle'>
              ￥{formatMoney(_total.toFixed(2)._toFixed(2))}
              <span styleName='tips_text'>{title}流水</span>
            </div>
            <div styleName='detail_box'>
              <div styleName='detail_title'>
                <h3>流水明细</h3>
                <span>共{count}单</span>
              </div>
              {this.renderList()}
              {Number(count) === 0? <p styleName='none'>暂无流水明细</p>: null}
              {Number(count) !== 0 && this.filter.nowPage * this.filter.limit < count? <div styleName='more_btn'><Button onClick={this._turnPage} size='small'>查看更多</Button></div>: null}
              {Number(count) > 0 && this.filter.nowPage * this.filter.limit >= count? <p styleName='no_more'>暂无更多</p>: null}
            </div>
          </div>
        </PullToRefresh>
        <Calendar
          locale={zhCNCalendar}
          onCancel={this.cancelCalendar}
          onConfirm={this.checkData}
          showShortcut
          visible={show}
          minDate={new Date(+now - 5184000000)}
          maxDate={new Date(now)}
        />
      </>
    )
  }
}
