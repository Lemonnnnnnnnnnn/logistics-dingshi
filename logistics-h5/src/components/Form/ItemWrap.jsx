import { Form } from 'antd';
import React from 'react';
import optionsDecorator from './decorators/optionsDecrator'
import watchDecorator from './decorators/watchDecorator'
import { isString, isObject } from '@/utils/utils'

/**
 * baseItem根据字段配置生成一个被 Form.Item包裹的组件，这个组件只在表单初始化的时候生成,多次生成会造成重复渲染,页面抖动等问题
 *
 * @param field
 * @param Component
 * @returns {function(*=)}
 * @constructor
 */
const BaseItem = (field, Component) =>{
  const WrapComponent = watchDecorator(Component)
  const Label = getItemLabel(field)
  return (props) => {
    const { form, formData, wrapperCol, labelCol, className, style } = props
    const { key, label, value, rules, validator, required, requireRemindMessage, defaultValue, component, ...restConfig } = field
    let _props = restConfig
    const layout = wrapperCol || labelCol ? { wrapperCol, labelCol } : {}
    if (!isString(component)) {
      _props = props
    }
    // 瞎鸡儿加的，为了让input支持后缀... 看到了别打我
    if (props.addonAfter&&component==='input'){
      _props.addonAfter = props.addonAfter
    }

    return (
      <Form.Item
        style={props.style}
        className={className}
        label={Label}
        {...layout}
        // key={props.key || key}
      >
        {form.getFieldDecorator(key, {
          rules: [{
            validator: (rule, value, callback) => {
              if (validator) validator({ field, rule, value, callback, formData })
              callback()
            }
          }, {
            required, message: requireRemindMessage || `请输入${label}`,
          }, ],
          initialValue: defaultValue
        })(
          <WrapComponent {..._props} />
        )}
      </Form.Item>
    )
  }
}

function getItemLabel ({ label, optionalLabel }){
  if (!label) return null
  if (isObject(label)) return label
  if (optionalLabel) return (
    <>
      <span style={{ fontWeight: 'bold' }}>{label}</span>
      {/* <span style={{ color:'#b4b4b4' }}> (可选)</span> */}
    </>
  )

  return <span style={{ fontWeight: 'bold' }}>{label}</span>
}


export const TableItem = (field, Component) => (props) => {
  const WrapComponent = Component
  const { form } = props
  const { key, label, rules, validator, required, requireRemindMessage, defaultValue, component, ...restConfig } = field
  return (
    form.getFieldDecorator(key, {
      rules: [{
        validator: (rule, value, callback) => {
          if (validator) validator({ field, rule, value, callback })
          callback()
        }
      }, {
        required, message: requireRemindMessage || `请输入${label}`,
      }, ],
      initialValue: defaultValue
    })(
      <WrapComponent {...restConfig} />
    )
  )
}

// todo 提供Value,Onchange事件，validate接口
export function CustomItemWrapper (field) {

  const { component: CustomItem, ...rest } = field
  const { key } = rest
  const WrapCustomItem = BaseItem(field, optionsDecorator(CustomItem))
  return (props) => {
    const { form, formData } = props
    const onChange = (value) => {
      form.setFieldsValue({ [key]: value })
      form.validateFields([key])
    }

    const validate = () => {
      form.validateFields([key], (error, value) => {
        console.error('validate', error, value)
      })
    }
    const fieldValue = form.getFieldValue(key) // || {}
    const newPorps = {
      ...props,
      field: rest,
      onChange,
      validate,
      value: fieldValue,
      formData
    }
    return <WrapCustomItem {...newPorps} />
  }
}

// 提供对antd组件的包装功能，用于开发者自定义 field组件时对antd组件绑定Form.Item
/**
 * @deprecated
 * @param props
 * @returns {{children: ItemWrapper.props.children}}
 * @constructor
 */
export function ItemWrapper (props) {
  const { children } = props
  return ({ children })
}

class DefaultReadOnlyComponent extends React.Component {
  render () {
    return <span style={{ wordBreak: 'break-all' }} title={this.props.value}>{this.props.value}</span> || '--'
  }
}

// 只读模式下默认在value为空的时候显示无
export default function WrapItem (field, Component, readOnlyComponent = DefaultReadOnlyComponent) {
  if (readOnlyComponent === null || field.readOnly !== true) return BaseItem(field, Component)
  return BaseItem(field, watchDecorator(readOnlyComponent))
}


export function WrapTableItem (field, Component, readOnlyComponent = DefaultReadOnlyComponent) {
  if (readOnlyComponent === false || field.readOnly !== true) return TableItem(field, watchDecorator(Component))
  return TableItem(field, watchDecorator(readOnlyComponent))
}
