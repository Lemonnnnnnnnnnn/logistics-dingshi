import React from 'react';
import { Icon } from 'antd';
import { Tag } from 'antd-mobile';
import WxImageViewer from 'react-wx-images-viewer';
import CssModule from 'react-css-modules'
import { FORM_MODE } from '@gem-mine/mobile-schema-form'
import { isFunction, isEqual, isArray, getOssImg, getOssVideo, changeUnit, judgeFileType } from '@/utils/utils'
import PopUpImg from '@/components/PopUpImg/PopUpImg'
import PopUpVideo from '@/components/PopUpVideo/PopUpVideo'
import styles from './UpLoad.less'
import Upload from './UpLoad'


/**
 * todo 优化样式：
 *       -- mouseHover 边框高亮
 *       -- 删除样式优化
 */

@CssModule(styles, { allowMultiple: true })
export default function (AddComponent) {
  return class UploadFile extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      files: [],
      prevProps: {},
      showFiles: [],
      showPicture: false,
    };
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const { value: nextFiles } = nextProps;
    const { prevProps: { value: currentFiles }, files } = prevState;
    // console.error(nextFiles, currentFiles, 'getDerivedStateFromProps')
    return isEqual(nextFiles, currentFiles) || isEqual(nextFiles, files) ? { prevProps: nextProps, } : { prevProps: nextProps,
      files: isArray(nextProps.value) ? nextProps.value : [nextProps.value],
      showFiles: isArray(nextProps.value) ? nextProps.value : [nextProps.value],
    };
  }

    removeFile = (file, index) => {
      const { files = [], showFiles = [] } = this.state;
      const { onChange } = this.props;
      const { onDelete } = this.props.field;
      const nextFiles = files.filter((item, _index) => index !== _index);
      const nextShowFiles = showFiles.filter((item, _index) => index !== _index);
      this.setState({ files: nextFiles, showFiles: nextShowFiles }, () => {
        isFunction(onChange) && onChange(nextFiles, file);
        isFunction(onDelete) && onDelete(nextFiles);
      });
    };

    getOriginalName (nameWithKey) {
      return nameWithKey.replace(/_KEY_[^.]+/, '');
    }

    wrappedOnUpload = fileObject => {
      const { files = [], showFiles } = this.state;
      const { onChange, form, formData } = this.props;
      const { addMode, onAdded, afterUpload } = this.props.field;
      const { showFileName, fileName, fileSize } = fileObject;
      const nextFiles = addMode === 'camera' ? [fileName] : [...files, fileName];
      const nextShowFiles = [...showFiles, { showFileName, fileSize }];
      afterUpload && afterUpload(nextFiles, { form, formData });
      this.setState({ files: nextFiles, showFiles: nextShowFiles }, () => {
        isFunction(onChange) && onChange(nextFiles, fileObject.name);
        isFunction(onAdded) && onAdded(nextFiles);
      });
    };

    renderUploadedFile = (showFile, index) => {
      const { renderMode = 'img', disabled } = this.props.field;
      const readOnly = disabled || this.props.mode === FORM_MODE.DETAIL;
      return renderMode === 'img'
        ? <React.Fragment key={index}>{this.renderImgPreview(showFile, index)}</React.Fragment>
        : <Tag key={showFile} closable={!readOnly} onClose={() => this.removeFile(showFile, index)}>{this.getOriginalName(showFile)} {readOnly && <Icon type='search' />}</Tag>;
    };


    renderImgPreview = (file, index) => {
      const { field: { previewConfig = { width: 100, height: 100 } } } = this.props;
      const readOnly = this.props.field.disabled || this.props.mode === FORM_MODE.DETAIL;

      const imgUrl = getOssImg(file.showFileName, previewConfig);
      const { imageStyle = {}, showSize } = this.props.field;
      const videoUrl = getOssVideo(file.showFileName)

      return (
        <span key={file.showFileName} styleName='img-preview-wrap'>

          { judgeFileType(file.showFileName) === 'image' && <PopUpImg
            type='typeKey'
            onClick={() => this.watchPicture(index)}
            src={imgUrl}
            style={{ width: '30vw', height: '30vw', ...imageStyle }}
            isShowImage={this.props.field.addMode !== 'camera'}
          /> }
          { judgeFileType(file.showFileName) === 'video' && <PopUpVideo src={videoUrl} />}

          {readOnly ||
          <span onClick={() => this.removeFile(file, index)} styleName='remove-file'>
            <Icon
              style={{ margin: '0.5em' }}
              type='close'
            />
          </span>}
          {showSize && <div style={{ textAlign: 'center' }}>{changeUnit(file.fileSize)}</div>}
        </span>
      );
    };

    renderUpload () {
      const { accept = 'image/*', showHeader = false, saveIntoBusiness = true, maxSize } = this.props.field;
      return (
        <Upload
          accept={accept}
          saveIntoBusiness={saveIntoBusiness}
          showHeader={showHeader}
          onUpload={this.wrappedOnUpload}
          maxSize={maxSize}
        >
          <AddComponent {...this.props.field} />
        </Upload>
      );
    }

    closeSignPicture = () => {
      this.setState({
        showPicture: false,
      });
    };

    watchPicture = pictureIndex => {
      this.setState({
        pictureIndex,
        showPicture: true,
      });
    };

    render () {
      const { files = [], showFiles = [], showPicture, pictureIndex } = this.state;
      const { max = 3, disabled, addMode = 'img' } = this.props.field;
      const readOnly = disabled || this.props.mode === FORM_MODE.DETAIL;
      const wxImageViewerProps = {
        onClose: this.closeSignPicture,
        urls: showFiles.map(item => getOssImg(item.showFileName)),
        index: pictureIndex,
      };
      return (
        <>
          {showFiles.map(this.renderUploadedFile)}
          {showPicture && <WxImageViewer {...wxImageViewerProps} />}
          {!readOnly && files.length < max && this.renderUpload()}
          {addMode === 'camera' && this.renderUpload()}
        </>
      );
    }
};
}
