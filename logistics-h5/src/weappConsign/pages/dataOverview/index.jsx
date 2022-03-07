import React from 'react'
import { Picker, List, Flex, Calendar, Toast, Button } from 'antd-mobile'
import moment from 'moment'
import { DatePicker } from 'antd'
import CSSModules from 'react-css-modules'
import zhCN from 'antd-mobile/lib/calendar/locale/zh_CN'
import { Chart, Axis, Geom, Tooltip, Legend, Guide } from 'bizgoblin'
import { getProjectList, getDataOverview, getArrayTransportAmount } from '@/services/apiService'
import { formatMoney, lodashDebounce } from '@/utils/utils'
import { getAuthority } from '@/utils/authority'
import auth from '@/constants/authCodes'
import styles from './index.less'

const { Item } = Flex

@CSSModules(styles, { allowMultiple: true })
export default class Index extends React.Component{
  state = {
    ready: false,
    projectId: '',
    show: false,
    pickStartTime: undefined,
    pickEndTime: undefined,
    selectedKey: 1,
    filter: {
      nowPage: 1,
      limit: 15
    }
  }

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

  constructor (props) {
    super(props)
    this._turnPage = lodashDebounce(this.turnPage, 300)
  }

  searchButton = () => {
    const { selectedKey } = this.state
    return (
      <ul styleName='search_ul'>
        {this.data.map(item => (
          <li key={item.key} starttime={item.createDateStart} dateindex={item.key} onClick={this.searchReportForms} styleName={selectedKey === item.key? 'search_li active': 'search_li'}>{item.text}</li>
        ))}
      </ul>
    )
  }

  turnPage = () => {
    const { filter: { nowPage, limit } } = this.state
    this.setState({
      filter: {
        nowPage: nowPage + 1,
        limit
      }
    })
  }

  searchReportForms = e => {
    const selectedKey = Number(e.currentTarget.getAttribute('dateindex'))
    this.setState({
      selectedKey,
      pickStartTime: undefined,
      pickEndTime: undefined,
    })
    const createDateStart = e.currentTarget.getAttribute('starttime')
    this.getFreshData(createDateStart)
  }

  checkData = (start, end) => {
    const pickStartTime = moment(start).startOf('day')
    const pickEndTime = moment(end).endOf('day')
    pickStartTime.format('YYYY/MM/DD HH:mm:ss')
    this.dateIndex = 6
    this.setState({
      selectedKey: undefined,
      pickStartTime,
      pickEndTime,
      show:false
    })
    this.getFreshData(pickStartTime.format('YYYY/MM/DD HH:mm:ss'), pickEndTime.format('YYYY/MM/DD HH:mm:ss'))
  }

