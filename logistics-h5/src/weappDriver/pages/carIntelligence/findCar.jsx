import React, { Component } from 'react';
import { Toast } from 'antd-mobile'
import { SchemaForm, Item } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton'
import '@gem-mine/mobile-schema-form/src/fields'
import router from 'umi/router';
import CarNofield from './component/carNofield'

class FindCar extends Component {

  formSchema = {
    carNo: {
      label: '请输入车牌号',
      component: CarNofield,
      rules: {
        required: [true, '请输入车牌号']
      },
    }
  }

  renderErrors = errors => {
    Toast.fail(errors[0], 1, null, false)
  }

  submitForm = value => {
    const { location:{ query:{ plat } } } = this.props
    const { carNo='' } = value
    const _carNo = carNo.toUpperCase()
    const reg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/
    if (!reg.test(_carNo)) {
      return Toast.fail('请输入正确的车牌号', 1)
    }
    router.replace(`findList?carNo=${_carNo}&plat=${plat}`)
  }

  render () {
    return (
      <SchemaForm schema={this.formSchema}>
        <Item field='carNo' />
        <div style={{ padding:'15px', width:'100%', position:'absolute', bottom:'0' }}>
          <DebounceFormButton debounce type='primary' label='立即检索' onError={this.renderErrors} onClick={this.submitForm} />
        </div>
      </SchemaForm>
    );
  }
}

export default FindCar;
