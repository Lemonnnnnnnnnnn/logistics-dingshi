import React from 'react';
import ReactImageGallery from 'react-image-gallery';
import logo from '@/assets/logo.png';
import 'react-image-gallery/styles/css/image-gallery.css';
import { getOssImg } from '@/utils/utils';

// todo 最大化时，无法滚动图片
// todo 可设置不显示缩略图

const defaultSettings = {
  showIndex:0,
  showPlayButton:false,

};

export default function ImageGallery (props){
  const { images = [], className, ...restProps } = props;

  if (images.length===0){
    return <img src={logo} />;
  }

  const _images = images.map(image=>({
    original:getOssImg(image),
    thumbnail:getOssImg(image),
  }));

  return <ReactImageGallery items={_images} showPlayButton={false} {...restProps} />;
}
