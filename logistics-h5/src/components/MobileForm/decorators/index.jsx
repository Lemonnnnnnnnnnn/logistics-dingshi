import React, { useContext } from 'react'
import FormContext from '@/components/Form/FormContext';

const decorators = [
  // optionsDecorator,
  mainDecorator
]


/**
 * 主装饰器，增加formData, field 等基本数据
 *
 * @param Component
 * @param field
 * @returns {Function}
 */
function mainDecorator (Component, field){
  return (props)=>{

    const { formData } = useContext(FormContext)
    return <Component {...props} field={field} formData={formData} />
  }
}

// 为控件增加decorator
export default function addDecorators (field, Compoent){
  return decorators.reduce((Compoent, decorator)=>decorator(Compoent, field), Compoent)
}
