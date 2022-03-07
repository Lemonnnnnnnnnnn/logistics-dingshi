import React, { Component } from 'react';

export default class CopyText extends Component{
  copyDom = React.createRef()

  copy = () => {
    this.copyDom.current.select();
    document.execCommand("Copy");
  }

  render () {
    const { label, renderData } = this.props;
    return (
      <p>
        <span style={{ display: 'inline-block', width: '60px', textAlign: 'left', marginRight: '15px' }}>{label}</span>
        <input style={{ border: 'none', backgroundColor: 'white', width: '200px' }} readOnly ref={this.copyDom} value={renderData} />
        <a style={{ marginLeft: '10px' }} onClick={this.copy}>复制</a>
      </p>
    );
  }
}
