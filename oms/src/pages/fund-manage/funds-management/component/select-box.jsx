import React, { Component } from 'react';
import { Button } from 'antd';
import { isFunction } from '../../../../utils/utils';

class SelectBox extends Component {

  valueChange = (e) => {
    const optionValue= e.target.getAttribute('optionValue');
    const { onChange } = this.props;
    isFunction(onChange) && onChange(optionValue);
  }

  renderButton = () => {
    const { options=[], value } = this.props;
    const buttonList = options.map(item => (
      <li key={item.key}>
        <Button disabled={item.disabled} type={`${value}` === `${item.value}`? 'primary': 'default'} optionValue={item.value} onClick={this.valueChange}>{item.label}</Button>
      </li>
    ));
    return buttonList;
  }

  render () {
    return (
      <ul>
        {this.renderButton()}
      </ul>
    );
  }
}

export default SelectBox;
