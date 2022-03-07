import React, { Component } from 'react';
import { List } from 'antd-mobile';
import { isFunction } from '@/utils/utils'

const Item = List.Item;
const Brief = Item.Brief;
let inputInstance

class CarNofield extends Component {

  renderCarNo = () => {
    const { value='' } = this.props
    const list = new Array(7).fill(0)
    return list.map((item, index) => {
      return (
        <span key={index} style={{ fontWeight:'bold', display:'inline-block', width:'40px', height:'48px', background:'rgba(248,248,248,1)', borderRadius:'4px', fontSize:'17px', lineHeight:'40px', textAlign:'center' }}>
          {value[index] || null}
        </span>
      )
    })
  }

  onInput = (e) => {
    const { value='' } = e.target
    const { onChange } = this.props
    if(value.length<8) {
      isFunction(onChange) && onChange(value)
    }
  }

  openInput = () => {
    inputInstance.focus();
  };

  render() {
    const { label } = this.props.field
    return (
      <Item onClick={this.openInput}>
        {label}
        <input
          maxLength={7}
          onChange={this.onInput}
          ref={input => (
            inputInstance = input
          )}
          style={{ border:'none', color:'#fff', background:'rgba(256,256,256,0)' }}
        />
        <Brief style={{ display:'flex', alignItems: 'center', justifyContent:'space-around' }}>
          {this.renderCarNo()}
        </Brief>
      </Item>
    );
  }
}

export default CarNofield;
