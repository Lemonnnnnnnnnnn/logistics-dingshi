import React from 'react'
import { omit, isFunction } from 'lodash'
import getFormComponent from './interface'

const { BaseItem } = getFormComponent()

// todo 支持隐藏字段

const fieldType = {}

const CanFindComponent = (type) => () => <div style={{ color: 'red' }}>没有找到类型为[{type}]的组件</div>

export function getComponent (type) {
  return fieldType[type] || CanFindComponent(type)
}

/**
 * 注册 formItem组件
 * @param type   类型
 * @param Component 包装过的FormItem
 * @param normalize 组件初始值的格式化方法，例如 TimePicker value接收的是moment,需要通过format方法将string转换为moment
 */
export function registerComponent (type, Component) {
  Component.$register = true
  if (Component.Text) {
    Component.Text.$format = Component.$format
    Component.Text.$normalize = Component.$normalize
    fieldType[`${type}.text`] = Component.Text
  } else {
    fieldType[`${type}.text`] = Component
  }
  fieldType[type] = Component
}

const omitProps = ['$item', '$index', '$arrayItems', '$parent', 'changeFields', 'changeValues', 'normalizeSchema', 'field', 'formData']

// 由于一些原生组件在传入一些其未定义的参数时会报警告，因此通过 fieldWrapper过滤掉这些不识别的参数
// 同时form的getFieldDecorator高阶组件也只接受class组件，因此也做一层包装
export function FieldWrapper (FieldComponent) {
  class Component extends React.Component {
    render () {
      const { field } = this.props
      return <FieldComponent {...field} {...omit(this.props, omitProps)} />
    }
  }
  if (!isFunction(BaseItem)){
  }
  return BaseItem(Component)
}
