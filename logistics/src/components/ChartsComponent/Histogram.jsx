import React, { Component } from 'react'
import {
  Chart,
  Geom,
  Axis,
  Tooltip,
  Label
} from 'bizcharts'
import DataSet from '@antv/data-set'
import Slider from 'bizcharts-plugin-slider'


class Histogram extends Component {

  handleSliderChange = e => {
    const { startRadio, endRadio } = e
    this.ds.setState('start', startRadio)
    this.ds.setState('end', endRadio)
  };

  render() {
    const { data = [], xAxisKey, yAxisKey, xAxisName, yAxisName, tooltip, showTitle, yAxisScale = {} } = this.props
    const cols = {
      [yAxisKey]: {
        alias: yAxisName,
        ...yAxisScale,
      },
      [xAxisKey]: {
        alias: xAxisName,
      },
    }
    this.ds = new DataSet({
      state: {
        start: 0,
        end: 1,
      },
    })
    const dsData = this.ds.createView('origin').source(data)
    dsData.transform({
      type: 'filter',
      callback: (item, idx) => {
        const radio = idx / data.length
        return radio >= this.ds.state.start && radio <= this.ds.state.end
      },
    })
    return (
      <>
        <Chart padding={100} height={600} data={dsData} scale={cols} forceFit>
          <Axis title={{ offset: 50, position: 'end' }} label={{ autoRotate: false, autoHide: true }} name={xAxisKey} />
          <Axis title={{ offset: 50 }} label={{ autoRotate: false }} name={yAxisKey} />
          <Tooltip
            showTitle={showTitle}
            crosshairs={{
              type: 'y',
            }}
          />
          <Geom
            type='interval'
            tooltip={tooltip}
            position={`${xAxisKey}*${yAxisKey}`}
          >
            <Label content={`${yAxisKey}`} />
          </Geom>
        </Chart>
        <Slider
          key={Math.random()}
          data={data}
          height={45}
          padding={150}
          xAxis={xAxisKey}
          yAxis={yAxisKey}
          onChange={this.handleSliderChange}
        />
      </>
    )
  }
}

export default Histogram
