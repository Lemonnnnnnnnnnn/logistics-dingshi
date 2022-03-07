import React, { Component } from 'react';
import ForgetPassword from '@/weappDriver/pages/forgetPassword'

class Registry extends Component {
  render () {
    return (
      <ForgetPassword title='注册' type='registry' smsType='SMS_152857205' />
    );
  }
}

export default Registry;
