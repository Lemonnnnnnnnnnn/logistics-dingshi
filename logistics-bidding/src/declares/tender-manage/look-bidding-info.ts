import { IContactConfirmEntitiesData, IPackageCorrelationItem } from ".";
import { IBidderOfferItem } from "..";

// 招标详情返回参数
export interface IPublicBidderDetailReqs {
  tenderId: number; //招标id
  tenderType: number; //招标类型(1.招标 2.询价)
  tenderTitle: string; //项目标题
  tenderStatus: number; //招标状态(1.草稿 2.预报 3.投标中 4.待开标-评标 5.待开标-二次报价 6.待开标-价格确认 7.待开标-未公示 8.已开标 9.已撤回)
  tenderNo: string; //项目编号
  isMultipleWinner: number; //中标是否可为多个投标单位(0.不是,1.是)
  offerStartTime: string; //报价开始日期
  offerEndTime: string; //报价结束日期
  tenderOpenTime: string; //开标日期
  invoiceRequirements: number; //发票要求 1.增值税专票 2.增值税普通发票
  settlementType: number; //结算方式(1.月,2.签收后,3.其它)
  settlementTypeContent: string; //结算方式内容
  supplierScope: number; //供应商范围(1.公开征集供应商,2.定向邀请指定供应商)
  performanceBond: number; //履约保证金(合同金额占比)
  paymentType: number; //支付方式 1.银行转账 2.银行承兑 3.其它
  paymentTypeContent: string; //支付方式内容
  seeTenderContent: number; //查看投标信息条件 1.随时可看 2.投标截止日期后可看
  seeIsConfirm: number; //是否需确认验证码 0.不需要,1.需要
  tenderDentryid: string; //项目附件
  isEffect: number;
  createUserName: string;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
  remark: string;
  organizationId: number;
  tenderEvaluationResult: null; //评标说明
  isShowPrice: number; //是否展示价格:0.不展示,1.展示
  isShowTender: number; //是否公示招标:0.不公示,1.公示
  isUnlock: number; //是否解锁:0.未解锁,1.已解锁
  priceConfirmTime: null; //价格确认截止时间
  unlockStartTime: null; //解锁开始时间
  priceTwoTime: null; //二次报价截止时间
  isShowEvaluation: number; //是否展示评标:0.不展示,1.展示
  tenderPublicTime: string; //招标发布日期
  contactPurchaseRespList: IContactConfirmEntitiesData[]; // 采购联系人
  tenderPackageEntities: ITenderPackageEntitiesData[];
  tenderBidderResps: ITenderBidderRespsData[];
  bidderDetailEventResps: IBidderDetailEventResps[];
}

export interface IBidderDetailEventResps {
  organizationId: number;
  organizationName: string;
  /** 包件顺位列表 */
  sequenceList: number[];
  /** 投标时间 */
  tenderBidderTime: null;
  /** 二次报价时间 */
  secondOfferTime: null;
  /** 价格确认时间 */
  priceConfirmationTime: null;
}

export interface ITenderPackageEntitiesData {
  tenderPackageId: number; //招标包件id
  tenderId: number; //招标id
  tenderPackageTitle: string; //包件标题
  earnestMoney: number; //投标保证金
  tenderFee: number; //标书费
  isEffect: number;
  createUserName: string;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
  remark: string;
  isAbortive: number; // 是否流标 0.没流标,1.流标
  packageSequence: number; // 包件顺位(1代表第一包)
  packageCorrelationEntities?: IPackageCorrelationEntitiesData[];
  packageCorrelationResps?: IPackageCorrelationEntitiesData[];
}
export interface IPackageCorrelationEntitiesData {
  packageCorrelationId: number; //包件关联id
  tenderPackageId: number; //招标包件id
  goodsId: number; //货品Id
  goodsUnit: number; //货物重量单位 1:吨 2:斤 3:克 4:千克 5:米 6:千米
  firstCategoryId: number; //一级类目id
  firstCategoryName: string; //一级类目名称
  deliveryId: number; //提货点id
  receivingId: number; //卸货点id
  maxContain: number; //最高限价(含税运费)
  maxNotContain: number; //最高限价(不含税运费)
  estimateTransportVolume: number; //预计运输量
  isEffect: number;
  createUserName: string;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
  remark: null;
  goodsName: string; //货品名称
  materialQuality: null; //材质
  categoryName: string; //类目名称
  specificationType: null; //规格型号
  packagingMethod: number; //包装方式 1.袋装，2.散装
  receivingName: string; //卸货点名称
  receivingAddress: string; //卸货点地址
  deliveryName: string; //提货点名称
  deliveryAddress: string; //提货点地址
}
export interface ITenderBidderRespsData {
  tenderBidderId: number; //投标者表id
  tenderId: number; //招标id
  tenderBidderStatus: number; //1邀标待投 2待支付 3已投标 4待二次报价 5二次报价 6待价格确认 7已价格确认 8已中标 9未中标
  tenderBidderDentryid: string; //投标/资质文件
  lookView: number; //（主账号）邀标提示：是否查看：【0】未查看，【1】已查看
  tenderBidderTime: string; //投标时间
  priceConfirmationTime: null; //价格确认时间
  organizationId: number; //机构id
  organizationName: string;
  isEffect: number;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  tenderBidderSecondTime: string;
  updateTime: string;
  remark: string;
  isInvite: null; //是否为邀请商家(0.不是 1.是)
  inviteTime: null; //邀请时间
  bidderPackageDetailResps: IBidderPackageEntitiesData[];
  bidderContactEntities: IBidderContactEntitiesData[];
}

