import React, { Component } from 'react';
import { FORM_MODE } from '@gem-mine/antd-schema-form';
import CarMange from './CarManage';

export default class CarDetail extends Component{
  render (){
    return (
      <CarMange mode={FORM_MODE.DETAIL} {...this.props} />
    );
  }
}
