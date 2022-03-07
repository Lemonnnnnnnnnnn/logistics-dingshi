import React, { Component } from 'react'
import { Button, Modal } from 'antd-mobile'
import router from 'umi/router'

export default class Index extends Component {

  state = {}

  componentDidMount () {
    const str = localStorage.getItem('test')
    localStorage.removeItem('test')
    this.setState({
      str
    })
    window.addEventListener('popstate', this.test)
  }

  // componentWillUnmount (){
  //   Modal.alert('保存', '您填写的信息已保存草稿')
  // }

  test = () => {
    localStorage.setItem('test', '已存储')
  }

  componentWillUnmount () {
    window.removeEventListener('popstate', this.test, false)
  }

  goback = () => {
    router.goBack()
  }

  render () {
    const { str } = this.state
    return (
      <>
        <div>{str}</div>
        <Button onClick={this.goback}>离开页面时监听事件</Button>
      </>
    )
  }
}
