import React, { Component } from 'react'
import { Card, WingBlank } from 'antd-mobile'
import { isFunction } from '@/utils/utils'
import styles from './CardContent.css'

export default class CardContent extends Component{

  // constructor (props){
  //   super(props)
  //   const { fieldConfig, item } = props
  //   const fields = this.normalize(fieldConfig)
  //   this.state={
  //     fields,
  //     item
  //   }
  // }

  normalize = (config=[]) =>{
    const { item } = this.props
    const fields = config.map(({ label, key, labelStyle, render, layout='inline', contentStyle }, index)=>({
      key:key||index,
      label,
      labelStyle,
      layout,
      content:isFunction(render)? render(item): item[key],
      contentStyle
    }))
    return fields
  }

  onCardClick = (e) => {
    e.stopPropagation()
    const { onCardClick, item } = this.props
    isFunction(onCardClick)&&onCardClick(item)
  }

  renderCard = () =>{
    const { fieldConfig } = this.props
    const fields = this.normalize(fieldConfig)
    return (
      <WingBlank>
        <Card style={{ position:'relative' }} onClick={this.onCardClick}>
          <Card.Body>
            <div>{this.renderFields(fields)}</div>
          </Card.Body>
        </Card>
      </WingBlank>
    )
  }

  renderFields = fields =>fields.map(({ key, label, labelStyle={}, contentStyle={}, layout, content }) =>{
    const display = layout === 'horizontal' ? 'block' : 'inline-block'
    return (
      <div className={styles.contentItem} key={key}>
        {label ? <div className={styles.label} style={{ ...labelStyle, display }}>{`${label}：`}</div> : null}
        <div className={styles.content} style={{ display, ...contentStyle }}>{content}</div>
      </div>
    )
  })

  render (){
    return (
      <>
        {this.renderCard()}
      </>
    )
  }

}
