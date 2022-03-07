import {
  IPaginationResponse,
  IGoodsParams,
  ITenderInvitedList,
  IPutBiddingParams,
  IInviteBidderParams,
  IBiddingParams,
  IBiddingItem,
  IApplyEarnestMoneyRefundParams,
  IReceivingReqs,
  IUsersParams,
  IUsersReqs,
  IReceivingParams,
  IDeliveriesParams,
  IDeliveriesReqs,
  IGoodsReqs,
  IAddGoodsParams,
  IGoodsCategoriesParams,
  IGoodsCategoriesReqs,
  IOrganizationsReqs,
  IOrganizationsParams,
  IAddReceivingParams,
  IAaddDeliveriesParams,
  IPublicBidderDetailReqs,
  IConsignmentRelationshipsParams,
  IEvaluationParams,
  IRefundEarnestMoneyReqs,
  IEvaluationReqs,
  IConfirmPriceParams,
  IBidderMainDetailReqs
} from "../declares";
import { basicAxios, authAxios } from "@/utils/axios";

export const getInvitedList = (tenderId: number) =>
  authAxios.get<ITenderInvitedList, ITenderInvitedList>(
    `/v1/tenders/${tenderId}/inviteList`
  );

// 邀标代投
export const inviteBidder = (params: IInviteBidderParams) =>
  authAxios.post(`/v1/tenders/${params.tenderId}/inviteBidder`, { ...params });

// 新增与其他机构关系 - 从平台库中添加承运商
export const postConsignmentRelationships = (
  params: IConsignmentRelationshipsParams
) => authAxios.post(`/v1/consignmentRelationships`, { ...params });

// 发布招标
export const putBidding = (params: IPutBiddingParams) =>
  authAxios.post("/v1/tenders", params);

// 修改招标
export const updateBidding = (tenderId: number, params: IPutBiddingParams) =>
  authAxios.patch(`/v1/tenders/${tenderId}`, params);

// 招标详情
export const getBiddingDetail = (tenderId: number) =>
  authAxios.get<IPutBiddingParams, IPutBiddingParams>(
    `/v1/tenders/${tenderId}`
  );

// 招标列表
export const getBiddingList = (params: IBiddingParams) =>
  authAxios.get<
    IPaginationResponse<IBiddingItem>,
    IPaginationResponse<IBiddingItem>
  >(`/v1/tenders`, { params });

// 修改招标
export const modifyBidding = (params: IBiddingParams) =>
  authAxios.get<IPaginationResponse<IBiddingItem>>(`/v1/tenders`, { params });

export const applyEarnestMoneyRefund = (
  params: IApplyEarnestMoneyRefundParams
) =>
  basicAxios.patch(
    `/v1/tenderBidder/${params.tenderId}/applyEarnestMoneyRefund`,
    { params }
  );

// 获取货品名称列表
export const getGoodsList = (params: IGoodsParams) =>
  authAxios.get<IPaginationResponse<IGoodsReqs>>(`v1/goods`, { params });

// 添加货品名称
export const postGoods = (params: IAddGoodsParams) =>
  authAxios.post(`v1/goods`, params);

// 获取提货点列表
export const getDeliveriesList = (params: IDeliveriesParams) =>
  authAxios.get<IPaginationResponse<IDeliveriesReqs>>(`v1/deliveries`, {
    params
  });
// 添加提货点
export const postDeliveries = (params: IAaddDeliveriesParams) =>
  authAxios.post(`v1/deliveries`, params);

//获取卸货点列表
export const getReceivingList = (params: IReceivingParams) =>
  authAxios.get<IPaginationResponse<IReceivingReqs>>(`v1/receivings`, {
    params
  });
// 添加卸货点
export const postReceivings = (params: IAddReceivingParams) =>
  authAxios.post(`v1/receivings`, params);

//获取人员列表
export const getUsersList = (params: IUsersParams) =>
  authAxios.get<IPaginationResponse<IUsersReqs>>(`v1/users`, {
    params
  });

