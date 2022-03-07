import React, { Component } from 'react';
import CSSModules from 'react-css-modules'
import { List, Switch, Modal, WhiteSpace } from 'antd-mobile';
import router from 'umi/router';
import styles from './BankManager.less'
import { getBankCard, patchUnbindBankCard, patchWeAppBankCard } from '@/services/apiService'

const { alert } = Modal

@CSSModules(styles, { allowMultiple: true })
class CarSetting extends Component {

  state = {
    ready: false,
    data: {}
  }

  componentDidMount (){
    const { location:{ query:{ bankAccountId } } } = this.props
    getBankCard({ bankAccountId: Number(bankAccountId) })
      .then(res => {
        this.setState({
          ready: true,
          data: res,
          checked: res.isAvailable
        })
      })
  }

  setDefault = () => {
    const { location:{ query:{ bankAccountId } } } = this.props
    const { checked } = this.state
    this.setState({
      checked:!checked
    }, () => {
      if (this.state.checked) {
        patchWeAppBankCard(bankAccountId)
      }
    })
  }

  unbindCard = () => {
    const { location:{ query:{ bankAccountId } } } = this.props
    alert('解除绑定', '解除银行卡绑定后不能享受更多服务哦', [
      { text: '暂不解除' },
      { text: '解除绑定', onPress: () => {
        patchUnbindBankCard(bankAccountId)
          .then(() => {
            router.goBack()
          })
      } },
    ])
  }

  render () {
    const { data, ready, checked } = this.state
    return (
      ready &&
      <div styleName='weapp_driver_car_setting'>
        <div styleName='shadow bank_card background_white'>
          <div>
            <h3 styleName='car_no'>{`${data.bankAccount.substring(0, 4)} **** **** **** ${data.bankAccount.substr(-3)}`}</h3>
            <span styleName='car_type'>{data.bankName}</span>
          </div>
        </div>
        <WhiteSpace />
        <List.Item
          extra={<Switch
            checked={checked}
            color='rgba(76,217,100,1)'
            onChange={this.setDefault}
          />}
        >
          默认收款
        </List.Item>
        <WhiteSpace />
        <List.Item
          arrow="horizontal"
          onClick={this.unbindCard}
        >
          解除绑定
        </List.Item>
      </div>
    );
  }
}

export default CarSetting;
