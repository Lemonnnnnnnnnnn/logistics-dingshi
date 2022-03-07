import React from 'react'
import { Chart, Tooltip, Geom } from 'bizcharts'
import { Row, Col } from 'antd'
import { ACCOUNT_TYPE_DIST } from '@/constants/project/project'

export default class AccountCard extends React.Component {
  render() {
    const { data, name } = this.props
    const isAbnormal = data[0].status === 1

    return (
      <div style={{ height : '100px', width : '200px', boxShadow : '0 0 8px #888', padding : '10px' }}>
        <div style={{ fontWeight : 'bold' }}>{ACCOUNT_TYPE_DIST[name]}</div>
        <Row type='flex' style={{ marginBottom : '10px' }} justify='space-between'>
          <Col>昨日对账</Col>
          <Col>
            {!isAbnormal ? <div style={{ color : '#8EE106' }}>正常</div> : <div style={{ color : 'red' }}>异常</div>}
          </Col>
        </Row>
        <Chart
          padding='5%'
          height={20}
          data={data}
          forceFit
        >
          {/* TODO: tooltip 偏移 */}
          <Tooltip
            showTitle={false}
            placement="end"
            offset={50}
          />
          {/* TODO : 被选中的拉长，标签带阴影 */}
          <Geom
            type="interval"
            position="date*height"
            color={['status', (status)=>status === 0 ? '#8EE106' : '#D9001B']}
            active={[true, {
              highlight: false, // true 是否开启 highlight 效果，开启时没有激活的变灰
              style: {
                shadowColor : '#888',

              } // 选中后 shape 的样式
            }]}
            tooltip={['date*status', (date, status)=>({
              name : `${date}`,
              value : status === 0 ? '正常' : '异常',
              offset : 50
            })]}
          />

        </Chart>
      </div>

    )
  }
}
