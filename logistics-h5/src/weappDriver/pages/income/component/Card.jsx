import React from 'react'
import CSSModules from 'react-css-modules'
import { Toast, Flex } from 'antd-mobile'
import CopyToClipboard from 'react-copy-to-clipboard'
import moment from 'moment';
import styles from './card.less'
import copyable from '@/assets/driver/copyable.png'

@CSSModules(styles, { allowMultiple: true })
export default class Card extends React.Component{
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

  stop = e => {
    e.stopPropagation()
  }

  render () {
    const { isCopy } = this.state
    const { item: { projectName, transactionAmount, createTime, payerName, payeeName, transportListDetailResp, totalTaxes } } = this.props
    return (
      <div styleName='Card'>
        <div styleName='card_head'>
          <h3>{projectName}</h3>
          <h3>+&nbsp;￥{transactionAmount}</h3>
        </div>
        {totalTaxes ? (
          <Flex justify='between'>
            <span>其中代扣税费</span>
            <span>￥{totalTaxes}</span>
          </Flex>) : null}
        <header styleName='copy_box'>
          <span>运单号：</span>
          <span>{this.props.item.transportNo}</span>
          {
            isCopy ?
              <div styleName='marL10' onClick={this.stop}>
                <CopyToClipboard onCopy={this.onCopy} text={this.item.text||this.item.content}>
                  <img src={copyable} alt="图片加载失败" />
                </CopyToClipboard>
              </div>
              :
              null
          }
        </header>
        {
          transportListDetailResp?
            <div styleName='process'>
              <span>{transportListDetailResp.deliveryItems || transportListDetailResp.deliveryItems.length > 0? transportListDetailResp.deliveryItems.map(item => (<span>{item.deliveryName}</span>)): '无提货点'}</span>
              <span styleName='margin'> - </span>
              <span>{transportListDetailResp.receivingName || '无卸货点'}</span>
            </div>
            :
            null
        }
        <p>{moment(createTime).format('YYYY/MM/DD HH:mm:ss')}</p>
      </div>
    )
  }
}
