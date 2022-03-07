import React from 'react'
import { ImagePicker } from 'antd-mobile'
import Map from './map.jsx'

export default class Demo extends React.Component {
  state = {
    files: [{
      url: 'https://zos.alipayobjects.com/rmsportal/PZUUCKTRIHWiZSY.jpeg',
      id: '2121',
    }, {
      url: 'https://zos.alipayobjects.com/rmsportal/hqQWgTXdrlmVVYi.jpeg',
      id: '2122',
    }],
    multiple: false
  }

  onChange = (files, type, index) => {
    this.setState({
      files,
    });
  }

  render () {
    const { multiple, files } = this.state

    const imgProps = {
      files,
      multiple,
      onChange: this.onChange,
      selectable: files.length < 7
    }
    const mapProps = {
      serviceId: 50557,
      trackDentryid: 279,
      terminalId: 168575261,
      transportId: 341787419448576
    }

    return (
      <div>
        <ImagePicker {...imgProps} />
        <Map {...mapProps} />
      </div>
    )
  }
}
