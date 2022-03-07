import React from 'react'
import CSSModules from 'react-css-modules'
import { WhiteSpace, Toast, InputItem } from 'antd-mobile'
import { SchemaForm, Item, FormButton } from '@gem-mine/mobile-schema-form'
import router from 'umi/router'
import styles from './add.less'
// import SelectType from './SelectType'
import '@gem-mine/mobile-schema-form/src/fields'
import service from '@/assets/driver/line_service.png'
import warning from '@/assets/driver/warning.png'
import { lodashDebounce } from '@/utils/utils'
import { getBankAccount, getNowUser, postWeAppBankAccount } from '@/services/apiService'


@CSSModules(styles, { allowMultiple: true })
export default class Add extends React.Component{
  state = {
    // phoneNumber: '',
    ready: false,
    formData: {},
    loading: false
  }

  bindFormSchema = {
    code: {
      component: 'inputItem',
      placeholder: '请输入验证码',
      rules: {
        required: [true, '请输入验证码'],
        validator: ({ value }) => {
          const reg = /^[A-Za-z0-9]+$/
          if (!reg.test(value)) {
            return '验证码由字母和数字组成'
          }
        }
      }
    }
  }

  formSchema = {
    // type: {
    //   label: '银行卡类型',
    //   component: SelectType,
    //   rules: {
    //     required: [true, '请选择银行卡类型'],
    //   }
    // },
    nickName: {
      label: '持卡人',
      component: InputName,
      rules: {
        required: [true, '请输入持卡人姓名'],
      },
      placeholder: '请输入持卡人姓名',
      onChange: (nickName) => {

      }
    },
    bankAccount: {
      label: '储蓄卡',
      component: InputBankCard,
      placeholder: '请输入常用银行卡号',
      rules: {
        required: [true, '请输入常用银行卡号'],
      },
      getCardInfo: (data) => {
        this.cardInfo = data
      }
    },
    // idcardNo: {
    //   label: '身份证号',
    //   component: 'inputItem',
    //   placeholder: '请输入身份证号',
    //   disabled: true,
    //   rules: {
    //     required: [true, '请输入身份证号'],
    //     validator: ({ value }) => {
    //       if (!testIdCard(value)){
    //         return '请输入正确的身份证号'
    //       }
    //     }
    //   }
    // },
    // phone: {
    //   label: '手机号',
    //   component: 'inputItem',
    //   placeholder: '请输入手机号',
    //   rules: {
    //     required: [true, '请输入手机号'],
    //     validator: ({ value }) => {
    //       const phone = /^1\d{10}$/
    //       if (!phone.test(value)) {
    //         return '手机号格式错误'
    //       }
    //     }
    //   }
    // }
  }

  componentDidMount () {
    getNowUser().then(data => {
      this.setState({
        formData: {
          // nickName: data.nickName,
          // idcardNo: data.idcardNo,
        },
        ready: true
      })
    })
  }

  submitForm = data => {
    if (!data.nickName || !data.nickName.trim()) return Toast.fail('请输入持卡人姓名')
    if (!this.cardInfo || !this.cardInfo.bankName) return Toast.fail('银行卡尚未识别成功')
    const formData = {
      bankAccount: data.bankAccount,
      bankName: this.cardInfo.bankName,
      province: this.cardInfo.province,
      city: this.cardInfo.city,
      nickName: data.nickName.trim()
    }
    this.setState({
      loading: true
    })
    postWeAppBankAccount(formData).then(() => {
      Toast.success('绑定成功', 1.5, router.replace('bankCard'), true)
    })
      .catch(() => {
        this.setState({
          loading: false
        })
      })
    // this.setState({
    //   phoneNumber: data.phone,
    //   step: 2
    // })
  }

  bindCard = data => {
    console.log(data)
    Toast.success('绑定银行卡成功', 2, () => {
      router.push('bankCard')
    })
  }

  renderErrors = errors => {
    Toast.fail(errors[0], 1, null, false)
  }

  toService = () => {
    router.push('/WeappDriver/customerService')
  }


  render () {
    const { formData, ready, loading } = this.state
    return (
      ready
      &&
      <div styleName='container' className='weApp_driver_bankCard_add'>
        <SchemaForm schema={this.formSchema} data={formData}>
          {/* <Item field='type' />
          <WhiteSpace /> */}
          <Item field='nickName' />
          <WhiteSpace />
          {/* <Item field='idcardNo' />
          <WhiteSpace /> */}
          <Item field='bankAccount' />
          <WhiteSpace />
          <WhiteSpace />
          <WhiteSpace />
          <div styleName='btn_box'>
            <FormButton debounce disabled={loading} type='primary' label='下一步' onError={this.renderErrors} onClick={this.submitForm} />
          </div>
        </SchemaForm>
        <div styleName='line_service'>
          <img src={service} alt="图片加载失败" />
          <span onClick={this.toService}>联系客服</span>
        </div>
        {/* <div styleName={step === 2? 'code_container init_active': 'code_container'}>
          <h3>已发送验证码至手机</h3>
          <p>{phoneNumber && `${phoneNumber.substring(0, 3)}******${phoneNumber.substr(8)}` || '' }</p>
          <SchemaForm schema={this.bindFormSchema}>
            <Item field='code' />
            <WhiteSpace />
            <WhiteSpace />
            <WhiteSpace />
            <div styleName='btn_box'>
              <FormButton debounce type='primary' label='绑定' onError={this.renderErrors} onClick={this.bindCard} />
            </div>
          </SchemaForm>
        </div> */}
      </div>
    )
  }
}

@CSSModules(styles, { allowMultiple: true })
class InputName extends React.Component{
  state = {
    value: ''
  }

  onChange = value => {
    this.setState({
      value
    })
    this.props.form.setFieldsValue({ nickName: value })
  }

  render () {
    return (
      <div styleName='inputName'>
        <span>持卡人</span>
        <InputItem placeholder='请输入持卡人姓名' onChange={this.onChange} value={this.state.value} />
        {/* <div styleName='warning'>
          <img src={warning} alt="图片加载失败" />
          <span>只能添加本人银行卡哦</span>
        </div> */}
      </div>
    )
  }
}

@CSSModules(styles, { allowMultiple: true })
class InputBankCard extends React.Component{
  state = {
    bankName: ''
  }

  constructor (props){
    super(props)
    this._getBankName = lodashDebounce(this.getBankName, 1000)
  }

  getBankName = val => {
    console.log(this.props)
    getBankAccount(val).then(data => {
      this.setState({
        bankName: data.bankName || ''
      })
      this.props.field.getCardInfo(data)
    })
  }

  onChange = val => {
    this.props.onChange(val)
    this.props.field.getCardInfo(null)
    if (val === '') {
      this.setState({
        bankName: ''
      })
    }
    if ( val && val.length > 15 ) {
      this._getBankName({ bankAccount: val })
    }
  }

  render () {
    const { bankName } = this.state
    return (
      <div styleName='inputBankCard_container'>
        <div styleName='inputBankCard'>
          <span>储蓄卡</span>
          <InputItem placeholder='请输入储蓄卡号' clear onChange={this.onChange} />
        </div>
        <div styleName='tips'>{bankName}</div>
      </div>
    )
  }
}
