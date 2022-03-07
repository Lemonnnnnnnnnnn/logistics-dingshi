import React from 'react'
import { List, WhiteSpace, Toast, Icon } from 'antd-mobile'
import MobileForm, { FORM_MODE, FormItem, FormButton } from '@/components/MobileForm';

export default class DeliveryItems extends React.Component {

  schema = {
    fields: [
      {
        key: 'deliveryId',
        component: 'picker',
        required: true,
        label: '提货点',
        placeholder: '请选择提货点',
        options: () => {
          if (!this.props.options.deliveryItems) return []
          const delivery = this.props.options.deliveryItems.map(item => ({ key: item.deliveryId, value: item.deliveryId, label: item.deliveryName }))
          return delivery
        }
      },
      {
        key: 'goodsId',
        component: 'picker',
        label: '货品名称',
        required: true,
        placeholder: '请选择货品',
        options: () => {
          if (!this.props.options.goodsItems) return []
          // 用来去重，一个提货点有多种货品，但一个货品只有一个提货点可提
          const data = (this.props.form.getFieldValue('deliveryItems') || []).map(item => item.goodsId)
          const goods = this.props.options.goodsItems.filter(item => {
            const check = data.indexOf(item.goodsId)
            return check < 0
          })
          const goodsOptions = goods.map(item => ({ key: item.goodsId, value: item.goodsId, label: `${item.categoryName}-${item.goodsName}` }))
          return goodsOptions
        }
      },
      {
        key: 'receivingNum',
        label: '计划重量',
        component: 'input',
        // 数量正则校验
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
    ],
    operations: [{
      label: '取消',
      type: 'default',
      action: 'cancel',
      inline: true,
      size: 'small',
      className: 'mr-10',
      onClick: () => {
        this.setState({
          showForm: false,
          showAddButton: true
        })
      }
    }, {
      label: '保存',
      type: 'primary',
      action: 'submit',
      inline: true,
      size: 'small',
      onClick: (formData) => {
        const [prebookingObjectId] = formData.deliveryId
        const { deliveryName } = this.props.options.deliveryItems.find(item => item.deliveryId === prebookingObjectId)
        const [goodsId] = formData.goodsId
        const goods = this.props.options.goodsItems.find(item => item.goodsId === goodsId)
        const goodsName = `${goods.goodsName}`
        const categoryName = `${goods.categoryName}`
        const { list } = this.state
        const newItem = {
          deliveryId: prebookingObjectId,
          prebookingObjectId,
          deliveryName,
          goodsId,
          categoryName,
          goodsName,
          goodsUnit: goods.deliveryUnit,
          goodsUnitCN: goods.deliveryUnitCN,
          receivingNum: (+formData.receivingNum)
        }
        const result = [...list, newItem]
        this.props.onChange(result)
        this.setState({
          list: result,
          showForm: false,
          showAddButton: true
        })
      }
    }]
  }

  constructor (props) {
    super(props)
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

  componentWillReceiveProps (nextprops) {
    if (this.props.value !== nextprops.value) {
      this.setState({ list: nextprops.value, showForm: false, showAddButton: true })
    }
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

  deleteDelivery = index => {
    const { list } = this.state
    list.splice(index, 1)
    this.props.onChange(list)
    this.setState({
      list
    })
  }

  render () {
    return (
      <>
        {this.state.list.length > 0 && this.state.list.map((item, index) => {
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
        {this.state.showForm && (
          <>
            <WhiteSpace size="lg" />
            <MobileForm schema={this.schema} mode={FORM_MODE.ADD}>
              <FormItem fields='deliveryId' />
              <FormItem fields='goodsId' />
              <FormItem fields='receivingNum' />
              <div style={{ fontSize: 0, padding: '5px 10px' }} className="textRight ">
                <FormButton debounce action='cancel' />
                <FormButton debounce action='submit' />
              </div>
            </MobileForm>
          </>
        )}
        {this.state.showAddButton &&
          <List.Item>
            <div
              style={{ width: '100%', color: '#108ee9', textAlign: 'center' }}
              onClick={this.showForm}
            >
              <Icon type="down" size='xxs' />增加提货点
            </div>
          </List.Item>}

      </>
    )
  }

}
