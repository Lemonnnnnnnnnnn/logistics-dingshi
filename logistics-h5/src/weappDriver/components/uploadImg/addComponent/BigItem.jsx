import React, { Component } from 'react';
import CssModule from 'react-css-modules'
import styles from '../UpLoad.less'
import UpLoadImage from '../UpLoadImage'
import addCamera from '@/assets/driver/camera.png'

@UpLoadImage
@CssModule(styles, { allowMultiple: true })
class BigItem extends Component {
  render () {
    const { backImg, label } = this.props
    return (
      <div styleName='image_container'>
        {
          backImg?
            <img styleName='hasBackImg' src={backImg} alt='图片加载失败' />
            :
            null
        }
        <div styleName="camera_icon">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '48px', height: '48px', background: 'rgba(46,122,245,1)', borderRadius: '50%' }}>
            <img src={addCamera} alt='' />
          </div>
          <p>{label}</p>
        </div>
      </div>
    );
  }
}

export default BigItem;