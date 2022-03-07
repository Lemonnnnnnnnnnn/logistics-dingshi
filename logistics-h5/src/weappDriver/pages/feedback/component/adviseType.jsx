import React, { useState, useEffect } from 'react'
import { Tag, Flex } from 'antd-mobile'

const AdviseType = ({ onChange }) =>{
  const [list, setList] = useState([
    { title : '功能异常', selected : false, key : 1 },
    { title : '产品建议', selected : false, key : 2 },
    { title : '其他问题', selected : false, key : 3 }
  ])

  useEffect(()=>{
    const selectedTag = list.find(item=>item.selected)
    if (selectedTag) {
      onChange(selectedTag.key)
    } else {
      onChange(undefined)
    }
  }, list)

  const onChangeTag = (selected, key) =>{
    const newList = list.map(item=>{
      if (item.key === key) return { ...item, selected }
      return { ...item, selected: false }
    })
    setList(newList)
  }

  const renderTags = () =>list.map(item=><Tag key={item.key} selected={item.selected} onChange={(selected)=>onChangeTag(selected, item.key)}>{item.title}</Tag>)

  return (
    <div>
      <div style={{ padding :'1rem 0' }}>意见类型：</div>
      <Flex justify='around' style={{ marginBottom :'1rem' }}>
        {renderTags()}
      </Flex>
    </div>
  )
}

export default AdviseType
