import React from 'react'
import MobileForm, { FORM_MODE, FormItem, FormButton } from '@/components/MobileForm';

export default class CustomField extends React.Component {
  schema = {
    fields: [
      {
        key: 'userName2',
        label: '用户名',
        component: 'input',
        required: true,
        modifiable: false,
        maxLength: 50,
        minLength: 10,
        placeholder: '请填写用户名'
        // type:'password'
      },
      {
        key: 'realName2',
        label: '真实姓名',
        component: 'input',
        required: true
      },
      {
        key: 'password2',
        label: '密码',
        component: 'input',
      },
    ],
    operations: [{
      label: '取消',
      type: 'default',
      className: 'mr-10',
      action: 'cancel',
      onClick: (value) => { console.log(value) },
      required: ({ formData }) => {
        const { contacts } = formData
        return contacts === 2
      }
    }, {
      label: '保存',
      type: 'primary',
      action: 'submit2',
      className: 'mr-10',
      onClick: (formData, form) => {
        console.info('props', formData, form)
        const { list } = this.state
        const result = [...list, formData]
        this.props.onChange(result)
        // todo 需要手动验证，目前暂未提供
        console.info('formData', formData)
        this.setState({
          list: result,
          showForm: false,
          showAddButton: true
        })
      }
    }]
  }


  constructor(props) {
    super(props)
    console.info('CustomField', this.props)
    if (props.value && props.value.length > 0) {
      this.state = {
        list: props.value,
        showForm: false,
        showAddButton: true
      }
    } else {
      this.state = {
        list: [],
        showForm: true,
        showAddButton: false
      }
    }
  }

  onAdd = () => {

  }

  showForm = () => {
    this.setState({
      showForm: true,
      showAddButton: false
    })
  }

  render() {

    return (
      <>
        {this.state.list.length > 0 && this.state.list.map((item, index) => {
          const { userName2, realName2, password2 } = item
          return (
            <div key={index}>
              <div>{userName2}</div>
              <div>{realName2}</div>
              <div>{password2}</div>
            </div>
          )
        })}
        {this.state.showForm && (
          <>

            <MobileForm schema={this.schema} entity={{}} mode={FORM_MODE.ADD}>
              <FormButton debounce action="submit2" />
              <FormItem fields='userName2' />
              <FormItem fields='realName2' />
              <FormItem fields='password2' />
            </MobileForm>
          </>
        )}
        {this.state.showAddButton && <a onClick={this.showForm}>添加提货点</a>}

      </>
    )
  }

}
