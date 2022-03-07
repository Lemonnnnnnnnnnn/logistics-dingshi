// 获取货主手续费（服务费）
import { getUserInfo } from "@/services/user";
import { SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT, SHIPMENT_TO_PLAT } from "@/constants/account";
import { ORDER_INTERNAL_STATUS } from "@/constants/project/project";
import { OWNER as CONSIGNMENT, PLATFORM, SHIPMENT } from "@/constants/organization/organizationType";

// 根据当前机构类型 运单总价取不同的字段

/*
 * transportCost :         当前机构为货主
 * platformTransportCost : 当前机构为本级承运
 * shipmentTransportCost : 当前机构为下级承运
 * */
/*

* 货主:
* 承运向平台对账 : 承运
* 其他         : 托运
* */

/*
* shipmentOrganizationId : 实际调度机构ID
* shipmentId : 本级承运ID
* */
export const accountTransportCost = ({
  transportPriceEntity,
  shipmentOrganizationId,
  shipmentOrgId,
  accountInitiateType,
  shipmentId,
  accountOrgType,
  shipmentTransportCost: _shipmentTransportCost,
  transportCost: _transportCost,
  platformTransportCost: _platformTransportCost
}) => {
  const transportPriceType = transportPriceEntity?.transportPriceType || transportPriceEntity?.accountInitiateType || accountOrgType || accountInitiateType;

  const shipmentTransportCost = transportPriceEntity?.shipmentTransportCost || _shipmentTransportCost;
  const transportCost = transportPriceEntity?.transportCost || _transportCost;
  const platformTransportCost = transportPriceEntity?.platformTransportCost || _platformTransportCost;

  const { organizationType, organizationId } = getUserInfo();
  if (PLATFORM === organizationType || CONSIGNMENT === organizationType) {
    return transportCost || 0;
  }

  if (transportPriceType === SHIPMENT_TO_PLAT) { // 承运是货主
    if (shipmentId === organizationId) { // 本级
      return transportCost || 0;
    }
    if ((shipmentOrganizationId || shipmentOrgId) === organizationId) { // 下级
      return shipmentTransportCost || 0;
    }
  } else { // 托运是货主
    if (shipmentId === organizationId) { // 本级
      return platformTransportCost || 0;
    }
    if ((shipmentOrganizationId || shipmentOrgId) === organizationId) { // 下级
      return shipmentTransportCost || 0;
    }
  }
  return 0;
};


/*
 * freightCost :         当前机构为货主
 * platformUnitPrice : 当前机构为本级承运
 * shipmentUnitPrice : 当前机构为下级承运
 * */
/*

 */
// 根据当前机构类型 运单单价取不同的字段

export const accountUnitPrice = ({
  transportPriceEntity,
  shipmentOrganizationId,
  shipmentOrgId,
  shipmentId,
  accountOrgType
}) => {
  const transportPriceType = transportPriceEntity.transportPriceType || transportPriceEntity.accountInitiateType || accountOrgType;
  const { shipmentUnitPrice, freightCost, platformUnitPrice } = transportPriceEntity;
  const { organizationType, organizationId } = getUserInfo();

  if (PLATFORM === organizationType || CONSIGNMENT === organizationType) {
    return freightCost || 0;
  }

  if (transportPriceType === SHIPMENT_TO_PLAT) { // 承运是货主
    if (shipmentId === organizationId) { // 本级
      return freightCost || 0;
    }
    if ((shipmentOrganizationId || shipmentOrgId) === organizationId) { // 下级
      return shipmentUnitPrice || 0;
    }
  } else { // 托运是货主
    if (shipmentId === organizationId) { // 本级
      return platformUnitPrice || 0;
    }
    if ((shipmentOrganizationId || shipmentOrgId) === organizationId) { // 下级
      return shipmentUnitPrice || 0;
    }
  }
  return 0;

};


// 获取货主服务费
export const getServiceCharge = (transportPriceEntity) => {
  const { organizationType } = getUserInfo();
  const accountOrgType = transportPriceEntity.transportPriceType || transportPriceEntity.accountInitiateType;
  // 平台和托运方展示
  if (PLATFORM === organizationType || CONSIGNMENT === organizationType) {
    return transportPriceEntity.serviceCharge || 0;
  }
  // 承运方展示
  if (accountOrgType === SHIPMENT_TO_PLAT) { // 承运是货主
    return transportPriceEntity.serviceCharge || 0;
  }  // 托运是货主
  return 0;
};

// 对账管理-获取应付账款(平台为应收账款)
export const getNeedPay = ({ transportPriceEntity, accountInternalStatus }, record) => {
  const { serviceCharge, damageCompensation } = transportPriceEntity;
  const { shipmentId } = record;
  const { organizationId, organizationType } = getUserInfo();
  const transportCost = accountTransportCost({ ...record, transportPriceEntity });

  if (ORDER_INTERNAL_STATUS.INSIDE === accountInternalStatus) {
    return (Number(transportCost) - Number(damageCompensation));
  }
  if (ORDER_INTERNAL_STATUS.FORMAL === accountInternalStatus) {
    return (Number(serviceCharge));
  }
  // if (shipmentId === organizationId && organizationType === SHIPMENT){
  //   return Number(transportCost) - Number(damageCompensation) + Number(getServiceCharge(record)) + getShipmentServiceCharge(record, transportPriceEntity);
  // }

  return (Number(transportCost) - Number(damageCompensation) + Number(getServiceCharge(transportPriceEntity)));

};

// 对账管理-获取承运服务费
export const getShipmentDifferenceCharge = ({ shipmentOrganizationId, shipmentOrgId, subordinateShipmentId, shipmentId }, transportPriceEntity)=>{
  const { organizationId } = getUserInfo();
  const _subordinateShipmentId = shipmentOrganizationId || subordinateShipmentId || shipmentOrgId;
  if (shipmentId !== _subordinateShipmentId && organizationId === _subordinateShipmentId){ // 如果有下级并且当前用户是下级
    return 0;
  }
  return transportPriceEntity.shipmentDifferenceCharge || 0;
};

// 对账管理-获取承运接单服务费
export const getShipmentServiceCharge = ({ shipmentOrganizationId, shipmentOrgId, subordinateShipmentId, shipmentId }, transportPriceEntity)=>{
  const { organizationId } = getUserInfo();
  const _subordinateShipmentId = shipmentOrganizationId || subordinateShipmentId || shipmentOrgId;
  if (shipmentId !== _subordinateShipmentId && organizationId === _subordinateShipmentId){ // 如果有下级并且当前用户是下级
    return 0;
  }
  return transportPriceEntity.shipmentServiceCharge || 0;
};


