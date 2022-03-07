import React from "react";
import {
  Chart,
  Geom,
  Axis,
  Tooltip,
  Coord,
  Legend,
  Guide
} from "bizcharts";
import DataSet from "@antv/data-set"
import router from 'umi/router'
import { PREBOOKING_STAUTS } from '@/constants/project/project'

const { DataView } = DataSet;
const { Html } = Guide;

const getItemUrl = (itemName) => {
  const itemStatus = {
    '待确定': PREBOOKING_STAUTS.UNCERTAINTY,
    '调度中': PREBOOKING_STAUTS.UNCOMPLETED,
    '已拒绝': PREBOOKING_STAUTS.REFUSE,
    '调度完成': PREBOOKING_STAUTS.COMPLETE
  }
  const url = `/buiness-center/preBookingList/preBooking?prebookingStatus=${ itemStatus[itemName]}`
  return url
}

const getItemVal = (data, itemName) => (
  data.filter(item => item.item === itemName)[0].count
)
class PreBookingDonut extends React.Component {

  state = {
    hasError: false
  }

  componentDidCatch (error, info) {
    this.setState({ hasError: true })
    // logErrorToMyService(error, info);
  }

  renderPreBookingDonut = (title, data) => {
    const dv = new DataView();
    const total = data.reduce((sum, obj) => sum + obj.count, 0)
    dv.source(data).transform({
      type: "percent",
      field: "count",
      dimension: "item",
      as: "percent"
    });
    const cols = {
      percent: {
        formatter: val => {
          val = `${val * 100 }%`;
          return val;
        }
      }
    };
    return (
      <div style={{ width:'100%', display: 'inline-block' }}>
        <Chart
          data={dv}
          scale={cols}
          padding={[0, 200, 0, 0]}
          forceFit
          height={350}
        >
          <Coord type="theta" radius={0.75} innerRadius={0.73} />
          <Axis name="percent" />
          <Legend
            position="right-center"
            textStyle={{
              fontSize: '14', // 文本大小
            }}
            itemMarginBottom={30}
            layout="vertical"
            itemFormatter={val => `${val }      ${ getItemVal(data, val)}`
            }
            onClick={event => {
              const itemName = event.item.value
              const url = getItemUrl(itemName)
              router.push(url)
            }}
          />
          <Tooltip
            showTitle={false}
            itemTpl={`<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>`}
          />
          <Guide>
            <Html
              position={["50%", "50%"]}
              html={`<div style=text-align:center;width:10em;><span style=color:#8c8c8c;font-size:14px>${title}</span><br><span style=color:black;font-size:24px;font-weight:400>${total}</span></div>`}
              alignX="middle"
              alignY="middle"
            />
          </Guide>
          <Geom
            type="intervalStack"
            position="percent"
            color="item"
            tooltip={[
              "item*percent",
              (item, percent) => {
                percent = `${(percent * 100).toFixed(2)}%`
                return {
                  name: item,
                  value: percent
                };
              }
            ]}
            style={{
              lineWidth: 1,
              stroke: "#fff"
            }}
          />
        </Chart>
      </div>
    )
  }

  renderErrorTipComponet = () => (
    <div style={{ display:'inlineBlock', padding:'200px 0', textAlign:'center' }}>
      图表显示失败,IE10及以下版本不兼容,推荐使用Chrome浏览器!
    </div>
  )

  render (){
    const { title, data } = this.props
    return this.state.hasError ? this.renderErrorTipComponet() : this.renderPreBookingDonut(title, data)
  }
}

export default PreBookingDonut
