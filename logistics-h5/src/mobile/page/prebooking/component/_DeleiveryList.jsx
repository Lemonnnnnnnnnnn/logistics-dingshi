import React, { Component } from 'react';
import { SchemaForm, FORM_MODE, Item, FormButton, Observer } from '@gem-mine/mobile-schema-form';
import { List, WhiteSpace, Toast, Icon, Button } from 'antd-mobile'
import '@gem-mine/mobile-schema-form/src/fields'

class _DeleiveryList extends Component {

  constructor (props){
    super(props)
    this.deliverySchema = {
      deliveryId:{
        component: 'picker',
        rules:{
          required:[true, '请选择提货点']
        },
        label: '提货点',
        placeholder: '请选择提货点',
        options: () => {
          if (!this.props.field.deliveryItems) return []
          const delivery = this.props.field.deliveryItems.map(item => ({ key: item.deliveryId, value: item.deliveryId, label: item.deliveryName }))
          return delivery
        }
      },
      goodsId:{
        component: 'picker',
        label: '货品名称',
        rules:{
          required:[true, '请选择货品']
        },
        placeholder: '请选择货品',
        options: () => {
          if (!this.props.field.goodsItems) return []
          // 用来去重，一个提货点有多种货品，但一个货品只有一个提货点可提
          const data = (this.props.form.getFieldValue('deliveryItems') || []).map(item => item.goodsId)
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
        },
      }
    }
    this.setErrors = this.props.setErrors
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

  saveDeivery = (value) =>{
    const [prebookingObjectId] = value.deliveryId
    const { deliveryName } = this.props.field.deliveryItems.find(item => item.deliveryId === prebookingObjectId)
    const [goodsId] = value.goodsId
    const goods = this.props.field.goodsItems.find(item => item.goodsId === goodsId)
    const { goodsName, categoryName, deliveryUnit, deliveryUnitCN } = goods
    const { list } = this.state
    // 因为提交数据时使用prebookingObjectId字段表示提卸货点id，所以在数据处理时多存一个字段prebookingObjectId
    const newItem = {
      deliveryId: prebookingObjectId,
      prebookingObjectId,
      deliveryName,
      goodsId,
      categoryName,
      goodsName,
      goodsUnit: deliveryUnit,
      goodsUnitCN: deliveryUnitCN,
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

  render () {
    const { showForm, showAddButton, list=[] } = this.state
    return (
      <>
        {list.length > 0 && list.map((item, index) => {
          const { deliveryName, goodsId, goodsName, receivingNum, goodsUnitCN, categoryName } = item
          return (
            <List key={goodsId}>
              <List.Item extra={<Icon type='cross-circle' onClick={() => this.deleteDelivery(index)} />}><span style={{ fontSize: '17px', color: '#333333' }}>提货信息</span></List.Item>
              <List.Item extra={`${deliveryName}`}>提货点</List.Item>
              <List.Item arrow='horizontal' multipleLine>货品名称<List.Item.Brief>{`${categoryName}-${goodsName}`}</List.Item.Brief></List.Item>
              <List.Item extra={`${receivingNum}${goodsUnitCN}`}>计划重量</List.Item>
            </List>
          )
        })}
        {showForm && (
          <>
            <WhiteSpace size="lg" />
            <SchemaForm schema={this.deliverySchema} data={{}} mode={FORM_MODE.ADD} onChange={() => this.setErrors([])}>
              <Item field="deliveryId" />
              <Item field="goodsId" />
              <Item field="receivingNum" />
              <Button size="small" style={{ width: '50%', display: 'inline-block', borderRadius: '23.5px', marginTop: '10px' }} onClick={this.cancelAdd}>取消</Button>
              <FormButton onError={(errors) => { this.setErrors(errors) }} size="small" style={{ width: '50%', display: 'inline-block', borderRadius: '23.5px', marginTop: '10px' }} debounce type='primary' label="保存" onClick={this.saveDeivery} />
            </SchemaForm>
          </>
        )}
        {showAddButton &&
          <List.Item>
            <div
              style={{ width: '100%', color: '#108ee9', textAlign: 'center' }}
              onClick={this.showForm}
            >
              <Icon type="down" size='xxs' />增加提货点
            </div>
          </List.Item>
        }
      </>
    );
  }
}

export default _DeleiveryList;
