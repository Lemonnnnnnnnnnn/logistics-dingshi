import React, { Component } from 'react'
import { Tag } from 'antd'
import CSSModules from 'react-css-modules'
import styles from './index.less'

const { CheckableTag } = Tag

@CSSModules(styles)
export default class MultipleCheckButton extends Component {

  // 选择标签
  handleChange(tag, checked) {
    const { value = [] } = this.props
    const nextSelectedTags = checked ? [...value, tag.id] : value.filter(t => t !== tag.id)
    this.props.onChange(nextSelectedTags)
  }

  render() {
    const { tagsFromServer, value = [[]] } = this.props

    return (
      <div className={styles.multipleCheckButton}>
        {tagsFromServer.map(tag => (
          <CheckableTag
            key={tag.id}
            // color='red'
            checked={value.find(item=>item === tag.id)}
            onChange={checked => this.handleChange(tag, checked)}
          >
            {tag.name}
          </CheckableTag>
        ))}
      </div>)
  }
}