//获取货品类目列表
export const getGoodsCategoriesList = (params: IGoodsCategoriesParams) =>
  authAxios.get<IPaginationResponse<IGoodsCategoriesReqs>>(
    `v1/goodsCategories`,
    {
      params
    }
  );

//获取机构列表
export const getOrganizationsList = (params: IOrganizationsParams) =>
  authAxios.get<IPaginationResponse<IOrganizationsReqs>>(`v1/organizations`, {
    params
  });

//撤标
export const putWithdraw = (tenderId: number, reason: string) =>
  authAxios.patch(`v1/tenders/${tenderId}/withdraw`, {
    reason
  });

//退保审核
export const putRefundEarnestMoney = (
  tenderId: number,
  items: Array<{
    reason: string;
    isConsentRefund: boolean;
    tenderBidderPackageId: number;
  }>
) => authAxios.patch(`v1/tenders/${tenderId}/refundEarnestMoney`, items);

//启动开标解锁，发送短信
export const putSendlockSms = (tenderId: number) =>
  authAxios.patch(`v1/tenders/${tenderId}/beginUnlock`);

//查看投标解锁
export const putUnlockSms = (tenderId: number, phone: string, code: string) =>
  authAxios.patch(`v1/tenders/${tenderId}/unlock`, {
    phone,
    code
  });

export const getPublicBidderDetail = (tenderId: number) =>
  authAxios.get<IPublicBidderDetailReqs, IPublicBidderDetailReqs>(
    `v1/tenders/${tenderId}/publicBidderDetail`
  );
// export const getPublicBidderDetail = (tenderId: number) =>
//   authAxios.get<IPublicBidderDetailReqs, IPublicBidderDetailReqs>(
//     `v1/tenders/656013798245888/publicBidderDetail`
//   );

//获取待退保审核列表
export const getRefundAuditList = (tenderId: number) =>
  authAxios.get<IRefundEarnestMoneyReqs[], IRefundEarnestMoneyReqs[]>(
    `v1/tenders/${tenderId}/refundAuditList`
  );

// 发起二次报价
export const putTwoPrice = (tenderId: number, priceTwoTime: string) =>
  authAxios.patch(`v1/tenders/${tenderId}/secondOffer`, { priceTwoTime });

// 输入评标结果
export const postEvaluation = (tenderId: number, params: IEvaluationParams) =>
  authAxios.patch(`v1/tenders/${tenderId}/evaluation`, params);

// 获取评标结果详情
export const getEvaluation = (tenderId: number) =>
  authAxios.get<IEvaluationReqs, IEvaluationReqs>(
    `v1/tenders/${tenderId}/getTenderShipList`
  );

// 价格确认
export const putConfirmPrice = (
  tenderId: number,
  params: IConfirmPriceParams
) => authAxios.patch(`v1/tenders/${tenderId}/confirmPrice`, params);

// 以投标者为主的投标详情
export const getBidderMainDetail = (tenderId: number) =>
  authAxios.get<IBidderMainDetailReqs, IBidderMainDetailReqs>(
    `v1/tenders/${tenderId}/bidderMainDetail`
  );
// 包件为主的投标详情
// export const getTenderMainDetail = (tenderId: number) =>
//   authAxios.get<IBidderMainDetailReqs, IBidderMainDetailReqs>(
//     `v1/tenders/656013798245888/tenderMainDetail`
//   );
export const getTenderMainDetail = (tenderId: number) =>
  authAxios.get<IBidderMainDetailReqs, IBidderMainDetailReqs>(
    `v1/tenders/${tenderId}/tenderMainDetail`
  );

export const getTenderCorrelationMainDetail = (tenderId: number) =>
  authAxios.get<IBidderMainDetailReqs, IBidderMainDetailReqs>(
    `/v1/tenders/${tenderId}/tenderCorrelationMainDetail`
  );

//公示
export const putPublic = (tenderId: number) =>
  authAxios.patch(`v1/tenders/${tenderId}/public`);

// 浏览招标信息事件
export const browserTenderDetail = (tenderId: number) =>
  authAxios.post(`/v1/tenderEvent/${tenderId}/browse`);
