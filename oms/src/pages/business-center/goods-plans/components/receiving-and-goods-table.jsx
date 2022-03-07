import React, { Component } from 'react';
import { Table } from 'antd';
import { connect } from 'dva';
import { DICTIONARY_TYPE } from '../../../../services/dictionaryService';
import dictionariesModel from '../../../../models/dictionaries';

function mapStateToProps (state) {
  return {
    goodsUnits: state.dictionaries.items
  };
}
const { getDictionaries } = dictionariesModel.actions;

@connect(mapStateToProps, { getDictionaries })
export default class ReceivingAndGoodsTable extends Component{

  componentDidMount () {
    this.props.getDictionaries(DICTIONARY_TYPE.GOOD_UNIT);
  }

  columns=[
    {
      title: '卸货点',
      dataIndex: 'receivingName'
    },
    {
      title: '卸货地址',
      dataIndex: 'receivingAddress'
    },
    {
      title: '联系人',
      dataIndex: 'contactName'
    },
    {
      title: '电话',
      dataIndex: 'contactPhone'
    },
    {
      title: '货品名称',
      dataIndex: 'goodsName'
    },
    {
      title: '规格型号',
      dataIndex: 'specificationType'
    },
    {
      title: '包装',
      dataIndex: 'packagingMethod',
      render:text=>{
        if (text === 1) return '袋装';
        if (text === 2) return '散装';
        return '--';
      }
    },
    {
      title: '数量',
      dataIndex: 'goodsNum'
    },
    {
      title: '单位',
      dataIndex: 'goodsUnit'
    }
  ]

  getUnit = (dictionaryCode)=>{
    const { goodsUnits } = this.props;
    return goodsUnits.filter(item=>+item.dictionaryCode === dictionaryCode)[0]?.dictionaryName || dictionaryCode;
  }

  render (){
    const { value: data=[] } = this.props;
    const newData = data.map(item=>{
      item.goodsUnit = this.getUnit(item.goodsUnit);
      return item;
    });
    if (!data) return <></>;
    return <Table rowKey="goodsCorrelationId" columns={this.columns} dataSource={newData} pagination={false} />;
  }
}
