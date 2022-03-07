
// 时间相关装饰器，对时间格式进行转换
import React from 'react'
import moment from 'moment'

const defaultShowFormat = 'YYYY-MM-DD'
export default function momentDecorator (Component){
  return (props)=>{
    // 如果没有value 和 defaultValue，则显示当前时间
    const { value, format, defaultValue } = props
    if (props.readOnly===true){
      return value ? moment(value).format(format || defaultShowFormat) : '无'
    }
    let momentTime = moment(value || defaultValue)
    if (!defaultValue && !value){
      momentTime = moment()
    }
    console.info('momentDecorator', props.field)
    return <Component {...props.field} />
  }
}
