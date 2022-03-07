import React from 'react';
import CSSModules from 'react-css-modules';
import moment from 'moment';
import { message } from 'antd';
import { getOSSToken } from '@/services/apiService';
import { isFunction, last } from '@/utils/utils';
import styles from './Upload.css';

// import('ali-oss')
//   .then(({ default: OSSMethod }) => OSS = OSSMethod)

function getAccessInfo () {
  return getOSSToken();
}

function getTempNameWithKey (name) {
  const nowDate = moment(new Date()).format('YYYY/MM/DD');
  return `temp/${nowDate}/${name.replace(/\.([^.]+)$/, `|&|_KEY_${new Date().getTime()}.$1`).split('|&|')[1]}`;
  // return `temp/${nowDate}/${name.replace(/\.([^.]+)$/, `_KEY_${new Date().getTime()}.$1`)}`
}

function getBusinessNameWithKey (name) {
  const nowDate = moment(new Date()).format('YYYY/MM/DD');
  return `business/${nowDate}/${name.replace(/\.([^.]+)$/, `|&|_KEY_${new Date().getTime()}.$1`).split('|&|')[1]}`;
  // return `business/${nowDate}/${name.replace(/\.([^.]+)$/, `_KEY_${new Date().getTime()}.$1`)}`
}

function tempNameToBusinessName (name){
  return name.replace('temp', 'business');
}

export default CSSModules(({ children, onUpload, accept, renderMode, fileSuffix, multiple, saveIntoBusiness = true, size, style }) => {
  let inputInstance;
  const openUpload = () => {
    inputInstance.click();
  };

  const uploadFile = ({ credentials: { accessKeyId, accessKeySecret, securityToken } }, file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result], { type: file.type });
      const { ossEndpoint, ossBucket } = window.envConfig;
      import('ali-oss').then(({ default:OSS })=>{
        const client = new OSS({
          accessKeyId,
          accessKeySecret,
          stsToken: securityToken,
          endpoint: ossEndpoint,
          bucket: ossBucket
        });
        resolve(client.put(saveIntoBusiness ?getBusinessNameWithKey(file.name) :getTempNameWithKey(file.name), blob));
      });
    };
    reader.readAsArrayBuffer(file);
  });

  const uploadIfNeeded = () => {
    const file = inputInstance.files[0];
    const fileSize = (file?.size/1024).toFixed(2);
    if (renderMode !== 'img' && renderMode !== 'wordImg' ) {
      const fileType = last(file.name.split('.'));
      if (fileSuffix.findIndex(item => item.toLowerCase() === fileType.toLowerCase()) === -1) {
        message.error('不支持的文件类型');
        return;
      }
    }
    if (renderMode === 'photo' && fileSuffix ) {
      const fileType = last(file.name.split('.'));
      if (fileSuffix.findIndex(item => item.toLowerCase() === fileType.toLowerCase()) === -1) {
        message.error('不支持的文件类型');
        return;
      }
    }
    // eslint-disable-next-line eqeqeq
    if (size != undefined && fileSize > size) {
      message.error(`当前文件${ fileSize }KB 超过了限制大小${ size }KB`);
      return;
    }

    file && getAccessInfo()
      .then(accessInfo => uploadFile(accessInfo, file, renderMode))
      .then(data => {
        const tempName = data.name;
        const res = {
          oldName: file.name,
          showFileName: tempName,
          fileName: tempNameToBusinessName(tempName)
        };
        isFunction(onUpload) && onUpload(res);
      });
  };

  return (
    <div styleName="upload" onClick={openUpload} style={style}>
      <input
        onChange={uploadIfNeeded}
        ref={fileInput => (inputInstance = fileInput)}
        accept={accept}
        type="file"
        multiple={multiple}
        style={{ display: 'none' }}
      />
      {children}
    </div>
  );
}, styles);
