import React from 'react'
import moment from 'moment'
import { getAuthnticationInfo, getPrebookingInfo, getTransportInfo } from '@/services/apiService'
import AuthnticationChart from './components/AuthenticationChart'
import AuditChart from './components/AuditChart'
import OrderStatistics from './components/OrderStatistics'
import { PREBOOKINGTYPE } from '@/constants/index/index'

class IndexPagePlatform extends React.Component {
  state = {
    authnticationInfo: [],
    prebookingInfo: [],
    transportInfo: [],
    ready: false
  }

  componentDidMount () {
    this.dataInit()
  }

  dataInit () {
    const params = {
      type: PREBOOKINGTYPE.MONTH, // 按月统计
      createDateStart: this.getOneYearBeforeTime(),
      createDateEnd: this.getNowTime()
    }

    Promise.all([getAuthnticationInfo(), getPrebookingInfo(params), getTransportInfo(params)])
      .then(([authnticationInfo, prebookingInfo, transportInfo]) => {
        prebookingInfo = this.dataOrderByTime(prebookingInfo)
        transportInfo = this.dataOrderByTime(transportInfo)
        this.setState({
          authnticationInfo,
          prebookingInfo,
          transportInfo,
          ready: true
        })
      })
  }

  getNowTime () {
    return moment().format('YYYY/MM/DD HH:mm:ss')
  }

  getOneYearBeforeTime () {
    return moment().subtract(1, 'years').format('YYYY/MM/DD HH:mm:ss')
  }

  dataOrderByTime = data => data.sort((a, b) => new Date(a.date) - new Date(b.date))

  // 重选时间获取新的预约单运单数据
  updateData = (createDateStart, createDateEnd) => {
    const params = {
      type: PREBOOKINGTYPE.AUTO,
      createDateStart,
      createDateEnd
    }
    const newDataObj = {}
    getPrebookingInfo(params).then(data => {
      newDataObj.prebookingInfo = this.dataOrderByTime(data)
      return getTransportInfo(params)
    }).then(data => {
      newDataObj.transportInfo = this.dataOrderByTime(data)
      this.setState({ ...newDataObj })
    })
  }

  render () {
    const { ready, authnticationInfo, prebookingInfo, transportInfo } = this.state
    return (
      <>
        {ready && <AuthnticationChart {...authnticationInfo} />}
        <AuditChart {...authnticationInfo} />
        {ready && <OrderStatistics prebookingInfo={prebookingInfo} transportInfo={transportInfo} updateData={this.updateData} />}
      </>
    )
  }
}
export default IndexPagePlatform
