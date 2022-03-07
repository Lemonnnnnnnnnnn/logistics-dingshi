import React, { Component } from 'react';
import { Input, Select } from "antd"
import { isFunction } from '@/utils/utils'

const InputGroup = Input.Group;

const priceOptions = [
  {
    key:1,
    value:1,
    label:'元/吨'
  }, {
    key:2,
    value:2,
    label:'吨/公里'
  }, {
    key:3,
    value:3,
    label:'一口价'
  }
]

class DeliveryField extends Component {

  state = {
    fieldValue:{
      priceType:1,
      price:0
    }
  }

  onPriceTypeChange = priceType => {
    const { fieldValue } = this.state
    const { onChange } = this.props
    this.setState({
      fieldValue:{ ...fieldValue, priceType }
    })
    isFunction(onChange) && onChange({ ...fieldValue, priceType })
  }

  onNumChange = (price = 0) => {
    const { fieldValue } = this.state
    const { onChange } = this.props
    this.setState({
      fieldValue:{ ...fieldValue, price }
    })
    isFunction(onChange) && onChange({ ...fieldValue, price })
  }

  renderDeliveryInputGroup = () => {
    // debugger
    const { placeholder } = this.props
    const priceTypes = priceOptions.map(item => (
      <Select.Option key={item.key} title={item.label} value={item.value}>{item.label}</Select.Option>
    ))
    return (
      <div>
        <InputGroup compact>
          <Input type="number" placeholder={placeholder} onChange={e => this.onNumChange(e.target.value)} style={{ width: '150px' }} />
          <Select onChange={this.onPriceTypeChange} defaultValue={1} style={{ width: '100px' }}>
            {priceTypes}
          </Select>
        </InputGroup>
      </div>
    )
  }

  render () {
    return (
      <>
        {this.renderDeliveryInputGroup()}
      </>
    );
  }
}

export default DeliveryField;
