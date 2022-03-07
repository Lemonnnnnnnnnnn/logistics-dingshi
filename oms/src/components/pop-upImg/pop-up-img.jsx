import React, { useState, useEffect } from 'react';
import CSSModules from 'react-css-modules';
import styles from './pop-up-img.css';
import ImageDetail from '../image-detail';

const imgCache = window._imgCache = {
};

const PopUpImg = ({ src, type = Math.random(), largeSrc = src, needAuthority, allow, ...restProps }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [currentImg] = useState(largeSrc);

  useEffect(() => {
    if (!imgCache[type]) {
      imgCache[type] = [];
    }

    imgCache[type].push(largeSrc);
    return () => {
      const index = imgCache[type].indexOf(largeSrc);
      imgCache[type].splice(index, 1);
    };
  }, [src]);

  const getIndex = () => {
    const index = imgCache[type].indexOf(currentImg);
    return index;
  };

  const showBigImg = () => {
    if (!needAuthority) setShowDetail(true);
    const { accountType } = JSON.parse(localStorage.getItem('token'));
    if (accountType === 1) setShowDetail(true);
    if (allow) setShowDetail(true);
  };

  return (
    <>
      <img styleName="thumb-img" onClick={showBigImg} src={src} {...restProps} alt='' />
      {
        showDetail
          ? (
            <div onClick={() => setShowDetail(false)} styleName="modal-mask">
              <div onClick={e => e.stopPropagation()} styleName="modal-box">
                <ImageDetail imageData={imgCache[type]} index={getIndex()} />
              </div>
            </div>
          )
          : null
      }
    </>
  );
};

export default CSSModules(styles, { allowMultiple: true })(PopUpImg);
