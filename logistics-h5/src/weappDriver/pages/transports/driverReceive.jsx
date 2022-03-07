import React, { Component } from 'react';
import { Card, Icon, Toast } from 'antd-mobile'
import { SchemaForm, Item, FormButton } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton'
import router from 'umi/router';
import { browser } from '@/utils/utils'
import { getJsSDKConfig, postTransportProcess } from '@/services/apiService'
import signIcon from '@/assets/signIcon.png'
import style from './driverPickup.less'
import UpLoadImage from '@/weappDriver/components/uploadImg/addComponent/ButtonUpload'
import '@gem-mine/mobile-schema-form/src/fields'

class DriverReceive extends Component {

  constructor (props) {
    super(props)
    this.schema = {
      billDentryid: {
        label:'添加到站图片',
        component: UpLoadImage,
        imageStyle:{
          width:'256px',
          height:'auto',
          margin:'10px 0'
        },
        rules:{
          required:[true, '请上传到站图片']
        },
      }
    }
  }

  componentDidMount () {
    if (browser.versions.android) {
      getJsSDKConfig({ url: encodeURIComponent(window.location.href.split('#')[0]) })
        .then(({ timestamp, nonceStr, signature }) => {
          wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx5b020341411ebf08', // 必填，公众号的唯一标识
            timestamp, // 必填，生成签名的时间戳
            nonceStr, // 必填，生成签名的随机串
            signature, // 必填，签名
            jsApiList: ['getLocation'] // 必填，需要使用的JS接口列表
          })
        })
    }
  }

  formOnError = () => {
    Toast.fail('请上传到站图片', 1)
  }

  submitData = (data) => {
    const { billDentryid } = data
    const { location:{ query: { transportId } } } = this.props
    const submitData = { billDentryid: billDentryid.join(','), pointType: 3, transportId }
    this.getLocation(submitData)
  }

  getLocation = submitData =>{
    Toast.loading('正在获取当前定位', 100)
    wx.getLocation({
      type:'gcj02',
      isHighAccuracy:true,
      success:res => {
        Toast.hide()
        const { longitude, latitude } = res
        postTransportProcess({ longitude, latitude, ...submitData })
          .then(() => {
            Toast.success('提交成功', 2)
            setTimeout(()=>{
              this.goback()
            }, 2000)
          })
      },
      fail: () => {
        // 获取不到定位就将经纬度先设为0.0传给后端
        postTransportProcess({ longitude : 0.0, latitude : 0.0, ...submitData })
          .then(() => {
            Toast.success('提交成功', 2)
            setTimeout(()=>{
              this.goback()
            }, 2000)
          })
        // Toast.fail('获取定位信息失败，请开启定位', 1)
      }
    })
  }

  goback = () => {
    router.goBack()
  }

  render () {
    return (
      <SchemaForm schema={this.schema}>
        <Card style={{ overflow: 'hidden', paddingBottom: '25px', width: '315px', margin: '9px auto 18px auto' }}>
          <Card.Body prefixCls='driverPickCard'>
            <div className={style.leftTop}>
              <Icon type="check" style={{ position: 'absolute', width: '25px', height: '18px', color: 'white', left: '-20px', top: '-18px' }} color="white" />
            </div>
            <div style={{ position: 'relative', left: '33px', width: '256px', top: '26px', display: 'inline-block' }}>
              <img src={signIcon} alt="" />
              <div style={{ marginLeft: '39px', display: 'inline-block', verticalAlign: 'top' }}>
                <div style={{ fontSize: '14px', lineHeight: '20px', color: 'rgba(52,67,86,0.5)', fontFamily: 'PingFangSC-Regular,PingFang SC', fontWeight: 600 }}>请上传</div>
                <div style={{ marginTop: '4px', fontSize: '23px', lineHeight: '27px', color: 'rgba(14,27,66,1)', fontFamily: 'PingFangSC-Regular,PingFang SC', fontWeight: 600 }}>到站图片</div>
              </div>
              <div style={{ margin: '15px auto 20px auto ', fontFamily: 'PingFangSC-Regular,PingFang SC', color: 'rgba(52,67,86,0.7)', fontSize: '19px', width: '256px', height: '56px', lineHeight: '28px', fontWeight: 600 }}>请拍照或上传图片，车头及货物相关信息</div>
              <Item field="billDentryid" />
            </div>
          </Card.Body>
        </Card>
        <DebounceFormButton onError={this.formOnError} label='提交' debounce onClick={this.submitData} style={{ width:'315px', position:'relative', color:'white', background:'rgba(251,164,79,1)', borderRadius:'8px', margin:'23px auto 20px auto' }} />
      </SchemaForm>
    );
  }
}

export default DriverReceive;
