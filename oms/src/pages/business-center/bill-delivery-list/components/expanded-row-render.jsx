import React, { memo } from 'react';
import Zmage from 'react-zmage';
import { getOssImg } from '../../../../utils/utils';

import styles from '../add-list.less';

const ExpandedRowRender = memo(({ receivingDentryid = [], weighDentryid = [], deliveryDentryid = [] }) => {
  return receivingDentryid.length || weighDentryid.length || deliveryDentryid.length ? (
    <div className={styles.expandedRowInfo}>
      {
        deliveryDentryid && deliveryDentryid.map(item => (
          <div className={styles.expandedRowItem} key={item}>
            <Zmage src={getOssImg(item)} alt="" />
            <span>提货单据</span>
          </div>
        ))
      }
      {
        receivingDentryid &&receivingDentryid.map(ite => (
          <div className={styles.expandedRowItem} key={ite}>
            <Zmage src={getOssImg(ite)} alt="" />
            <span>签收单据</span>
          </div>
        ))
      }
      {
        weighDentryid && weighDentryid.map(ite => (
          <div className={styles.expandedRowItem} key={ite}>
            <Zmage src={getOssImg(ite)} alt="" />
            <span>过磅单据</span>
          </div>
        ))
      }
    </div>
  ) : (
    <div className={styles.expandedRowInfo}>暂时无可查看单据</div>
  );
});

export default ExpandedRowRender;
