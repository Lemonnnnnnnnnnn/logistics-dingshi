import React, { Component } from 'react';
import { SchemaForm, FORM_MODE, Item, Parent, FormButton, ErrorNoticeBar } from '@gem-mine/mobile-schema-form/src';
import '@gem-mine/mobile-schema-form/src/fields'
import { List, WhiteSpace } from 'antd-mobile'
import { isEqual } from '@/utils/utils';
import CustomField from './components/CustomField'


const schema = {
  'userName': {
    key: 'userName',
    label: '用户名',
    component: 'input',
    visible: ({ formData }) => (formData.project !== 2),
    rules:{
      required: true,
      max: 50,
      validator: async ({ value, formData }) => {
        console.error('userName', formData, value)
        // return '这是一个测试'
      },
    },
    placeholder: '请填写用户名',
  },
  'realName': {
    key: 'realName',
    label: '真实姓名',
    component: 'inputItem',
    rules:{
      required:true
    },
    value: {
      watch: 'userName',
      action: (userName) =>{
        console.info('watch userName', userName)
        return `${userName}=1111`
      }

    }
  },
  'password': {
    key: 'password',
    label: '密码',
    component: 'inputItem',
    required: true
    // validator: ({ rule, value, entity, callback })=> callback(),
    // type:'password'
  },
  'project': {
    key: 'project',
    label: '项目列表',
    component: 'picker',
    // disabled:true,
    rules:{
      required:true
    },
    defaultValue:[1],
    // placeholder:'请选择项目',
    options: () => [{
      value: 1,
      label: <div style={{ color: 'red' }}>aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
    }, { value: 2, label: 'bbb' }, { value: 3, label: 'ccc' }]
  },
  'project2': {
    key: 'project2',
    label: '项目列表2',
    component: 'picker',
    // disabled:true,
    required: true,
    options: {
      watch: ['project'],
      action: (formData) => {
        if (isEqual(formData.project, [2])) {
          return [{ value: 1, label: <div style={{ color: 'red' }}>aaa</div> }, {
            value: 2,
            label: 'bbb'
          }, { value: 3, label: 'ccc' }]
        }
        return [{ value: 2, label: 'bbb' }, { value: 3, label: 'ccc' }]
      }
    }
  },
  'createTime': {
    key: 'createTime',
    label: '创建时间',
    rules:{
      required: true,
    },
    component: 'calender',
    props:{
      type: 'one',
      arrow:'horizontal'
    }
  },
  'custom': {
    key: 'custom',
    label: '自定义组件',
    component: CustomField,
    // disabled:true,
  },
  'users':{
    type:'array',
    fields:{
      'userName':{
        label: '用户名',
        component: 'inputItem',
      },
      'realName':{
        label: '真实姓名',
        component: 'inputItem',
        format:{
          output:(value)=>`${value}111`
        }
      },
      'password':{
        component: 'inputItem',
        value:{
          watch:'users.userName',
          action:(username)=>username
        }
      }
    }
  }
}

const data ={
  'userName':"张小敬",
  'users':[{
    userName:'张小强'
  }]
}

export default class FormDemo extends Component {

  state={ errors:[] }

  componentDidMount () {
    // console.warn('componentDidMount=', this.props)
  }

  addUser (data, form){
    form.addArrayItem('users', { userName:'aaa' })
  }

  render () {
    console.log(this.props.entity)
    return (
      <SchemaForm schema={schema} data={data} mode={FORM_MODE.ADD} onChange={()=>this.setState({ errors:[] })}>
        <ErrorNoticeBar errors={this.state.errors} />
        <List renderHeader={() => '这是一个列表'}>
          <Item field="userName" style={{ margin:10 }} />
          <Item field='realName' />
        </List>
        <List className="pick-list" renderHeader={() => '这是一个列表2'}>
          <Item field='password' />
          <Item field='project' />
          {/* <Item field='project2' /> */}
          <Item field='createTime' />
        </List>
        {/* <List renderHeader={() => '这是自定义组件'}> */}
        {/* <Item field='custom' /> */}
        {/* </List> */}
        <List renderHeader={() => '表单数组'}>
          <Parent field='users'>
            <Item field='userName' />
            <Item field='realName' />
            <Item field='password' />
          </Parent>
          <FormButton debounce action="submit" onClick={this.addUser} />
        </List>
        <WhiteSpace size="lg" />
        {/* <Calendar type='one' /> */}
        {/* <Row> */}
        {/* <Item field='phoneList' {...this.props} /> */}
        {/* </Row> */}
        <FormButton
          debounce
          label="保存"
          debounce
          visible={(formData)=>{
            const { project = [] } = formData
            return project[0] === 1
          }}
          validate
          onError={(errors)=>this.setState({ errors })}
          onClick={(formdata)=>{
            console.info('formdata', formdata)
          }}
        />
      </SchemaForm>)
  }
}
