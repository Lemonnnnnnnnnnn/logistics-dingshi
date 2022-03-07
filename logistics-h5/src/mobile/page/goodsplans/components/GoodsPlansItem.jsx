import React, { Component } from 'react';
import { WingBlank, WhiteSpace, Card, Modal, Button, Toast } from 'antd-mobile'
import router from 'umi/router'
import { PLANSTATUS, CONSIGNMENT_UNTREATED, CONSIGNMENT_REFUSED, GOINGON, COMPLETE, CANCEL, FINISH } from '@/constants/goodsPlans/goodsPlans'
import Authorized from '@/utils/Authorized'
import orderPic from '@/assets/prebook_icon.png'
import { patchGoodPlans } from '@/services/apiService'

const { prompt } = Modal
export default class GoodsPlansItem extends Component {
  jumpToDetail = () => {
    const { item: { goodsPlanId } } = this.props
    router.push(`goodsplansDetail?goodsPlanId=${goodsPlanId}`)
  } // ok

  renderCardTitle = () => {
    const { item: { goodsPlanName, planStatus } } = this.props
    const STATUS_COLOR = ['#FF9900', '#FF0000', '#009900', '#1890FF', '#FF0000', '#1890FF']
    return (
      <div style={{ width: '100%' }}>
        <span style={{ display: 'inline-block', width: '75%', fontSize: '16px' }}>{goodsPlanName}</span>
        <span style={{ marginTop: '2px', fontSize: '14px', float: 'right', color:STATUS_COLOR[planStatus] }}>{PLANSTATUS[planStatus]}</span>
      </div>
    )
  } // ok

  getMobileGoodsPlan = () => {
    const { refresh } = this.props
    return refresh()
  }

  renderOperations = () => {
    const { planStatus, goodsPlanId } = this.props.item
    // console.error(planStatus, goodsPlanId)
    const operations = {
      [CONSIGNMENT_UNTREATED]: [{
        title: '拒绝',
        className: 'ghost',
        onClick: (e) => {
          e.stopPropagation()
          prompt('请输入拒绝原因', null, [
            {
              text: '取消'
            },
            {
              text: '确定',
              onPress: value => {
                if (!value){
                  Toast.fail('拒绝理由不得为空', 2, null, false)
                  return
                }
                this.rejectGoodsPlans(goodsPlanId, value)
              },
              style:{ background:'rgba(49,151,251,1)', color: 'white' }
            }
          ])
        }
      }, {
        title: '接受',
        className: 'primary',
        onClick: (e) => {
          e.stopPropagation()
          this.acceptGoodsPlans(goodsPlanId)
        }
      }],
      [GOINGON]: [{
        title: '预约单列表',
        className: 'ghost',
        onClick: (e) => {
          e.stopPropagation()
          this.goToRelationPreBookingPage(goodsPlanId)
        }
      }, {
        title: '运单列表',
        className: 'ghost',
        onClick: (e) => {
          e.stopPropagation()
          this.goToRelationTransportPage(goodsPlanId)
        }
      }, {
        title: '新建预约单',
        className: 'primary',
        onClick: (e)=>{
          e.stopPropagation()
          this.goCreateGoodsPlansPage(goodsPlanId)
        }
      }
      ],
      [COMPLETE]: [{
        title: '预约单列表',
        className: 'ghost',
        onClick: (e) => {
          e.stopPropagation()
          this.goToRelationPreBookingPage(goodsPlanId)
        }
      }, {
        title: '运单列表',
        className: 'ghost',
        onClick: (e) => {
          e.stopPropagation()
          this.goToRelationTransportPage(goodsPlanId)
        }
      }],
      [FINISH]:[{
        title: '预约单列表',
        className: 'ghost',
        onClick: (e) => {
          e.stopPropagation()
          this.goToRelationPreBookingPage(goodsPlanId)
        }
      }, {
        title: '运单列表',
        className: 'ghost',
        onClick: (e) => {
          e.stopPropagation()
          this.goToRelationTransportPage(goodsPlanId)
        }
      }]
    }[planStatus] || []
    console.error(operations)
    return operations.map((item, index) => (
      <Authorized key={index} authority={item.auth}>
        <Button className={item.className || ''} inline size="small" onClick={item.onClick} style={{ marginLeft: '6px' }}>{item.title}</Button>
      </Authorized>
    ))
  }

  rejectGoodsPlans = (goodsPlanId, remarks) => {
    const params = {
      goodsPlanId,
      planStatus: 1,
      remarks
    }
    patchGoodPlans(params)
      .then(() => {
        Toast.success('已拒绝', 1);
        setTimeout(() => {
          this.getMobileGoodsPlan()
        }, 1);
      })
  }

  acceptGoodsPlans = goodsPlanId => {
    const params = {
      goodsPlanId,
      planStatus: 2
    }
    patchGoodPlans(params)
      .then(() => {
        Toast.success('已接受', 1);
        setTimeout(() => {
          this.getMobileGoodsPlan()
        }, 1);
      })
  }

  goToRelationPreBookingPage = goodsPlansId => {
    router.push(`prebookingList?goodsPlanId=${goodsPlansId}&tab=5`)
  }

  goToRelationTransportPage = goodsPlansId => {
    router.push(`transportList?goodsPlanId=${goodsPlansId}&tab=9`)
  }

  goCreateGoodsPlansPage = goodsPlansId => {
    router.push(`createPrebookingByGoodsPlan?goodsPlanId=${goodsPlansId}&mode=add`)
  }

  render () {
    const { item:{ projectName } } = this.props

    return (
      <WingBlank size='lg'>
        <WhiteSpace size="md" />
        <Card className="card-block no-division" onClick={this.jumpToDetail}>
          <Card.Header
            title={this.renderCardTitle()}
            thumb={<img width='18' height='18' src={orderPic} alt="" />}
          />
          <Card.Body>
            <div style={{ color: 'gray', fontSize: '13px', marginBottom: '3px' }}>{`合同名称：${projectName}`}</div>
            <WhiteSpace size="lg" />
          </Card.Body>
          <Card.Footer style={{ textAlign: 'right' }} content={this.renderOperations()} />
        </Card>
      </WingBlank>
    )
  }
}
