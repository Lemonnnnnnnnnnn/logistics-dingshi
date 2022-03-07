import React from 'react';
import CSSModules from 'react-css-modules';
import moment from 'moment'
import { Toast } from 'antd-mobile'
// import { connect } from 'dva'
import styles from './DriverUpLoad.css';
import { getOSSToken } from '@/services/apiService'
import { isFunction, browser } from '@/utils/utils';
import nativeApi from '@/utils/nativeApi'

// import('ali-oss')
//   .then(({ default: OSSMethod }) => OSS = OSSMethod)


function getAccessInfo () {
  Toast.loading('图片上传中', 100)
  return getOSSToken()
}

function getTempNameWithKey (name) {
  const nowDate = moment(new Date()).format('YYYY/MM/DD')
  return `temp/${nowDate}/${name.replace(/\.([^.]+)$/, `_KEY_${new Date().getTime()}.$1`)}`
}

function tempNameToBusinessName (name){
  return name.replace('temp', 'business')
}

export default (CSSModules(({ children, onUpload, accept, showHeader }) => {
  let inputInstance;

  const openUpload = () => {
    console.log(!browser.versions.android)
    // if (!browser.versions.android){
    //   inputInstance.click();
    // }
    inputInstance.click();
    // inputInstance.click();
  };

  const uploadFile = ({ credentials: { accessKeyId, accessKeySecret, securityToken } }, file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result], { type: file.type })
      const { ossEndpoint, ossBucket } = window.envConfig
        import('ali-oss').then(({ default:OSS })=>{
          const client = new OSS({
            accessKeyId,
            accessKeySecret,
            stsToken: securityToken,
            endpoint: ossEndpoint,
            bucket: ossBucket
          })
          resolve(client.put(getTempNameWithKey(file.name), blob))
        })
    };
    reader.readAsArrayBuffer(file);
  })

  const uploadIfNeeded = () => {
    if (browser.versions.ios && !showHeader) {
      nativeApi.hideHeader()
    }
    const file = inputInstance.files[0]
    console.log(inputInstance.files[0])
    file && getAccessInfo()
      .then(accessInfo => uploadFile(accessInfo, file))
      .then(data => {
        Toast.hide()
        const tempName = data.name
        const res = {
          showFileName: tempName,
          fileName: tempNameToBusinessName(tempName)
        }
        isFunction(onUpload) && onUpload(res)
        // return useOcrGeneral({ image: data.url, transportId:13564684564456 })
      })
      .catch(()=>{
        Toast.hide()
        Toast.fail('上传失败,请检查您的网络连接', 1)
      })
  };

  return (
    <div styleName="upload" key={Math.random()} onClick={openUpload}>
      <input
        onChange={uploadIfNeeded}
        ref={fileInput => (
          inputInstance = fileInput
        )}
        accept={accept}
        type="file"
        style={{ display: 'none' }}
      />
      {children}
    </div>
  );
}, styles))
