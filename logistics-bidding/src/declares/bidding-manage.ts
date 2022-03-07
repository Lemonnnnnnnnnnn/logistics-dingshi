import {
  IDictionary,
  IPaginationParams,
  ITableListObjProps,
  IUserItem
} from "./common";
import {
  TENDER_TITLE,
  TENDER_TYPE,
  TENDER_STATUS,
  SUPPLIER_SCOPE,
  OFFER_TIME,
  TENDER_TIME,
  TENDER_CHINESE_DICT,
  TENDER_TYPE_DICT,
  SUPPLIER_SCOPE_DICT,
  IPackageCorrelationItem,
  TENDER_BIDDER_STATUS
} from "./tender-manage";
import { renderOptions } from "@/utils/utils";

export enum TENDER_BIDDER_STATUS_ENUM {
  WaitBidding = 1,
  WaitPay,
  Tendered,
  WaitBiddingTwo,
  BiddingTwoOver,
  WaitPriceConfirm,
  PriceConfirmOver,
  Winning,
  Fail,
  Withdrawn,
  NotBidding
}

// 承运投标状态
// 1邀标待投 2待支付 3已投标 4二次报价 5价格确认 6已中标 7未中标
export const TENDER_BIDDER_STATUS_DICT: IDictionary = {
  [TENDER_BIDDER_STATUS_ENUM.WaitBidding]: "邀标待投",
  [TENDER_BIDDER_STATUS_ENUM.WaitPay]: "待支付",
  [TENDER_BIDDER_STATUS_ENUM.Tendered]: "已投标",
  [TENDER_BIDDER_STATUS_ENUM.BiddingTwoOver]: "已二次报价",
  [TENDER_BIDDER_STATUS_ENUM.WaitBiddingTwo]: "待二次报价",
  [TENDER_BIDDER_STATUS_ENUM.WaitPriceConfirm]: "待价格确认",
  [TENDER_BIDDER_STATUS_ENUM.PriceConfirmOver]: "已价格确认",
  [TENDER_BIDDER_STATUS_ENUM.Winning]: "已中标",
  [TENDER_BIDDER_STATUS_ENUM.Fail]: "未中标",
  [TENDER_BIDDER_STATUS_ENUM.Withdrawn]: "已撤回",
  [TENDER_BIDDER_STATUS_ENUM.NotBidding]: "未投标",
};

// 投标搜索初始条件
export const TENDER_BIDDER_SEARCH_INIT = {
  [TENDER_TITLE]: undefined,
  // [PROJECT_CREATE_TIME]: undefined,
  [TENDER_TYPE]: undefined,
  [TENDER_STATUS]: undefined,
  // [IS_MULTIPLE_WINNER]: undefined,
  [SUPPLIER_SCOPE]: undefined,
  [OFFER_TIME]: undefined,
  [TENDER_TIME]: undefined
  // [TENDER_NO]: undefined
};

// 投标搜索筛选列表
export const BIDDING_SEARCH_LIST = [
  {
    label: TENDER_CHINESE_DICT[TENDER_TITLE],
    key: TENDER_TITLE,
    type: "input",
    placeholder: `请选择${TENDER_CHINESE_DICT[TENDER_TITLE]}`
  },
  {
    label: TENDER_CHINESE_DICT[TENDER_TYPE],
    key: TENDER_TYPE,
    placeholder: `请输入${TENDER_CHINESE_DICT[TENDER_TYPE]}`,
    type: "select",
    showSearch: true,
    options: renderOptions(TENDER_TYPE_DICT)
  },
  {
    label: TENDER_CHINESE_DICT[TENDER_BIDDER_STATUS],
    key: TENDER_BIDDER_STATUS,
    placeholder: `请选择状态`,
    type: "select",
    showSearch: true,
    options: renderOptions(TENDER_BIDDER_STATUS_DICT)
  },
  {
    label: TENDER_CHINESE_DICT[SUPPLIER_SCOPE],
    key: SUPPLIER_SCOPE,
    placeholder: `请选择${TENDER_CHINESE_DICT[SUPPLIER_SCOPE]}`,
    type: "select",
    showSearch: true,
    options: renderOptions(SUPPLIER_SCOPE_DICT)
  },
  {
    label: TENDER_CHINESE_DICT[OFFER_TIME],
    key: OFFER_TIME,
    type: "time"
  },
  {
    label: TENDER_CHINESE_DICT[TENDER_TIME],
    key: TENDER_TIME,
    type: "time"
  }
];

