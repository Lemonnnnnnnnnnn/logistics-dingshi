import React from 'react';
import TableContainer from '../../../components/table/table-container';

@TableContainer({ order: 'desc' })
export default class PrebookingWrap extends React.Component {
  render() {
    return this.props.children;
  }
}
