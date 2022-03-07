import React from 'react'
import { Modal, Input } from 'antd'

export default class InputMap extends React.Component{
  constructor (props) {
    super(props)
    this.state = {
      show: false,
      inputValue: '',
      addressVal: ''
    }
  }

  showModal = () => {
    this.setState({
      show: true
    })
  }

  handleCancel = () => {
    this.setState({
      show: false
    })
  }

  addressVal = (e) => {
    this.setState({
      inputValue: e.target.value
    })
  }

  okBtn = () => {
    const { inputValue } = this.state
    this.setState({
      addressVal: inputValue,
      show: false
    })
  }

  render () {
    const { show, inputValue, addressVal } = this.state
    return (
      <>
        <Input type="text" value={addressVal} onClick={this.showModal} />
        <Modal
          title='输入地址'
          width='40vw'
          onCancel={this.handleCancel}
          visible={show}
          onOk={this.okBtn}
        >
          <Input type="text" value={inputValue} onChange={this.addressVal} />
        </Modal>
      </>
    )
  }
}