export interface IBidderPackageEntitiesData {
  createUserName?: string;
  tenderBidderPackageId: number; //投标包件表ID
  tenderBidderId: number; //投标者表ID
  tenderPackageId: number; //招标包件ID
  tenderBidderPackageStatus: number; //投标包件状态: 0.未中标 1已中标
  earnestMoneyStatus: number; //保证金状态：【1】未缴纳；【2】已缴纳；【3】退保审核中；【4】审核成功；【5】审核失败；【6】已退保；
  paymentTime: null; //保证金缴纳时间
  refundApplyRemark: null; //退保申请备注
  refundAuditRemark: null; //退保审核备注
  isEffect: number;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
  earnestMoneyPayTime: string;
  tenderFee: number;
  remark: string;
  earnestMoney: number;
  tenderPackageTitle: string;
  packageSequence: number;
  bidderSequence: number; //投标顺位
  organizationId: number;
  tenderBidderPackageEntity: any;
  packageCorrelationResps: IPackageCorrelationItem[];
  bidderOfferEntities: IBidderOfferEntitiesData[];
}

export interface IBidderOfferEntitiesData {
  tenderBidderOfferId: number; //报价表id
  tenderBidderId: number; //投标者表id
  tenderPackageId: number; //招标包件表ID
  packageCorrelationId: number; //包件关联id
  tenderBidderPackageId: number; //投标包件表ID
  offerTimes: number; //报价次数
  taxContain: number; //含税运费（元/吨）
  taxNotContain: number; //不含税运费（元/吨）
  maximumCapacity: number; //预计月最大运输量
  offerConfirmation: number; //是否确认：0待确认，1同意，2不同意
  organizationId: number; //机构id
  isEffect: number;
  createUserName: null;
  createUserId: number;
  id?: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
  remark: string;
}

export interface IBidderContactEntitiesData {
  tenderBidderContactId: number; //招标者业务联系人id
  tenderBidderId: number; //投标者表id
  contactId: number; //联系人id
  contactName: null; //联系人名称
  contactPhone: null; //联系人电话
  lookView: number; //二次进价，价格确认，撤标提示：是否查看：【0】未查看，【1】已查看
  organizationId: number;
  isEffect: number;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
}

export interface IContactConfirmEntitiesData {
  tenderContactId: number;
  tenderId: number;
  contactType: number; //联系人类型:1.采购联系人,2.验证码确认人员
  contactId: number; //联系人id
  contactName: string;
  contactPhone: string;
  isUnlock: number;
  createUserId?: number;
  createTime?: string;
}
export interface ITenderEventRespsData {
  tenderEventId: number;
  tenderId: number;
  tenderEventType: number; // 事件类别(1.创建招标单 2.发布招标单 3.撤回招标单 4.查看投标信息 5.录入评标结果 6.标书费收入 7.发起二次报价 8.要求价格确认 9.发布评标结果)
  tenderEventDetail: string;
  organizationId: number;
  isEffect: number;
  createUserName: string;
  createUserId: number;
  createTime: string;
  organizationName: string;
}

