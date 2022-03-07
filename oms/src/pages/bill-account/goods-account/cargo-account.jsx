import React, { Component } from 'react';
import GoodsAccountList from './account-list';

// 托运对账列表
export default class CargoGoodsAccountList extends Component{
  render () {
    return (
      <GoodsAccountList menuType='launchAccount' />
    );
  }
}
