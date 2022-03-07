import React from 'react'
import { List, Icon } from 'antd-mobile'
import { connect } from 'dva'
import MobileForm, { FORM_MODE, FormItem, FormButton } from '@/components/MobileForm';

function mapStateToProps (state) {
  return {
    deliveryItems: state.preBooking.entity.deliveryItems,
    receivingItems: state.preBooking.entity.receivingItems,
  }
}

@connect(mapStateToProps, {})
export default class DeliveryItems extends React.Component {

  schema = {
    fields: [
      {
        key: 'goodsId',
        component: 'picker',
        label: '提货信息',
        required: true,
        placeholder: ' ',
        options: () => {
          const data = (this.props.form.getFieldValue('deliveryItems') || []).map(item => item.goodsId)
          let deliveryItems = [...this.props.deliveryItems]
          if (data.length>0){
            const { goodsId } = this.props.form.getFieldValue('deliveryItems')[0]
            const { receivingId } = this.props.receivingItems.find(item=>item.goodsId===goodsId)
            const deliveryGoodsId = this.props.receivingItems.filter(item=>item.receivingId===receivingId).map(item => item.goodsId)
            deliveryItems = deliveryItems.filter(item=>{
              const index = deliveryGoodsId.indexOf(item.goodsId)
              return index >= 0
            })
          }
          const options = deliveryItems.filter(item => {
            const check = data.indexOf(item.goodsId)
            return check < 0
          })
          return options.map(item => ({ key: item.goodsId, value: item.goodsId, label: `${item.deliveryName}-${item.categoryName}-${item.goodsName}` }))
        }
      },
      {
        key: 'goodsNum',
        label: '计划重量',
        component: 'input',
        placeholder: ' ',
        style: { textAlign: 'right' },
        validator: ({ value }) => {
          if (!value) {
            return '请输入计划重量'
          }
          if (value){
            const reg = /^\d+(\.\d+)?$/
            if (+value === 0) return '计划重量不能为0'
            if (!reg.test(value)) return '输入计划重量有误'
          }
        }
      },
      {
        key: 'freightPrice',
        label: '运价(可选)',
        component: 'input',
        placeholder: ' ',
        style: { textAlign: 'right' },
        validator: ({ value }) => {
          if (value){
            const reg = /^\d+(\.\d+)?$/
            if (!reg.test(value)) return '输入运价有误'
          }
        }
      }
    ],
    operations: [{
      label: '保存',
      type: 'primary',
      action: 'submit',
      size: 'small',
      inline: true,
      onClick: (formData) => {
        const { goodsNum, freightPrice, goodsId: [goodsId] } = formData
        const delivery = this.props.deliveryItems.find(item => item.goodsId === goodsId)
        const newItem = {
          ...delivery,
          correlationObjectId: delivery.deliveryId,
          receivingUnit: delivery.goodsUnit,
          goodsNum: (+goodsNum),
          freightPrice: +(freightPrice || 0),
        }
        const { value: list = [] } = this.props
        const result = [...list, newItem]

        this.props.onChange(result)
        this.setState({
          // list: result,
          showForm: false,
          showAddButton: true
        })
      }
    }, {
      label: '取消',
      type: 'default',
      action: 'cancel',
      className: 'mr-10',
      size: 'small',
      inline: true,
      onClick: () => {
        this.setState({
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
        // list: props.value,
        showForm: false,
        showAddButton: true
      }
    } else {
      this.state = {
        // list: [],
        showForm: false,
        showAddButton: true
      }
    }
  }

  showForm = () => {
    this.setState({
      showForm: true,
      showAddButton: false
    })
  }


  deleteDelivery = index => {
    const { value: list = [] } = this.props
    list.splice(index, 1)
    this.props.onChange([...list])
    this.setState({
      list:[...list]
    })
  }

  render () {
    const { value: list = [] } = this.props
    const { showForm, showAddButton } = this.state

    return (
      <>
        {list.length > 0 && list.map((item, index) => {
          const { projectCorrelationId, deliveryName, deliveryAddress, contactName, contactPhone, categoryName, goodsName, goodsNum, goodsUnitCN, freightPrice, isPicked=false } = item
          return (
            <List key={projectCorrelationId}>
              <List.Item extra={isPicked?<span style={{ color:'gray', fontSize:'13px' }}>已提货</span>:<Icon type='cross-circle' onClick={() => this.deleteDelivery(index)} />}><span style={{ fontSize: '17px', color: '#333333' }}>提货点</span></List.Item>
              <List.Item align="top">提货信息
                <List.Item.Brief>
                  <div>{`${deliveryName}-${categoryName}-${goodsName}`}</div>
                  <div>{`联系人：${contactName} 联系人电话：${contactPhone}`}</div>
                  <div>{`提货地址：${deliveryAddress}`}</div>
                </List.Item.Brief>
              </List.Item>
              <List.Item extra={`${goodsNum}${goodsUnitCN}`}>计划重量</List.Item>
              <List.Item extra={freightPrice ? `${freightPrice}元` : '待商定'}>运价</List.Item>
            </List>
          )
        })}
        {showForm && (
          <MobileForm schema={this.schema} mode={FORM_MODE.ADD}>
            <FormItem fields='goodsId' />
            <FormItem fields='goodsNum' />
            <FormItem fields='freightPrice' />
            <div style={{ fontSize: 0, padding: '5px 10px' }} className="textRight ">
              <FormButton debounce action='cancel' />
              <FormButton debounce action='submit' />
            </div>
          </MobileForm>
        )}
        {showAddButton &&
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