export interface IPackageCorrelationCreateReqsItem {
  goodsId: number;
  goodsUnit: number;
  deliveryId: number;
  receivingId: number;
  maxContain: number;
  maxNotContain: number;
  estimateTransportVolume: number;
  packageCorrelationResps: IPackageCorrelationItem[];
}
export interface IBidderMainDetailReqs {
  contactConfirmRespList: IContactConfirmEntitiesData[];
  contactPurchaseRespList: IContactConfirmEntitiesData[];
  createTime: string;
  createUserId: number;
  createUserName: string;
  invoiceRequirements: number;
  isEffect: number;
  isMultipleWinner: number;
  isShowEvaluation: number;
  isShowPrice: number;
  isShowTender: number;
  isUnlock: number;
  offerEndTime: string;
  offerStartTime: string;
  organizationId: number;
  organizationName: string;
  paymentType: number;
  paymentTypeContent: string;
  performanceBond: number;
  priceConfirmTime: string;
  priceTwoTime: string;
  remark: string;
  seeIsConfirm: number;
  seeTenderContent: number;
  settlementType: number;
  settlementTypeContent: string;
  supplierScope: number;
  tenderBidderResps: ITenderBidderRespsData[];
  tenderDentryid: string;
  tenderEvaluationResult: string;
  tenderId: number;
  tenderNo: string;
  tenderOpenTime: string;
  tenderPackageEntities: ITenderPackageEntitiesItem[]; //投标者
  tenderPublicTime: string;
  tenderStatus: number;
  tenderTitle: string;
  tenderType: number;
  unlockStartTime: string;
  updateTime: string;
  updateUserId: number;
}
export interface ITenderPackageEntitiesItem {
  bidderContactEntities: [];
  bidderPackageDetailResps: IBidderPackageDetailResps[];
  createTime: string;
  createUserId: number;
  inviteTime: string;
  isEffect: number;
  isInvite: string;
  lookView: number;
  organizationId: number;
  organizationName: string;
  priceConfirmationTime: string;
  remark: string;
  tenderBidderDentryid: string;
  tenderBidderId: number;
  tenderBidderNo: string;
  tenderBidderSecondTime: string;
  tenderBidderStatus: number;
  tenderBidderTime: string;
  tenderId: number;
  updateTime: string;
  updateUserId: number;
}

export interface IBidderPackageDetailResps {
  // 包件
  bidderOfferEntities: IBidderOfferItem[]; // 报价列表
  bidderSequence: number;
  createTime: string;
  createUserId: number;
  earnestMoneyPayTime: string;
  earnestMoneyRefundTime: string;
  earnestMoneyStatus: number;
  isEffect: number;
  organizationId: number;
  organizationName: string;
  packageCorrelationResps: IPackageCorrelationResps[];
  refundApplyRemark: string;
  refundAuditRemark: string;
  remark: string;
  tenderBidderId: number;
  tenderBidderPackageId: number;
  tenderBidderPackageStatus: number;
  tenderFeePayTime: string;
  tenderFeeRefundTime: string;
  tenderPackageEntity: ITenderPackageEntityInfo;
  tenderPackageId: number;
  updateTime: string;
  updateUserId: number;
}

export interface IPackageCorrelationResps {
  bidderOfferItems: IBidderOfferItem[];
  categoryName: string;
  createTime: string;
  createUserId: number;
  createUserName: string;
  deliveryAddress: string;
  deliveryCityCode: string;
  deliveryCountyCode: string;
  deliveryId: number;
  deliveryName: string;
  deliveryProvinceCode: string;
  estimateTransportVolume: number;
  firstCategoryId: number;
  firstCategoryName: string;
  goodsId: number;
  goodsName: string;
  goodsUnit: number;
  isEffect: number;
  materialQuality: string;
  maxContain: number;
  maxNotContain: number;
  packageCorrelationId: number;
  packagingMethod: string;
  receivingAddress: string;
  receivingCityCode: string;
  receivingCountyCode: string;
  receivingId: number;
  receivingName: string;
  receivingProvinceCode: string;
  remark: string;
  specificationType: number;
  tenderId: number;
  tenderPackageId: number;
  updateTime: string;
  updateUserId: number;
}
export interface ITenderPackageEntityInfo {
  // 包件信息
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
  packageCorrelationResps: any;
  tenderBidderPackageEntity: any;
  bidderPackageEntities: any;
}
