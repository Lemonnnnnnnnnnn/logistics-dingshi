import React from 'react'
import { connect } from 'dva'
import Edit from '../../releasePrebooking/index'
import model from '@/models/preBooking'
import contractModel from '@/models/contract'

const { actions: { detailPreBooking } } = model

const { actions: { detailProjects } } = contractModel

@connect(null, { detailPreBooking, detailProjects })
export default class Index extends React.Component{
  state = {
    ready: false
  }

  componentDidMount () {
    const { location: { query: { prebookingId, projectId } } } = this.props
    this.props.detailProjects({ projectId }).then(() => {
      this.props.detailPreBooking({ prebookingId }).then((data => {
        data.shipmentId = [data.shipmentId]
        data.projectId = [data.projectId]
        data.deliveryItems = data.deliveryItems && data.deliveryItems.map((item, index) =>({
          itemId: index,
          prebookingObjectId: item.deliveryId,
          goodsId: item.goodsId,
          receivingNum: item.receivingNum,
          goodsUnit: item.goodsUnit
        })) || []
        data.receivingItems = data.receivingItems && data.receivingItems.map((item, index) =>({
          itemId: index,
          prebookingObjectId: item.receivingId,
          goodsId: item.goodsId,
          receivingNum: item.receivingNum,
          goodsUnit: item.goodsUnit
        })) || []
        this.prebookingInfo = data
        this.setState({
          ready: true
        })
      }))
    })
  }

  render () {
    const { ready } = this.state
    const { location: { query } } = this.props
    return (
      ready
      &&
      <Edit key={query.prebookingId} {...query} prebookingInfo={this.prebookingInfo} />
    )
  }
}