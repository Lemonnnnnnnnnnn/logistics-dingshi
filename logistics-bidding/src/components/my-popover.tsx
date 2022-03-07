import {Popover} from 'antd'
import React from 'react'

const MyPopover = ({text}) => (
    <Popover content={text}>
        <p className='text-ellipsis'>{text}</p>
    </Popover>
)

export default MyPopover