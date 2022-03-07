import {
  IBidderMainDetailReqs,
  IContactConfirmEntitiesData,
  IEvaluationReqs,
  IPackageCorrelationCreateReqsItem,
  IPublicBidderDetailReqs,
  IRefundEarnestMoneyReqs,
  ITenderEventRespsData,
  ITenderInvitedItem
} from ".";
import { IPaginationParams, ITableListObjProps, IDictionary } from "../common";
import { renderOptions } from "@/utils/utils";
import dayjs from "dayjs";
import { IBidderOfferItem } from "@/declares";
import { ITenderMainDetail } from "@/declares/tender-manage/tenderMainDetail";

// 项目名称
export const TENDER_TITLE = "tenderTitle";
// 发布时间
export const PROJECT_CREATE_TIME = "time"; //加字段
// 采购类型
export const TENDER_TYPE = "tenderType";
// 状态
export const TENDER_STATUS = "tenderStatus";
// 是否可多家中标
export const IS_MULTIPLE_WINNER = "isMultipleWinner";
// 供应商范围
export const SUPPLIER_SCOPE = "supplierScope";
// 投标起止日期
export const OFFER_TIME = "offerTime";
// 开标日期
export const TENDER_TIME = "tenderTime";
// 项目编号
export const TENDER_NO = "tenderNo";
// 项目ID
export const TENDER_ID_LIST = "tenderIdList";
//投标时间
export const TENDER_BIDDER_TIME = "tenderBidderTime";
// 机构名称
export const ORGANIZATION_NAME = "organizationName";
// 联系人
export const CONTACT_NAME = "contactName";
//联系电话
export const CONTACT_PHONE = "contactPhone";
//机构地址
export const ORGANIZATION_ADDRESS = "organizationAddress";
// 邀请时间
export const INVITE_TIME = "inviteTime";
// 投标状态
export const TENDER_BIDDER_STATUS = "tenderBidderStatus";

// 招标/投标管理列表中英文字典对应
export const TENDER_CHINESE_DICT: IDictionary = {
  // [TENDER_ID_LIST]: "项目ID",
  [TENDER_NO]: "项目编号",
  [TENDER_TITLE]: "项目名称",
  [TENDER_TYPE]: "采购类型",
  [SUPPLIER_SCOPE]: "供应商范围",
  [IS_MULTIPLE_WINNER]: "是否可多家中标",
  [TENDER_STATUS]: "状态",
  [TENDER_BIDDER_STATUS]: "状态",
  [PROJECT_CREATE_TIME]: "发布时间",
  [OFFER_TIME]: "投标起止日期",
  [TENDER_TIME]: "开标日期",
  [TENDER_BIDDER_TIME]: "投标时间",

  [ORGANIZATION_NAME]: "公司名称",
  [CONTACT_NAME]: "联系人",
  [CONTACT_PHONE]: "联系电话",
  [ORGANIZATION_ADDRESS]: "详细地址",
  [INVITE_TIME]: "邀请时间"
};

// 托运招标状态
//招标状态(1.草稿 2.预报 3.投标中 4.待开标-评标 5.待开标-二次报价 6.待开标-价格确认 7.待开标-未公示 8.已开标 9.已撤回)
export const TENDER_STATUS_DICT: IDictionary = {
  1: "草稿",
  2: "预报",
  3: "投标中",
  4: "待开标-评标",
  5: "待开标-二次报价",
  6: "待开标-价格确认",
  7: "待开标-未公示",
  8: "已开标",
  9: "已撤回"
};

// 采购类型
export const TENDER_TYPE_DICT: IDictionary = {
  1: "招标",
  2: "询价"
};

// 是否可对家中标
export const IS_MULTIPLE_WINNER_DICT: IDictionary = {
  0: "单家",
  1: "多家"
};

// 供应商范围
export const SUPPLIER_SCOPE_DICT: IDictionary = {
  1: "公开征集供应商",
  2: "定向邀请指定供应商"
};

