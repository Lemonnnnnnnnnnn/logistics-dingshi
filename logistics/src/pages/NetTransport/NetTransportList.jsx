import React, { Component } from 'react';
import TableContainer from '@/components/Table/TableContainer';
import TransportList from '@/pages/BusinessCenter/Transport/TransportList';

@TableContainer({ order: 'desc', isOrderAccount :true, isPermissonSelectAll: true })
class NetTransportList extends Component {
  render () {
    return (
      <TransportList {...this.props} orderBill />
    );
  }
}

export default NetTransportList;
