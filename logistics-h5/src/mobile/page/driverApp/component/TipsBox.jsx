import React, { Component } from 'react';
import tipsIcon from '@/assets/tipsIcon.png'

const defaultWord = '您填写的签收重量已超出约定磅差千分之3，请核实是否填写正确'
class TipsBox extends Component {
  render () {
    const { title='提示消息', word=defaultWord, icon=tipsIcon } = this.props
    return (
      <div>
        <div style={{ fontSize: '18px', height: '26px', fontWeight: '600', lineHeight: '26px', marginBottom: '35px', color: 'rgba(14,27,66,1)' }}>{title}</div>
        <img src={icon} alt="" />
        <div style={{ margin:'35px 20px', fontSize:'19px', color:'color:rgba(111,127,175,1)', lineHeight:'26px' }}>
          {word}
        </div>
      </div>
    );
  }
}

export default TipsBox;
