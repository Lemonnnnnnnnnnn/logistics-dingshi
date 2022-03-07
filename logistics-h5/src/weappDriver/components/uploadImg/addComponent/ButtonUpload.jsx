import React, { Component } from 'react';
import { Button } from 'antd-mobile'
import CssModule from 'react-css-modules'
import styles from '../UpLoad.less'
import UpLoadImage from '../UpLoadImage'

@UpLoadImage
@CssModule(styles, { allowMultiple: true })
class BigItem extends Component {
  render () {
    const { label } = this.props
    return (
      <Button styleName='add_button'>{label || '拍照或上传'}</Button>
    );
  }
}

export default BigItem;
