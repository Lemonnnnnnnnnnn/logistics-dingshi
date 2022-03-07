import React, { Component } from 'react';
import { List, WhiteSpace, Toast } from 'antd-mobile'
import { SchemaForm, Item, FormButton, Observer } from '@gem-mine/mobile-schema-form/src';
import { postFeedBack, postExceptions, getNowUser } from '@/services/apiService'
import '@gem-mine/mobile-schema-form/src/fields'
import DefaultItemMedia from '@/weappDriver/components/uploadImg/addComponent/DefaultItemMedia'
import DebounceFormButton from '@/components/DebounceFormButton'
// import PopUpVideo from '@/components/PopUpVideo/PopUpVideo'
import AdviseType from './adviseType'
import FeedbackPhone from './feedbackPhone'

class Feedback extends Component {

  state = {
    imageNum : 0,
    videoNum : 0
  }

  componentDidMount () {
    getNowUser().then(data=>{
      const schema = {
        feedbackType : {
          component : AdviseType,
        },
        feedbackContent: {
          component: 'textArea',
          // arrow: 'empty',
          rules: {
            required: [true, '请输入问题的详细描述'],
          },
          props:{
            count: 200,
            // rows: 4,
            placeholder: '请输入问题的详细描述',
            style:{
              fontSize:'14px'
            }
          },
        },
        feedbackDentryid: {
          component: DefaultItemMedia,
          onAdded:this.onImageChange,
          onDelete:this.onImageChange,
          max : 3,
          accept : 'image/*',
          // eslint-disable-next-line no-restricted-properties
          maxSize : 10 * Math.pow(2, 20),
          showSize : true,
        },
        feedbackDentryidVideo: {
          component: DefaultItemMedia,
          onAdded:this.onVideoChange,
          onDelete:this.onVideoChange,
          max : 1,
          accept : 'video/*',
          // eslint-disable-next-line no-restricted-properties
          maxSize : 20 * Math.pow(2, 20),
          showSize : true,
        },
        feedbackPhone :{
          component : FeedbackPhone,
          defaultValue :data.phone
        }
      }
      this.setState({
        ready : true,
        schema
      })
    })
  }

  onImageChange = (file) => {
    this.setState({
      imageNum:file.length
    })
  }

  onVideoChange = (file) => {
    this.setState({
      videoNum:file.length
    })
  }

  toastError = (error) => {
    Toast.fail(error[0], 1.5)
  }

  check =(value) =>{
    const { feedbackPhone, feedbackType } = value
    const reg = /^1\d{10}$/
    if (!reg.test(feedbackPhone)) {
      return Toast.fail('请输入正确的手机号', 2)
    }

    if (!feedbackPhone){
      return Toast.fail('请输入手机号', 2)
    }

    if (!feedbackType){
      return Toast.fail('请选择意见类型', 2)
    }
    return true
  }

  sendFeedback = value => {
    if (!this.check(value)){
      return
    }

    postFeedBack({
      ...value,
      feedbackPort : 10,
      feedbackDentryidVideo : (value.feedbackDentryidVideo || []).join(','),
      feedbackDentryid:(value.feedbackDentryid || []).join(',') }
    )
      .then(()=>{
        Toast.success('反馈成功', 2)
        setTimeout(()=>{
          // router.goBack()
          this.props.onChangeTab(null, 1)
        }, 2000)
      })
    // }
  }

  render () {
    const { imageNum, videoNum, ready, schema } = this.state
    return (
      ready ?
        <SchemaForm schema={schema}>
          <WhiteSpace />
          <List style={{ minHeight : '75vh', background : '#fff' }}>
            <div style={{ margin : '0 1rem' }}>
              <Item field='feedbackType' />
              <Item field='feedbackContent' />
              <div>请提供相关问题的截图或视频，单张图控制在 10M内，视频控制在 20M内</div>
              <div style={{ marginTop : '1rem' }}>图片({`${imageNum}/3`})</div>
              <Item field='feedbackDentryid' />
              <div>视频({`${videoNum}/1`})</div>
              <Item field='feedbackDentryidVideo' />
              <Item field='feedbackPhone' />
              <div>请放心填写，为保护您的隐私，传输方式将进行加密！</div>
            </div>

          </List>
          <DebounceFormButton
            style={{
              margin: '1rem 15px',
              width:'calc(100vw - 30px)',
              height: '47px',
              background: 'rgba(46,122,245,1)',
              borderRadius: '4px',
              color: 'white',
              fontSize: '17px',

            }}
            label='提交'
            onClick={this.sendFeedback}
            onError={this.toastError}
          />
        </SchemaForm> : null
    )
  }
}

export default Feedback;

