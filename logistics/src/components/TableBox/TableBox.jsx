import React, { Component } from 'react';
import styles from './TableBox.css'

export default class TableBox extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { children, headerText } = this.props
    return (
      <div className={styles.box}>
        <div className={styles.box_header}>{headerText}</div>
        <div className={styles.box_body}>{children}</div>
      </div>
    )
  }
}
