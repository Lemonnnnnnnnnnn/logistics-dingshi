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
import DataSet from "@antv/data-set";
import router from 'umi/router'
import { TRANSPORT_FINAL_STATUS } from '@/constants/project/project'
import { OWNER } from '@/constants/organization/organizationType'

const { DataView } = DataSet;
const { Html } = Guide;

const getItemUrl = (itemName, organizationType) => {
  const url = '/buiness-center/transportList/transport?transportFinalStatus='
  const itemStatus = {
    '未接单': TRANSPORT_FINAL_STATUS.UNTREATED,
    '运输中': TRANSPORT_FINAL_STATUS.TRANSPORTING,
    '待审核': organizationType === OWNER ? TRANSPORT_FINAL_STATUS.SIGNED : TRANSPORT_FINAL_STATUS.SHIPMENT_UNAUDITED,
    '被拒绝': TRANSPORT_FINAL_STATUS.DRIVER_REFUSE,
    '已接单': TRANSPORT_FINAL_STATUS.ACCEPT,
    '已签收': TRANSPORT_FINAL_STATUS.SIGNED,
    '运单异常': TRANSPORT_FINAL_STATUS.TRANSPORT_EXECPTION,
    '待提货': TRANSPORT_FINAL_STATUS.UNDELIVERY
  }
  return url + itemStatus[itemName]
}

const getItemVal = (data, itemName) => (
  data.filter(item => item.item === itemName)[0].count
)

const TransportDonut = ({ title, data, organizationType }) => {
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
    <ErrorBoundary>
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
            itemMarginBottom={20}
            layout="vertical"
            itemGap={100}
            itemFormatter={item =>`${item}      ${getItemVal(data, item)}`}
            onClick={event => {
              const itemName = event.item.value
              const url = getItemUrl(itemName, organizationType)
              router.push(url)
            }}
          />
          <Tooltip
            showTitle={false}
            itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
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
                percent = `${(percent * 100).toFixed(2) }%`;
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
    </ErrorBoundary>
  );
}

export class ErrorBoundary extends React.Component {
  state = {
    hasError: false
  }

  componentDidCatch () {
    this.setState({ hasError: true });
  }

  render () {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

export default TransportDonut
