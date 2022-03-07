import React, { Component } from 'react';
import { List } from 'antd-mobile'
import moment from 'moment'
import router from 'umi/router'
import todoItemConfig from '@/constants/todo/todo'

const { Item } = List
const { Brief } = Item

class TodoListItem extends Component {

  onClick = (pendingId, pendingType)=>{
    router.push(`${todoItemConfig[pendingType].url}${pendingId}`)
  }

  render () {
    const { pendingId, pendingName, updateTime, pendingType } = this.props.item
    return (
      <Item arrow="horizontal" multipleLine onClick={()=>{ this.onClick(pendingId, pendingType) }}>
        <div style={{ display: 'inline-block', verticalAlign:'top' }}>
          <img style={{ width: '44px', height: '44px' }} src={todoItemConfig[pendingType].icon} alt="" />
        </div>
        <div style={{ display: 'inline-block', verticalAlign:'top' }}>
          <span style={{ fontSize: '16px', color: 'black', fontWeight:'600' }}>{`"${pendingName}"${todoItemConfig[pendingType].after}`}</span>
          <Brief style={{ fontSize:'14px' }}>{moment(updateTime).format('YYYY-MM-DD HH:mm:ss')}</Brief>
        </div>
      </Item>

    );
  }
}

export default TodoListItem;
