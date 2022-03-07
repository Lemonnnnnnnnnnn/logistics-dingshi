
import React, { useContext, useEffect, useState } from 'react';
import { forEach, isFunction, isString } from '@/utils/utils'
import FormContext from './FormContext'
import { CustomItemWrapper } from './ItemWrap'

const fieldType = {}

function getComponent (type) {
  const Creator = fieldType[type]
  if (!Creator) return `没有找到[{type}]对应的组件`
  return Creator.Component
}

export function formatValue (type, value) {
  if (!value || !type || !isString(type)) return value
  const Creator = fieldType[type]
  if (!Creator) return `没有找到[{type}]对应的组件`
  return Creator.formatValue ? Creator.formatValue(value) : value
}

/**
 * 注册 formItem组件
 * @param type   类型
 * @param WrappedComponent 包装过的FormItem
 */
export function registerComponent (type, WrappedComponent) {
  if (isFunction(WrappedComponent)) {
    fieldType[type] = { Component: WrappedComponent }
  } else {
    fieldType[type] = WrappedComponent
  }
}

// 创建 itemField组件
function ItemCreator (field) {
  const { component } = field
  if (isString(component)) {
    const Component = getComponent(component)
    return Component(field)
  } if (isFunction(component)) {
    // 用户自定义组件
    return CustomItemWrapper(field)
  }
}

/**
 * todo 多字段显示与单字段显示在布局上有差异
 *
 * @param props
 * @returns {Array}
 * @constructor
 */
export function FormItem (props) {
  const [Items, setItems] = useState()
  const { form, normalizeSchema, formData } = useContext(FormContext)
  const { fields, ...restProps } = props
  const _props = {
    ...restProps,
    form,
    normalizeSchema,
    formData
  }
  useEffect(() => {
    // 如果存在fields ，则只渲染对应字段
    const { fields: schemaFields } = normalizeSchema
    let showFields = schemaFields
    if (fields) {
      const customFields = isString(fields) ? [fields] : fields
      showFields = schemaFields.filter(field => customFields.indexOf(field.key) !== -1)
    }
    const _items = []
    forEach(showFields, field => {
      const Item = ItemCreator(field)
      Item._key = field.key
      // Item._colSpan = field.colSpan
      _items.push({
        field,
        Item,
      })
    })
    setItems(_items)
  }, [fields])

  const formItems = []
  let hasChange = false
  forEach(Items, ({ field, Item }) => {
    const { display, requiredAction } = field
    if (display && display(_props) === false) return false
    if (isFunction(requiredAction)) {

      const _required = requiredAction(_props)
      if (field._required !== _required) {
        if (isString(_required)) {
          field.requireRemindMessage = _required
        } else {
          field.required = !!_required
        }
        hasChange = true
      } else {
        // form.setFields({[field.key]:{errors:''}})
      }
      field._required = _required
    } else {
      field._required = field.required
    }

    const ItemElement = Item  // isFunction(Item) ? Item : CustomItemWrapper(Item)
    // formItems.push(<Col span={Item._colSpan || 24}><ItemElement key={Item._key} {...restProps} form={form} normalizeSchema={normalizeSchema} formData={formData} /></Col>)
    formItems.push(<ItemElement key={Item._key} {...restProps} form={form} normalizeSchema={normalizeSchema} formData={formData} />)
  })

  if (hasChange) {
    const _items = []
    forEach(Items, ({ field }) => {
      console.info('hasChange field', field)
      const Item = ItemCreator(field)
      Item._key = field.key
      // Item._colSpan = field.colSpan
      _items.push({
        field,
        Item,
      })
    })
    setItems(_items)
  }


  return formItems
}
