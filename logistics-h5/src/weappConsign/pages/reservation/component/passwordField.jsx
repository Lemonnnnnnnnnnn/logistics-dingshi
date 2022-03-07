import React, { Component } from 'react'
import { List, InputItem } from 'antd-mobile'
import { isFunction } from '@/utils/utils'
import CSSModules from 'react-css-modules'
import styles from './passwordField.less'

const { Item } = List
const { Brief } = Item
let inputInstance

@CSSModules(styles, { allowMultiple: true })
class PasswordField extends Component {

  renderBlock = () => {
    const { value = '', PWRight } = this.props
    const list = new Array(4).fill(0)
    return list.map((item, index) => (
      <div
        key={index}
        style={{
          display: 'inline-block',
          width: '48px',
          height: '48px',
          background: PWRight ? '#F8F8F8' : '#F8E3E6',
          borderRadius: '4px',
          color : PWRight ? '#000' : 'red',
          fontSize: '40px',
          lineHeight: '40px',
          textAlign: 'center',
        }}
      >
        {value[index] || null}
      </div>
    ))
  }

  onInput = (val) => {
    const { onChange } = this.props
    if (val.length < 5) {
      isFunction(onChange) && onChange(val)
    }
  }

  openInput = () => {
    inputInstance.focus()
  }

  render () {
    return (
      <Item styleName='passwordField' onClick={this.openInput}>
        <div styleName='input'>
          <InputItem
            maxLength={4}
            type='money'
            onChange={this.onInput}
            ref={input => (
              inputInstance = input
            )}
            style={{ border: 'none', color: '#fff', background: 'rgba(256,256,256,0)' }}
          />
        </div>
        <div styleName='customBlock'>
          <Brief style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            {this.renderBlock()}
          </Brief>
        </div>
      </Item>
    )
  }
}

export default PasswordField
