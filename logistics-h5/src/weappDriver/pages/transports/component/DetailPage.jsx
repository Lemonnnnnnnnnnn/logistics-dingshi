import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import { Rate } from 'antd'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Toast, Steps, Button, Flex } from 'antd-mobile'
import { getTransport, postEvaluate } from '@/services/apiService'
import copyable from '@/assets/driver/copyable.png'
import heading from '@/assets/driver/heading.png'
import phoneCall from '@/assets/driver/phoneCall.png'
import complete from '@/assets/driver/complete.png'
import cancel from '@/assets/driver/cancel.png'
import { unitPrice } from '@/utils/utils'
import { TRANSPORTIMMEDIATESTATUS } from '@/constants/transport/transport'
import styles from './detailPage.less'

const { Step } = Steps

@CSSModules(styles, { allowMultiple: true })
export default class DetailItem extends Component {
  state = {
    isCopy: true,
    ready: false,
    ratePoint: 0,
  }

  constructor (props) {
    super(props)
    this.item = {
      label: '运单号',
      // content: this.props.item.transportNo,
    }
  }

  componentDidMount () {
    console.log(this.props)
    const { location: { query: { transportId } } } = this.props
    getTransport(transportId).then(data => {
      this.setState({
        detail: data,
        ready: true,
      })
      this.item = {
        label: '运单号',
        content: data.transportNo,
      }
    })
  }

  onCopy = () => {
    Toast.success('已复制运单号到剪切板', 1)
    this.setState({
      isCopy: false,
    })
  }

  circle = (styleName) => (
    <div styleName='circle_container'>
      <div styleName={styleName} />
    </div>
  )

  stop = e => {
    e.stopPropagation()
  }

