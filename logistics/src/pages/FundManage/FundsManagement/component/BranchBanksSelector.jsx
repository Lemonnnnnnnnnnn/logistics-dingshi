import React, { Component } from 'react';
import { Select, Spin } from 'antd';
import { lodashDebounce, isFunction, trim } from '@/utils/utils';
import { getBranchBanks } from '@/services/apiService';

const { Option } = Select;

class BranchBanksSelector extends Component {

  state = {
    options: [],
    fetching: false,
  };

  constructor (props) {
    super(props);
    this.fetchBranchBanks = lodashDebounce(this.fetchBranchBanks, 1000);
  }

  fetchBranchBanks = value => {
    if (!trim(value)) return;
    this.setState({ options: [], fetching: true });
    getBranchBanks({ limit:30, offset:0, branchBankName:value })
      .then(({ items }) => {
        this.setState({
          options:items,
          fetching: false
        });
      });
  };

  handleChange = value => {
    const { onChange } = this.props;
    this.setState({
      fetching: false,
    });
    isFunction(onChange) && onChange(value);
  }

  render () {
    const { fetching, options } = this.state;
    const { value } = this.props;
    return (
      <Select
        showSearch
        labelInValue
        defaultActiveFirstOption={false}
        value={value}
        placeholder="请选择开户行支行名称"
        notFoundContent={fetching ? <Spin size="small" /> : null}
        filterOption={false}
        onSearch={this.fetchBranchBanks}
        onChange={this.handleChange}
        style={{ width: '100%' }}
      >
        {options.map(item => <Option key={item.branchBankId} value={item.branchBankCode}>{item.branchBankName}</Option>)}
      </Select>
    );
  }
}

export default BranchBanksSelector;
