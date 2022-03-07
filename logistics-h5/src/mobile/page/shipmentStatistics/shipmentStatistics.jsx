import React from 'react'
import { Calendar, Picker, List } from 'antd-mobile'
import { Chart, Axis, Geom, Tooltip, Guide } from 'bizgoblin'
import moment from 'moment'
import zhCN from 'antd-mobile/lib/calendar/locale/zh_CN'
import { getProject, getChartTotal } from '@/services/apiService'
import { getAuthority } from '@/utils/authority'
import auth from '@/constants/authCodes'

const { ACCOUNT } = auth


const pixelRatio = window.devicePixelRatio;
export default class ShipmentStatistics extends React.Component {
  state = {
    visible: false,
    createDateStart: moment().subtract(7, 'days').startOf('day').format('YYYY/MM/DD HH:mm:ss'),
    createDateEnd: moment().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    projectItems: [],
    oderCountData: undefined,
    weightCountData: undefined,
    projectId: undefined,
    projectName: undefined
  }

  componentDidMount () {
    this.dataInit()
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
        const projectItems = (data.items||[]).map(item => ({
          label: item.projectName,
          value: item.projectId
        }))
        this.setState({
          projectItems,
          // createDateStart,
          // createDateEnd,
          projectId: projectItems[0].value,
          projectName: this.getProjectName(projectItems[0].value, projectItems)
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
      const { projectId } = this.state
      projectId ? this.getChartData() : null
    })
  }

  // 日期框关闭的回调函数
  onCancel = () => {
    this.setState({
      visible: false
    })
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

  getProjectName = (value, projectItems = this.state.projectItems) => projectItems.filter(item => item.value === value)[0].label

  schemaChartData = (data) => {
    const oderCountData = [
      {
        type: '预约单数',
        count: data.preNum
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

    const weightCountData = {
      data: [],
      others: {
        preWeight: [],
        loadWeight: [],
        unloadWeight: []
      }
    }
    const pushDate = ({ key, name }) => {
      data[key].forEach(item => {
        const list = item.goodsUnit === '吨'
          ? weightCountData.data
          : weightCountData.others[key]

        list.push({ name, type: key, goodsNum: item.goodsNum, goodsUnit: item.goodsUnit })
      })
    }

    pushDate({ key: 'preWeight', name: '预约重量' })
    pushDate({ key: 'loadWeight', name: '实提量' })
    pushDate({ key: 'unloadWeight', name: '实收量' })

    // 判断weightCountData.data中是否缺少预约重量/实提量/实收量的数据
    let isPreWeightDataExisted = false
    let isLoadWeightDataExisted = false
    let isunLoadWeightDataExisted = false

    weightCountData.data.forEach(item => {
      const updateExistStatusMethod = {
        preWeight: () => isPreWeightDataExisted = true,
        loadWeight: () => isLoadWeightDataExisted = true,
        unloadWeight: () => isunLoadWeightDataExisted = true
      }[item.type] || (() => { })

      updateExistStatusMethod()
    })

    // 缺数据补全
    !isPreWeightDataExisted && weightCountData.data.push({ name: '预约重量', type: 'preWeight', goodsNum: 0, goodsUnit: '吨' })
    !isLoadWeightDataExisted && weightCountData.data.push({ name: '实提量', type: 'loadWeight', goodsNum: 0, goodsUnit: '吨' })
    !isunLoadWeightDataExisted && weightCountData.data.push({ name: '实收量', type: 'unloadWeight', goodsNum: 0, goodsUnit: '吨' })
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
      createDateEnd
    }

    getChartTotal(param).then(this.schemaChartData)
  }

  drawOrderCountChart = (data) => {
    const defs = [{
      dataKey: 'type',
      type: 'cat'
    },
    {
      dataKey: 'count'
    }]
    return (
      <div style={{ width: '95%', margin: '0 5% 0 0' }}>
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
      dataKey: 'type',
      type: 'cat'
    },
    {
      dataKey: 'goodsNum'
    }]
    return (
      <div style={{ width: '95%', margin: '0 5% 0 0' }}>
        <Chart width="100%" data={data.data} defs={defs} pixelRatio={pixelRatio}>
          <Axis dataKey="name" label={{ fontSize: 12 }} />
          <Axis dataKey="goodsNum" line={{ stroke: '#e8e8e8' }} label={{ fontSize: 12 }} />
          <Geom geom="interval" position="name*goodsNum" />
          <Tooltip onShow={this.weightChartToolTip} />
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
            position={['-1%', '-10%']}
            content='重量'
            style={{
              fill: '#666',
              fontSize: '12'
            }}
          />
        </Chart>
      </div>
    )
  }

  weightChartToolTip = (ev) => {
    const { items } = ev
    items[0].name = items[0].title
    const { type, goodsUnit } = items[0].origin
    const othersData = this.state.weightCountData.others[type]
    let value = `${items[0].value}${goodsUnit}`
    if (othersData) {
      othersData.forEach(item => {
        value = `${value}、${item.goodsNum}${item.goodsUnit}`
      })
    }
    items[0].value = value

  }

  render () {
    const { oderCountData, weightCountData, projectItems, visible, projectId, createDateStart, createDateEnd, projectName } = this.state
    const defaultDate = new Date(moment().subtract(1, 'months'))
    const maxDate = new Date()
    return (
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
          <List.Item arrow="horizontal" onClick={() => { this.setState({ visible: true }) }}>
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
        />
        {oderCountData && this.drawOrderCountChart(oderCountData)}
        {weightCountData && this.drawWeightCountChart(weightCountData)}
      </div>

    )
  }
}
