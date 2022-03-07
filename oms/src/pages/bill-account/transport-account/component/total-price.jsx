import React, { Component } from 'react';
import { formatMoney } from '@/utils/utils'

class TotalPrice extends Component {
  render () {
    const { value = 0 } = this.props
    return (
      <div>
        总运费
        <span style={{ fontWeight:'bold' }}>{value?formatMoney(value):'--'}</span>
        元
      </div>
    );
  }
}

export default TotalPrice;
