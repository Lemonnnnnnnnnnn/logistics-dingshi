import { connect } from 'dva'
import './FormFiled/Input'
import './FormFiled/Picker'
import './FormFiled/TextArea'
import './FormFiled/Calender'
import React from 'react';
import { List } from 'antd-mobile'

export { default } from './MobileForm'
export { FormItem } from './Item'
export { default as FormButton } from './FormButton'
export { FORM_MODE } from './constants'
export { FormContextCustom } from './FormContext'

// todo  加载所有表单组件



export function BindStore (scope){
  const Model = require(`@/models/${scope}`)
  const actions = { ...Model.default.actions }

  return (CustomizedForm) => connect(state=>state[scope], actions)(CustomizedForm)
}

// todo 需要修改

// 表单容器
export function FormCard (props) {
  const { children } = props
  return (
    <List renderHeader={()=>'这是一个列表'}>
      {children}
    </List>
  )
}