// 投标dva store
export interface ITenderBidderManageStoreProps {
  tenderBidderList: ITableListObjProps<ITenderBidderItem>;
  tenderBidderDetail: ITenderBidderDetail | null;
  contactIdItems: ITableListObjProps<IUserItem>;
  refundInfo: IRefundInfoRes | null;
}

// 投标列表返回item
export interface ITenderBidderItem {
  tenderBidderId: number; // 投标者表id
  tenderId: number; // 招标id
  tenderBidderStatus: number; // 1邀标待投 2待支付 3已投标 4二次报价 5价格确认 6已中标 7未中标
  tenderBidderTime: string; // 投标时间
  remark: string; // 备注
  tenderType: number; // 招标类型(1.招标 2.询价)
  tenderTitle: string; // 项目标题
  isMultipleWinner: number; // 中标是否可为多个投标单位(0.不是,1.是)
  supplierScope: number; // 供应商范围(1.公开征集供应商,2.定向邀请指定供应商)
  offerStartTime: string; // 报价开始日期
  offerEndTime: string; // 报价结束日期
  tenderOpenTime: string; // 开标日期
  tenderNo: string; // 项目编号
  tenderStatus: number; // 招标状态
}

// 投标列表请求参数
export interface ITenderBidderParams extends IPaginationParams {
  tenderTitle?: string; // 项目标题
  tenderBidderStatus?: number; // 1邀标待投 2待支付 3已投标 4二次报价 5价格确认 6已中标 7未中标
  tenderStatus?: number; // 招标状态
  isMultipleWinner?: number; // 中标是否可为多个投标单位(0.不是,1.是)
  tenderType?: number; // 招标类型(1.招标 2.询价)
  supplierScope?: number; // 供应商范围(1.公开征集供应商,2.定向邀请指定供应商)
  tenderOpenTimeStart?: string; // 开标日期Start
  tenderOpenTimeEnd?: string; // 开标日期End
  offerTimeStart?: string; // 报价开始/结束日期Start
  offerTimeEnd?: string; // 报价开始/结束日期Start
  isCount?: boolean; //是否返回总数|not_must|defaul:true
  isOrderByTime?: boolean; //是否根据创建时间排序|not_must|defaul:true
}

// 立即投标，修改投标请求参数
export interface IPatchTenderBidderParams {
  tenderBidderId: number; // 投标者表id
  tenderId: number; // 投标ID
  tenderBidderDentryid: string; // 投标/资质文件
  remark: string; // 备注
  offerTimes: number; // 报价次数：'''默认值1'''
  contactIdItems: number[]; // 业务联系人  用户Id
  bidderOfferItems: IBidderOfferItem[];
}

//立即投标，修改投标返回数据
export interface IPatchTenderBidder {
  tenderBidderId: number;
  tenderId: number;
  tenderBidderStatus: number;
  tenderBidderDentryid: string;
  lookView: number;
  tenderBidderTime: string;
  organizationId: number;
  isEffect: number;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
  remark: string;
}

// 支付投标保证金/标书费
export interface IPayTenderBidderParams {
  tenderId: number;
  smsCode: string; // 短信验证码
  phone: string; // 电话
}

// 二次报价请求参数
export interface IPatchTenderBidderTwoParams {
  offerTimes: number;
  tenderBidderId?: number;
  tenderId?: number;
  bidderOfferItems: IBidderOfferItem[];
}

export interface IPriceConfirmParams {
  tenderBidderId: number;
  bidderOfferConfirmItems: IBidderOfferConfirmItems[];
}

export interface IBidderOfferConfirmItems {
  tenderPackageId: number;
  packageCorrelationId: number;
  offerConfirmation: number;
}
export interface IPatchTenderBidderTwo {
  tenderBidderOfferId: number;
  tenderBidderId: number;
  tenderPackageId: number;
  packageCorrelationId: number;
  offerTimes: string;
  taxContain: number;
  taxNotContain: number;
  maximumCapacity: number;
  offerConfirmation: string;
  organizationId: number;
  isEffect: number;
  createUserName: string;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
  remark: string;
}

export interface IBidderOfferFormItem {
  taxContain?: number; // 含税运费（元/吨）
  taxNotContain?: number; // 不含税运费（元/吨）
  maximumCapacity?: number; // 预计月最大运输量
  remark?: string; // 备注
}

