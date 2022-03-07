/**
 */
import React from 'react'
import { InputItem } from 'antd-mobile'
import WrapItem from '../ItemWrap'
import { omit } from '@/utils/utils'
import { registerComponent } from '../Item'

// todo placeholder 使用 extra提示，当获取焦点/存在value时消失 ？ 需要这样吗？

export const DEFAULT_MAX_LENGTH = 50

const InputComponent = function InputCreator (field){
  if (!field.placeholder && field.label){
    field.placeholder = `请输入${field.label}`
  }

  if (!field.maxLength) field.maxLength = DEFAULT_MAX_LENGTH
  return WrapItem(field, (props)=>{
    const _props = omit(props, ['refs', 'requiredAction', 'validator', 'display', '_required', 'modifiable', 'optionalLabel', 'formData', 'FormContext'])
    return (
      <InputItem {..._props}>
        {props.label}
      </InputItem>
    )
  })
}


registerComponent('input', InputComponent)



export default InputComponent
