import React from 'react';
import CSSModules from 'react-css-modules';
import { Toast } from 'antd-mobile'
// import { connect } from 'dva'
import { getOSSToken } from '@/services/apiService'
import { isFunction, browser, getTempNameWithKey, getBusinessNameWithKey } from '@/utils/utils';
import nativeApi from '@/utils/nativeApi'
import styles from './UpLoad.less';


function getAccessInfo () {
  Toast.loading('文件上传中', 10)
  return getOSSToken()
}

function tempNameToBusinessName (name){
  return name.replace('temp', 'business')
}

export default (CSSModules(({ children, onUpload, accept, showHeader, saveIntoBusiness = true, maxSize }) => {
  let inputInstance;

  const openUpload = () => {
    inputInstance.click();
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
          resolve(client.put(saveIntoBusiness
            ?getBusinessNameWithKey(file.name)
            :getTempNameWithKey(file.name),
          blob))
        })
    };
    reader.readAsArrayBuffer(file);
  })

  const uploadIfNeeded = () => {
    if (browser.versions.ios && !showHeader) {
      nativeApi.hideHeader()
    }
    const file = inputInstance.files[0]

    if (maxSize && file.size > maxSize){
      return Toast.fail('当前选取文件过大，请重新选择')
    }

    file && getAccessInfo()
      .then(accessInfo => uploadFile(accessInfo, file))
      .then(data => {
        Toast.hide()
        const tempName = data.name
        const res = {
          showFileName: tempName,
          fileName: tempNameToBusinessName(tempName)
        }
        isFunction(onUpload) && onUpload({ ...res, fileSize : file.size })
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
