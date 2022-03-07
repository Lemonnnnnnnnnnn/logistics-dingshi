import React, { Component } from 'react';
import InvoicingList from './components/invoicing-list';

export default class HistoryContainer extends Component{
  render () {
    return (
      <InvoicingList history={this.props.history} />
    );
  }
}
