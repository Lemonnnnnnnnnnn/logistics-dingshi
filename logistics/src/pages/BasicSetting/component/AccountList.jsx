import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import styles from './AccountList.less';
import AccountCard from './AccountCard';

@CSSModules(styles, { allowMultiple: true })
export default class AccountList extends Component{
  render () {
    const { dataList = [] } = this.props;
    const index = dataList.findIndex(item => item.isAvailable === true);
    const filterDataList = JSON.parse(JSON.stringify(dataList));
    if (index !== -1) {
      filterDataList.unshift(filterDataList.splice(index, 1)[0]);
    }
    const cardList = filterDataList.map(item => <AccountCard cardInfo={item} key={item.bankAccountId} />);
    return (
      <div styleName='box'>
        {cardList}
      </div>
    );
  }
}
