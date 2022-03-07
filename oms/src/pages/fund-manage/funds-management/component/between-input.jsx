import React, { Component } from 'react';
import { InputNumber, Input } from 'antd';
import { isFunction } from '../../../../utils/utils';

const InputGroup = Input.Group;

class BetweenInput extends Component {

  // constructor (props){
  //   super(props)
  //   const { defaultValue:[min, max] } = props
  //   this.state = {

  //   }
  // }

  minChange = (value) => {
    // const { value } = e.target
    const { onChange, value:formValue } = this.props;
    isFunction(onChange) && onChange([value, formValue?.[1]]);
  }

  maxChange = (value) => {
    // const { value } = e.target
    const { onChange, value:formValue } = this.props;
    isFunction(onChange) && onChange([formValue?.[0], value]);
  }

  render () {
    const { placeholder:[minPlaceholder='Minimum', maxPlaceholder='Maximum'], value=[] } = this.props;
    return (
      <InputGroup className='money_between_input' compact>
        <InputNumber onChange={this.minChange} value={value[0]} style={{ width: '40%' }} placeholder={minPlaceholder} />
        <Input
          style={{
            width: '20%',
            borderLeft: 0,
            pointerEvents: 'none',
            backgroundColor: '#fff',
          }}
          placeholder="~"
          disabled
        />
        <InputNumber onChange={this.maxChange} value={value[1]} style={{ width: '40%', textAlign: 'center', borderLeft: 0 }} placeholder={maxPlaceholder} />
      </InputGroup>
    );
  }
}

export default BetweenInput;
