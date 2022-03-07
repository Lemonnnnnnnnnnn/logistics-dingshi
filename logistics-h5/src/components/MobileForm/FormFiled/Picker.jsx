/**
 */
import React from 'react'
import { Picker, List } from 'antd-mobile'
import WrapItem from '../ItemWrap'
import { registerComponent } from '../Item'
import optionsDecorator from '@/components/MobileForm/decorators/optionsDecrator';
import CSSModules from 'react-css-modules';
import styles from '@/components/MobileForm/mobileForm.css';


export const DEFAULT_MAX_LENGTH = 50
const PickerComponent = function PickerCreator (field ){
  if (!field.placeholder && field.label){
    field.placeholder = `请输入${field.label}`
  }

  if (field.required){
    field.required = (value)=>(!value || value.length === 0 )
  }


  if (!field.maxLength) field.maxLength = DEFAULT_MAX_LENGTH
  const arrow =field.disabled ? '':'horizontal'
  return WrapItem(field, optionsDecorator(CSSModules(styles)((props)=>(
    <Picker {...props} data={props.options} title={props.label} cols={1} extra={`${props.placeholder}`}>
      <List.Item key={field.key} arrow={arrow}>{props.label}</List.Item>
    </Picker>
  ))))
}


registerComponent('picker', PickerComponent)



export default PickerComponent
