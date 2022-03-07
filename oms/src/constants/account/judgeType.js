const judgeType= {
  // 网络货运平台与承运对账
  PLAT_TO_SHIPMENT: 'platToShipment', // 平台对承运发起货品对账列表
  SHIPMENT_TO_PLAT: 'shipmentToPlat', // 承运对平台发起货品对账列表
  PALT_JUDGE_SHIPMENT: 'platJudgeShipment', // 平台审核承运货品对账列表
  SHIPMENT_JUDGE_PALT: 'shipmentJudgePlat', // 承运审核平台货品对账列表

  // 网络货运平台与托运对账
  PLAT_TO_CONSIGNMENT: 'platToConsignment', // 平台对托运发起货品对账列表
  CONSIGNMENT_TO_PLAT: 'consignmentToPlat', // 托运对平台发起货品对账列表
  PLAT_JUDGE_CONSIGNMENT: 'platJudgeConsignment', // 平台对托运发起货品对账列表
  CONSIGNMENT_JUDGE_PLAT: 'consignmentJudgePlat', // 托运审核承运货品对账列表

  // 原始自营对账
  SHIPMENT_TO_CONSIGNMENT: 'shipmentToConsignment', // 承运对托运发起货品对账列表
  CONSIGNMENT_JUDGE_SHIPMENT: 'consignmentJudgeShipment', // 托运审核承运货品对账列表
}
export default judgeType