// 招标搜索初始条件
export const TENDER_SEARCH_INIT = {
  [TENDER_TITLE]: undefined,
  [PROJECT_CREATE_TIME]: undefined,
  [TENDER_TYPE]: undefined,
  [TENDER_STATUS]: undefined,
  [IS_MULTIPLE_WINNER]: undefined,
  [SUPPLIER_SCOPE]: undefined,
  [OFFER_TIME]: undefined,
  [TENDER_TIME]: undefined,
  [TENDER_NO]: undefined
};

// 招标搜索筛选列表
export const TENDER_SEARCH_LIST = [
  {
    label: TENDER_CHINESE_DICT[TENDER_TITLE],
    key: TENDER_TITLE,
    type: "input",
    placeholder: `请选择${TENDER_CHINESE_DICT[TENDER_TITLE]}`
  },
  {
    label: TENDER_CHINESE_DICT[PROJECT_CREATE_TIME],
    key: PROJECT_CREATE_TIME,
    type: "time"
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
    label: TENDER_CHINESE_DICT[TENDER_STATUS],
    key: TENDER_STATUS,
    placeholder: `请选择${TENDER_CHINESE_DICT[TENDER_STATUS]}`,
    type: "select",
    showSearch: true,
    mode: "tags",
    options: renderOptions(TENDER_STATUS_DICT)
  },
  {
    label: TENDER_CHINESE_DICT[IS_MULTIPLE_WINNER],
    key: IS_MULTIPLE_WINNER,
    placeholder: `请选择${TENDER_CHINESE_DICT[IS_MULTIPLE_WINNER]}`,
    type: "select",
    showSearch: true,
    options: renderOptions(IS_MULTIPLE_WINNER_DICT)
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
  },
  {
    label: TENDER_CHINESE_DICT[TENDER_NO],
    key: TENDER_NO,
    placeholder: `请输入${TENDER_CHINESE_DICT[TENDER_NO]}`,
    type: "input"
  }
];

export interface IPackageCreateItem {
  tenderPackageTitle: string;
  earnestMoney: number;
  tenderFee: number;
  packageSequence: number;
  remark: string;
  packageCorrelationResps?: IPackageCorrelationItem[];
  packageCorrelationCreateReqs: IPackageCorrelationCreateReqsItem[];
}

export interface ITenderManageStoreProps {
  bidding: ITableListObjProps<IBiddingItem>;
  goodsList: IGoodsReqs[];
  deliveriesList: IDeliveriesReqs[];
  receivingList: IReceivingReqs[];
  usersList: IUsersReqs[];
  refundEarnestMoneyList: IRefundEarnestMoneyReqs[];
  goodsCategoriesList: IGoodsCategoriesReqs[];
  biddingDetail: IPutBiddingParams | null;
  organizationsList: ITableListObjProps<IOrganizationsReqs>;
  publicBidderDetail: IPublicBidderDetailReqs | null;
  // organizationsList: ITableListObjProps<IOrganizationsReqs>;
  priceSureList: any[];
  inviteListDetailResps: ITenderInvitedItem[];
  evaluationInfo: IEvaluationReqs | null;
  bidderMainDetail: IBidderMainDetailReqs | null;
  tenderMainDetail: ITenderMainDetail | null;
  bidEvaluationResults: ITenderMainDetail | null;
  tenderCorrelationMainDetail: ITenderMainDetail | null;
}

// 托运招标列表请求参数
export interface IBiddingParams extends IPaginationParams {
  tenderTitle?: string;
  tenderType?: string;
  tenderStatus?: string;
  tenderNo?: string;
  isMultipleWinner?: string;
  tenderStatusArr?: string;
  offerStartTime?: string;
  offerEndTime?: string;
  tenderOpenTime?: string;
  tenderEndTime?: string;
  supplierScope?: string;
  tenderIdList?: string;
  publicStartTime?: string; //招标发布日期|开始
  publicEndTime?: string; //招标发布日期|结束
}

// 托运招标列表返回item
export interface IBiddingItem {
  tenderId: number;
  tenderType: number;
  tenderTitle: string;
  isRefundAuditExist: boolean;
  tenderStatus: number;
  isTenderBidder: boolean;
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
  tenderEvaluationResult: number | null;
  isShowPrice: number;
  isShowTender: number;
  isUnlock: number;
  priceConfirmTime: number | null;
  unlockStartTime: number | null;
  priceTwoTime: number | null;
  isShowEvaluation: number | null;
}

