import React, { Component } from 'react';
import { List, WhiteSpace, Toast, Icon, Button } from 'antd-mobile'
import { SchemaForm, FORM_MODE, Item, FormButton, ErrorNoticeBar } from '@gem-mine/mobile-schema-form';
import '@gem-mine/mobile-schema-form/src/fields'


class _ReceivingList extends Component {

  constructor (props){
    super(props)
    this.setErrors = this.props.setErrors
    this.receivingSchema = {
      receivingId:{
        component: 'picker',
        rules:{
          required:[true, '请选择卸货点']
        },
        label: '卸货点',
        placeholder: '请选择卸货点',
        options: () => {
          if (!this.props.field.receivingItems) return []
          const receiving = this.props.field.receivingItems.map(item => ({ key: item.receivingId, value: item.receivingId, label: item.receivingName }))
          return receiving
        }
      },
      goodsId:{
        component: 'picker',
        rules:{
          required:[true, '请选择货品']
        },
        label: '货品名称',
        placeholder: '请选择货品',
        options: () => {
          if (!this.props.field.goodsItems) return []
          // 用来去重，一个卸货点有多种货品，但一个货品只有一个卸货点可卸
          const data = (this.props.form.getFieldValue('receivingItems') || []).map(item => item.goodsId)
          const goods = this.props.field.goodsItems.filter(item => {
            const check = data.indexOf(item.goodsId)
            return check < 0
          })
          const goodsOptions = goods.map(item => ({ key: item.goodsId, value: item.goodsId, label: `${item.categoryName}-${item.goodsName}` }))
          return goodsOptions
        }
      },
      receivingNum:{
        label: '计划重量',
        component: 'inputItem',
        rules:{
          validator: ({ value }) => {
            const reg = /^\d+(\.\d+)?$/
            if (+value === 0) {
              return '计划重量不能为0'
            }
            if (!reg.test(value)) {
              return '请输入正确的重量'
            }
          }
        }
      }
    }

    if (props.value && props.value.length > 0) {
      this.state = {
        list: props.value,
        showForm: false,
        showAddButton: true
      }
    } else {
      this.state = {
        list: [],
        showForm: false,
        showAddButton: true
      }
    }
  }

  cancelAdd = () =>{
    this.setState({
      showForm: false,
      showAddButton: true
    })
  }

  deleteDelivery = index => {
    const { list } = this.state
    list.splice(index, 1)
    this.props.onChange(list)
    this.setState({
      list
    })
  }

  saveReceiving = (value) => {
    const [prebookingObjectId] = value.receivingId
    const { receivingName } = this.props.field.receivingItems.find(item => item.receivingId === prebookingObjectId)
    const [goodsId] = value.goodsId
    const goods = this.props.field.goodsItems.find(item => item.goodsId === goodsId)
    const { goodsName, categoryName, receivingUnit, receivingUnitCN } = goods
    const { list } = this.state
    const newItem = {
      receivingId: prebookingObjectId,
      prebookingObjectId,
      receivingName,
      goodsId,
      goodsName,
      categoryName,
      goodsUnit: receivingUnit,
      goodsUnitCN: receivingUnitCN,
      receivingNum: (+value.receivingNum)
    }
    const result = [...list, newItem]
    this.props.onChange(result)
    this.setState({
      list: result,
      showForm: false,
      showAddButton: true
    })
  }

  showForm = () => {
    if (!this.props.formData.projectId || this.props.formData.projectId.length === 0) {
      Toast.fail('您还未选择合同！', 2);
      return
    }
    this.setState({
      showForm: true,
      showAddButton: false
    })
  }

  deleteReceiving = index => {
    const { list } = this.state
    list.splice(index, 1)
    this.props.onChange(list)
    this.setState({
      list
    })
  }

  render () {
    const { showForm, showAddButton, list=[] } = this.state
    return (
      <>
        {list.length > 0 && list.map((item, index) => {
          const { receivingName, goodsId, goodsName, receivingNum, goodsUnitCN, categoryName } = item
          return (
            <List key={goodsId}>
              <List.Item extra={<Icon type='cross-circle' onClick={() => this.deleteReceiving(index)} />}><span style={{ fontSize: '17px', color: '#333333' }}>卸货信息</span></List.Item>
              <List.Item extra={`${receivingName}`}>卸货点</List.Item>
              <List.Item arrow='horizontal' multipleLine>货品名称<List.Item.Brief>{`${categoryName}-${goodsName}`}</List.Item.Brief></List.Item>
              <List.Item extra={`${receivingNum}${goodsUnitCN}`}>计划重量</List.Item>
            </List>
          )
        })}
        {showForm&&
        <>
          <WhiteSpace size="lg" />
          <SchemaForm schema={this.receivingSchema} mode={FORM_MODE.ADD} onChange={() => this.setErrors([])}>
            <Item field="receivingId" />
            <Item field="goodsId" />
            <Item field="receivingNum" />
            <Button size="small" style={{ width: '50%', display: 'inline-block', borderRadius: '23.5px', marginTop: '10px' }} onClick={this.cancelAdd}>取消</Button>
            <FormButton onError={(errors) => { this.setErrors(errors) }} size="small" style={{ width: '50%', display: 'inline-block', borderRadius: '23.5px', marginTop: '10px' }} debounce type='primary' label="保存" onClick={this.saveReceiving} />
          </SchemaForm>
        </>}
        {showAddButton &&
          <List.Item>
            <div
              style={{ width: '100%', color: '#108ee9', textAlign: 'center' }}
              onClick={this.showForm}
            >
              <Icon type="down" size='xxs' />增加卸货点
            </div>
          </List.Item>}
      </>
    );
  }
}

export default _ReceivingList;
