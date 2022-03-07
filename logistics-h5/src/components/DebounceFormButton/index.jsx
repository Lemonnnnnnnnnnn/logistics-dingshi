import React, { Component } from 'react'
import { FormButton } from '@gem-mine/mobile-schema-form'
import { lodashDebounce } from '@/utils/utils'


export default class DebounceFormButton extends Component {
  render () {
    const { onClick, ...refProps } = this.props

    return (
      <FormButton {...refProps} onClick={onClick ? lodashDebounce(onClick, 500) : onClick} />
    )
  }
}

