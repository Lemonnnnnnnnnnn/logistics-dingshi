import React from 'react'
import { connect } from 'dva'
import { getJsSDKConfig, getProjectList } from '@/services/apiService'
import { SchemaForm, Item, Observer } from '@gem-mine/mobile-schema-form'
import '@gem-mine/mobile-schema-form/src/fields'
import { browser } from '@/utils/utils'
import { Toast } from 'antd-mobile'
import ReservationList from './component/reservationList'


function mapStateToProps (state) {
  return {
    nowUser: state.user.nowUser,
  }
}

@connect(mapStateToProps)
// @CSSModules(styles, { allowMultiple: true })
export default class Reservation extends React.Component {
  state = {
    ready: false,
  }

  componentDidMount () {
    if (browser.versions.android) {
      getJsSDKConfig({ url: encodeURIComponent(window.location.href.split('#')[0]) })
        .then(({ timestamp, nonceStr, signature }) => {
          wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx5b020341411ebf08', // 必填，公众号的唯一标识
            timestamp, // 必填，生成签名的时间戳
            nonceStr, // 必填，生成签名的随机串
            signature, // 必填，签名
            jsApiList: ['getLocation'], // 必填，需要使用的JS接口列表
          })
        })
    }
    Toast.loading()
    getProjectList({ limit: 1000, offset: 0, order: 'desc' })
      .then(({ items }) => {
        Toast.hide()
        this.projectList = items ? items.map(i => ({ value: i.projectId, label: i.projectName })) : []
        this.projectList.unshift({ value: -1, label: '全部' })
      })
      .then(() => {
        this.schema = {
          project: {
            label: '选择项目',
            placeholder: '请选择项目',
            component: 'picker',
            options: this.projectList,
          },
          reservationList: {
            component: ReservationList,
            value: Observer({
              watch: 'project',
              action: (res) => res,
            }),
            defaultValue: this.projectList[0].value,
          },
        }
      })
      .then(() => this.setState({ ready: true }))
  }


  render () {
    const { ready } = this.state
    return (
      <>
        {ready &&
        <SchemaForm schema={this.schema}>
          <Item field='project' />
          <Item field='reservationList' />
        </SchemaForm>
        }
      </>
    )
  }
}
