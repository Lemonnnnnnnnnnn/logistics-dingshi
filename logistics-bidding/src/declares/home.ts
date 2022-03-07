import {
  IDictionary,
  IPaginationResponse,
  TenderStatus
} from "@/declares/common";
import {
  IPackageCorrelationItem,
  IPublicBidderDetailReqs
} from "@/declares/tender-manage";

export interface IProjectItem {
  title: string;
  time: number;
  address: string;
  company: string;
  status: number;
  id: number;
  goodsItems: IGoodsItems[];
}

export interface IGoodsItems {
  goodsName: string;
  id: number;
  weight: number;
  unit: string;
}

// 首页dva store
export interface IHomeStoreProps {
  categoryList: ICategory[];
  homePageListBidding: IPaginationResponse<IHomePageListRes>;
  homePageListInquiry: IPaginationResponse<IHomePageListRes>;
  tenderNotice: IPaginationResponse<IHomePageListRes>;
  biddingResult: IPaginationResponse<IHomePageListRes>;
  noticeDetail: IPublicBidderDetailReqs | {};
  authBidderInfo: IAuthBidderInfo | {};
  noticeTitle: string;
}

export interface IHomePageListFilter {
  /** 招标类型：【1】招标 【2】询价 */
  tenderType?: number;
  /** 一级类目id */
  firstCategoryId?: number;
  /** 一级类目名称 */
  firstCategoryName?: string;
  /** 招标状态：【1】草稿；【2】预报；【3】投标中；【4】待开标-评标；【5】待开标-二次报价；【6】待开标-价格确认；【7】待开标-未公示；【8】已开标；【9】已撤回； */
  tenderStatus?: number;
  tenderStatusArray?: string;
  /** 卸货点的省份 */
  receivingProvince?: string;
  /** 是否依照【信息发布时间】排序 */
  orderByTenderPublicTime?: boolean;
  /** 是否依照【信息截止时间】排序 */
  orderByOfferEndTime?: boolean;
  /** 是否降序排列 */
  isDescendingOrder?: boolean;
  // 模糊搜索：托运名称/货品名称/项目名称
  fuzzySearchStr?: string;
}

export interface IHomePageListParams extends IHomePageListFilter {
  /** 从第offset条数据开始取 */
  offset: number;
  /** 取limit条数据 */
  limit: number;
}

export interface IHomePageListRes {
  /** 招标id */
  tenderId: number;
  /** 招标类型：【1】招标 【2】询价 */
  tenderType: number;
  /** 项目标题 */
  tenderTitle: string;
  /** 招标状态：【1】草稿；【2】预报；【3】投标中；【4】待开标-评标；【5】待开标-二次报价；【6】待开标-价格确认；【7】待开标-未公示；【8】已开标；【9】已撤回； */
  tenderStatus: number;
  /** 报价开始日期 */
  offerStartTime: string;
  /** 报价结束日期 */
  offerEndTime: string;
  /** 中标是否可为多个投标单位(0.不是,1.是) */
  isMultipleWinner: number;
  /** 招标公司名称 */
  tenderOrganizationName: string;
  receivingAddress: string;
  isShowPrice: number; // 是否展示价格：【0】不展示；【1】展示；
  tenderNotLoginGoodsResps: ITenderNotLoginGoodsItem[];
  receivingAddressResolution : string[];
}

/** 货品信息 */
export interface ITenderNotLoginGoodsItem {
  /** 类目名称 */
  categoryName: string;
  firstCategoryName:string;
  /** 货品名称 */
  goodsName: string;
  /** 材质 */
  materialQuality: string;
  /** 规格型号 */
  specificationType: string;
  /** 货物重量单位 1:吨 2:斤 3:克 4:千克 5:米 6:千米 */
  goodsUnit: number;
  /** 预计运输量 */
  estimateTransportVolume: number;
}

export interface ICategory {
  categoryId: number;
  categoryName: string;
  parentId: number;
  remarks: null;
  isEffect: number;
  createTime: string;
  updateTime: string;
  createUserId: number;
  updateUserId: number;
}

export interface INoticeDetailParams {
  tenderId: number;
  login?: boolean;
  sysCode?: string;
}

export interface IAuthLastWonTender {
  /** 招标id */
  tenderId: number;
  /** 中标公司名称 */
  wonTenderOrganizationName: string;
}

export const INIT_TENDER_STATUS = `${TenderStatus.Prediction},${TenderStatus.InBidding},${TenderStatus.InBidEvaluation},${TenderStatus.twoPrice},${TenderStatus.PriceSure},${TenderStatus.NotPublicized},${TenderStatus.BidOpened},${TenderStatus.Withdrawn}`;

export const TENDER_STATUS_OPTIONS = [
  { label: "即将开始", key: 1, value: "2" },
  { label: "投标中", key: 2, value: "3" },
  { label: "待开标", key: 3, value: "4,5,6,7" },
  { label: "已开标", key: 4, value: "8" },
  { label: "已撤回", key: 5, value: "9" }
];

