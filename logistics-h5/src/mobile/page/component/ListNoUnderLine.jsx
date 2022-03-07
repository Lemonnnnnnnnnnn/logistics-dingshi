import React from 'react'
import {List} from 'antd-mobile'

const ListNoUnderLine = ({children, className = '', ...props}) => (
  <List className={`list-line ${className}`} {...props}>
    {children}
  </List>
)

ListNoUnderLine.Item = List.Item

export default ListNoUnderLine
