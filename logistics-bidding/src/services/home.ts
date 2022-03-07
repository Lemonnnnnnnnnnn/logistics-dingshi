import { authAxios, basicAxios } from "@/utils/axios";
import {
  IAuthBidderInfo,
  IAuthLastWonTender,
  ICategory,
  IHomePageListParams,
  IHomePageListRes,
  IOrganizationInfo,
  IPageParams,
  IPaginationResponse,
  IPublicBidderDetailReqs
} from "@/declares";

//招标列表（未登录）
export const getAuthTenderList = (params: IHomePageListParams) =>
  basicAxios.get<
    IPaginationResponse<IHomePageListRes>,
    IPaginationResponse<IHomePageListRes>
  >("/authTenderList", { params });

//招标列表（已登录） - 中标结果 - 只看与我相关
export const getHomePageList = (params: IHomePageListParams) =>
  authAxios.get<
    IPaginationResponse<IHomePageListRes>,
    IPaginationResponse<IHomePageListRes>
  >("/v1/tenders/homePageList", { params });

export const getAllCategory = () =>
  authAxios.get<ICategory[], ICategory[]>("/authAllCategory");

// 项目招标未登录 部分数据
export const getNoticeDetail = (tenderId: number) =>
  basicAxios.get<IPublicBidderDetailReqs, IPublicBidderDetailReqs>(
    `/v1/tenders/${tenderId}/announcement`
  );

// 项目招标未登录 全部数据（分享链接进来的）
export const getNoticeDetailFull = (tenderId: number, sysCode: string) =>
  basicAxios.get<IPublicBidderDetailReqs, IPublicBidderDetailReqs>(
    `/v1/tenders/${tenderId}/announcementAll`,
    {
      params: { sysCode }
    }
  );

// 项目招标已登录
export const getNoticeDetailLogin = (tenderId: number) =>
  authAxios.get<IPublicBidderDetailReqs, IPublicBidderDetailReqs>(
    `/v1/tenders/${tenderId}/announcementLogin`
  );

// 首页最新中标信息
export const getAuthLastWonTender = (params: IPageParams) =>
  basicAxios.get<IAuthLastWonTender[], IAuthLastWonTender[]>(
    `/authLastWonTender`,
    {
      params
    }
  );

// 招标机构信息
export const getAuthOrganizationInfo = (
  params: IPageParams & { consignmentOrganizationId: number  , currentTenderId : number}
) =>
  basicAxios.get<IOrganizationInfo, IOrganizationInfo>(
    "/authOrganizationInfo",
    { params }
  );

// 中标详情信息
export const getAuthBidderInfo = (tenderId: number) =>
  basicAxios.get<IAuthBidderInfo, IAuthBidderInfo>("/authBidderInfo", {
    params: { tenderId }
  });
// 中标详情信息，更多数据
export const getAuthBidderInfoMore = (tenderId: number) =>
  basicAxios.get<IAuthBidderInfo, IAuthBidderInfo>("/authBidderInfoMore", {
    params: { tenderId }
  });

// 设置招标提醒
export const postTendersRemind = (tenderId: number) =>
  authAxios.post(`/v1/tenders/${tenderId}/remind`);

// 分享
export const getTenderShare = (tenderId: number) =>
  authAxios.get<number, number>(`/v1/tenders/${tenderId}/tenderShare`);
