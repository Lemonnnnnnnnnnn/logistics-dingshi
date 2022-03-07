import React, { Component } from 'react';
import router from 'umi/router';
import CSSModules from 'react-css-modules';
import moment from 'moment';
import { Toast } from 'antd-mobile'
import { getOssImg } from '@/utils/utils'
import { latestPrebooking } from '@/services/apiService'
import heading from '@/assets/driver/heading.png'
import newUser from '@/assets/driver/newUser.png'
import { getUserInfo } from '@/services/user'
import styles from './JoinUs.less'

@CSSModules(styles, { allowMultiple: true })
class Index extends Component {
  state = {}

  componentDidMount () {
    latestPrebooking().then(data => {
      this.setState({
        lists: data || []
      })
    })
  }

  toLogin = () => {
    router.push('login')
  }

  renderLists = () => {
    const { lists } = this.state
    return lists.map((item, index) => (
      <li key={index}>
        <span>
          {
            item.portraitDentryid?
              <img src={getOssImg(item.portraitDentryid, { width: '24', height: '24' })} alt="图片加载失败" />
              :
              <img src={heading} alt="图片加载失败" />
          }
          <span>{item.nickName}</span>
          <span>{moment(item.createTime).fromNow()}发布</span>
        </span>
        <span>￥{(item.maximumShippingPrice || 0).toFixed(2)._toFixed(2)}</span>
      </li>
    ))
  }

  render () {
    const { lists } = this.state
    return (
      lists
      &&
      <div styleName='bgContainer'>
        <div styleName='list'>
          {
            lists.length > 0?
              this.renderLists()
              :
              null
          }
        </div>
        <div styleName='banner'>
          <img src={newUser} alt="图片加载失败" />
          <span>秒结运费</span>
          <span>专为司机打造的大宗基建货物运输平台</span>
          <p>立即加入易键达</p>
        </div>
        <div styleName='joinUs_btn'>
          <button styleName='btn' type='button' onClick={this.toLogin}>立即加入</button>
        </div>
      </div>
    )
  }
}

export default Index;
