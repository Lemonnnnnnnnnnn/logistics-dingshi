import React, { useState, useEffect } from 'react'
import { ImagePicker, Toast } from 'antd-mobile'
import { FORM_MODE } from '@gem-mine/mobile-schema-form'
import WxImageViewer from 'react-wx-images-viewer';
import { getOssImg, getTempNameWithKey, tempNameToBusinessName, dataURLtoBlob, isFunction, isArray } from '@/utils/utils'
import { getOSSToken, useOcrGeneral } from '@/services/apiService'
import styles from './UpLoadImage.css'

export default function UpLoadImage (_props){
  const { value, onChange: _onChange, mode, field={}, ocrCallBack=()=>{}, isOcr=false, ocrParams={} } = _props
  const [showFiles, setShowFiles] = useState([])
  const [isInitData, setIsInitData] = useState(false)
  const [uploadFiles, setUploadFiles] = useState([])
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [imageListIndex, setImageListIndex] = useState()
  useEffect(()=>{
    if ((mode === FORM_MODE.DETAIL || mode === FORM_MODE.MODIFY) && !isInitData && value?.length ){
      setIsInitData(true)
      if (isArray(value)){
        setShowFiles(value)
        setUploadFiles(value)
      } else {
        setShowFiles([value])
        setUploadFiles([value])
      }
    }
  }, [value])

  const filesMaxLength = 1
  const { label, style, valueStyle = {} } = field
  const selectable = mode === FORM_MODE.DETAIL ? false : showFiles.length < filesMaxLength // 当表单模式为详情模式,或者图片文件长度大于等于文件最大长度时不可选
  const disableDelete = mode === FORM_MODE.DETAIL // 当表单模式为详情模式时不可删除
  const imagePickerFiles = showFiles.map(item => ({ url: getOssImg(item) }))

  const onFail = (errMsg)=>{
    Toast.show(errMsg)
  }

  const onSuccess = ()=> {
    Toast.success('上传成功', 1)
    return Promise.resolve({})
  }

  const onChange = (_files, operationType, index) => {
    if (operationType === 'add') {
      Toast.loading('上传中', 1000)
      const index = _files.length - 1
      const newFile = _files[index]
      getOSSToken()
        .then(({ credentials: { accessKeyId, accessKeySecret, securityToken } }) => new Promise((resolve) => {
          const blob = dataURLtoBlob(newFile.url)
          const { ossEndpoint, ossBucket } = window.envConfig
          import('ali-oss').then(({ default: OSS }) => {
            const client = new OSS({
              accessKeyId,
              accessKeySecret,
              stsToken: securityToken,
              endpoint: ossEndpoint,
              bucket: ossBucket
            })
            resolve(client.put(getTempNameWithKey(newFile.file.name), blob))
          })
        }))
        .then(data => {
          const newShowFiles = [...showFiles, data.name]
          const newUploadFiles = [...uploadFiles, tempNameToBusinessName(data.name)]
          setShowFiles(newShowFiles)
          setUploadFiles(newUploadFiles)
          isFunction(_onChange) && _onChange(newUploadFiles)
          return isOcr ? useOcrGeneral({ ...ocrParams, imageType:0, image:data.url }) : onSuccess()
          // Toast.success('上传成功', 1)
        })
        .catch(()=>{
          Toast.hide()
          Toast.fail('上传失败,请检查您的网络连接', 1)
        })
        .then((data)=>{
          if (!data.billNo) return false
          isFunction(ocrCallBack)&&ocrCallBack(data)
          Toast.success('上传成功', 1)
        })
    } else if (operationType === 'remove') {
      const newShowFiles = showFiles.filter((item, _index) => _index !== index)
      const newUploadFiles = uploadFiles.filter((item, _index) => _index !== index)
      // getOSSToken()
      //   .then(({ credentials: { accessKeyId, accessKeySecret, securityToken } }) => new Promise((resolve) => {
      //     const newFile = files[index]
      //     const { ossEndpoint, ossBucket } = window.envConfig
      //     import('ali-oss').then(({ default: OSS }) => {
      //       const client = new OSS({
      //         accessKeyId,
      //         accessKeySecret,
      //         stsToken: securityToken,
      //         endpoint: ossEndpoint,
      //         bucket: ossBucket
      //       })
      //       resolve(client.delete(newFile.url))
      //     })
      //   }))
      setShowFiles(newShowFiles)
      setUploadFiles(newUploadFiles)
      isFunction(_onChange) && _onChange(newUploadFiles)
    }
  }

  const openImageview = (index, imagelist) => {
    setShowImageViewer(true)
    setImageListIndex(index)
  }

  const imagePickerProps = {
    selectable,
    style: valueStyle,
    files: imagePickerFiles,
    onChange,
    disableDelete,
    onImageClick: openImageview,
    onFail
  }

  const urls = imagePickerFiles.map(item => item.url)

  const onClose = () => {
    setShowImageViewer(false)
  }

  const wxImageViewerProps = {
    onClose,
    urls,
    index: imageListIndex
  }

  return (
    <div className={styles.uploadWrap} style={style}>
      { label && <div className="formLabel">{label}</div>}
      <div style={{ display: 'inline-block', width: '100%', height:'100%' }}>
        <ImagePicker ref={field.imageRef} {...imagePickerProps} />
      </div>
      { showImageViewer && <WxImageViewer {...wxImageViewerProps} /> }
    </div>
  )
}
