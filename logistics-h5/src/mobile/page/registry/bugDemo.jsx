import React from 'react'
import { SchemaForm, FORM_MODE, Item, FormButton, ErrorNoticeBar } from '@gem-mine/mobile-schema-form/src';
import '@gem-mine/mobile-schema-form/src/fields'

export default class Demo extends React.Component{

  state = {
    errors: []
  }

  constructor (props) {
    super(props)
    this.schema = {
      // 当Field1使用validate校验,表单校验不正常
      // 当Field1中的validate替换为pattern时，表单校验正常
      'field1':{
        label: '字段1',
        component: 'inputItem',
        rules: {
          required: [true, '请输入字段1'],
          // pattern:[/^1\d{10}$/, '请输入正确的手机号'],
          validator: ({ value }) => {
            if (value!=='1') return 'field1错误'
          }
        }
      },
      'field2':{
        label: '字段2',
        component: 'inputItem',
        rules: {
          required: [true, '请输入字段2'],
          // pattern:[/^[A-Za-z0-9_]{6,16}$/, '请输入正确的字段2'],
          validator: ({ value }) => {
            if (value!=='2') return 'field2错误'
          }
        }
      },
      'copyField2':{
        label: '重复字段2',
        component: 'inputItem',
        rules: {
          required: [true, '请输入重复字段2'],
          validator: ({ value, formData }) => {
            const { field2 } = formData
            if (!(value === field2)) {
              return '输入不一致'
            }
          }
        }
      }
    }
  }

  render (){
    return (
      <SchemaForm schema={this.schema} mode={FORM_MODE.ADD} onChange={() => this.setState({ errors: [] })}>
        <ErrorNoticeBar errors={this.state.errors} />
        <Item field="field1" />
        <Item field="field2" />
        <Item field="copyField2" />
        <FormButton debounce
          label='提交'
          validate={['field1', 'field2', 'copyField2']}
          onError={(errors) => this.setState({ errors })}
          onClick={()=>alert('提交')}
        />
      </SchemaForm>
    )
  }
}
