import React, { useState } from 'react'
import { Modal } from 'antd-mobile'
import Video from '@/assets/driver/video.png'
import CssModule from 'react-css-modules'
import styles from '@/weappDriver/components/uploadImg/UpLoad.less'
import VideoJS from './VideoJs'

const popUpVideo = ({ src }) =>{
  const [showModal, setShowModal] = useState(false)

  const openModal = () =>{
    setShowModal(true)
  }

  const cancelModal = () =>{
    setShowModal(false)
  }

  const playerRef = React.useRef(null);

  const videoJsOptions = { // lookup the options in the docs for more options
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{
      src,
      // type: 'video/mp4'
    }]
  }

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // you can handle player events here
    player.on('waiting', () => {
      console.log('player is waiting');
    });

    player.on('dispose', () => {
      console.log('player will dispose');
    });
  };

  return (
    <>
      {/* <video style={{ width: '30vw', height: '30vw' }} onClick={openModal} src={src} /> */}
      <span style={{ margin:'10px 0px 20px 2.5vw' }} styleName="img-preview-wrap upload" onClick={openModal}>
        <div styleName="img-preview-operations">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '48px', height: '48px', borderRadius: '50%' }}>
            <img src={Video} alt='' />
          </div>
        </div>
      </span>
      <Modal
        visible={showModal}
        transparent
        maskClosable
        closable
        onClose={cancelModal}
        title='视频预览'
      >
        <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
      </Modal>
    </>)
}

export default CssModule(styles, { allowMultiple : true })(popUpVideo)
