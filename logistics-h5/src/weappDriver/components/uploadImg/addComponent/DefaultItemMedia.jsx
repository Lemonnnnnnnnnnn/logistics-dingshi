import React, { Component } from 'react';
import CssModule from 'react-css-modules'
import addCamera from '@/assets/driver/camera.png'
import styles from '../UpLoad.less'
import UpLoadMedia from '../UpLoadMedia'

@UpLoadMedia
@CssModule(styles, { allowMultiple: true })
class DefaultItemMedia extends Component {
  render () {
    return (
      <span style={{ margin:'10px 0px 20px 2.5vw' }} styleName="img-preview-wrap upload">
        <div styleName="img-preview-operations">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '48px', height: '48px', background: 'rgba(46,122,245,1)', borderRadius: '50%' }}>
            <img src={addCamera} alt='' />
          </div>
        </div>
      </span>
    );
  }
}

export default DefaultItemMedia;
