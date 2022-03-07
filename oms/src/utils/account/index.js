// 各个类型的对账单总运费取不同的字段
import {
  SUPERIOR_SHIPMENT,
  SUBORDINATE_SHIPMENT,
  SHIPMENT_TO_PLAT,

  SHIPMENT_TO_CONSIGN,
  SHIPMENT_ACCOUNT_MANAGE
} from "@/constants/account";
import { getUserInfo } from "@/services/user";
import { PLATFORM, OWNER as CONSIGNMENT, SHIPMENT } from '@/constants/organization/organization-type';
import { ORDER_INTERNAL_STATUS } from "@/constants/project/project";


export const accountCost = ( record) => {
  const {  subordinateShipmentId, shipmentId, accountOrgType, totalFreight, shipmentServiceCharge, shipmentServiceProfit } = record;
  const { organizationType, organizationId } = getUserInfo();

  if (PLATFORM === organizationType || CONSIGNMENT === organizationType) {
    return totalFreight || 0;
  }

  // 承运展示
  if ( accountOrgType === SHIPMENT_TO_PLAT ) { // 承运是货主
    if (shipmentId  === organizationId){ // 本级
      return totalFreight || 0;
    }
    if (subordinateShipmentId === organizationId ){ // 下级
      return (totalFreight - shipmentServiceProfit - shipmentServiceCharge) || 0;
    }
  } else { // 托运是货主
    if (shipmentId  === organizationId){ // 本级
      return (totalFreight - shipmentServiceCharge) || 0;
    }
    if (subordinateShipmentId === organizationId ){ // 下级
      return (totalFreight - shipmentServiceProfit - shipmentServiceCharge) || 0;
    }
  }
  return 0;
};


// 获取货主手续费
export const getServiceCharge = ({ accountOrgType, serviceCharge }) =>{
  const { organizationType } = getUserInfo();
  // 平台和托运方展示
  if (PLATFORM === organizationType || CONSIGNMENT === organizationType){
    return serviceCharge || 0;
  }
  // 承运方展示
  if ( accountOrgType === SHIPMENT_TO_PLAT ) { // 承运是货主
    return serviceCharge || 0;
  }  // 托运是货主
  return  0;
};

// 对账管理-获取承运服务费
export const getShipmentDifferenceCharge = ({ shipmentId, subordinateShipmentId, shipmentServiceProfit })=>{
  const { organizationId } = getUserInfo();
  if (shipmentId !== subordinateShipmentId && organizationId === subordinateShipmentId){ // 如果有下级并且当前用户是下级
    return 0;
  }
  return shipmentServiceProfit || 0;
};

// 对账管理-获取承运接单手续费
export const getShipmentServiceCharge = ({ shipmentId, subordinateShipmentId, shipmentServiceCharge })=>{
  const { organizationId } = getUserInfo();
  if (shipmentId !== subordinateShipmentId && organizationId === subordinateShipmentId){ // 如果有下级并且当前用户是下级
    return 0;
  }
  return shipmentServiceCharge || 0;
};


// 对账管理-获取应付账款(平台为应收账款)
export const getNeedPay = (record) =>{
  const { serviceCharge, damageCompensation, accountInternalStatus, shipmentId } = record;
  const transportCost = accountCost(record);
  const { organizationId, organizationType } = getUserInfo();

  if (ORDER_INTERNAL_STATUS.INSIDE === accountInternalStatus) {
    return (Number(transportCost) - Number(damageCompensation));
  }
  if (ORDER_INTERNAL_STATUS.FORMAL === accountInternalStatus) {
    return (Number(serviceCharge));
  }
  // if (shipmentId === organizationId && organizationType === SHIPMENT){
  //   return Number(transportCost) - Number(damageCompensation) + Number(getServiceCharge(record)) + getShipmentServiceCharge(record);
  // }

  return (Number(transportCost) - Number(damageCompensation) + Number(getServiceCharge(record)));
};


export const judgeShipmentType = ({ subordinateShipmentId, shipmentId }) =>{
  const { organizationId } = getUserInfo();
  if (shipmentId === organizationId) return SUPERIOR_SHIPMENT;
  if (subordinateShipmentId === organizationId) return SUBORDINATE_SHIPMENT;
  return 0;
};

export const judgeMenuType = (path)=>{
  if (path.indexOf("shipmentToConsignmentTransportAccount") !== -1){
    return SHIPMENT_TO_CONSIGN;
  } if (path.indexOf("shipmentTransportAccountManage") !== -1){
    return SHIPMENT_ACCOUNT_MANAGE;
  }
  return 0;
};
