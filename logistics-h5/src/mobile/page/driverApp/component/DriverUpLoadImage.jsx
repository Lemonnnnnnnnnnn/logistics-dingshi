import React from 'react'
import { Icon } from 'antd'
import { Button, Tag } from 'antd-mobile'
import WxImageViewer from 'react-wx-images-viewer';
import CssModule from 'react-css-modules'
import { FORM_MODE } from '@gem-mine/mobile-schema-form'
import { isFunction, isEqual, isArray, getOssImg } from '@/utils/utils'
import styles from './DriverUpLoad.css'
import camera from '@/assets/camera.png'
import PopUpImg from '@/components/PopUpImg/PopUpImg'
import Upload from './DriverUpLoad'


/**
 * todo 优化样式：
 *       -- mouseHover 边框高亮
 *       -- 删除样式优化
 */

@CssModule(styles, { allowMultiple: true })
export default class UploadFile extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      files: [],
      prevProps: {},
      showFiles:[],
      showPicture:false
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const { value: nextFiles } = nextProps
    const { prevProps:{ value: currentFiles }, files } = prevState
    // console.error(nextFiles, currentFiles, 'getDerivedStateFromProps')
    return isEqual(nextFiles, currentFiles) || isEqual(nextFiles, files)
      ? {
        prevProps: nextProps
      }
      : {
        prevProps: nextProps,
        files: isArray(nextProps.value) ? nextProps.value : [nextProps.value],
        showFiles: isArray(nextProps.value) ? nextProps.value : [nextProps.value]
      }
  }

  removeFile = (file, index) => {
    const { files = [], showFiles = [] } = this.state
    // console.log(files, showFiles, file, index)
    const { onChange } = this.props
    const nextFiles = files.filter((item, _index) => index !== _index)
    const nextShowFiles = showFiles.filter((item, _index) => index !== _index)
    // console.log(nextFiles, nextShowFiles)
    this.setState({ files: nextFiles, showFiles: nextShowFiles }, ()=>{
      isFunction(onChange) && onChange(nextFiles, file)
    })
  }

  getOriginalName (nameWithKey) {
    return nameWithKey.replace(/_KEY_[^.]+/, '')
  }

  wrappedOnUpload = fileObject => {
    const { files = [], showFiles } = this.state
    const { onChange, field:{ addMode='img' } } = this.props
    const { showFileName, fileName } = fileObject
    const nextFiles = addMode === 'camera'? [fileName] : [...files, fileName]
    const nextShowFiles = [...showFiles, showFileName]
    this.setState({ files: nextFiles, showFiles: nextShowFiles }, ()=>{
      isFunction(onChange) && onChange(nextFiles, fileObject.name)
    })
  }

  renderUploadedFile = (showFile, index) => {
    const { renderMode = 'img', disabled } = this.props.field
    const readOnly = disabled || this.props.mode === FORM_MODE.DETAIL
    return renderMode === 'img'
      ? <React.Fragment key={index}>{this.renderImgPreview(showFile, index)}</React.Fragment>
      : <Tag key={showFile} closable={!readOnly} onClose={() => this.removeFile(showFile, index)}>{this.getOriginalName(showFile)} {readOnly && <Icon type="search" />}</Tag>
  }

  renderImgPreview = (file, index) => {
    const readOnly = this.props.field.disabled || this.props.mode === FORM_MODE.DETAIL
    const imgUrl = getOssImg(file, { width: 256, height: 256 })
    // const largeSrc = getOssImg(file)
    return (
      <span key={file} styleName="img-preview-wrap">
        <PopUpImg type="typeKey" onClick={()=> this.watchSignPicture(index)} src={imgUrl} style={{ width: 256 }} isShowImage={this.props.field.addMode !== 'camera'} />
        { readOnly || <span onClick={() => this.removeFile(file, index)} styleName="remove-file"><Icon style={{ margin:'0.5em' }} type="close" /></span>}
      </span>
    )
  }

  renderUpload () {
    const { accept = 'image/*', showHeader = false } = this.props.field
    return (
      <Upload accept={accept} showHeader={showHeader} onUpload={this.wrappedOnUpload}>
        {this.renderAddMode()}
      </Upload>
    )
  }

  renderAddMode = () => {
    const { addMode = 'img', buttonProps={} } = this.props.field
    const { buttonStyle, buttonIcon, buttonLabel='上传' } = buttonProps
    const iconStyle={ marginTop: 15 }
    switch (addMode) {
      case 'img':
        return <span styleName="img-preview-wrap upload"><div styleName="img-preview-operations"><Icon style={iconStyle} type="plus" /><span title={buttonLabel} styleName="img-preview-label">{buttonLabel}</span></div></span>
      case 'button':
        return <Button icon={buttonIcon ||"upload"} style={buttonStyle}>{buttonLabel}</Button>
      case 'camera':
        return <img src={camera} alt='' style={{ marginLeft:'10px', width:'30px', height:'25px' }} />
      default:
    }
  }

  closeSignPicture = () => {
    this.setState({
      showPicture:false
    })
  }

  watchSignPicture = pictureIndex => {
    this.setState({
      pictureIndex,
      showPicture:true
    })
  }

  render () {
    const { files = [], showFiles = [], showPicture, pictureIndex } = this.state
    const { max = 3, disabled, addMode='img' } = this.props.field
    const readOnly = disabled || this.props.mode === FORM_MODE.DETAIL
    const wxImageViewerProps = {
      onClose:this.closeSignPicture,
      urls:showFiles.map(picture => getOssImg(picture)),
      index: pictureIndex
    }
    return (
      <>
        {showFiles.map(this.renderUploadedFile)}
        { showPicture && <WxImageViewer {...wxImageViewerProps} /> }
        {!readOnly && files.length < max && this.renderUpload()}
        {addMode === 'camera' && this.renderUpload()}
      </>
    )
  }
}
