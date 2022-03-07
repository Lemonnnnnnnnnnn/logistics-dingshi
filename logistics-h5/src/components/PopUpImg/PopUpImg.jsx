import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './PopUpImg.css'

const PopUpImg = ({ src, isShowImage, ...restProps }) => (
  <>
    {isShowImage && <img styleName="thumb-img" src={src} {...restProps} alt='' />}
  </>
)

export default CSSModules(styles, { allowMultiple: true })(PopUpImg)
