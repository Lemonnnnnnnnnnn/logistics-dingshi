import React from 'react'
import ListContainer from '@/mobile/page/component/ListContainer'
import { getFeedbackList } from '@/services/apiService'
import RecordItem from './recordItem'

const List = ListContainer(RecordItem)

const RecordList = () => {
  const listParams = {
    action: getFeedbackList,
    primaryKey: 'feedbackId',
    params: { feedbackPort: 10 },
    keyName: 'feedbackContent',
    showSearchBar: true,
    searchBarProps: {
      placeholder: '搜索意见反馈内容',
    },
  }

  return (
    <>
      <List {...listParams} />
    </>
  )
}

export default RecordList
