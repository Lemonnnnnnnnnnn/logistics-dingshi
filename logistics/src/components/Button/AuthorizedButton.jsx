import React from 'react'
import { Popconfirm } from 'antd'
import Authorized from '@/utils/Authorized'
import { isFunction } from '@/utils/utils'

const defaultButton = ({ children, ...restProps })=> <a {...restProps}>{children}</a>

export default function AuthorizedButton (Button = defaultButton){
  return ({ title, onClick, auth, confirmMessage }) =>props =>{
    const { record, index, state, className } = props
    const Contaner = auth ? Authorized: React.Fragment
    return (
      <Contaner authority={auth}>
        {
          confirmMessage
            ? ()=>{
              const message = isFunction(confirmMessage) ? confirmMessage(record) : confirmMessage
              return <Popconfirm title={message} onConfirm={() => onClick(record, index, state)}><Button className={className}>{title}</Button></Popconfirm>
            }
            : <Button className={className} onClick={() => onClick(record, index, state)}>{title}</Button>
        }
      </Contaner>
    )
  }
}
