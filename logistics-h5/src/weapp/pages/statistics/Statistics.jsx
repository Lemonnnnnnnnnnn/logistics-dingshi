import React from 'react'
import { Calendar, Picker, List, Toast } from 'antd-mobile'
import { Chart, Axis, Geom, Tooltip, Guide } from 'bizgoblin'
import moment from 'moment'
import { connect } from 'dva'
import zhCN from 'antd-mobile/lib/calendar/locale/zh_CN'
import { getProject, getCustomerChartTotal } from '@/services/apiService'
import { USERPROJECTSTATUS } from '@/constants/project/project'
import { getAuthority } from '@/utils/authority'
import auth from '@/constants/authCodes'
import { getUserInfo } from '@/services/user'
import GuestTips from '@/weapp/component/GuestTips/GuestTips'
import noDataSvg from '@/assets/nodata.svg'
import styles from './Statistics.css'

const { ACCOUNT } = auth

const pixelRatio = window.devicePixelRatio;

const TYPE = {
  DAY: 0,
  MONTH: 1,
  AUTO: 2,
  YEAR: 3
}

function mapStateToProps (state) {
  return {
    nowUser: state.user.nowUser
  }
}

@connect(mapStateToProps, null)
export default class Statistics extends React.Component {
  state = {
    visible: false,
    createDateStart: moment().subtract(7, 'days').startOf('day').format('YYYY/MM/DD HH:mm:ss'),
    createDateEnd: moment().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    projectItems: [],
    oderCountData: undefined,
    weightCountData: undefined,
    projectId: undefined,
    projectName: undefined,
    ready:false
  }

  isLogin = !!getUserInfo().accessToken

  accountType = getUserInfo().accountType

  componentWillMount () {
    this.dataInit()
  }

  preventTouchmove (e){
    if (e._isScroller) return;
    e.preventDefault();
  }

  dataInit = () => {
    const ownedPermissions = getAuthority()
    const spacialAuthes = [ACCOUNT]  // 能够查看全部项目预约单运单的权限
    const check = spacialAuthes.some(auth => ownedPermissions.indexOf(auth) > -1)
    const filter = {
      offset: 0,
      limit: 100000,
      isPermissonSelectAll:check||undefined
    }
    getProject(filter)
      .then(data => {
        const projectItems = (data.items||[]).filter(item=>{
          const { customerResponsibleItems } = item
          const auditStatus = (customerResponsibleItems||[]).find( item => item.responsibleId === this.props.nowUser.userId)?.auditStatus
          return auditStatus === USERPROJECTSTATUS.SUCCESS || this.accountType === 1
        }).map(item => ({
          label: item.projectName,
          value: item.projectId
        }))
        this.setState({
          projectItems,
          // createDateStart,
          // createDateEnd,
          projectId: projectItems[0]?.value,
          projectName: this.getProjectName(projectItems[0]?.value, projectItems)
        }, this.getChartData)
      })
  }

  // 日期框确定的回调函数
  onConfirm = (createDateStart, createDateEnd) => {
    this.setState({
      createDateStart: moment(createDateStart).format('YYYY/MM/DD HH:mm:ss'),
      createDateEnd: moment(createDateEnd).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
      visible: false
    }, () => {
      document.getElementsByClassName('am-tabs-tab-bar-wrap')[0].style.display = 'flex'
      // document.body.removeEventListener('touchmove', this.preventTouchmove, {
      //   passive: false
      // });
      const { projectId } = this.state
      projectId ? this.getChartData() : null
      document.getElementById('root').style.paddingBottom = this.rootPaddingBottom
    })
  }

  // 日期框关闭的回调函数
  onCancel = () => {
    this.setState({
      visible: false
    })
    document.getElementsByClassName('am-tabs-tab-bar-wrap')[0].style.display = 'flex'
    document.getElementById('root').style.paddingBottom = this.rootPaddingBottom
    // document.body.removeEventListener('touchmove', this.preventTouchmove, {
    //   passive: false
    // });
  }

  // 选择项目确定的回调函数
  setProjectId = value => {
    this.setState({
      projectId: value[0],
      projectName: this.getProjectName(value[0])
    }, () => {
      const { createDateStart } = this.state
      createDateStart ? this.getChartData() : null
    })
  }

  getProjectName = (projectId, projectItems = this.state.projectItems) => {
    if (!projectId){
      return ''
    }
    projectItems.filter(item => item.value === projectId)[0].label
  }

  schemaChartData = (data) => {
    const oderCountData = [
      {
        type: '计划单数',
        count: data.planNum
      },
      {
        type: '运单数',
        count: data.tranNum
      },
      {
        type: '异常运单数',
        count: data.tranAbnormalNum
      },
    ]

    const weightCountData = []

    data.planWeight.forEach( item =>{
      item.type = '计划重量'
      weightCountData.push(item)
    })
    data.signForWeight.forEach( item =>{
      item.type = '实收重量'
      weightCountData.push(item)
    })
    // 将无序的数据按时间排序
    weightCountData.sort((a, b)=>moment(a.date) -moment(b.date))
    this.setState({
      oderCountData,
      weightCountData
    })
  }

