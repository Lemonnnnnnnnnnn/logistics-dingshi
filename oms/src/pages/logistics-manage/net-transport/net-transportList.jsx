import React, { Component } from 'react';
import TableContainer from '../../../components/table/table-container';
import TransportList from '../../business-center/transport/transport-list.jsx';

@TableContainer({ order: 'desc', isOrderAccount :true, isPermissonSelectAll: true })
class NetTransportList extends Component {
  render () {
    return (
      <TransportList {...this.props} orderBill />
    );
  }
}

export default NetTransportList;
