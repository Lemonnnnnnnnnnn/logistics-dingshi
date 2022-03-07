import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Toast, Steps, Flex } from 'antd-mobile'
import router from 'umi/router'
import { unitPrice } from '@/utils/utils'
import copyable from '@/assets/driver/copyable.png'
import styles from './DetailItem.less'

const { Step } = Steps

@CSSModules(styles, { allowMultiple: true })
export default class DetailItem extends Component{
  state = {
    isCopy: true
  }

  constructor (props) {
    super(props)
    this.item = {
      label: '运单号',
      content: this.props.item.transportNo,
    }
  }

  onCopy = () => {
    Toast.success('已复制运单号到剪切板', 1)
    this.setState({
      isCopy: false
    })
  }

  circle = (styleName) => (
    <div styleName='circle_container'>
      <div styleName={styleName} />
    </div>
  )

  renderList = () => {
    const { item:{ deliveryItems, receivingId, receivingName, receivingAddress, signItems, transportImmediateStatus, contactName, contactPhone } } = this.props
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
          key={item.deliveryId}
          title={item.deliveryName}
          icon={transportImmediateStatus === 3? this.circle('gray'): this.circle('green')}
          description={description}
        />
      )
    })

    if (!receivingId) return addressArr

    const description = (
      <div>
        <div style={{ marginBottom : '0.5rem', wordBreak : 'normal', whiteSpace : 'normal' }}>{receivingAddress}</div>
        <Flex align='start' justify='between'>
          <span>卸货联系人：</span>
          {signItems ?
            <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}>{signItems[0]?.contactName} {signItems[0]?.contactPhone}</span> :
            <span style={{ wordBreak : 'normal', whiteSpace : 'normal', textAlign : 'right' }}> {contactName} {contactPhone}</span>}
        </Flex>
      </div>
    )

    addressArr.push(
      <Step
        key={receivingId}
        title={receivingName}
        icon={transportImmediateStatus === 3? this.circle('gray'): this.circle('yellow')}
        description={description}
      />
    )
    return addressArr
  }

  toDetail = () => {
    router.push(`transportsDetail?transportId=${this.props.item.transportId}`)
  }

  stop = e => {
    e.stopPropagation()
  }

  render () {
    const { isCopy } = this.state
    const { deliveryTime } = this.props.item
    return (
      <div styleName='container' onClick={this.toDetail}>
        {
          this.props.item.transportImmediateStatus === 4 && !this.props.item.createEvaluateScore?
            <div styleName='tab'>
              待评价
            </div>
            :
            null
        }
        <Flex>
          <div>
            <span>运单号：</span>
            <span>{this.props.item.transportNo}</span>
          </div>
          {
            isCopy ?
              <div onClick={this.stop}>
                <CopyToClipboard onCopy={this.onCopy} text={this.props.item.transportNo}>
                  <img src={copyable} alt="图片加载失败" />
                </CopyToClipboard>
              </div>
              :
              null
          }
        </Flex>
        <div>
          <span>项目名称：</span>
          <span>{this.props.item.projectName}</span>
        </div>

        <div styleName='line' />
        {
          this.props.item.transportImmediateStatus === 3?
            <Steps className='transports_detail_item_step_gray'>
              {this.renderList()}
            </Steps>
            :
            <Steps className='transports_detail_item_step_colorful'>
              {this.renderList()}
            </Steps>
        }
        <div styleName='line0' />
        <div styleName={this.props.item.transportImmediateStatus === 3? 'dateBox': 'dateBox_colorful'}>
          {
            deliveryTime? <span>装货时间：{moment(deliveryTime).format('YYYY/MM/DD HH:mm:ss')}</span>: <span>装货时间：无</span>
          }
          <span>{`${unitPrice(this.props.item)}`}</span>
        </div>
      </div>
    )
  }
}
