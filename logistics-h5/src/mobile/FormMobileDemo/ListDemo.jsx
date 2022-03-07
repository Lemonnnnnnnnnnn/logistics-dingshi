import React from 'react'
import ListContainer from '@/mobile/page/component/ListContainer'
import { Card, WhiteSpace, WingBlank } from 'antd-mobile';
import orderPic from '@/assets/prebook_icon.png'
import request from '@/utils/request'


class Item extends React.Component {

  render (){

    const { item } = this.props
    return (
      <WingBlank size='lg'>
        <WhiteSpace size="md" />
        <Card className="card-block no-division">
          <Card.Header
            title={<span style={{ fontSize: '16px' }}>{`${item.projectName}`}</span>}
            thumb={<img width='18' height='18' src={orderPic} />}
            extra={<span style={{ color: '#999', fontSize: '14px' }}>不知道这是什么</span>}
          />
          <Card.Body>
            <p>{item.driverCompanyName}</p>
            <p>{item.driverUserName}</p>
          </Card.Body>
          <Card.Footer />
        </Card>
      </WingBlank>)
  }
}

const ItemList = ListContainer(Item)

export default class extends React.Component {
  render (){
    const props = {
      action:(params)=>request.get('/v1/transports/all', { params }),
      params:{ a:1, b:2 }
    }
    return (
      <ItemList {...props} />
    )
  }
}



