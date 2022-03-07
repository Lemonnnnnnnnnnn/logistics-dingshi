import { Rule } from "antd/lib/form";
import {
  ITenderManageStoreProps,
  ITenderBidderManageStoreProps,
  IOrganizationsReqs,
  IHomeStoreProps
} from ".";

//分页
export interface IPaginationParams {
  limit: number;
  offset?: number;
  isCount?: boolean; //是否返回总数|not_must|defaul:true
  isOrderByTime?: boolean; //是否根据创建时间排序|not_must|defaul:true
}

export interface IPageParams {
  limit: number;
  offset?: number;
}

//列表返回
export interface IPaginationResponse<T> {
  items: T[];
  count: number;
}

export interface ITableListObjProps<T> {
  count: number;
  items: T[];
}

// 搜索项
export interface ISearchListProps {
  label: string;
  key: string;
  type: string;
  value?: any;
  required?: boolean;
  allowClear?: boolean; // 是否要清除按钮
  showSearch?: boolean; // 针对select是否搜索
  placeholder?: string;
  rules?: Rule[];
  mode?: string;
  options?: ISelectOptionProps[];
}

// select Option
export interface ISelectOptionProps {
  label: string;
  key: number | string;
  value: number | string;
}

export interface IOptionItem {
  age: string;
  max: string;
  price: string;
  remarks: string;
  check: boolean;
}

// 按钮
export interface IButtonListProps {
  label: string;
  btnType?: string;
  type?: string;
  key: any;
  onClick: (val: any) => void;
}

// 按钮
export interface ISearchOptions {
  label: string;
  options: any;
  key: number | string;
}

//commonStore
export interface ICommonStoreProps {
  currentMenuKey: string;
  userInfo: IUserInfo;
  fuzzySearchStr: string; // 搜索的文案
  currentUserInfo: IUserInfoResponse | null;
  supplierList: ITableListObjProps<IOrganizationsReqs>;
  addShipmentList: ITableListObjProps<IOrganizationsReqs>;
  shipmentList: ITableListObjProps<IOrganizationsReqs>;
}

export interface ILoading {
  effects: {
    [key: string]: boolean;
  };
}

export interface IDictionary {
  [key: string]: any;
}

//store的类型
export interface IStoreProps {
  commonStore: ICommonStoreProps;
  tenderManageStore: ITenderManageStoreProps;
  biddingManageStore: ITenderBidderManageStoreProps;
  homeStore: IHomeStoreProps;
  loading: ILoading;
}

export enum TenderStatus {
  Daft = 1, // 草稿
  Prediction = 2, // 预报
  InBidding = 3, // 投标中
  InBidEvaluation = 4, // 待开标-评标
  twoPrice = 5, // 待开标-二次报价
  PriceSure = 6, // 待开标-价格确认
  NotPublicized = 7, // 待开标-未公示
  BidOpened = 8, // 已开标
  Withdrawn = 9 // 已撤回
}

export enum BidderStatus {
  Pending = 1, // 1邀标待投
  ToPaid = 2, // 待支付
  Tendered = 3, // 已投标
  ToTwoPrice = 4, // 待二次报价
  TwoPrice = 5, // 二次报价
  PriceSure = 6, // 价格确认
  PriceSured = 7, // 已价格确认
  WonTheBid = 8, // 已中标
  NoTheBid = 9, // 未中标
  Withdrawn = 10 // 招标已撤回
}

export enum GoodsUnits {
  Ton = 0,
  Car = 8,
  // Kilogram,
  Meter = 2,
  // Kilometer,
  Square = 1,
  Block = 6,
  Zhang = 5,
  Bag = 4,
  Root = 3
}

export const GOODS_UNITS_DICT: IDictionary = {
  [GoodsUnits.Ton]: "吨",
  [GoodsUnits.Car]: "车",
  [GoodsUnits.Meter]: "米",
  // [GoodsUnits.Kilometer]: "千米",
  [GoodsUnits.Square]: "方",
  [GoodsUnits.Block]: "块",
  [GoodsUnits.Zhang]: "张",
  [GoodsUnits.Bag]: "袋",
  [GoodsUnits.Root]: "根"
};

// 获取上传图片key响应参数 getOSSToken
export interface IOSSTokenResponse {
  requestId: string;
  credentials: ICredentialsData;
  assumedRoleUser: {
    arn: string;
    assumedRoleId: string;
  };
}

