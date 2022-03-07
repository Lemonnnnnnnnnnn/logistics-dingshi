import React, { Component } from 'react';
import { Spin } from 'antd';
import ReactDOM from 'react-dom';

export default class Modal extends Component{
  constructor (props) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount () {
    document.body.appendChild(this.el);
  }

  componentWillUnmount () {
    document.body.removeChild(this.el);
  }

  render () {
    return (
      this.props.loading?
        ReactDOM.createPortal(
          <div className='auditModal'>
            <Spin size="large" />
            <h3 style={{ marginTop: '20px', fontSize: '24px' }}>资料识别中，预计需要等待1分钟</h3>
          </div>,
          this.el
        )
        :
        null
    );
  }
}