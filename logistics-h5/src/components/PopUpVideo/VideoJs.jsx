import React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export const VideoJS = ( props ) => {

  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const { options, onReady } = props;

  React.useEffect(() => {
    // make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      const player = playerRef.current = videojs(videoElement, options, () => {
        console.log("player is ready");
        onReady && onReady(player);
      });
    } else {
      // you can update player here [update player through props]
      // const player = playerRef.current;
      // player.autoplay(options.autoplay);
      // player.src(options.sources);
    }
  }, [options]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => () => {
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
  }, []);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
}


// const App = () => {
//   const playerRef = React.useRef(null);
//
//   const videoJsOptions = { // lookup the options in the docs for more options
//     autoplay: true,
//     controls: true,
//     responsive: true,
//     fluid: true,
//     sources: [{
//       src: 'http://my-oss-bucket-epressarrive.oss-cn-hangzhou.aliyuncs.com/temp/2021/10/21/_KEY_1634786473703.mp4',
//       type: 'video/mp4'
//     }]
//   }
//
//   const handlePlayerReady = (player) => {
//     playerRef.current = player;
//
//     // you can handle player events here
//     player.on('waiting', () => {
//       console.log('player is waiting');
//     });
//
//     player.on('dispose', () => {
//       console.log('player will dispose');
//     });
//   };
//
//   // const changePlayerOptions = () => {
//   //   // you can update the player through the Video.js player instance
//   //   if (!playerRef.current) {
//   //     return;
//   //   }
//   //   // [update player through instance's api]
//   //   playerRef.current.src([{src: 'http://ex.com/video.mp4', type: 'video/mp4'}]);
//   //   playerRef.current.autoplay(false);
//   // };
//
//   return (
//     <>
//       <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
//     </>
//   );
// }

export default VideoJS;
