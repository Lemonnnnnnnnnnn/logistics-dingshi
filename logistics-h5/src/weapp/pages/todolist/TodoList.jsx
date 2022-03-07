import React, { Component } from 'react'
import { WingBlank, WhiteSpace } from 'antd-mobile'
import ListContainer from '@/mobile/page/component/ListContainer'
import GuestTips from '@/weapp/component/GuestTips/GuestTips'
import { getUserInfo } from '@/services/user'
import { getToDoList } from '@/services/apiService'
import TodoListItem from './components/TodoListItem'


const List = ListContainer(TodoListItem)
class TodoList extends Component {

  isLogin = !!getUserInfo().accessToken

  render () {
    const props = {
      action: getToDoList,
      primaryKey: 'pendingId',
      whiteSpace: false,
      style: {
        borderRadius: '10px'
      }
    }
    return (
      this.isLogin ?
        <>
          <WhiteSpace size="lg" />
          <WingBlank style={{ height: '100%' }}>
            <List {...props} />
          </WingBlank>
        </>
        : <GuestTips />
    );
  }
}

export default TodoList;