// 发布|修改招标请求参数
export interface IPutBiddingParams {
  isEffect?: number;
  tenderType?: number;
  tenderTitle?: string;
  isMultipleWinner?: number;
  offerStartTime?: string;
  offerEndTime?: string;
  tenderOpenTime?: string;
  tenderStatus?: number;
  priceTwoTime?: string;
  priceConfirmTime?: string;
  invoiceRequirements?: number;
  settlementType?: number;
  settlementTypeContent?: string;
  supplierScope?: number;
  performanceBond?: number;
  paymentType?: number;
  paymentTypeContent?: string;
  seeTenderContent?: number;
  seeIsConfirm?: number;
  tenderDentryid?: string;
  remark?: string;
  unlockStartTime?: string | null;
  tenderOperate?: number;
  contactPurchaseList?: number[];
  contactConfirmList?: number[]; // 指定人员验证
  tenderPackageEntities?: IPackageCorrelationCreateReqsItem[];
  contactConfirmRespList?: IContactConfirmEntitiesData[]; // 指定人员验证实体
  contactPurchaseEntities?: IContactConfirmEntitiesData[];
  packageCreateReqs?: IPackageCorrelationCreateReqsItem[];
  tenderEventResps?: ITenderEventRespsData[];
  transactionEntities?: ITransactionEntitiesData[];
  bidderDetailEventResps?: IBidderDetailEventRespsData[];
}
export interface IBidderDetailEventRespsData {
  organizationId: number;
  organizationName: "四川能投物资产业集团有限公司";
  sequenceList: number[]; //包件顺位列表
  tenderBidderTime: string; //投标时间
  tenderBidderSecondTime: string; //二次报价时间
  priceConfirmationTime: string; //价格确认时间
}
export interface ITransactionEntitiesData {
  transactionId: number;
  transactionNo: string;
  transactionType: string; //【42】标书费收入
  accountBalance: string;
  payerName: string;
  payerAccount: string;
  payeeName: string;
  payeeAccount: string;
  transactionAmount: string; //交易金额
  transportId: string;
  transportNo: string;
  projectId: number;
  projectName: string;
  isEffect: string;
  createTime: string; //创建时间
  createUserId: number;
  updateTime: string;
  updateUserId: number;
  remarks: string;
  orderId: number;
  orderNo: string;
  organizationId: number;
  driverUserId: number;
  transactionStatus: string;
  orderPayNo: string;
  orderDriverNo: string;
  operationType: string;
  payRemarks: string;
  orderPayDentryid: string;
  bankCode: string;
  payTime: string;
  payerVirtualAccountId: number;
  payeeVirtualAccountId: number;
  financeBusinessId: string;
  accountTransportId: string;
  accountTransportNo: string;
  applyBusinessId: number;
  applyBusinessNo: string;
}

export interface IPackageCorrelationItem {
  categoryName: string;
  createTime: string;
  createUserId: number;
  createUserName: string;
  deliveryAddress: string;
  deliveryId: number;
  deliveryName: string;
  estimateTransportVolume: number;
  firstCategoryId: number;
  firstCategoryName: string;
  goodsId: number;
  goodsName: string;
  goodsUnit: number;
  isEffect: number;
  packageSequence: number;
  materialQuality: number;
  maxContain: number;
  maxNotContain: number;
  packageCorrelationId: number;
  packagingMethod: number;
  receivingAddress: string;
  receivingId: number;
  receivingName: string;
  remark: string;
  specificationType: number;
  tenderPackageId: number;
  updateTime: string;
  updateUserId: number;
  bidderOfferItems?: IBidderOfferItem[];
}

export interface IApplyEarnestMoneyRefundParams {
  remarks: string;
  tenderId: number;
}

