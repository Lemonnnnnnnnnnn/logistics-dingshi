import React from 'react'
import { Row, Col } from 'antd'

const Item = ({ title, number })=>((
  <Col span={3} style={{ padding:'20px' }}>
    <div style={{ display:'inlineBlock', textAlign: 'center' }}>
      <div style={{ fontSize: '32px', color: '#1890FF', fontWeight: 400 }}>{number}</div>
      <div style={{ fontSize: '20px', color: 'rgba(0, 0, 0, 0.8)', fontWeight: 400 }}>{title}</div>
    </div>
  </Col>
))

const AuditChart = (props)=>(
  <div style={{ padding: '0 20px' }}>
    <Row style={{ marginTop:'30px', border:'1px solid rgba(233, 233, 233, 1)' }}>
      <Item title="运营审核" number={props.operatingAuditNum} />
      <Item title="货权审核" number={props.cargoAuditNum} />
      <Item title="托运审核" number={props.consignmentAuditNum} />
      <Item title="承运审核" number={props.shipmentAuditNum} />
      <Item title="司机审核" number={props.driverAuditNum} />
      <Item title="车辆审核" number={props.carAuditNum} />
      <Item title="项目审核" number={props.projectAuditNum} />
      <Item title="对账审核" number={props.accountAuditNum} />
    </Row>
  </div>

)

export default AuditChart
