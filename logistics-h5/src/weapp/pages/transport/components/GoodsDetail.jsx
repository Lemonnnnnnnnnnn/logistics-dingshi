import React, { Component } from 'react'
import { connect } from 'dva'

function mapStateToProps (state) {
  return {
    goodsUnits: state.dictionaries.items
  }
}
@connect(mapStateToProps, null)
export default class GoodsDetail extends Component{
  renderGoodInformItem = (deliveryItem) =>(
    <div key={deliveryItem.deliveryId}>
      <span style={{ color:'#A9A9A9' }}>{deliveryItem.categoryName}-{deliveryItem.goodsName} {deliveryItem.goodsNum}{this.getUnits(deliveryItem.goodsUnit)}</span>
    </div>
  )

  getUnits = (dictionaryCode) => {
    const { goodsUnits } = this.props
    return goodsUnits.filter(item=> +item.dictionaryCode===dictionaryCode)[0].dictionaryName
  }

  render (){
    const { value: deliveryItems, field:{ label } } = this.props
    return (
      <div style={{ overflow: 'hidden', background: '#fff', paddingRight: '15px' }}>
        <div className="formLabel">{label}</div>
        <div style={{ marginTop:'8px', verticalAlign: 'top', display:'inline-block', borderRadius:'7px', background:'rgba(247,247,247,1)', padding:'10px 15px', width:'calc(100vw - 100px)' }}>
          {
            deliveryItems && deliveryItems.map(deliveryItem => this.renderGoodInformItem(deliveryItem))
          }
        </div>
      </div>
    )
  }
}
