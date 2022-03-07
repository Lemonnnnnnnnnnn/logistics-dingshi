import React from 'react';
import { Upload, message } from 'antd';
import moment from 'moment';
import OSS from 'ali-oss';
import { getOSSToken } from '@/services/apiService';
import { isFunction } from '@/utils/utils';

const { Dragger } = Upload;
// TODO 存在问题：onchange时内部元素为普通object, onRemove时 内部元素为 file Object

function getBusinessNameWithKey(name) {
  const nowDate = moment(new Date()).format('YYYY/MM/DD');
  return `business/${nowDate}/${name.replace(/\.([^.]+)$/, `_KEY_${new Date().getTime()}.$1`)}`;
}

export default class AliyunOSSUpload extends React.Component {
  state = {
    OSSData: {},
  };

  async componentDidMount() {
    await this.init();
  }

  init = async () => {
    try {
      const OSSData = await getOSSToken();
      this.setState({
        OSSData,
      });
    } catch (error) {
      message.error(error);
    }
  };

  UploadToOss = file => {
    const { OSSData: { credentials: { accessKeyId, accessKeySecret, securityToken } } } = this.state;
    const { ossEndpoint, ossBucket } = window.envConfig;
    return new Promise((resolve, reject) => {
      const client = new OSS({
        accessKeyId,
        accessKeySecret,
        stsToken: securityToken,
        endpoint: ossEndpoint,
        bucket: ossBucket
      });
      client.put(getBusinessNameWithKey(file.name), file).then(data => {
        const { fileList = [] } = this.state;
        file._name = data.name;
        this.setState({
          fileList: [...fileList, file]
        });
        resolve(data);
      }).catch(error => {
        console.log(error, '------image error------');
        const { fileList = [] } = this.state;
        file.status = 'error';
        this.setState({
          fileList: [...fileList, file]
        });
        reject(error);
      });
    });
  }

  beforeUpload = async (file) => {
    // 若该方法是个promise则导致action执行
    const { OSSData: { credentials: { expiration } } } = this.state;
    const check = moment().isBefore(expiration);
    if (!check) {
      await this.init();
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.UploadToOss(file).then(() => {
        // 执行外部钩子函数
        const { fileList } = this.state;
        if (isFunction(this.props.onChangeAfterUploadToOss)){
          this.props.onChangeAfterUploadToOss(fileList);

        }
      });
    };
    return false; // 不调用默认的上传方法
  }

  onChange = (data) => {
    const { onChange } = this.props;
    isFunction(onChange) && onChange(data);
  }

  onRemove = file => {
    const { fileList } = this.state;
    const { onRemove } = this.props;

    const files = fileList.filter(v => v.uid !== file.uid);

    isFunction(onRemove) && onRemove(file, files);

    this.setState({
      fileList: files
    });
  };

  _beforeUpload = (file) => {
    this.beforeUpload(file);
    return false;
  }

  render() {
    const { fileList } = this.state;
    const { className, accept, children, commonType } = this.props;
    return (
      commonType ? (
        <Upload
          accept={accept}
          action=''
          className={className}
          multiple
          beforeUpload={this._beforeUpload}
          onRemove={this.onRemove}
          onChange={this.onChange}
          fileList={fileList}
        >
          {children}
        </Upload>) :
        (
          <Dragger
            accept={accept}
            action=''
            className={className}
            multiple
            beforeUpload={this._beforeUpload}
            onRemove={this.onRemove}
            onChange={this.onChange}
            fileList={fileList}
          >
            {children}

          </Dragger>
        )
    );
  }
}

