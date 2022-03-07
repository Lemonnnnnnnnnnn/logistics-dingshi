// 出库清单模板

export const getDeliveryStatementOSSFileKey = (type) => {
  const statusConfig = {
    'accountOutbound': 'accountOutbound/出库清单.xlsx',
  }[type];
  return statusConfig;
};

export const getDeliveryStatementCheckStatus = (status)=>{
  const statusConfig = {
    MATCHED:{
      word: '通过', color: 'green'
    },
    NO_MATCH:{
      word: '无法匹配', color: 'gray'
    },
    PART_MATCH:{
      word: '部分正确', color: 'orange'
    },
  }[status];

  return statusConfig;
};

export const getDeliveryStatementCheckAndBindStatus = (status)=>{
  const statusConfig={
    numMatch_true:{
      word: '重量匹配结果成功', color: 'green'
    },
    numMatch_false:{
      word: '重量匹配结果失败', color: 'red'
    },
    timeMatch_true:{
      word: '日期匹配结果成功', color: 'green'
    },
    timeMatch_false:{
      word: '日期匹配结果失败', color: 'red'
    },
    carNoMatch_true:{
      word: '车辆匹配结果成功', color: 'green'
    },
    carNoMatch_false:{
      word: '车辆匹配结果失败', color: 'red'
    },
    deliveryNoMatch_true:{
      word: '提货单号匹配结果成功', color: 'green'
    },
    deliveryNoMatch_false:{
      word: '提货单号匹配结果失败', color: 'red'
    },
  }[status];

  return statusConfig;
};

export default { };
