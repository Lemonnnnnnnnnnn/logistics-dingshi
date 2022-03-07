import React, { Component } from 'react';
import { FORM_MODE } from '@gem-mine/antd-schema-form';
import CarMange from './CarManage';

export default class ModifyCard extends Component{
  render (){
    return (
      <CarMange mode={FORM_MODE.MODIFY} {...this.props} />
    );
  }
}
