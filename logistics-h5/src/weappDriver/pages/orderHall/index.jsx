import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { SchemaForm, Item, FormButton, Observer } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton'
import '@gem-mine/mobile-schema-form/src/fields'
import router from 'umi/router'
import { NoticeBar, Toast } from 'antd-mobile'
import moment from 'moment'
import { getUrl } from '@/utils/utils'
import exchangeImage from '@/assets/driver/exchange.png'
import CityPicker from './component/CityPicker'
import styles from './index.less'

@CSSModules(styles, { allowMultiple: true })
export default class Index extends Component{
  state = {
    type: 1,
    exchange: 0
  }

  formSchema = {
    delivery: {
      label: '提货点',
      component: CityPicker,
      styleName: 'leftInput',
      placeholder: '提货点',
      observer: Observer({
        watch: '*exchange',
        action: exchange => ({ exchange })
      })
    },
    receive: {
      label: '卸货点',
      component: CityPicker,
      observer: Observer({
        watch: '*exchange',
        action: exchange => ({ exchange })
      }),
      styleName: 'rightInput',
      placeholder: '卸货点'
    },
    licenseValidityDate: {
      component: 'calender',
      label: '接货时间',
      placeholder: '接货时间（可选）',
    },
  }

  // 切换顶部tab暂时删除
  // changeStatus = (e) => {
  //   const type = Number(e.currentTarget.getAttribute('type'))
  //   this.setState({
  //     type
  //   })
  // }

  search = (value) => {
    if (!value.licenseValidityDate) {
      value.deliveryDateStart = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss')
      value.deliveryDateEnd = moment().set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss')
    } else {
      value.deliveryDateStart = value.licenseValidityDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss')
      value.deliveryDateEnd = value.licenseValidityDate.set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss')
      delete value.licenseValidityDate
    }
    const { delivery, receive } = value
    const deliveryAddress = delivery
    const receivingAddress = receive
    router.push(getUrl(`/WeappDriver/hallList?deliveryDateStart=${value.deliveryDateStart}&deliveryDateEnd=${value.deliveryDateEnd}`, { deliveryAddress, receivingAddress }))
  }

  exchange = () => {
    let { exchange } = this.state
    this.setState({
      exchange: exchange += 1
    })
  }

  renderErrors = (errors) => {
    Toast.fail(errors[0])
  }

  render () {
    const { exchange } = this.state
    return (
      <>
        {/* <div styleName='tab_header'>
          <ul>
            <li type='1' styleName={type === 1? 'active': ''} onClick={this.changeStatus}>全部</li>
            <li type='2' styleName={type === 2? 'active': ''} onClick={this.changeStatus}>钢筋</li>
            <li type='3' styleName={type === 3? 'active': ''} onClick={this.changeStatus}>水泥</li>
          </ul>
        </div> */}
        <div styleName='form_box' className='orderHall_index_schemaForm'>
          <NoticeBar mode="closable" className='orderHall_index_NoticeBar' icon={null}>接货地/卸货地不用全部选择</NoticeBar>
          <SchemaForm schema={this.formSchema} trigger={{ exchange }}>
            <div styleName='address_box form_div'>
              <Item field='delivery' />
              <img onClick={this.exchange} src={exchangeImage} alt="图片错误" />
              <Item field='receive' />
            </div>
            <div styleName='form_div' className='order_Hall_timePicker'>
              <Item field='licenseValidityDate' />
            </div>
            <DebounceFormButton styleName='btn_search' onError={this.renderErrors} label='运单查询' type='primary' onClick={this.search} />
          </SchemaForm>
        </div>
      </>
    )
  }
}
