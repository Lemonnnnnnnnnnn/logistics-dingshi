import React, { Component } from 'react'
import CardContent from './CardContent'
import ListContainer from '@/mobile/page/component/ListContainer'

const List = ListContainer(CardContent)
export default class CardList extends Component{

  renderList = () =>{
    const { fieldConfig, primaryKey, action, params, onCardClick, showSearchBar, searchBarProps, cancelText, keyName, style } = this.props
    // if (!isArray(data)) throw new Error('数据类型错误')
    const _props = {
      action,
      params,
      keyName,
      style
    }
    const itemProps = {
      fieldConfig,
      onCardClick
    }
    const listConfig = {
      showSearchBar,
      searchBarProps,
      cancelText
    }
    return <List primaryKey={primaryKey} {...listConfig} itemProps={itemProps} {..._props} />
  }

  render (){
    return (
      <>
        {this.renderList()}
      </>
    )
  }

}
