import React from 'react'
import moment from 'moment';
import Calender from '../components/Calendar'
import WrapItem from '../ItemWrap'
import { registerComponent } from '../Item'
import { ItemType } from '@/components/Form/constants';
import { isString } from '@/utils/utils';

const Component = function CalenderCreator (field, type=ItemType.FORM){
  const _field = {
    format:'YYYY-MM-DD',
    ...field,
    arrow:field.disabled ? '':'horizontal'
  }
  return WrapItem(_field, Calender)
}

function formatValue (value){
  if (isString(value)){
    return moment(value)
  }
  if (value instanceof moment){
    return value
  }
  return null
}


registerComponent('calender', {
  Component
})



export default Component
