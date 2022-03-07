import React, { useContext, useEffect, useState } from 'react';
import { isFunction, isEqual, isArray, omit, isString, isEmpty } from '@/utils/utils'
import FormContext from '@/components/MobileForm/FormContext';

/**
 * 如果当前字段配置有options字段时，处理options请求
 *
 * @param Component
 * @returns {*}
 */
// 恶心渣渣的form.item , 必须要使用class组件，不然后报警告，只好用class包一层
export default function watchDecorator (Component){
  const WatchDecoratorComponent = CreateWatchDecoratorComponent(Component)
  return class extends React.Component{

    render (){
      return (
        <WatchDecoratorComponent {...this.props} />
      )
    }
  }
}

function CreateWatchDecoratorComponent ( Component){
  return (props) => {

    const isField = !props.field
    const field = props.field || props

    const { watcher } = field
    if (watcher){
      const { formData, setField, form } = useContext(FormContext)
      const [customProps, setCustomProps] = useState({})
      const [oldFormData, setFormData] = useState({})
      useEffect(() => {
        if (isEqual(oldFormData, formData)) return
        setFormData(formData)
        const { action, key } = watcher
        if (checkChangeValue(oldFormData, formData, key)){
          const _props = isField ? { field:props, formData, form, oldFormData } : { ...props, formData, oldFormData }
          executeActions(action, _props ).then(results => {
            if (!isEmpty(results)){
              const { field, ...rest } = results
              if (field) {
                setField(field)
              }
              setCustomProps(rest)
            }
          })
        }
      }, [formData])

      return <Component {...props} {...customProps} />
    }

    return (
      <Component {...props} />
    )
  }
}



async function executeActions (action, params){
  try {
    const result = await action(params)
    if (!result) return {}
    const key = params.field._key || params.field['data-__field'].name
    if (isString(result) || isArray(result)){
      setTimeout(params.form.setFieldsValue({ [key]:result }), 10)
      return {}
    }
    const { field } = result
    if (field){
      const _field = { ...params.field, ...field }
      result.field = { ...omit(_field, ['data-__field', 'data-__meta', 'onChange']), key }
    }
    return result
  } catch (e){
    console.error(e)
  }
  return []
}

function checkChangeValue (oldValues, newValues, key){
  let change = false
  if (!isEqual(oldValues[key], newValues[key])){
    change = true
  }
  return change
}


