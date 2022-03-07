import React from 'react'
import { Picker, List } from 'antd-mobile'

export default class ReceivingPicker extends React.Component{
  render (){
    const { options=[], disabled=false, value, placeholder='', field:{ key }, label, formData:{ deliveryItems } } = this.props
    const arrow =disabled ? '':'horizontal'
    return (
      <Picker data={options} disabled={disabled} value={deliveryItems&&deliveryItems.length>0?value:[]} cols={1} extra={placeholder}>
        <List.Item key={key} arrow={arrow}>{label}</List.Item>
      </Picker>
    )
  }
}