  getFreshData = (beginDate, endDate = moment(new Date()).endOf('day').format('YYYY/MM/DD HH:mm:ss')) => {
    if (!this.state.projectId) return Toast.fail('请选择项目')
    Toast.loading('数据加载中...', 0)
    getArrayTransportAmount({ beginDate, endDate, projectId: this.state.projectId }).then(res => {
      this.setState({
        TransportAmountList: res,
        count: res.length,
        filter: {
          nowPage: 1,
          limit: 15
        }
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

  showCalendar = () => {
    this.setState({
      show: true
    })
  }

  cancelCalendar = () => {
    this.setState({
      show: false
    })
  }

  componentDidMount () {
    const { ACCOUNT } = auth
    const ownedPermissions = getAuthority()
    const spacialAuthes = [ACCOUNT]  // 能够查看全部项目预约单运单的权限
    const check = spacialAuthes.some(auth => ownedPermissions.indexOf(auth) > -1)
    getProjectList({ offset: 0, limit: 10000, isPermissonSelectAll:check||undefined }).then(res => {
      this.options = (res.items || []).map(current => ({
        label: current.projectName,
        value: current.projectId
      }))
      this.setState({
        ready: true
      })
    })
  }

  setProjectId = value => {
    const projectId = value[0]
    if (!projectId) return
    const selectedKey = 1
    Promise.all([getDataOverview({ projectId }), getArrayTransportAmount({ projectId, beginDate: this.data[0].createDateStart, endDate: moment(new Date()).endOf('day').format('YYYY/MM/DD HH:mm:ss') })]).then(res => {
      this.setState({
        projectId: value[0],
        dataList: res[0],
        selectedKey,
        TransportAmountList: res[1],
        count: res[1].length,
        filter: {
          nowPage: 1,
          limit: 15
        }
      })
    })
  }

  marker = (x, y, r, ctx) => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.moveTo(x - r - 3, y);
    ctx.lineTo(x + r + 3, y);
    ctx.stroke();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.fill();
  }

  renderChart = () => {
    const { dataList } = this.state
    // 填充数据，后端修改后无需
    // const { length } = dataList
    // const tempArr = [ ...dataList, ...new Array(7)].splice(0, 7)
    // tempArr.fill(0, 6 - length, 7)
    // tempArr.forEach((current, index) => {
    //   tempArr[index] = {
    //     date:moment().week(moment().week()).startOf('week').day(index + 1).format(),
    //     transportWeightTone: index + 1 > length? 0 : current.transportWeightTone,
    //     transportWeightCube: index + 1 > length? 0 : current.transportWeightCube
    //   }
    // })
    const unitTon = dataList.map(current => ({
      day: moment(current.date).format('DD'),
      unit: '吨',
      value: current.transportWeightTone,
      waitTransportNumber: current.waitTransportNumber,
      doingTransportNumber: current.doingTransportNumber,
      arrayTransportNumber: current.arrayTransportNumber,
    }))
    const unitSquare = dataList.map(current => ({
      day: moment(current.date).format('DD'),
      unit: '方',
      value: current.transportWeightCube,
      waitTransportNumber: current.waitTransportNumber,
      doingTransportNumber: current.doingTransportNumber,
      arrayTransportNumber: current.arrayTransportNumber,
    }))
    const toBeImplemented = dataList.map(current => ({
      day: moment(current.date).format('DD'),
      type: '待执行',
      value: current.waitTransportNumber,
    }))
    const implementing = dataList.map(current => ({
      day: moment(current.date).format('DD'),
      type: '运输中',
      value: current.doingTransportNumber,
    }))
    const completed = dataList.map(current => ({
      day: moment(current.date).format('DD'),
      type: '已完成',
      value: current.arrayTransportNumber,
    }))
    return (
      <>
        <h3 styleName='chart_title'>运输重量趋势图</h3>
        <div styleName='chart_container'>
          <Chart width="100%" data={[ ...unitTon, ...unitSquare ]} pixelRatio={window.devicePixelRatio * 1}>
            <Axis dataKey="value" position='left' />
            <Axis dataKey="day" />
            <Guide
              type='text'
              top
              position={['-2%', '-13%']}
              content='运输重量'
              style={{
                fill: '#666',
                fontSize: '12'
              }}
            />
            <Guide
              type='text'
              top
              position={['100%', '108%']}
              content='日期'
              style={{
                fill: '#666',
                fontSize: '12'
              }}
            />
            <Tooltip showCrosshairs />
            <Legend marker={this.marker} />
            <Geom geom="line" position="day*value" color="unit" />
            <Geom geom="point" position="day*value" color="unit" style={{ lineWidth: 1, stroke: '#FFF' }} />
          </Chart>
        </div>
        <h3 styleName='chart_title'>运输单量趋势图</h3>
        <div styleName='chart_container'>
          <Chart width="100%" data={[ ...toBeImplemented, ...implementing, ...completed ]} pixelRatio={window.devicePixelRatio * 1}>
            <Axis dataKey="value" position='left' />
            <Axis dataKey="day" />
            <Guide
              type='text'
              top
              position={['-2%', '-13%']}
              content='单量'
              style={{
                fill: '#666',
                fontSize: '12'
              }}
            />
            <Guide
              type='text'
              top
              position={['100%', '108%']}
              content='日期'
              style={{
                fill: '#666',
                fontSize: '12'
              }}
            />
            <Tooltip showCrosshairs />
            <Legend marker={this.marker} />
            <Geom geom="line" position="day*value" color="type" />
            <Geom geom="line" position="day*value" color="type" />
            <Geom geom="line" position="day*value" color="type" />
          </Chart>
        </div>
      </>
    )
  }

  renderReportForms = () => {
    const { TransportAmountList, count, filter: { nowPage, limit } } = this.state
    const tempArr = JSON.parse(JSON.stringify(TransportAmountList))
    const renderList = tempArr.splice(0, nowPage * limit)
    return (
      <>
        <div styleName='table_title'>
          <span>日期</span>
          <span>运输单数</span>
          <span>费用</span>
        </div>
        <ul styleName='table_body'>
          {
            renderList.map(current => (
              <li key={current.date}>
                <span>{moment(current.date).format('YYYY-MM-DD')}</span>
                <span>{current.arrayTransportNumber}</span>
                <span>￥{formatMoney(current.arrayTransportAmount._toFixed(2))}</span>
              </li>
            ))
          }
        </ul>
        {Number(count) !== 0 && nowPage * limit < count? <div styleName='more_btn'><Button onClick={this._turnPage} size='small'>查看更多</Button></div>: null}
        {Number(count) > 0 && nowPage * limit >= count? <p styleName='no_more'>暂无更多</p>: null}
      </>
    )
  }

  render () {
    const { ready, projectId, dataList, TransportAmountList, pickStartTime, pickEndTime, show } = this.state
    const now = new Date()
    const today = dataList?.find(item => moment(item.date).format('YYYY-MM-DD') === moment().utc().format('YYYY-MM-DD')) || undefined
    return (
      ready
      &&
      <>
        <Picker data={this.options} cols={1} value={[projectId]} onOk={this.setProjectId}>
          <List.Item arrow="horizontal">项目</List.Item>
        </Picker>
        <div styleName='data_container'>
          <div styleName='data_list'>
            <h3 styleName='title'>
              <span>当日</span>
              <span>{moment().format('YYYY-MM-DD')}</span>
            </h3>
            <div styleName='data_div'>
              <Flex>
                <Item>
                  <div styleName='block'>
                    <p>{today?.transportWeightTone|| 0}</p>
                    <p>运输重量(吨)</p>
                  </div>
                </Item>
                <Item>
                  <div styleName='block'>
                    <p>{today?.transportWeightCube|| 0}</p>
                    <p>运输重量(方)</p>
                  </div>
                </Item>
              </Flex>
              <Flex>
                <Item>
                  <div styleName='block'>
                    <p styleName='yellow'>{today?.waitTransportNumber|| 0}</p>
                    <p>待执行</p>
                  </div>
                </Item>
                <Item>
                  <div styleName='block'>
                    <p styleName='blue'>{today?.doingTransportNumber|| 0}</p>
                    <p>运输中</p>
                  </div>
                </Item>
                <Item>
                  <div styleName='block'>
                    <p>{today?.arrayTransportNumber|| 0}</p>
                    <p>已完成</p>
                  </div>
                </Item>
              </Flex>
            </div>
          </div>
          <div styleName='data_list mr_top15'>
            <h3 styleName='title'>
              <span>当周</span>
              <span>{moment().week(moment().week()).startOf('week').format('YYYY-MM-DD')} 至 {moment().week(moment().week()).endOf('week').format('YYYY-MM-DD')}</span>
            </h3>
            {
              dataList?
                this.renderChart()
                :
                <div styleName='no_data'>暂无数据</div>
            }
          </div>
          <div styleName='data_list mr_top15'>
            <h3 styleName='title'>
              <span>数据报表</span>
              <span />
            </h3>
            {this.searchButton()}
            <DatePicker.RangePicker style={{ width: '210px' }} value={[pickStartTime, pickEndTime]} onOpenChange={this.showCalendar} open={false} />
            {
              TransportAmountList && TransportAmountList.length > 0?
                this.renderReportForms()
                :
                <div styleName='no_data'>暂无数据</div>
            }
          </div>
        </div>
        <Calendar
          locale={zhCN}
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