export const INVITE_COLUMN = [
  {
    title: TENDER_CHINESE_DICT[ORGANIZATION_NAME],
    dataIndex: ORGANIZATION_NAME,
    key: ORGANIZATION_NAME
  },
  {
    title: TENDER_CHINESE_DICT[CONTACT_NAME],
    dataIndex: CONTACT_NAME,
    key: CONTACT_NAME
  },
  {
    title: TENDER_CHINESE_DICT[CONTACT_PHONE],
    dataIndex: CONTACT_PHONE,
    key: CONTACT_PHONE
  },
  {
    title: TENDER_CHINESE_DICT[ORGANIZATION_ADDRESS],
    dataIndex: ORGANIZATION_ADDRESS,
    key: ORGANIZATION_ADDRESS
  }
];

export const INVITED_COLUMN = [
  {
    title: TENDER_CHINESE_DICT[ORGANIZATION_NAME],
    dataIndex: ORGANIZATION_NAME,
    key: ORGANIZATION_NAME
  },
  {
    title: TENDER_CHINESE_DICT[INVITE_TIME],
    dataIndex: INVITE_TIME,
    key: INVITE_TIME,
    render: (text: string) => (text ? dayjs(text).format("YYYY/MM/DD") : "-")
  },
  {
    title: TENDER_CHINESE_DICT[TENDER_BIDDER_TIME],
    dataIndex: TENDER_BIDDER_TIME,
    key: TENDER_BIDDER_TIME,
    render: (text: string) => (text ? dayjs(text).format("YYYY/MM/DD") : "-")
  }
];

export const SHIPMENT_SEARCH_INIT = {
  [ORGANIZATION_NAME]: undefined,
  [CONTACT_NAME]: undefined
};

export const SHIPMENT_SEARCH_LIST = [
  {
    label: TENDER_CHINESE_DICT[ORGANIZATION_NAME],
    key: ORGANIZATION_NAME,
    type: "input",
    placeholder: `请输入${TENDER_CHINESE_DICT[ORGANIZATION_NAME]}`
  },
  {
    label: TENDER_CHINESE_DICT[CONTACT_NAME],
    key: CONTACT_NAME,
    type: "input",
    placeholder: `请输入${TENDER_CHINESE_DICT[CONTACT_NAME]}`
  }
];

export enum PageType {
  Add = "add", // 添加
  Edit = "edit", // 编辑
  Copy = "copy", // 编辑
  Detail = "detail" // 编辑
}

export interface IGoodsParams extends IPaginationParams {
  goodsName?: string; // 货品名称
}

export interface IAddGoodsParams {
  goodsName: string; //品牌名称|string|must|
  categoryId: number; //类目id|Long|must
  materialQuality: string; //材质|string|not_must
  specificationType: string; //规格型号|string|not_must|
  packagingMethod: number; //包装方式 1.袋装，2.散装，|int|not_must
  remarks: string; //备注|string|not_must
}

export interface IGoodsReqs {
  goodsId: string;
  goodsName: string;
  categoryName: string;
  materialQuality: string;
  specificationType: string;
  packagingMethod: string;
  remarks: string;
  is_effect: string;
  createUserId: string;
  updateUserId: string;
  createTime: string;
  updateTime: string;
}

export interface IDeliveriesParams extends IPaginationParams {
  deliveryName?: string; // 提货点|not_must|模糊匹配
  supplierOrgName?: string; // 供应商名称|not_must|模糊匹配
  isAvailable?: number; // 是否启用|int|not_must|false.禁用;true.启用
}

export interface IDeliveriesReqs {
  deliveryId: number;
  organizationId: number; //托运方id
  deliveryName: string;
  deliveryAddress: string;
  deliveryLongitude: number;
  deliveryLatitude: number;
  supplierOrgId: number;
  supplierOrgName: number; //提货单位名称
  contactName: string;
  contactPhone: string;
  remarks: string;
  isOpenFence: boolean; //是否开启围栏|not_must| true开启   false关闭
  radius: number; //围栏半径|not_must|
  isAvailable: true;
  createUserId: number;
  updateUserId: number;
  createTime: string;
  updateTime: string;
  deliveryType: number; //提货点类型 1.普通提货点 2.未知提货点
  provinceCode: number; // 省编码
  cityCode: number; // 市编码
  countyCode: number; // 县编码
  provinceCityCounty: string; // 省市县地址
}

