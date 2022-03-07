import React, { Component } from 'react';
import { List, InputItem, Modal, Button, Toast } from 'antd-mobile'
import numModalClose from '@/assets/numModalClose.png'
import { isFunction, isNumber, isNaN } from '@/utils/utils'
import style from './FieldInput.less'

function closest (el, selector) {
  const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
  while (el) {
    if (matchesSelector.call(el, selector)) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

class FieldInput extends Component {

  state = {
    visible:false
  }

  constructor (props){
    super(props)
    this.inputRef = React.createRef()
  }

  clickInput = e =>{
    const { field:{ modalInput } } = this.props
    e.preventDefault()
    if (!modalInput) return false
    this.setState({
      visible:true
    })
  }

  closeModal = () => {
    this.setState({
      visible:false
    })
  }

  setValue = () => {
    const { onChange } = this.props
    const { value } = this.inputRef.current
    if (!value) return this.closeModal()
    if (isNumber(+value)&&(!isNaN(+value))){
      isFunction(onChange) && onChange(value)
      this.closeModal()
    } else {
      Toast.fail('请输入正确的数量', 1)
    }
  }

  onWrapTouchStart = (e) => {
    // fix touch to scroll background page on iOS
    console.log(navigator.userAgent)
    if (!/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
      return;
    }
    const pNode = closest(e.target, '.am-modal-content');
    if (!pNode) {
      e.preventDefault();
    }
  }

  render () {
    const { field:{ fieldInputType, placeholder, label, extra, prefixCls, modalInput }, onChange, value } = this.props
    const { visible } = this.state
    return (
      <>
        <List onClick={this.clickInput}>
          <InputItem
            prefixCls={prefixCls || 'driverFieldInput'}
            labelNumber={7}
            value={value}
            type={fieldInputType}
            autoAdjustHeight
            placeholder={placeholder}
            editable={!modalInput}
            extra={<span style={{ color:'rgba(111,127,175,1)' }}>{extra}</span>}
            onChange={onChange}
          >{label}
          </InputItem>
        </List>
        <Modal
          animationType="up"
          visible={visible}
          // className={`${style.modalBox}`}
          wrapProps={{ onTouchStart: this.onWrapTouchStart }}
          onClose={this.closeModal}
        >
          <div className={style.textLeft} onClick={this.closeModal}>
            <img src={numModalClose} alt="" />
          </div>
          <div>
            <div style={{ fontSize:'18px', height:'26px', fontWeight:'600', lineHeight:'26px', marginBottom:'8px', color:'rgba(14,27,66,1)' }}>{label}</div>
            <input
              className={style.numberInput}
              // autoFocus
              defaultValue={value}
              ref={this.inputRef}
              type="number"
            />
            <div className={style.fakeBorder} />
            <div className={style.unitBox}>
              {`单位:${extra}`}
            </div>
          </div>
          <Button type="primary" onClick={this.setValue} style={{ height:'59px', width:'315px', margin:'0 auto', marginTop:'40px', lineHeight:'59px' }}>确定</Button>
        </Modal>
      </>
    );
  }
}

export default FieldInput;
