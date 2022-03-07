import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd-mobile'
import Submit from './component/submit'
import RecordList from './component/recordList'

const Feedback = ({ history :{ action } } ) =>{
  const [page, setPage] = useState(0)
  const tabs = [
    { title :'提交意见', key : 0 },
    { title :'意见反馈记录', key : 1 }
  ]

  const onChangeTab = (tab, index) =>{
    setPage(index)
  }
  useEffect(()=>{
    if (action === 'POP'){
      onChangeTab(null, 1)
    }
  }, [])


  const renderContent = ({ title, key }) => {
    switch (key){
      case 0 :
        return <Submit onChangeTab={onChangeTab} />
      case 1 :
        return <RecordList />
      default:
        return null
    }
  }


  return (
    <Tabs tabs={tabs} page={page} onChange={onChangeTab} prerenderingSiblingsNumber={0} destroyInactiveTab>
      {renderContent}
    </Tabs>
  )
}

export default Feedback;

