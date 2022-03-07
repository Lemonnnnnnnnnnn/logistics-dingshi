import React from 'react'
import { WingBlank, Card, List, Icon } from 'antd-mobile'
import moment from 'moment'
import router from 'umi/router'
import { getToDoList } from '@/services/apiService'
import { getUserInfo } from '@/services/user'
import GuestTips from '@/weapp/component/GuestTips/GuestTips'
import EmptyTips from '@/weapp/component/EmptyTips/EmptyTips'
import styles from './todoList.css'
import todoItemConfig from '@/constants/todo/todo'

const { Item } = List
const { Brief } = Item

export default class TodoList extends React.Component {
  state = {
    todoList: []
  }

  isLogin = !!getUserInfo().accessToken

  componentDidMount () {
    this.isLogin && getToDoList({ limit:3, offset: 0 })
      .then(({ items })=>{
        this.setState({
          todoList: items
        })
      })
  }

  toLogin = () => { }

  onClick = (pendingId, pendingType)=>{
    router.push(`${todoItemConfig[pendingType].url}${pendingId}`)
  }

  renderGuest = () => <GuestTips message="无法获取待办信息" />

  renderEmpty = () => <EmptyTips message="没有待办事务" />

  renderList = () => {
    const { todoList } = this.state
    return todoList.length
      ? (
        <List className={styles.todoList}>
          {todoList.map(item =>
            <Item key={item.pendingId} arrow="horizontal" multipleLine onClick={()=>{ this.onClick(item.pendingId, item.pendingType) }}>
              <div style={{ display: 'inline-block', verticalAlign:'top' }}>
                <img style={{ width: '44px', height: '44px' }} src={todoItemConfig[item.pendingType].icon} alt="" />
              </div>
              <div style={{ display: 'inline-block', verticalAlign:'top' }}>
                <span style={{ fontSize: '16px', color: 'black', fontWeight:'600' }}>{`"${item.pendingName}"${todoItemConfig[item.pendingType].after}`}</span>
                <Brief style={{ fontSize:'14px' }}>{moment(item.updateTime).format('YYYY-MM-DD HH:mm:ss')}</Brief>
              </div>
            </Item>
          )}
        </List>
      )
      : this.renderEmpty()
  }

  toTodoListPage = () => {
    router.push('/weapp/todoList')
  }

  render () {
    return (
      <WingBlank size="lg">
        <Card style={{ boxShadow: 'rgba(51, 51, 51, 0.08) 0px 2px 10px 0px' }}>
          <Card.Header
            title="待处理事务"
            extra={<span onClick={this.toTodoListPage} style={{ verticalAlign: 'top', fontSize: '14px' }}>更多<Icon type="right" style={{ verticalAlign: 'top' }} /></span>}
          />
          <Card.Body style={{ paddingTop: '0' }}>
            {
              this.isLogin
                ? this.renderList()
                : this.renderGuest()
            }
          </Card.Body>
        </Card>
      </WingBlank>
    )
  }
}
