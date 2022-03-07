
// 出库对账单核对状态
export const CHECK_STATUS = {
  MATCHED: 'MATCHED', // 通过
  PART_MATCH:'PART_MATCH', // 部分正确
  NO_MATCH: 'NO_MATCH' // 无法匹配
}




export const getCheckTransactionStatus = (state) =>{
  const statusConfig = {
    [CHECK_STATUS.MATCHED]:{
      word: '通过', color: 'green'
    },
    [CHECK_STATUS.PART_MATCH]:{
      word: '部分正确', color: 'orange'
    },
    [CHECK_STATUS.NO_MATCH]:{
      word: '无法匹配', color: 'red'
    },
  }[state]
  return statusConfig
}



