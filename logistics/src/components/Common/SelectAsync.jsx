
import React, { Component } from 'react';
import { Select, Spin } from 'antd';
import { lodashDebounce, isFunction, trim } from '@/utils/utils';
import { getCar } from '@/services/apiService';

const { Option } = Select;

class UserRemoteSelect extends Component {

  state = {
    options: [],
    fetching: false,
  };

  constructor (props) {
    super(props);
    this.fetchBranchBanks = lodashDebounce(this.fetchBranchBanks, 500);
  }

  componentDidMount() {
    this.setState({ options: this.props.options });
  }

  fetchBranchBanks = value => {
    if (!trim(value)) return;
    this.setState({ options: [], fetching: true });
    getCar({
      selectType: 1,
      limit: 50,
      offset: 0,
      carNo: value,
      isCount: false
    })
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
        defaultActiveFirstOption={false}
        value={value}
        placeholder="请选择或搜索车辆"
        notFoundContent={fetching ? <Spin size="small" /> : null}
        filterOption={false}
        onSearch={this.fetchBranchBanks}
        onChange={this.handleChange}
        onFocus={() => {
          if (!options || options.length <= 1) {
            this.setState({ options: [], fetching: true });
            getCar({
              selectType: 1,
              limit: 50,
              offset: 0,
              isCount: false
            }).then(res => {
              this.setState({ options: res.items, fetching: false });
            });
          }
        }}
        style={{ width: '100%' }}
      >
        {options.map(item => <Option key={item.carId} value={item.carId}>{item.carNo}</Option>)}
      </Select>
    );
  }
}

export default UserRemoteSelect;
