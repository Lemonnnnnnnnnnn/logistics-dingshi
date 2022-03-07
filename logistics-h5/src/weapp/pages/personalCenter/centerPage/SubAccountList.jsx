import React, { useState, useEffect } from 'react'
import { WingBlank, WhiteSpace, SearchBar } from 'antd-mobile'
import SubAccountItem from './component/SubAccountItem'
import { getResponsible } from '@/services/apiService'
import { USERPROJECTSTATUS } from '@/constants/project/project'

export default SubAccountList;

function SubAccountList (){
  const [subAccountData, setSubAccountData] = useState([])
  const getResponsibleAction = () => {
    getResponsible({ offset: 0, limit: 999999 })
      .then(({ items })=>{
        items.sort((a)=>{
          if (a.auditStatus === USERPROJECTSTATUS.UNTREATED){
            return -1
          }
          return 1
        })
        setSubAccountData(items)
      })
  }

  const serarchData = (value) => {
    const vagueSelect = value
    getResponsible({ offset: 0, limit: 999999, vagueSelect })
      .then(({ items })=>{
        items.sort((a)=>{
          if (a.auditStatus === USERPROJECTSTATUS.UNTREATED){
            return -1
          }
          return 1
        })
        setSubAccountData(items)
      })
  }

  useEffect(getResponsibleAction, [])

  return (
    <>
      <SearchBar onSubmit={serarchData} showCancelButton cancelText='搜索' placeholder="请输入子账号姓名、合同名称" style={{ height: '45px' }} onCancel={serarchData} />
      <div style={{ height: 'calc(100% - 45px)', overflowY: 'scroll' }}>
        <WingBlank>
          <WhiteSpace size="md" />
          {subAccountData.map((item) => (
            <div key={item.responsibleCorrelationId}>
              <SubAccountItem {...item} refresh={getResponsibleAction} />
              <WhiteSpace size="md" />
            </div>
          ))}
        </WingBlank>
      </div>
    </>
  )
}