export interface IAaddDeliveriesParams {
  deliveryName: string;
  deliveryAddress: string;
  deliveryLongitude: number;
  deliveryLatitude: number;
  supplierOrgId: number;
  contactName: string;
  contactPhone: string;
  transportId: number; //运单id,司机创建提货点传
  areaCode: string; // 县区域编码 6 位数字
}

export interface IReceivingParams extends IPaginationParams {
  receivingName?: string; // 卸货点名称|not_must|模糊匹配
  receivingLabel?: string; // 卸货点标签|not_must|模糊匹配
  receivingLabelId?: number; // 卸货点标签id|not_must|
  isAvailable?: number; // 是否启用|boolean|must|false.禁用;true.启用
  vagueSelect?: string; // 查询框|not_must|模糊匹配(项目名称和卸货点名称)
  isSelectSelf?: boolean; // 是否查询自己。false不是自己，true自己 不传查机构下全部
}

export interface IReceivingReqs {
  receivingId: number; // 卸货点id|
  receivingName: string; // 卸货点名称|string|must|
  receivingAddress: string; // 卸货点地址|string|must|
  receivingLabelId: number; // 卸货点标签id|Long|must|
  receivingLabel: string; // 卸货点标签|string|must|
  customerOrgName: string; // 客户名称/卸货单位|string|must|
  receivingLongitude: number; //  卸货点经度|decimal|must|
  receivingLatitude: number; // 卸货点纬度|decimal|must|
  customerOrgId: number; // 收货单位id|int|must|
  contactName: string; // 联系人名称|string|must|
  contactPhone: number; // 联系人电话|string|must|
  signDentryid: string; // 样签|string|must|
  remarks: string; // 备注
  isAvailable: boolean; // 是否启用|boolean|must|false.禁用;true.启用
  is_effect: boolean; // 是否生效|int|(0.失效;1.生效)
  isOpenFence: boolean; // 是否开启围栏|not_must| true开启   false关闭
  radius: number; // 围栏半径|not_must|
  createUserId: number;
  updateUserId: number;
  createTime: string;
  updateTime: string;
  provinceCode: number; // 省编码
  cityCode: number; // 市编码
  countyCode: number; // 县编码
  provinceCityCounty: string; // 省市县地址
}

export interface IAddReceivingParams {
  receivingName: string; //卸货点名称|string|must|
  receivingAddress: string; //卸货点地址|string|must|
  receivingLabelId: number; //卸货点标签id|Long|not_must|客户创建不传
  receivingLongitude: number; //卸货点经度|decimal|must|
  receivingLatitude: number; //卸货点纬度|decimal|must|
  signDentryid: string; //样签|string|not_must|
  remarks: string; //备注|not_must|
  customerOrgId: string;
  contactName: string; //联系人名称|string|
  contactPhone: number; //联系人电话|string|
  isOpenFence: boolean; //是否开启围栏|not_must| true开启   false关闭
  radius: number; //围栏半径|not_must|
  isAvailable: boolean; //是否启用|boolean|must|false.禁用;true.启用
  areaCode: string; // 县区域编码 6 位数字
}

export interface IUsersParams extends IPaginationParams {
  organizationId?: number; // 所属企业标识|must(不能查询关联的司机账户，只能搜索平台全部司机账户)
  accountType?: number; // 账号类型(1.主账号，2.司机账号，3.机构下普通账户)
  organizationType?: number; // 机构类型(1.平台;2.运营方;3.货权方;4.货主;5.承运商;6.供应商;7.客户)
  organizationName?: number; // 机构名称
  vagueSelect?: string; //查询框|not_must|模糊匹配(用户姓名或手机号)
  nickName?: string; // 用户姓名|not_must|模糊匹配
  phone?: number; // 等于查询：手机号|not_must
  phoneLike?: number; // 模糊查询：手机号|not_must
  isAvailable?: boolean; //状态
  isReturnRole?: boolean; //是否返回角色|defaul:false
  accountTypeArr: string;
}

