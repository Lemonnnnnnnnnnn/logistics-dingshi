import React from 'react';
import optionsDecorator from './decorators/optionsDecrator'
import watchDecorator from '@/components/MobileForm/decorators/watchDecorator';
import { omit } from '@/utils/utils';

/**
 * baseItem根据字段配置生成一个被 Form.Item包裹的组件，这个组件只在表单初始化的时候生成,多次生成会造成重复渲染,页面抖动等问题
 *
 * @param field
 * @param Component
 * @returns {function(*=)}
 * @constructor
 */
const WrapItem = (field, Component) =>{
  const WrapComponent = watchDecorator(Component)
  const { label, validator, required, requireRemindMessage } = field
  // todo 过滤掉一些非原生使用的属性
  const _field = omit(field, ['refs', 'requiredAction', 'validator', 'display', '_required', 'modifiable', 'optionalLabel', 'isCustomField'])
  return (props) => {
    const { formData } = props
    const { form, FormContext } = props
    const { key, isCustomField } = field
    const decorator = form.getFieldProps(key, {
      rules: [{
        validator: async (rule, value, callback) => {
          if (validator) {
            const errorInfo = await validator({ field, rule, value, formData })
            return callback(errorInfo)
          }
          callback()
        }
      }, {
        required, message: requireRemindMessage || `请输入${label}`,
      }, ],

    })
    return isCustomField? <WrapComponent
      {...props}
      {...field}
      {...decorator}
      FormContext={FormContext}
    />: <WrapComponent {...decorator} {..._field} FormContext={FormContext} />
  }
}
export default WrapItem

// todo 提供Value,Onchange事件，validate接口
export function CustomItemWrapper (field) {
  const { component: CustomItem, ...rest } = field
  const { key } = rest
  const WrapCustomItem = WrapItem(field, optionsDecorator(CustomItem))
  return (props) => {
    const { form } = props
    const onChange = (value) => {
      form.setFieldsValue({ [key]: value })
      form.validateFields([key])
    }

    const validate = () => {
      form.validateFields([key], (error, value) => {
        console.error('validateFields', error, value)
      })
    }
    const fieldValue = form.getFieldValue(key) // || {}
    console.error('validate',rest, props)
    const newPorps = {
      ...props,
      field: rest,
      onChange,
      validate,
      value: fieldValue
    }
    return <WrapCustomItem {...newPorps} />
  }
}