  // 获取项目纬度统计数据
  getChartData = () => {
    const { projectId, createDateStart, createDateEnd } = this.state
    const param = {
      projectId,
      createDateStart,
      createDateEnd,
      type:TYPE.AUTO
    }
    if (!projectId){
      Toast.fail('该账号下暂无合同', 2, null, false )
      return
    }
    getCustomerChartTotal(param).then(data=>{
      this.setState({
        ready: true
      })
      this.schemaChartData(data)

    })
  }

  drawOrderCountChart = (data) => {
    const defs = [{
      dataKey: 'type',
      type: 'cat',
    },
    {
      dataKey: 'count'
    }]
    return (
      <div className={styles.asd} style={{ width: '95%' }}>
        <Chart data={data} width="100%" defs={defs} pixelRatio={pixelRatio}>
          <Axis dataKey="type" label={{ fontSize: 12 }} />
          <Axis dataKey="count" line={{ stroke: '#e8e8e8' }} label={{ fontSize: 12 }} />
          <Geom geom="interval" position="type*count" />
          <Tooltip onShow={this.orderChartToolTip} />
          <Guide
            type='text'
            top
            position={['101%', '95%']}
            content='类别'
            style={{
              fill: '#666',
              fontSize: '12'
            }}
          />
          <Guide
            type='text'
            top
            position={['-2%', '-10%']}
            content='单数'
            style={{
              fill: '#666',
              fontSize: '12'
            }}
          />
        </Chart>
      </div>
    )
  }

  orderChartToolTip = (ev) => {
    const { items } = ev
    items[0].name = items[0].title
  }

  drawWeightCountChart = (data) => {
    const defs = [{
      dataKey: 'date',
      range: [0, 0.95],
      tickCount: 7
    },
    {
      dataKey: 'number',  // 数据列字段，必填
    }]
    return (
      <div style={{ width: '95%' }}>
        <Chart width="100%" data={data} defs={defs} pixelRatio={pixelRatio}>
          <Axis dataKey="date" label={{ fontSize: 12, rotate: -0.3 }} />
          <Axis dataKey="number" line={{ stroke: '#e8e8e8' }} label={{ fontSize: 12 }} />
          <Geom geom="line" position="date*number" color="type" />
          <Tooltip showCrosshairs onShow={this.weightCountChartToolTip} />
          <Guide
            type='text'
            top
            position={['101%', '95%']}
            content='日期'
            style={{
              fill: '#666',
              fontSize: '12'
            }}
          />
          <Guide
            type='text'
            top
            position={['-1%', '-10%']}
            content='重量(吨)'
            style={{
              fill: '#666',
              fontSize: '12'
            }}
          />
        </Chart>
      </div>
    )
  }

  weightCountChartToolTip = ev => {
    const { items } = ev
    items.splice(0, 0, { name: items[0].title || '', x:items[0].x, y: items[0].y })
  }

  showCalendar = () => {
    this.setState({ visible: true })
    document.getElementsByClassName('am-tabs-tab-bar-wrap')[0].style.display = 'none'
    // document.body.addEventListener('touchmove', this.preventTouchmove, {
    //   passive: false
    // });
    this.rootPaddingBottom = document.getElementById('root').style.paddingBottom
    document.getElementById('root').style.paddingBottom = 0
  }

  render () {
    const { oderCountData, weightCountData, projectItems, visible, projectId, createDateStart, createDateEnd, projectName, ready } = this.state
    const defaultDate = new Date(moment().subtract(1, 'months'))
    const maxDate = new Date()
    return (
      this.isLogin?
        ready &&
        <div>
          <List>
            <Picker
              data={projectItems}
              title='请选择项目'
              cols={1}
              value={[projectId]}
              onOk={this.setProjectId}
            >
              <List.Item arrow="horizontal">请选择项目</List.Item>
            </Picker>
            <List.Item arrow="horizontal" onClick={this.showCalendar}>
              请选择日期
              {
                createDateStart ?
                  <span style={{ float: 'right' }}>{moment(createDateStart).format('YYYY/MM/DD')}~{moment(createDateEnd).format('YYYY/MM/DD')}</span>
                  : <span style={{ float: 'right', fontSize: '15px' }}>请选择</span>
              }
            </List.Item>
          </List>
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '18px', color: '#666' }}>{projectName}</div>
          <Calendar
            visible={visible}
            locale={zhCN}
            onCancel={this.onCancel}
            onConfirm={this.onConfirm}
            showShortcut
            maxDate={maxDate}
            defaultDate={defaultDate}
            zIndex={999999999999999999999}
          />
          {oderCountData && this.drawOrderCountChart(oderCountData)}
          {weightCountData && this.drawWeightCountChart(weightCountData)}
          { (!oderCountData && !weightCountData) &&
          <img style={{ margin: '30px auto 0px', position: 'absolute', left: '0', right: '0' }} src={noDataSvg} alt="" /> }
        </div>
        :
        <GuestTips />
    )
  }
}