export interface IUsersReqs {
  userId: number;
  nickName: string;
  userName: string;
  sex: number;
  phone: string;
  organizationId: number;
  organizationName: string; //机构名称|string
  organizationType: number; //机构类型|int|1.平台;2.运营方;3.货权方;4.货主;5.承运商;6.供应商;7.客户
  isAvailable: boolean;
  createTime: string;
  updateTime: string;
  roleItems: IRoleItemsData[];
}

export interface IRoleItemsData {
  roleId: number;
  baseRoleId: number;
  roleCode: string;
  roleName: string;
  createTime: string;
  updateTime: string;
  createUserId: number;
  updateUserId: number;
  organizationType: number;
  organizationNameOrg: number; // 机构表机构名称
  remarks: string;
  isAvailable: boolean;
}

export interface IGoodsCategoriesParams {
  parentId?: number;
}

export interface IGoodsCategoriesReqs {
  categoryId: number; //类目id
  categoryName: string; //类目名称
  parentId: number; //上一级id
  remarks: string;
  is_effect: number;
  createUserId: number;
  updateUserId: number;
  createTime: string;
  updateTime: string;
}

export interface IOrganizationsParams extends IPaginationParams {
  selectType?: number; //查询类型|must|1.查询所有机构,2.管理机构页面模糊查询（有关系的机构），3.添加机构页面模糊查询
  vagueSelect?: string; //查询框|not_must|模糊匹配(机构名称)
  organizationType?: number; //查询的机构类型，仅支持认证中心的查询|must|模糊匹配|1.平台;2.运营方;3.货权方;4.货主;5.承运商;6.供应商;7.客户
  organizationTypeList?: string; //查询的机构类型，仅支持认证中心的查询|must|模糊匹配|1.平台;2.运营方;3.货权方;4.货主;5.承运商;6.供应商;7.客户
  auditStatus?: number; //审核状态(0.认证失败;1.已认证;2.待认证;)|not_must
  authenticationType?: number; //认证类型(0.公司认证;1.个人认证)|not_must
  isAvailable?: number; //是否启用(false.禁用;true.启用)|not_must
  notSelectOrganizationIdList?: string | undefined; //不查询的机构id集合
}

export interface IOrganizationsReqs {
  organizationId: number;
  organizationName: string;
  organizationAddress: string;
  contactName: string;
  contactPhone: string;
  consignmentRelationshipId: number; //托运方界面提供|托运方与其他机构关系id
  auditStatus: number; //审核状态|0.认证失败;1.已认证;2.待认证
  isAvailable: boolean; //是否启用|false.禁用;true.启用
  isUsed: boolean; //是否添加|false.未添加  true.已添加
}

export interface IConsignmentRelationshipsParams {
  relationshipOrgType: number; //其他机构类型|int|must|3.货权方;;5.承运商
  relationshipOrgId: number; //其他机构id|long|must|
}

export enum TENDER_EVENT_RESPS {
  Create = 1,
  OpenTender,
  Drawback,
  View,
  setResult,
  TenderFeeIncome,
  OpenTwo,
  Confirm,
  OpenResult
}

// 事件类别(1.创建招标单 2.发布招标单 3.撤回招标单 4.查看投标信息 5.录入评标结果 6.标书费收入 7.发起二次报价 8.要求价格确认 9.发布评标结果)

export const TENDER_EVENT_DICT: IDictionary = {
  [TENDER_EVENT_RESPS.Create]: "创建了招标信息",
  [TENDER_EVENT_RESPS.OpenTender]: "发布了招标信息",
  [TENDER_EVENT_RESPS.Drawback]: "撤回了招标信息",
  [TENDER_EVENT_RESPS.View]: "查看了招标信息",
  [TENDER_EVENT_RESPS.setResult]: "录入了招标信息",
  [TENDER_EVENT_RESPS.TenderFeeIncome]: "标书费收入",
  [TENDER_EVENT_RESPS.OpenTwo]: "发起了二次报价",
  [TENDER_EVENT_RESPS.Confirm]: "要求价格确认",
  [TENDER_EVENT_RESPS.OpenResult]: "发布了评标结果"
};