  renderList = () => {
    const { detail } = this.state
    const { deliveryItems, receivingId, receivingName, receivingAddress, signItems, transportImmediateStatus, contactName, contactPhone } = detail
    const addressArr = deliveryItems.map(item => {
      const description = (
        <div style={{ width : '100%' }}>
          <div style={{ marginBottom : '0.5rem', wordBreak : 'normal', whiteSpace : 'normal' }}>{item.deliveryAddress || '如未收到信息，请联系发单方获取位置信息'} </div>
          <div>
            <Flex align='start' justify='between'>
              <span>提货联系人：</span>
              <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}>{item.contactName} {item.contactPhone}</span>
            </Flex>
            <Flex align='start' justify='between'>
              <span>货品：</span>
              <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}>{item.categoryName} {item.goodsName}</span>
            </Flex>
            <Flex align='start' justify='between'>
              <span>计划量：</span>
              <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}>{item.goodsNum} {item.goodsUnitCN}</span>
            </Flex>
            <Flex align='start' justify='between'>
              <span>实提量：</span>
              <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}>{item.deliveryNum} {item.deliveryUnitCN}</span>
            </Flex>
          </div>
        </div>)
      return (
        <Step
          key={item.transportCorrelationId}
          title={this.renderTitle(item, transportImmediateStatus)}
          icon={this.circle('green')}
          description={description}
        />
      )
    })
    if (receivingId) {
      const description = (
        <div>
          <div style={{ marginBottom : '0.5rem', wordBreak : 'normal', whiteSpace : 'normal' }}>{receivingAddress}</div>
          <Flex align='start' justify='between'>
            <span>卸货联系人：</span>
            {signItems ? <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}>{signItems[0]?.contactName} {signItems[0]?.contactPhone}</span> :
            <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}> {contactName} {contactPhone}</span>}
          </Flex>
        </div>
      )
      addressArr.push(<Step key={receivingId} title={receivingName} icon={this.circle('yellow')} description={description} />)
    }
    return addressArr
  }

  renderTitle = (item, transportImmediateStatus) => (
    <>
      <span style={{ width:'70%', display:'inline-block', overflow:'hidden', textOverflow:'ellipsis' }}>{item.deliveryName}</span>
      {(transportImmediateStatus === 5 || transportImmediateStatus === 22) && !item.isPicked && <Button className={styles.pick_button} onClick={this.driverPickup(item)}>提货</Button>}
    </>
  )

  renderStatusPicture = () => {
    const { detail } = this.state
    let dom
    switch (detail.transportImmediateStatus) {
      case TRANSPORTIMMEDIATESTATUS.CANCEL:
        dom = <img styleName='statusPic' src={cancel} alt='图片加载失败' />
        break
      default:
        dom = <img styleName='statusPic' src={complete} alt='图片加载失败' />
    }
    return dom
  }

  changePoint = value => {
    this.setState({
      ratePoint: value,
    })
  }

  postEvaluate = () => {
    const { ratePoint, detail } = this.state
    if (!ratePoint && ratePoint === 0) return Toast.fail('请选择评价分数')
    const postData = {
      evaluateSubjectId: detail.transportId,
      evaluateScore: ratePoint,
      evaluateUserId: detail.createUserId,
    }
    postEvaluate(postData).then(() => {
      const { location: { query: { transportId } } } = this.props
      getTransport(transportId).then(data => {
        this.setState({
          detail: data,
          ready: true,
        })
      })
      Toast.success('评价成功')
    })
  }

  renderPickupTime = () => {
    const { detail } = this.state
    const deliveryTime = detail.eventItems.find(item => item.eventStatus === 5 || item.eventStatus === 30)?.createTime
    const tips = deliveryTime ? moment(deliveryTime).format('YYYY-MM-DD HH:mm:ss') : '无'
    return tips
  }

  render () {
    const { isCopy, ready, detail, ratePoint } = this.state
    return (
      ready
      &&
      <div styleName='container' onClick={this.toDetail}>
        <div styleName='userInfo_box'>
          <div styleName='info_box'>
            <img src={heading} alt='图片加载失败' />
            <div>
              <p>{detail.createUserName}</p>
              <p>
                <span>成交：{detail.fixtureNumber || '0'}</span>
                <span />
                <span>好评率：{detail.feedbackRate || '0%'}</span>
              </p>
            </div>
          </div>
          <a
            href={`tel: ${detail.logisticsBusinessTypeEntity.releaseHall === 1 ? detail.createPreUserPhone : detail.createUserPhone}`}
          >
            <img src={phoneCall} alt='图片加载失败' />
          </a>
        </div>
        {detail.transportImmediateStatus === 4 ?
          <div styleName='rate_container'>
            <div styleName='box'>
              <div styleName='tab'>审核通过</div>
              <h3>审核通过</h3>
              {
                detail.transportImmediateStatus === 4 && !detail.createEvaluateScore ?
                  <p>该运单已审核通过，评价一下吧</p>
                  :
                  null
              }
              <div styleName='rate_item'>
                <span>总体评分</span>
                {
                  detail.transportImmediateStatus === 4 && !detail.createEvaluateScore ?
                    <Rate value={ratePoint} defaultValue={0} onChange={this.changePoint} />
                    :
                    <Rate defaultValue={detail.createEvaluateScore} disabled />
                }
              </div>
              <div styleName='btn_container'>
                {
                  detail.transportImmediateStatus === 4 && !detail.createEvaluateScore ?
                    <button type='button' onClick={this.postEvaluate}>提交评价</button>
                    :
                    <button type='button'>已评价</button>
                }
                {/* <button type='button'>暂不评价</button> */}
              </div>
            </div>
          </div>
          :
          null
        }
        <div styleName='detail_box'>
          {this.renderStatusPicture()}
          <Flex>
            <div>
              <span>运单号：</span>
              <span>{detail.transportNo}</span>
            </div>
            {
              isCopy ?
                <div onClick={this.stop}>
                  <CopyToClipboard onCopy={this.onCopy} text={detail.transportNo}>
                    <img src={copyable} alt="图片加载失败" />
                  </CopyToClipboard>
                </div>
                :
                null
            }
          </Flex>
          <div>
            <span>项目名称：</span>
            <span>{detail.projectName}</span>
          </div>
          <div styleName='line' />
          <Steps
            className={detail.transportImmediateStatus === 3 ? 'transports_detailPage_item_step_gray' : 'transports_detailPage_item_step_colorful'}
          >
            {this.renderList()}
          </Steps>
          <div styleName='line0' />
          <div styleName='itemBox'>
            <p>装货时间: {this.renderPickupTime()}</p>
            <p>运输费用: {unitPrice(detail)}</p>
          </div>
          <div styleName='qrCode'>
            <img src={copyable} alt='二维码加载失败' />
          </div>
        </div>
      </div>
    )
  }
}
