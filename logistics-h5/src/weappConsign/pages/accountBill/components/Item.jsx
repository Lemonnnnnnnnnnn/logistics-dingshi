import React from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import router from 'umi/router'
import styles from './item.less'

@CSSModules(styles, { allowMultiple: true })
export default class Item extends React.Component {
  goDetail = () => {
    router.push(`accountBill/detail?accountTransportId=${this.props.item.accountTransportId}`)
  }

  render () {
    return (
      <div styleName="card_container" onClick={this.goDetail}>
        <h3 styleName='title'>
          <span>运单数{this.props.item.transportNumber}</span>
          <span>-￥{this.props.item.receivables.toFixed(2)._toFixed(2)}</span>
        </h3>
        <p styleName='time'>{moment(this.props.item.createTime).format('YYYY-MM-DD HH:mm:ss')}</p>
      </div>
    )
  }
}