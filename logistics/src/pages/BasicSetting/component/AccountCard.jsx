import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { connect } from 'dva'
import { Col, Tag, Button, notification, Popover, Icon } from 'antd'
import { SchemaForm, Item, FORM_MODE } from '@gem-mine/antd-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton';
import '@gem-mine/antd-schema-form/lib/fields'
import auth from '@/constants/authCodes'
import Authorized from '@/utils/Authorized'
import model from '@/models/bankInvoice'
import styles from './AccountCard.less'

const {
  BANK_SETTING_DISABLE,
  BANK_SETTING_ENABLE
} = auth

const { actions: { getBankAccount, patchBankAccount } } = model

@connect(null, { getBankAccount, patchBankAccount })
@CSSModules(styles, { allowMultiple: true })
export default class AccountCard extends Component {
  infoForm = {
    invoiceTitle: {
      label: '账户名称:',
      component: 'input',
    },
    invoiceNo: {
      label: '发票税号:',
      component: 'input',
    },
    bankName: {
      label: '开户行:',
      component: 'input',
    },
    bankAccount: {
      label: '账号:',
      component: 'input',
    }
  }

  state = {
    visible: false,
  }

  hide = () => {
    this.setState({
      visible: false,
    })
  }

  handleVisibleChange = visible => {
    this.setState({ visible })
  }

  renderWindow = () => {
    const { cardInfo } = this.props
    const dom = (
      <>
        <p style={{ marginBottom: '10px' }}>
          <Icon style={{ color:'red', marginRight: '5px' }} type="close-circle" theme="filled" />你确定要{!Number(cardInfo.isAvailable)?'激活': '禁用'}该{Number(cardInfo.cardAccountType) === 1?'对公账户': '备付金账户'}吗？
        </p>
        <div styleName='effect_button_box'>
          <Button size='small' type="primary" onClick={this.isAvailableChange}>确定</Button>
          <Button size='small' onClick={this.hide}>取消</Button>
        </div>
      </>
    )
    return (
      cardInfo.isAvailable?
        <Authorized authority={[BANK_SETTING_DISABLE]}>
          <Popover
            content={dom}
            trigger="click"
            visible={this.state.visible}
            onVisibleChange={this.handleVisibleChange}
          >
            <Button type="danger" ghost>禁用</Button>
          </Popover>
        </Authorized>
        :
        <Authorized authority={[BANK_SETTING_DISABLE]}>
          <Popover
            content={dom}
            trigger="click"
            visible={this.state.visible}
            onVisibleChange={this.handleVisibleChange}
          >
            <Button type="primary" ghost>激活</Button>
          </Popover>
        </Authorized>
    )
  }

  isAvailableChange = () => {
    const { cardInfo, patchBankAccount, getBankAccount } = this.props
    patchBankAccount({ bankAccountId: cardInfo.bankAccountId, isAvailable: !cardInfo.isAvailable }).then(data => {
      notification.success({
        message: `${Number(data.isAvailable)?'激活': '禁用'}成功`,
        description:
          `${Number(data.isAvailable)?'激活': '禁用'}该${Number(data.cardAccountType) === 1?'对公账户': '备付金账户'}成功`,
      })
      getBankAccount({ limit: 1000, offset: 0 })
    })
    this.hide()
  }

  render () {
    const { cardInfo = {} } = this.props
    return (
      <>
        <Col className='bankManage_cardInfo'>
          <h4 style={{ fontSize: '14px', margin: '0 0 10px 0px', height: '42px', lineHeight: '42px' }}>状态：{!cardInfo.isAvailable?<Tag color="red">禁用</Tag>:<Tag color="blue">激活</Tag>}</h4>
          <SchemaForm layout='vertical' schema={this.infoForm} mode={FORM_MODE.DETAIL} data={{ ...cardInfo }}>
            <Item field="invoiceTitle" />
            <Item field="invoiceNo" />
            <Item field="bankName" />
            <Item field="bankAccount" />
          </SchemaForm>
          {/* <div styleName='button_box'>
            {this.renderWindow()}
          </div> */}
        </Col>
      </>
    )
  }
}
