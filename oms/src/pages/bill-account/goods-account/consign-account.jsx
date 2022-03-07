import React, { Component } from 'react';
import GoodsAccountList from './account-list';

// 货权对托运审核货品对账列表
export default class CargoGoodsAccountList extends Component{
  render () {
    return (
      <GoodsAccountList menuType='judgeAccount' />
    );
  }
}
