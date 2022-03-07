import React, { Component } from 'react';
import { FORM_MODE } from '@gem-mine/antd-schema-form';
import CarManage from './car-manage';

export default class AddCard extends Component{
  render (){
    return (
      <CarManage mode={FORM_MODE.ADD} {...this.props} />
    );
  }
}
