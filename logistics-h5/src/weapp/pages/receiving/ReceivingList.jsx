import React, { Component } from 'react'
import ListContainer from '@/mobile/page/component/ListContainer'
import ReceivingListItemCard from './components/ReceivingListItemCard'
import { getReceivingList } from '@/services/apiService'

const List = ListContainer(ReceivingListItemCard)
export default class ReceivingList extends Component{

  renderContent = () => {
    const props = {
      action:getReceivingList,
      style:{ height:'calc(100% - 68px)' },
      params:{
        isSelectSelf:true
      },
      itemProps:{
        editAuthority:true
      },
      keyName:'vagueSelect',
      wingBlank:true,
      showSearchBar:true,
      searchBarProps:{
        placeholder:"项目名称、卸货点名称"
      }
    }
    return (
      <List {...props} />
    )
  }

  render (){
    return (
      <div style={{ height:'100%', position: 'relative' }}>
        {this.renderContent()}
      </div>
    )
  }
}
