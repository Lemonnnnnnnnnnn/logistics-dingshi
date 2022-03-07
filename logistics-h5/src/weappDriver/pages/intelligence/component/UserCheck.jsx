import React from 'react'
import router from 'umi/router'
import { WhiteSpace, Toast } from 'antd-mobile'
import CSSModules from 'react-css-modules'
import { SchemaForm, Item, FormButton } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton'
import styles from './UserCheck.less'
import bgImg from '@/assets/driver/background.png'
import { postDriverBasicAuth } from '@/services/apiService'
import { testIdCard } from '@/utils/utils'
import '@gem-mine/mobile-schema-form/src/fields'

@CSSModules(styles, { allowMultiple: true })
export default class Index extends React.Component{

  schema = {
    nickName: {
      label: '姓名',
      component: 'inputItem',
      placeholder: '请输入姓名',
      clear:true,
      rules:{
        required:[true, '请输入姓名'],
      },
    },
    idcardNo: {
      label: '身份证',
      component: 'inputItem',
      placeholder: '请输入身份证号',
      rules: {
        required: [true, '请输入身份证号'],
        validator: ({ value }) => {
          if (!testIdCard(value)){
            return '请输入正确的身份证号'
          }
        }
      },
    },

  }

  renderErrors = (errors) => {
    Toast.fail(errors[0])
  }

  submitForm = params => {
    postDriverBasicAuth(params).then(res => {
      if (res.description === '一致') {
        router.replace('intelligence')
        return
      }
      Toast.fail('认证失败, 姓名与身份证号不匹配')
    })
  }

  render () {
    return (
      <div styleName='container'>
        <img src={bgImg} alt="图片加载失败" />
        <div styleName='title'>实名认证</div>
        <div styleName='form'>
          <SchemaForm schema={this.schema}>
            <Item field='nickName' />
            <WhiteSpace />
            <WhiteSpace />
            <Item field='idcardNo' />
            <WhiteSpace />
            <WhiteSpace />
            <p styleName='red'>*请确保姓名与身份证上的信息一致</p>
            <WhiteSpace />
            <WhiteSpace />
            <DebounceFormButton debounce type='primary' label='完成验证' onError={this.renderErrors} onClick={this.submitForm} />
          </SchemaForm>
        </div>
      </div>
    )
  }
}
