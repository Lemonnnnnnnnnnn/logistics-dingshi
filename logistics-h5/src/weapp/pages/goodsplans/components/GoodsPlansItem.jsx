import React, { Component } from 'react'
import { Card, WingBlank, WhiteSpace } from 'antd-mobile'
import router from 'umi/router'
import moment from 'moment'
import styles from './GoodsPlansItem.css'
import { PLANSTATUS } from '@/constants/goodsPlans/goodsPlans'

const STATUS_COLOR = ['#FF9900', '#FF0000', '#009900', '#1890FF', '#FF0000', '#1890FF']

export default class GoodsPlansItem extends Component {
  titleHightLight = (title, keyword) => title.replace(keyword, `<span style="color:red">${keyword}</span>`)

  goToDetailPage = () => {
    const { goodsPlanId, planStatus } = this.props.item

    router.push(`/weapp/GoodsPlansDetail?goodsPlanId=${goodsPlanId}&planStatus=${planStatus}`)
  }

  renderPlanStatus = () => {
    const { planStatus } = this.props.item
    const statusStyle = {
      fontSize: '14px',
      color: STATUS_COLOR[planStatus]
    }
    return <span style={statusStyle}>{PLANSTATUS[planStatus]}</span>
  }

  render () {
    const { createTime, goodsPlanName, projectName, createUserName } = this.props.item
    const { keyword } = this.props
    return (
      <WingBlank>
        <Card className={styles.card} onClick={this.goToDetailPage}>
          <Card.Header title={<span style={{ fontSize: '14px', color: '#9B9B9B' }}>{moment(createTime).format('YYYY-MM-DD')}</span>} extra={this.renderPlanStatus()} />
          <Card.Body style={{ padding: '0 15px' }}>
            <div className={styles.goodsPlansName} dangerouslySetInnerHTML={{ __html: this.titleHightLight(goodsPlanName, keyword) }} />
            <div>
              <div className={styles.contractName}>{projectName}</div>
              <div className={styles.createUserName}>{`创建人:${createUserName||'暂无记录'}`}</div>
            </div>
          </Card.Body>
          {/* <Card.Footer content={projectName} /> */}
        </Card>
      </WingBlank>
    )
  }
}

