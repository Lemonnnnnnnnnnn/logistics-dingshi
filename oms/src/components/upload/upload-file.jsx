import React from 'react';
import { Button, Icon, Tag } from 'antd';
import CssModule from 'react-css-modules';
import { FORM_MODE } from '@gem-mine/antd-schema-form';
import { isFunction, isEqual, isArray, getOssImg } from '../../utils/utils';
import PopUpImg from '../pop-upImg/pop-up-img';
import styles from './upload.css';
import Upload from './upload';

/**
 * todo 优化样式：
 *       -- mouseHover 边框高亮
 *       -- 删除样式优化
 */

@CssModule(styles, { allowMultiple: true })
export default class UploadFile extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      files: [],
      prevProps: {},
      showFiles:[]
    };
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const { value: nextFiles } = nextProps;
    const { prevProps:{ value: currentFiles }, files } = prevState;
    if (!nextProps.value) return null;
    return isEqual(nextFiles, currentFiles) || isEqual(nextFiles, files)
      ? {
        prevProps: nextProps
      }
      : {
        prevProps: nextProps,
        files: isArray(nextProps.value) ? nextProps.value : [nextProps.value],
        showFiles: isArray(nextProps.value) ? nextProps.value : [nextProps.value]
      };
  }

  removeFile = (file, index) => {
    const { files = [], showFiles = [] } = this.state;
    const { onChange } = this.props;
    const nextFiles = files.filter((item, _index) => index !== _index);
    const nextShowFiles = showFiles.filter((item, _index) => index !== _index);
    this.setState({ files: nextFiles, showFiles: nextShowFiles }, ()=>{
      isFunction(onChange) && onChange(nextFiles, file);
    });
  }

  getOriginalName (nameWithKey, renderMode) {
    if (renderMode === 'doc' || renderMode === 'pdf&img') {
      const tempFileName = nameWithKey.replace(/_KEY_[^.]+/, '');
      const index=tempFileName.lastIndexOf("\/");
      const fileName = tempFileName.substring(index+1, tempFileName.length);
      return fileName;
    }
    return nameWithKey.replace(/_KEY_[^.]+/, '');
  }

  wrappedOnUpload = fileObject => {
    const { files = [], showFiles } = this.state;
    const { onChange } = this.props;
    const { showFileName, fileName } = fileObject;
    const nextFiles = [...files, fileName];
    const nextShowFiles = [...showFiles, showFileName];
    this.setState({ files: nextFiles, showFiles: nextShowFiles }, ()=>{
      isFunction(onChange) && onChange(nextFiles, fileObject.name);
    });
  }

  renderUploadedFile = (showFile, index) => {
    const { renderMode = 'img' } = this.props;
    const readOnly = this.props.readOnly || this.props.mode === FORM_MODE.DETAIL;
    if (renderMode === 'doc' || renderMode === 'pdf&img') {
      return <Tag key={showFile} closable={!readOnly} onClose={() => this.removeFile(showFile, index)}>{this.getOriginalName(showFile, renderMode)} {readOnly && <Icon type="search" />}</Tag>;
    }
    return renderMode === 'img' || renderMode === 'wordImg' || renderMode === 'photo'
      ? this.renderImgPreview(showFile, index)
      : <Tag key={showFile} closable={!readOnly} onClose={() => this.removeFile(showFile, index)}>{this.getOriginalName(showFile)} {readOnly && <Icon type="search" />}</Tag>;
  }

  renderImgPreview = (file, index) => {
    const readOnly = this.props.readOnly || this.props.mode === FORM_MODE.DETAIL;
    const imgUrl = getOssImg(file, { width: 100, height: 100 });
    const largeSrc = getOssImg(file);
    const { needAuthority, allow } = this.props;
    return (
      <span key={file} styleName="img-preview-wrap">
        <PopUpImg type="typeKey" src={imgUrl} largeSrc={largeSrc} needAuthority={needAuthority} allow={allow} />
        { readOnly || <span onClick={() => this.removeFile(file, index)} styleName="remove-file"><Icon type="close" /></span>}
      </span>
    );
  }

  stopPropagation = (e) => {
    e.stopPropagation();
  }

  renderUpload () {
    const { renderMode = 'img', labelUpload = '上传', accept = 'image/*', fileSuffix = [], saveIntoBusiness = true, size=100*1024, style={} } = this.props;
    const iconStyle={ marginTop: 15 };
    let upload;
    switch (renderMode) {
      case 'img':
        upload = <span styleName="img-preview-wrap upload"><div styleName="img-preview-operations"><Icon style={iconStyle} type="plus" /><span title={labelUpload} styleName="img-preview-label">{labelUpload}</span></div></span>;
        break;
      case 'doc':
        upload = <><Button icon="upload">{labelUpload}</Button><span style={{ height: '32px', display: 'inline-block', verticalAlign:'top', lineHeight: '32px' }} onClick={this.stopPropagation}>（仅支持上传doc、docx、pdf格式）</span></>;
        break;
      case 'xls':
        upload = <><Button icon="upload">{labelUpload}</Button><span style={{ height: '32px', display: 'inline-block', verticalAlign:'top', lineHeight: '32px' }} onClick={this.stopPropagation}>（仅支持上传xls、xlsx格式）</span></>;
        break;
      case 'pdf&img':
        upload = <><Button icon="upload">{labelUpload}</Button><span style={{ height: '32px', display: 'inline-block', verticalAlign:'top', lineHeight: '32px' }} onClick={this.stopPropagation} /></>;
        break;
      case 'wordImg':
        upload = <span style={{ color:'#1890FF' }}>{labelUpload}</span>;
        break;
      case 'photo':
        upload = <span style={{ color:'#1890FF' }}>{labelUpload}</span>;
        break;
      default: <Button icon="upload">{labelUpload}</Button>;
    }
    return (
      <Upload accept={accept} onUpload={this.wrappedOnUpload} saveIntoBusiness={saveIntoBusiness} renderMode={renderMode} fileSuffix={fileSuffix} size={size} style={style}>
        {
          upload
        }
      </Upload>
    );
  }

  render () {
    const { files = [], showFiles = [] } = this.state;
    const { max = 1 } = this.props;
    const readOnly = this.props.readOnly || this.props.mode === FORM_MODE.DETAIL;
    return (
      <>
        {!readOnly && files.length < max && this.renderUpload()}
        {showFiles.map(this.renderUploadedFile)}
      </>
    );
  }
}
