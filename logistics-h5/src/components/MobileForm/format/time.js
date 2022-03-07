import { isString } from '@/utils/utils'

const formatField = ['calender']

export default function timeFormat (fields, values){
  fields.forEach(({ key, component }) =>{
    if (isString(component) && formatField.indexOf(component)!==-1){
      const _value = values[key]
      if (_value) values[key] = _value
    }
  })

  return values
}
