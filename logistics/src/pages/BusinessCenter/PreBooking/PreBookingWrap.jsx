import React from 'react';
import TableContainer from '@/components/Table/TableContainer';

@TableContainer({ order: 'desc' })
export default class PrebookingWrap extends React.Component {
  render() {
    return this.props.children;
  }
}
