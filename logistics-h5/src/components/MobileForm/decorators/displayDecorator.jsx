
// 时间相关装饰器，对时间格式进行转换
import React from 'react'

export default function displayDecorator (Component){
  return (props)=>{
    const _field = props.field || props
    if (_field._display ===false){
      return null
    }
    return <Component {...props.field} />
  }
}