// 报价信息
export interface IBidderOfferItem extends IBidderOfferFormItem   {
  tenderPackageId?: number; // 招标包件表ID
  packageCorrelationId?: number; // 包件关联id
  remark?: string;
  maximumCapacity: number;
  tenderBidderOfferId?: number;
  tenderBidderId?: number;
  tenderBidderPackageId?: number;
  offerTimes?: number;
  offerConfirmation?: number;
  organizationId?: number;
  organizationName?: string;
  isEffect?: number;
  createUserName: null;
  createUserId?: number;
  createTime?: string;
  updateUserId?: number;
  updateTime?: string;
}

export interface ITenderBidderDetail {
  /** 招标信息 */
  tenderId: number;
  /** 项目标题 */
  tenderTitle: string;
  /** 项目编号 */
  tenderNo: string;
  /** 招标状态(1草稿 2预报 3投标中 4待开标-评标 5待开标-二次报价 6待开标-价格确认 7待开标-未公示 8已开标 9已撤回) */
  tenderStatus: number;
  /** 投标信息 */
  tenderBidderNo: null | string;
  /** 投标者表id */
  tenderBidderId: number;
  /** 投标时间 */
  tenderBidderTime: string;
  /** 价格确认时间 */
  priceConfirmationTime: string;
  /** 二次报价时间 */
  tenderBidderSecondTime: string;
  /** 投标/资质文件 */
  tenderBidderDentryid: string;
  /** 1邀标待投 2待支付 3已投标 4待二次报价 5二次报价 6待价格确认 7已价格确认 8已中标 9未中标 */
  tenderBidderStatus: number;
  createUserId: number;
  /** 创建用户 */
  createUserName: string;
  bidderContactItems: IBidderContactItems[];
  tenderPackageItems: ITenderPackageItems[];
  tenderEventItems: ITenderEventItems[];
}

/** 业务联系人信息 */
export interface IBidderContactItems {
  tenderBidderContactId: number;
  tenderBidderId: number;
  contactId: number;
  contactName: null | string;
  contactPhone: null | string;
  lookView: number;
  organizationId: number;
  isEffect: number;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
}

/** 招标包件信息 */
export interface ITenderPackageItems {
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
  earnestMoneyPayTime: null | string;
  tenderFeeRefundTime: null | string;
  tenderFeePayTime: null | string;
  earnestMoneyRefundTime: null | string;
  remark: string;
  isAbortive: null | number;
  bidderSequence: number;
  packageSequence: number;
  packageCorrelationResps: IPackageCorrelationItem[];
  tenderBidderPackageEntity: ITenderBidderPackageEntity;
}

/** 事件信息 */
export interface ITenderEventItems {
  tenderEventId: number;
  tenderId: number;
  /** 承运方（投标者）投标操作事件类型(311创建了投标单 321修改了投标单 331支付了投标单 341二次报价 351价格确认 361退保申请) */
  tenderEventType: number;
  tenderEventDetail: string;
  organizationId: number;
  isEffect: number;
  createUserName: string;
  createUserId: number;
  createTime: string;
  organizationName: null | string;
}

export interface ITenderBidderPackageEntity {
  /** 投标包件信息 */
  tenderBidderPackageId: number;
  tenderBidderId: number;
  tenderPackageId: number;
  tenderBidderPackageStatus: number;
  earnestMoneyStatus: number;
  refundApplyRemark: null | string;
  refundAuditRemark: null | string;
  isEffect: number;
  createUserId: number;
  createTime: string;
  updateUserId: number;
  updateTime: string;
  remark: null | string;
  bidderSequence: number;
  organizationId: number;
}

export interface IRefundInfoRes {
  tenderBidderRefundPackageResps: ITenderBidderRefundPackageResps[];
  earnestMoneyAuditTime: string; // 保证金退款最新审核时间
  earnestMoneyRefundTime: string; // 保证金退款时间
  tenderEventEntities: ITenderEventEntities[];
  earnestMoneyStatus: number;
}

export interface ITenderBidderRefundPackageResps {
  packageSequence: number;
  packageSequenceStr: string; // 包件顺位
  tenderPackageTitle: string; // 包件标题
  earnestMoney: number; // 投标保证金
  earnestMoneyPayTime: string; // 保证金缴纳时间
}
export interface ITenderEventEntities {
  tenderEventId: number;
  tenderId: number;
  tenderEventType: number; // 事件类别：【36】退保申请；【10】退保申请通过；【11】退保申请拒绝；
  tenderEventDetail: string; // 事件内容
  organizationId: number; // 机构id
  organizationName: string; // 机构名称
  createUserName: string;
  createTime: string;
}
