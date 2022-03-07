import React from 'react'
import { MiniBar } from 'ant-design-pro/lib/Charts'
import { Row, Col } from 'antd'
import moment from 'moment'
import Media from 'react-media'

const chartItem = (title, total, data) => (
  <Media key={title} query="(max-width: 1280px)">
    {
      matches => matches ?
        <Col span={8} style={{ padding: '0 20px', marginBottom:'20px' }} key={title}>
          <div style={{ padding: '17px 17px 40px', border: '1px solid rgba(233, 233, 233, 1)' }}>
            <div style={{ color: 'rgba(0, 0, 0, 0.427450980392157)' }}>{title}</div>
            <div style={{ fontSize: '32px', fontWeight: '400', color: '#000', marginBottom: '-20px' }}>{total}</div>
            <MiniBar height={50} data={data} />
          </div>
        </Col>
        :
        <Col span={4} style={{ padding: '0 20px' }} key={title}>
          <div style={{ padding: '17px 17px 40px', border: '1px solid rgba(233, 233, 233, 1)' }}>
            <div style={{ color: 'rgba(0, 0, 0, 0.427450980392157)' }}>{title}</div>
            <div style={{ fontSize: '32px', fontWeight: '400', color: '#000', marginBottom: '-20px' }}>{total}</div>
            <MiniBar height={50} data={data} />
          </div>
        </Col>
    }
  </Media>
)


const getBeforeMonth = (nowtime, i) => moment(nowtime).subtract(i, 'months').format('YYYY-MM')

const AuthnticationChart = (props) => {
  const dataOrderByTime = data => data.sort((a, b) => new Date(a.x) - new Date(b.x))
  const operatingCertificationNumData = dataOrderByTime(props.operatingStatisticsNumber.map((item, index) => ({
    x: getBeforeMonth(props.nowtime, index),
    y: item
  })))
  const cargoStatisticsNumberData = dataOrderByTime(props.cargoStatisticsNumber.map((item, index) => ({
    x: getBeforeMonth(props.nowtime, index),
    y: item
  })))
  const consignmentStatisticsNumberData = dataOrderByTime(props.consignmentStatisticsNumber.map((item, index) => ({
    x: getBeforeMonth(props.nowtime, index),
    y: item
  })))
  const shipmentStatisticsNumberData = dataOrderByTime(props.shipmentStatisticsNumber.map((item, index) => ({
    x: getBeforeMonth(props.nowtime, index),
    y: item
  })))
  const driverStatisticsNumberData = dataOrderByTime(props.driverStatisticsNumber.map((item, index) => ({
    x: getBeforeMonth(props.nowtime, index),
    y: item
  })))
  const carStatisticsNumberData = dataOrderByTime(props.carStatisticsNumber.map((item, index) => ({
    x: getBeforeMonth(props.nowtime, index),
    y: item
  })))
  const data = [
    {
      title: '运营认证',
      total: props.operatingCertificationNum,
      data: operatingCertificationNumData
    },
    {
      title: '货权认证',
      total: props.cargoCertificationNum,
      data: cargoStatisticsNumberData
    },
    {
      title: '托运认证',
      total: props.consignmentCertificationNum,
      data: consignmentStatisticsNumberData
    },
    {
      title: '承运认证',
      total: props.shipmentCertificationNum,
      data: shipmentStatisticsNumberData
    },
    {
      title: '司机认证',
      total: props.driverCertificationNum,
      data: driverStatisticsNumberData
    },
    {
      title: '车辆认证',
      total: props.carCertificationNum,
      data: carStatisticsNumberData
    }
  ]
  return (
    <Row>
      {data.map(item => (
        chartItem(item.title, item.total, item.data)
      ))}
    </Row>
  )
}

export default AuthnticationChart