export const PROVINCE_OPTIONS = [
  { label: "四川", key: 1, value: "四川" },
  { label: "吉林", key: 2, value: "吉林" },
  { label: "黑龙江", key: 3, value: "黑龙江" },
  { label: "辽宁", key: 4, value: "辽宁" },
  { label: "北京", key: 5, value: "北京" },
  { label: "天津", key: 6, value: "天津" },
  { label: "河北", key: 7, value: "河北" },
  { label: "山西", key: 8, value: "山西" },
  { label: "内蒙古", key: 9, value: "内蒙古" },
  { label: "上海", key: 10, value: "上海" },
  { label: "江苏", key: 11, value: "江苏" },
  { label: "浙江", key: 12, value: "浙江" },
  { label: "山东", key: 13, value: "山东" },
  { label: "安徽", key: 14, value: "安徽" },
  { label: "江西", key: 15, value: "江西" },
  { label: "福建", key: 16, value: "福建" },
  { label: "重庆", key: 17, value: "重庆" },
  { label: "云南", key: 18, value: "云南" },
  { label: "贵州", key: 19, value: "贵州" },
  { label: "西藏", key: 20, value: "西藏" },
  { label: "广东", key: 21, value: "广东" },
  { label: "广西", key: 22, value: "广西" },
  { label: "湖南", key: 23, value: "湖南" },
  { label: "湖北", key: 24, value: "湖北" },
  { label: "河南", key: 25, value: "河南" },
  { label: "陕西", key: 26, value: "陕西" },
  { label: "甘肃", key: 27, value: "甘肃" },
  { label: "新疆", key: 28, value: "新疆" },
  { label: "宁夏", key: 29, value: "宁夏" },
  { label: "青海", key: 30, value: "青海" },
  { label: "海南", key: 31, value: "海南" }
];

export const HOME_CHINESE_DICT: IDictionary = {
  firstCategoryId: "货品类目",
  receivingProvince: "地区",
  tenderStatusArray: "招标状态",
  tenderType: "类型"
};

export interface IOrganizationInfo {
  /** 机构名称 */
  organizationName: string;
  /** 机构图标 */
  organizationIconDentryid: string;
  /** 招投标数量 */
  tenderNumber: number;
  /** 询价数量 */
  enquiryNumber: number;
  tenderNotLoginListResp: ITenderNotLoginListResp;
}

export interface ITenderNotLoginListResp {
  /**
   * 其他采购信息
   * 招标id
   */
  tenderId: number;
  /** 招标类型(1.招标 2.询价) */
  tenderType: number;
  /** 项目标题 */
  tenderTitle: string;
  /** 招标状态:1.草稿 2.预报 3.投标中 4.待开标-评标 5.待开标-二次报价 6.待开标-价格确认 7.待开标-未公示 8.已开标 9.已撤回 */
  tenderStatus: number;
  /** 报价开始日期 */
  offerStartTime: string;
  /** 报价结束日期 */
  offerEndTime: string;
  /** 中标是否可为多个投标单位(0.不是,1.是) */
  isMultipleWinner: number;
  /** 招标公司名称 */
  tenderOrganizationName: string;
  /** 卸货点的省市（若有多个卸货点，则取第一个） */
  receivingAddress: string;
  tenderNotLoginGoodsResps: ITenderNotLoginGoodsResps[];
  receivingAddressResolution : string[];
}

/** 货品信息 */
export interface ITenderNotLoginGoodsResps {
  /** 类目名称 */
  categoryName: string;
  firstCategoryName : string;
  /** 货品名称 */
  goodsName: string;
  /** 材质 */
  materialQuality: string;
  /** 规格型号 */
  specificationType: string;
  /** 货物重量单位 1:吨 2:斤 3:克 4:千克 5:米 6:千米 */
  goodsUnit: number;
  /** 预计运输量 */
  estimateTransportVolume: number;
}

export interface IAuthBidderInfo {
  tenderId: number;
  tenderType: number;
  tenderTitle: string;
  tenderNo: string;
  updateTime: string;
  tenderEvaluationResult: string;
  organizationId: number;
  bidderPackageItems: IBidderPackageItems[];
}

export interface IBidderPackageItems {
  tenderPackageId: number;
  tenderPackageTitle: string;
  packageSequence: number;
  bidderOrgItems: IBidderOrgItems[];
}

export interface IBidderOrgItems {
  tenderBidderId: number;
  tenderBidderPackageId: number;
  tenderPackageId: number;
  organizationId: number;
  organizationName: string;
  packageCorrelationItems: IPackageCorrelationResultItem[];
}

export interface IPackageCorrelationResultItem {
  tenderBidderPackageId: number;
  packageCorrelationId: number;
  tenderPackageId: number;
  taxContain: number;
  taxNotContain: number;
  goodsId: number;
  goodsName: string;
  categoryName: string;
  materialQuality: number;
  specificationType: number;
  goodsUnit: number;
  firstCategoryId: number;
  firstCategoryName: string;
  deliveryId: number;
  deliveryName: string;
  deliveryAddress: string;
  receivingId: number;
  receivingName: string;
  receivingAddress: string;
}
