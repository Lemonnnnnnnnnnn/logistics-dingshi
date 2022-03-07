import React, { Component } from 'react';
import { Select } from 'antd';
import { isFunction, getOssImg } from '@/utils/utils';

const { Option } = Select;

class SelectWithPicture extends Component {

  state = {
    imgSrc:''
  }

  static getDerivedStateFromProps (props, state) {
    if (props.value) {
      const { url } = props.options.find(item => item.value === props.value) || {};
      const imgSrc = getOssImg(url);
      state.imgSrc = imgSrc;
      return state;
    }
    return state;
  }

  selectOnChange = (value) => {
    const { onChange } = this.props;
    isFunction(onChange) && onChange(value);
  }

  openImg = () => {
    const { imgSrc } = this.state;
    window.open(imgSrc);
  }

  render () {
    const { options=[], disabled, value='temp' } = this.props;
    const { imgSrc } = this.state;
    return (
      <div style={{ display:'flex', alignItems:'center' }}>
        <Select disabled={disabled} value={value} style={{ width: '200px' }} placeholder='请选择单据名称' onChange={this.selectOnChange}>
          {options.map(item => <Option value={item.value} key={item.value}>{item.label}</Option>)}
        </Select>
        <img alt='' onClick={this.openImg} style={{ width:'200px', marginLeft:'30px' }} src={imgSrc} />
      </div>
    );
  }
}

export default SelectWithPicture;
