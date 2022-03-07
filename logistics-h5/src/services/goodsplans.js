
import { SCHEDULEDSTATUS, INTRANSPORTATIONSTATUS, COMPLETESTATUS, EXECPTIONSTATUS } from '@/constants/transport/transport'


export const statistics = (data) => {
  const { goodsCorrelationItems, transportCorrelationCnItems } = data
  const goodsStatistics = {}
  // 计算各个货品 总数
  goodsCorrelationItems.forEach((item)=>{
    goodsStatistics[item.goodsId] = {} // 货品ID为属性 该属性是一个对象 储存所有货品的统计信息
    goodsStatistics[item.goodsId].goodsName = `${item.goodItems[0].categoryName}-${item.goodItems[0].goodsName}`
    goodsStatistics[item.goodsId].total = item.goodsNum
    goodsStatistics[item.goodsId].scheduled = 0
    goodsStatistics[item.goodsId].inTransportation = 0
    goodsStatistics[item.goodsId].signed = 0
    goodsStatistics[item.goodsId].exception = 0
    goodsStatistics[item.goodsId].goodsUnitCN = item.goodsUnitCN
  })
  transportCorrelationCnItems.forEach(item => {
    if ( SCHEDULEDSTATUS.indexOf(item.transportImmediateStatus) !== -1) goodsStatistics[item.goodsId].scheduled += item.goodsNum // 已调度的
    if ( INTRANSPORTATIONSTATUS.indexOf(item.transportImmediateStatus) !== -1) goodsStatistics[item.goodsId].inTransportation+= item.deliveryNum // 运输中的
    if ( COMPLETESTATUS.indexOf(item.transportImmediateStatus) !== -1) goodsStatistics[item.goodsId].signed += item.receivingNum // 已签收
    if ( EXECPTIONSTATUS.indexOf(item.transportImmediateStatus) !== -1) goodsStatistics[item.goodsId].exception += item.deliveryNum // 运单异常
  })
  data.goodsStatistics = goodsStatistics
  return data
}

export default {
  statistics
}
