import React, { Component } from 'react';
import { Input, Select, Icon, message } from "antd"
import { connect } from 'dva'
import { isFunction } from '@/utils/utils'
import { countRemainWeight } from '@/services/prebooking'

const InputGroup = Input.Group;

function _mapStateToProps (state) {
  return {
    data: state.preBooking.entity
  }
}

@connect(_mapStateToProps, null)
class DispatchField extends Component {

  constructor (props){
    super(props)
    this.state = {
      list:[{ key:'temp', goodsId:props.data.deliveryItems[0].goodsId, goodsUnitCN:props.data.deliveryItems[0].goodsUnitCN }]
    }
  }

  onGoodsChange = (value, key) => {
    const { list } = this.state
    const { onChange, data:{ deliveryItems } } = this.props
    const newList = list.map(item => {
      let newItem = item
      if (newItem.key === key) {
        const { goodsUnitCN } = deliveryItems.find(({ goodsId }) => goodsId === value) || {}
        newItem = { ...newItem, goodsId:value, goodsUnitCN }
      }
      return newItem
    })
    this.setState({
      list:newList
    })
    isFunction(onChange) && onChange(newList)
  }

  onNumChange = (value, key) => {
    const { list } = this.state
    const { onChange } = this.props
    const newList = list.map(item => {
      let newItem = item
      if (newItem.key === key) {
        newItem = { ...newItem, goodsNum:(value === ''?value :+value) }
      }
      return newItem
    })
    this.setState({
      list:newList
    })
    isFunction(onChange) && onChange(newList)
  }

  renderGoodsInputGroup = ({ key, goodsId, goodsNum, goodsUnitCN }) => {
    const { data:{ deliveryItems }, name } = this.props
    const goodsOptions = deliveryItems.map(item => (
      <Select.Option key={item.goodsId} title={`${item.categoryName}${item.goodsName}`} value={item.goodsId}>{`${item.categoryName}${item.goodsName}`}</Select.Option>
    ))
    return (
      <div key={key}>
        <InputGroup compact>
          <Select onChange={value => this.onGoodsChange(value, key)} defaultValue={goodsId} style={{ width: '40%' }}>
            {goodsOptions}
          </Select>
          <Input type="number" addonAfter={goodsUnitCN} min={0} goodsid={goodsId} className={`_${name}`} value={goodsNum} onChange={e => this.onNumChange(e.target.value, key)} style={{ width: '45%' }} />
          <div onClick={() => this.deleteGoodsRows(key)} style={{ display: 'inline-block', lineHeight:'32px', height:'32px', marginLeft:'10px' }}>
            <Icon theme="twoTone" type="minus-circle" />
            <span>删除货物</span>
          </div>
        </InputGroup>
      </div>
    )
  }

  renderGoodsList = () => {
    const { list } = this.state
    return (
      list.map(item => this.renderGoodsInputGroup(item))
    )
  }

  addGoodsRows = () => {
    const { list } = this.state
    const { data:{ deliveryItems }, onChange } = this.props
    if (list.length === (deliveryItems || []).length) return message.warn('无法继续添加')
    const newList = [...list, { key:Math.random(), goodsId:deliveryItems[0].goodsId, goodsUnitCN:deliveryItems[0].goodsUnitCN }]
    this.setState({
      list:newList
    })
    isFunction(onChange) && onChange(newList)
  }

  deleteGoodsRows = key => {
    const { list } = this.state
    const { onChange } = this.props
    if (list.length <= 1) return message.warn('已经是最后一条了')
    const newList = list.filter(item => item.key !== key)
    this.setState({
      list:newList
    })
    isFunction(onChange) && onChange(newList)
  }

  allNumFill = () => {
    const { data:{ deliveryItems, transportItems }, name, onChange } = this.props
    const { list } = this.state
    const inputArray = document.querySelectorAll(`._${name} input`)
    const remainWeights = countRemainWeight(deliveryItems, transportItems)
    const _list = JSON.parse(JSON.stringify(list))
    inputArray.forEach(input => {
      const domGoodsId = input.getAttribute('goodsid')
      const listIndex = _list.findIndex(item => `${item.goodsId}` === domGoodsId)
      // debugger
      const { remainingNum } = remainWeights.find(item => `${item.goodsId}`===domGoodsId )
      _list[listIndex].goodsNum = remainingNum
      input.value = `${remainingNum}`
    });
    this.setState({
      list:_list
    })
    isFunction(onChange) && onChange(_list)
  }

  render () {
    const { selfSupport = false, onlySelfSupport } = this.props
    return (
      <>
        {onlySelfSupport?
          <div>
            如需使用网络货运功能请先将项目与运输合同关联
          </div> :
          <div>
            {this.renderGoodsList()}
            <div style={{ display: 'inline-block', width: '90px' }} onClick={this.addGoodsRows}>
              <Icon theme="twoTone" type="plus-circle" />
              <span>添加货物</span>
            </div>
            {selfSupport &&
              <div style={{ display: 'inline-block', width: '75px' }} onClick={this.allNumFill}>
                <span style={{ textDecoration: 'underline', color: '#40a9ff' }}>全部自营</span>
              </div>
            }
          </div>
        }
      </>
    );
  }
}

export default DispatchField;
