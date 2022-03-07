import React from "react"
import { Chart, Geom, Axis, Tooltip } from "bizcharts"

const PolygonalChart=({ data })=>{
  const cols = {
    yAxiosName: {
      min: 0
    },
    xAxiosName: {
      range: [0, 1]
    }
  }
  return (
    <div>
      <div style={{ height:'40px', lineHight: '40px', fontWeight: '650', fontSize: '16px' }}>全部项目</div>
      <Chart height={400} data={data} scale={cols} forceFit style={{ marginLeft:'-55px' }}>
        <Axis name="date" />
        <Axis name="number" />
        <Tooltip
          crosshairs={{ type: "y" }}
          itemTpl='<li data-index={index}><span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>单量: {value}</li>'
        />
        <Geom type="line" position='date*number' size={2} />
      </Chart>
    </div>
  )
}
export default PolygonalChart
