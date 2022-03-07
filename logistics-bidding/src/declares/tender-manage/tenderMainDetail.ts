import {
  IBidderPackageEntitiesData,
  IPackageCorrelationItem,
  ITenderBidderPackageEntity
} from "@/declares";

export interface ITenderMainDetail {
  tenderId: number;
  tenderType: number;
  tenderTitle: string;
  tenderStatus: number;
  tenderNo: string;
  isMultipleWinner: number;
  offerStartTime: string;
  offerEndTime: string;
  tenderOpenTime: string;
  invoiceRequirements: number;
  settlementType: number;
  settlementTypeContent: string;
  supplierScope: number;
  performanceBond: number;
  paymentType: number;
  paymentTypeContent: string;
  seeTenderContent: number;
  seeIsConfirm: number;
  tenderDentryid: string;
  isEffect: number;
  createUserName: string;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
  remark: string;
  organizationId: number;
  organizationName: string;
  tenderEvaluationResult: string;
  isShowPrice: number;
  isShowTender: number;
  isUnlock: number;
  priceConfirmTime: string;
  unlockStartTime: string;
  priceTwoTime: string;
  isShowEvaluation: number;
  tenderPublicTime: string;
  contactPurchaseRespList: IContactPurchaseRespList[];
  contactConfirmRespList: IContactConfirmRespList[];
  tenderPackageEntities: ITenderPackageEntities[];
}

/** 采购人员 */
export interface IContactPurchaseRespList {
  tenderContactId: number;
  tenderId: number;
  contactType: number;
  contactId: number;
  contactName: string;
  isUnlock: number;
  contactPhone: string;
}

/** 验证码确认人员 */
export interface IContactConfirmRespList {
  tenderContactId: number;
  tenderId: number;
  contactType: number;
  contactId: number;
  contactName: string;
  isUnlock: number;
  contactPhone: string;
}

/** 包件 */
export interface ITenderPackageEntities {
  tenderPackageId: number;
  tenderId: number;
  tenderPackageTitle: string;
  earnestMoney: number;
  tenderFee: number;
  isEffect: number;
  createUserName: string;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
  remark: string;
  isAbortive: number;
  packageSequence: number;
  packageCorrelationResps: IPackageCorrelationItem[];
  tenderBidderPackageEntity: ITenderBidderPackageEntity;
  bidderPackageEntities: ITenderBidderPackageEntity[];
  bidderPackageDetailResps: IBidderPackageDetailResps[];
  bidderOfferItems ?: any
}

/** 投标包件 */
export interface IBidderPackageDetailResps {
  tenderBidderPackageId: number;
  tenderBidderId: number;
  tenderPackageId: number;
  tenderBidderPackageStatus: number;
  earnestMoneyStatus: number;
  earnestMoneyPayTime: string;
  tenderFeePayTime: string;
  earnestMoneyRefundTime: string;
  tenderFeeRefundTime: string;
  refundApplyRemark: string;
  refundAuditRemark: string;
  isEffect: number;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
  remark: string;
  bidderSequence: number;
  organizationId: number;
  organizationName: string;
  packageCorrelationResps: IPackageCorrelationResps[];
  bidderPackageDetailResps ?: IBidderPackageEntitiesData[];
}

/** 包件关联 */
export interface IPackageCorrelationResps {
  packageCorrelationId: number;
  tenderPackageId: number;
  goodsId: number;
  goodsName: string;
  categoryName: string;
  materialQuality: number;
  specificationType: number;
  goodsUnit: number;
  packagingMethod: number;
  firstCategoryId: number;
  firstCategoryName: string;
  deliveryId: number;
  deliveryName: string;
  deliveryAddress: string;
  deliveryProvinceCode: string | number;
  deliveryCityCode: string | number;
  deliveryCountyCode: string | number;
  receivingId: number;
  receivingName: string;
  receivingAddress: string;
  receivingProvinceCode: string | number;
  receivingCityCode: string | number;
  receivingCountyCode: string | number;
  maxContain: number;
  maxNotContain: number;
  estimateTransportVolume: number;
  isEffect: number;
  createUserName: string;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
  remark: string;
  tenderId: number;
  bidderOfferItems: IBidderOfferItems[];
}

/** 报价 */
export interface IBidderOfferItems {
  tenderBidderOfferId: number;
  tenderBidderId: number;
  tenderPackageId: number;
  packageCorrelationId: number;
  tenderBidderPackageId: number;
  offerTimes: number;
  taxContain: number;
  taxNotContain: number;
  maximumCapacity: number;
  offerConfirmation: number;
  organizationId: number;
  isEffect: number;
  createUserName: string;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
  remark: string;
}
