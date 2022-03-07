import React, { Component } from 'react';
import { Input, message } from 'antd';
import { lodashDebounce } from '@/utils/utils';
import { getExpressCompany } from '@/services/apiService';

export default class ExpressNoInput extends Component{
  state = {
    value: ''
  }

  constructor (props){
    super(props);
    this._getExpressCompany = lodashDebounce(this.getCompany, 1000);
  }

  getCompany = (value) => {
    if (!value.toString().trim()) {
      return message.error('请正确输入快递单号！');
    }
    const { writeExpressCompany } = this.props;
    getExpressCompany({ expressNo: value.toString().trim() }).then(data => {
      writeExpressCompany(data.expNameList[0]);
    })
      .catch((a) => {
        console.log(a);
      });
  }

  inputValue = (e) => {
    const { value } = e.target;
    this.setState({
      value
    });
    this.props.form.setFieldsValue({
      expressNo: value.toString().trim()
    });
    if (value.length > 6) {
      this._getExpressCompany(value);
    }
  }

  render () {
    const { value } = this.state;
    const { placeholder } = this.props;
    return (
      <>
        <Input onChange={this.inputValue} value={value} placeholder={placeholder} />
      </>
    );
  }
}
