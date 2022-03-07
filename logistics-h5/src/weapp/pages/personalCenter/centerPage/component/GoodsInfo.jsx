import React, { Component } from 'react';
import styles from './GoodsInfo.css'

class GoodsInfo extends Component {

  renderGoodsItems = () => {
    const { value = [] } = this.props
    const goodsList = value.map(item => (
      <div key={item.goodsId} className={styles.itemWrap}>
        <div className={styles.itemRow}>
          <div className={styles.itemLabel}>名称：</div>
          <div className={styles.itemValue}>{`${item.categoryName}-${item.goodsName}`}</div>
        </div>
        <div className={styles.itemRow}>
          <div className={styles.itemLabel}>数量：</div>
          <div className={styles.itemValue}>{`${item.goodsNum}${item.deliveryUnitCN}`}</div>
        </div>
        <div className={styles.itemRow}>
          <div className={styles.itemLabel}>材质：</div>
          <div className={styles.itemValue}>{item.materialQuality || '--'}</div>
        </div>
        <div className={styles.itemRow}>
          <div className={styles.itemLabel}>规格型号：</div>
          <div className={styles.itemValue}>{item.specificationType || '--'}</div>
        </div>
      </div>
    ))
    return goodsList
  }

  render () {
    const { field: { label } } = this.props
    return (
      <div className={styles.goodsWrap}>
        <div className={styles.label}>{label}</div>
        <div className={styles.control}>
          {this.renderGoodsItems()}
        </div>
      </div>
    );
  }
}

export default GoodsInfo;