export interface IUserInfoResponse {
  userId: number;
  nickName: string;
  userName: string;
  sex: number;
  phone: string;
  accountType: number; //账号类型(1.主账号，2.司机账号，3.机构下普通账户)
  organizationName: string; //机构名称|string
  isAvailable: true;
  idcardNo: string;
  licenseType: number;
  licenseDentryid: string;
  qualificationCertificateDentryid: string;
  idcardFrontDentryid: string;
  idcardBackDentryid: string;
  organizationId: number; //所属机构id
  auditStatus: number; //审核状态|0.认证失败;1.已认证;2.待认证
  perfectStatus: number; //完善状态 0.完善认证失败,1.完善认证成功,2.未填写3.已填写
  createTime: string;
  updateTime: string;
  createUserId: number;
  updateUserId: number;
  remarks: string; //备注
  licenseNo: string; //驾驶证号|司机创建
  qualificationUnit: string; //从业资格证发证单位|司机创建
  qualificationValidityDate: string; //从业资格证有效期|司机创建
  licenseValidityDate: string; //驾驶证有效期|司机创建
  licenseFrontDentryid: string; //驾驶证正面(头像面)|司机创建
  licenseViceDentryid: string; //驾驶证副页(记录面)|司机创建
  qualificationFrontDentryid: string; //从业资格证正面(头像面)|司机创建
  qualificationBackDentryid: string; //从业资格证反面(国徽面)|司机创建
  driverFrontDentryid: string; //司机正面照|司机创建
  driverIdcardDentryid: string; //手持身份证照|司机创建
  roleItems: IRoleItemsData[];
  bankAccountItems: ICredentialsData[];
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
  remarks: string;
  isAvailable: true;
}

export interface IBankAccountItemsData {
  accessKeyId: string;
  accessKeySecret: string;
  expiration: string;
  securityToken: string;
}

export interface ICredentialsData {
  bankAccountId: number; //账户id
  bankAccount: "3322620720008737452"; //银行卡号
  userId: number;
  bankName: "交通银行";
  bankCode: null;
  createTime: string;
  createUserId: number;
  updateTime: string;
  updateUserId: number; //禁用启用
  isAvailable: boolean;
  isEffect: number;
}

//上传类型
export enum UpdateType {
  Img = "img", // 图片
  Btn = "btn" // 图片
}

export interface IUserInfo {
  accessToken: string; // token
  organizationType: number; // 登录的账号类型
  organizationName: string; // 登录账号所属机构名称
  nickName: string; // 昵称
  organizationId: number; // 登录账号ID
}

export interface IUserParams {
  accountType: number;
  offset: number;
  limit: number;
  organizationId: number;
}

export interface IUserItem {
  userId: number;
  nickName: string;
  userName: string;
  sex: number;
  phone: string;
  organizationId: number;
  /** 机构名称|string */
  organizationName: string;
  /** 机构类型|int|1.平台;2.运营方;3.货权方;4.货主;5.承运商;6.供应商;7.客户 */
  organizationType: number;
  isAvailable: boolean;
  createTime: string;
  updateTime: string;
  roleItems: IRoleItems[];
}

export interface IRoleItems {
  roleId: number;
  baseRoleId: number;
  roleCode: string;
  roleName: string;
  createTime: string;
  updateTime: string;
  createUserId: number;
  updateUserId: number;
  organizationType: number;
  /** 机构表机构名称 */
  organizationNameOrg: number;
  remarks: string;
  isAvailable: boolean;
}

// 登录账号类型
export enum OrganizationType {
  PLATFORM = 1, // 平台方
  CONSIGNMENT = 4, // 托运方
  SHIPMENT = 5 // 承运方
}

// 获取授权收手机号
export interface IAuthorizationPhoneRes {
  /** 授权支付人手机号 */
  paymentAuthorizationPhone: string;
  /** 授权支付人姓名 */
  paymentAuthorizationName: string;
}

export const INVOICE_REQUIREMENT_DICT: IDictionary = {
  1: "增值税专票",
  2: "增值税普通发票"
};

export const SETTLEMENT_TYPE_DICT: IDictionary = {
  1: "月",
  2: "签收后",
  3: "其它"
};

export const PAYMENT_TYPE_DICT: IDictionary = {
  1: "银行转账",
  2: "银行承兑",
  3: "其它"
};

export enum SUPPLIER_SCOPE_ENUM {
  Public = 1,
  Appoint
}
