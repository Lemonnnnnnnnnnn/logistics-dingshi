/**
 *  提供验证功能
 *  字段与state的绑定能力，不需要手动更新state
 *  f
 */
import React from 'react'
import { Input } from 'antd'
import { registerComponent } from '../Item'
import WrapItem from '@/components/Form/ItemWrap';

const { TextArea } = Input

class MyTextArea extends React.Component {
  render () {
    const { maxLength, value = '' } = this.props
    const word = value === null ? '' : value
    return maxLength
      ? (
        <div>
          <TextArea {...this.props} autosize={{ minRows: 4 }} style={{ resize:'none' }} />
          <span className="fr color-gray">{word.length}/{maxLength}</span>
        </div>
      )
      : <TextArea {...this.props} style={{ resize:'none' }} />
  }
}

// 在只读模式下，只显示字符串
const TextAreaComponent = function InputCreator (field) {
  return WrapItem(field, MyTextArea)
}

registerComponent('textArea', TextAreaComponent)
