import React, { Component } from 'react';
import { getOSSToken } from '@/services/apiService'
import { getOssFile } from '@/utils/utils'

class UploadText extends Component {

  upLoadFile = () => {
    const { value:{ contractDentryid='' }={} } = this.props
    getOSSToken()
      .then( ossKey=> {
        getOssFile(ossKey, contractDentryid)
      })
  }

  render () {
    const { value: { content = '易键达-承运合同' }={} } = this.props
    return (
      <div style={{ color:'#1890FF' }} onClick={this.upLoadFile}>
        {content}
      </div>
    );
  }
}

export default UploadText;
