import React, { Component } from 'react';
import InvoicingList from './components/InvoicingList';

export default class HistoryContainer extends Component{
  render () {
    return (
      <InvoicingList history={this.props.history} />
    );
  }
}
