import React, { Component } from 'react';
// import { Popconfirm } from 'antd'
import { getOSSToken } from '@/services/apiService';
import { getOssFile } from '@/utils/utils';
import { NETWORK_CONTRACT_LIST_STATUS } from '@/constants/project/project';

class ContractField extends Component {

  upLoadFile = contractDentryid => {
    getOSSToken()
      .then( ossKey=> {
        getOssFile(ossKey, contractDentryid);
      });
  }

  renderUsefulContract = () => {
    const { value } = this.props;
    const usefulContract = value.filter(({ contractState, isAvailable }) => contractState === NETWORK_CONTRACT_LIST_STATUS.AUDITED && isAvailable );
    const context = usefulContract.map(({ contractDentryid, contractName, contractId }, index, array) => (
      // <Popconfirm title={`下载${contractName}?`} onConfirm={() => this.upLoadFile(contractDentryid)}>
      //   <span>{contractName}</span>
      // </Popconfirm>
      <React.Fragment key={contractId}>
        <span style={{ textDecoration:'underline', color:'#1890FF' }} onClick={() => this.upLoadFile(contractDentryid)}>{contractName}</span>
        {index !== array.length-1 && <span>、</span>}
      </React.Fragment>
    ));
    return context;
  }

  render () {
    return (
      <div>
        {this.renderUsefulContract()}
      </div>
    );
  }
}

export default ContractField;
