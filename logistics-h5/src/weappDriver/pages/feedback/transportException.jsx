import React, { Component } from 'react';
import { List, WhiteSpace, Toast } from 'antd-mobile'
import { SchemaForm, Item, FormButton } from '@gem-mine/mobile-schema-form/src';
import router from 'umi/router';
import { postFeedBack, postExceptions } from '@/services/apiService'
import '@gem-mine/mobile-schema-form/src/fields'
import DefaultImgItems from '@/weappDriver/components/uploadImg/addComponent/DefaultItemImage'
import DebounceFormButton from '@/components/DebounceFormButton'

class Feedback extends Component {

  state = {
    num:0
  }

  constructor (props){
    super(props)
    this.schema = {
      theme: {
        label:'主题',
        component: 'inputItem',
        placeholder: '请输入主题',
        rules:{
          required:[true, '请输入主题'],
        },
      },
      feedbackContent: {
        component: 'textArea',
        arrow: 'empty',
        rules: {
          required: [true, '请输入问题的详细描述'],
        },
        props:{
          count: 100,
          rows: 3,
          placeholder: '请输入问题的详细描述',
          style:{
            fontSize:'14px'
          }
        },
      },
      feedbackDentryid: {
        component: DefaultImgItems,
        onAdded:this.onImageChange,
        onDelete:this.onImageChange
      },
    }
  }

  onImageChange = (file) => {
    this.setState({
      num:file.length
    })
  }

  toastError = (error) => {
    Toast.fail(error[0], 1.5)
  }

  sendFeedback = value => {
    const { location: { query: { transportId } } } = this.props
    postExceptions({ transportId, exceptionReason:4, exceptionExplain:value.feedbackContent, exceptionDentryid:(value.feedbackDentryid || []).join(',') })
      .then(()=> {
        Toast.success('提交异常成功', 2)
        setTimeout(()=>{
          router.goBack()
        }, 2000)
      })
  }

  render () {
    const { num } = this.state
    return (
      <SchemaForm schema={this.schema}>
        <Item field='theme' />
        <WhiteSpace />
        <List>
          <Item field='feedbackContent' />
          <List.Item extra={`${num}/3`}>图片上传</List.Item>
          <Item field='feedbackDentryid' />
        </List>
        <DebounceFormButton
          style={{
            margin: '0 15px',
            width:'calc(100vw - 30px)',
            height: '47px',
            background: 'rgba(46,122,245,1)',
            borderRadius: '4px',
            color: 'white',
            fontSize: '17px',
            position:'absolute',
            bottom:'15px'
          }}
          label='提交'
          onClick={this.sendFeedback}
          onError={this.toastError}
        />
      </SchemaForm>
    );
  }
}

export default Feedback;

