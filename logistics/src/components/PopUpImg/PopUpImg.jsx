import React, { useState, useEffect } from 'react';
import CSSModules from 'react-css-modules';
import { Player } from 'video-react';
import '../../../node_modules/video-react/dist/video-react.css';
import styles from './PopUpImg.css';
import ImageDetail from '@/components/ImageDetail';

const imgCache = window._imgCache = {
};

const PopUpImg = ({ src, type = Math.random(), largeSrc = src, video = false, needAuthority, allow, ...restProps }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [currentImg, setCurrentImg] = useState(largeSrc);

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

  const showBigImg = (e) => {
    if (!needAuthority) setShowDetail(true);
    const { accountType } = JSON.parse(localStorage.getItem('token_storage'));
    if (accountType === 1) setShowDetail(true);
    if (allow) setShowDetail(true);
  };
  return (
    <>
      {video ? (
        <div onClick={showBigImg} className={styles.box}>
          <Player src={src} />
          <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, backgroundColor: 'transparent' }} />
        </div>
      ): <img styleName="thumb-img" onClick={showBigImg} src={src} {...restProps} alt='' />}
      {
        showDetail
          ? (
            <div onClick={() => setShowDetail(false)} styleName="modal-mask">
              <div onClick={e => e.stopPropagation()} styleName="modal-box">
                {
                  video ? (
                    <div style={{ height: '400px', width: '100%' }}>
                      <Player src={src} />
                    </div>
                  ) : (
                    <ImageDetail imageData={imgCache[type] && imgCache[type].filter(item => item.indexOf('.mp4') === -1)} index={getIndex()} />
                  )
                }
              </div>
            </div>
          )
          : null
      }
    </>
  );
};

export default CSSModules(styles, { allowMultiple: true })(PopUpImg);
