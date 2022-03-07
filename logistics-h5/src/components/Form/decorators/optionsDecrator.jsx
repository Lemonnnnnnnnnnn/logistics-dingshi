import React, { useContext, useEffect, useState } from 'react';
import { isEqual } from '@/utils/utils'
import FormContext from '@/components/Form/FormContext';

/**
 * 如果当前字段配置有options字段时，处理options请求
 *
 * @param Component
 * @returns {*}
 */
// 恶心渣渣的form.item , 必须要使用class组件，不然后报警告，只好用class包一层
export default function optionsDecorator (Component){
  const OptionsDecoratorComponent = CreateOptionsDecoratorComponent(Component)
  return class extends React.Component{
    render (){
      return (
        <OptionsDecoratorComponent {...this.props} />
      )
    }
  }
}

function CreateOptionsDecoratorComponent (Component){
  return (props) => {
    const field = props.field || props
    const { optionConfig } = field
    if (optionConfig){
      const { watch, action } = optionConfig
      const { formData } = useContext(FormContext)
      const [options, setOptions] = useState([])
      const [oldFormData, setFormData] = useState()
      useEffect(() => {
        if (watch) {
          if (checkChangeValue(oldFormData, formData, watch)) {
            executeAction(action, formData).then(showOptions => setOptions(showOptions))
          }
          setFormData(formData)
        } else if (!oldFormData) {
          executeAction(action, formData ).then(showOptions => setOptions(showOptions))
          setFormData(formData)
        }
      }, [formData])
      const _field = {
        ...field,
        options
      }
      if (props.field){
        return (
          <Component {...props} field={_field} options={options} />
        )
      }
      return <Component {..._field} />
    }
    return (
      <Component {...props} />
    )
  }
}



async function executeAction (action, params){
  try {
    return await action(params)
  } catch (e){
    console.error(e)
  }
  return []
}

function checkChangeValue (oldValues = [], newValues, watchItems){
  let change = false
  watchItems.forEach(key=>{
    if (!isEqual(oldValues[key], newValues[key])){
      change = true
    }
  })
  return change
}


