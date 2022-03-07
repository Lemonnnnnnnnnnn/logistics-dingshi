import React, { Component } from 'react'


const goodTitleStyle = {
  width: '85px',
  display: 'inline-block',
  color: '#169BD5',
  verticalAlign: 'top'
}

const goodsNumStyle = {
  color: '#169BD5'
}

const contentStyle = {
  display: 'inline-block',
  verticalAlign: 'top',
}

export default class TransportCorrelationCnItems extends Component{

  render (){
    const { value } = this.props
    if (!value) return <></>
    const _value = Object.keys(value).map((key)=>({ goodsId: key, ...value[key] }))
    return (
      <div style={{ overflow: 'hidden', background: '#fff', paddingRight: '15px' }}>
        <div className="formLabel">计划单统计</div>
        <div style={{ marginTop:'8px', verticalAlign: 'top', display:'inline-block', borderRadius:'7px', background:'rgba(247,247,247,1)', padding:'10px 15px', width:'calc(100vw - 100px)' }}>
          {
            _value.map(item=>(
              <div key="goodsId" style={{ color:'rgba(155,155,155,1)' }}>
                {item.goodsName}： 要货 {item.total}{item.goodsUnitCN}、 已经调度 {item.scheduled}{item.goodsUnitCN}、 运输中 {item.inTransportation}{item.goodsUnitCN}、 运单异常 {item.exception}{item.goodsUnitCN},
                 已签收 {item.signed}{item.goodsUnitCN}
              </div>
            ))
          }
        </div>
      </div>
    )
  }

}
