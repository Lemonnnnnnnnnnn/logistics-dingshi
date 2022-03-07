import React from 'react'
import CSSModules from 'react-css-modules'
import QRCode from 'qrcode.react'
import router from 'umi/router'
import grayCancel from '@/assets/consign/gray_cancel.png'
import styles from './PrebookingQRCode.less'

@CSSModules(styles, { allowMultiple: true })
export default class Index extends React.Component{
  render () {
    const { location: { query: { prebookingId, prebookingNo } } } = this.props
    return (
      <div styleName='container'>
        <div styleName='card'>
          <div styleName='blueCard'>
            <div styleName='bot' />
            <div styleName='backImage'>
              <h3>易键达</h3>
              <p styleName='mar_bot30'>专为司机打造的大宗基建货物运输平台 秒结运费</p>
              <p>更多详细信息请登录官网</p>
              <p>www.dingshikj.com</p>
            </div>
          </div>
          <div styleName='white-card'>
            <h3>预约单号</h3>
            <p>{prebookingNo}</p>
            <div styleName='qrCode'>
              <QRCode
                value={`${window.envConfig.QRCodeEntry}/driver/prebooking/${prebookingId}`}
                size={80}
                fgColor="#000000"
                style={{
                  margin: '0 auto'
                }}
              />
            </div>
            <p styleName='gray'>转发给司机微信扫码接单</p>
            <p styleName='gray'>（可长按图片识别二维码)</p>
          </div>
        </div>
        <div styleName='image_container'>
          <img onClick={() => router.replace('/WeappConsign/main/release')} styleName='image' src={grayCancel} alt="图片加载失败" />
        </div>
      </div>
    )
  }
}

