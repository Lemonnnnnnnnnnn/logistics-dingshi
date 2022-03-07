import {
  IPaginationResponse,
  ITenderBidderItem,
  IPatchTenderBidder,
  IPriceConfirmParams,
  ITenderBidderParams,
  IPatchTenderBidderParams,
  IPatchTenderBidderTwoParams,
  ITenderBidderDetail,
  IUserParams,
  IPayTenderBidderParams,
  IRefundInfoRes
} from "../declares";
import { authAxios } from "../utils/axios";

// 承运投标管理列表
export const getTenderBidder = (params: ITenderBidderParams) =>
  authAxios.get<IPaginationResponse<ITenderBidderItem>>("/v1/tenderBidder", {
    params
  });

// 投标详情
export const getTenderBidderDetail = (tenderId: number) =>
  authAxios.get<ITenderBidderDetail, ITenderBidderDetail>(
    `/v1/tenderBidder/${tenderId}`
  );

// 获取业务联系人
export const getUser = (params: IUserParams) =>
  authAxios.get("/v1/users", { params });

// 立即投标/修改投标
export const patchTenderBidder = (params: IPatchTenderBidderParams) =>
  authAxios.patch<IPatchTenderBidder>(
    `/v1/tenderBidder/${params.tenderId}`,
    params
  );

export const payTenderBidder = (params: IPayTenderBidderParams) =>
  authAxios.post(`/v1/tenderBidder/${params.tenderId}/payTenderBidder`, params);

// 二次报价
export const patchTenderBidderTwo = (
  tenderId: number,
  params: IPatchTenderBidderTwoParams
) => authAxios.patch(`/v1/tenderBidder/${tenderId}/two`, params);

//退保申请
export const patchApplyEarnestMoneyRefund = (
  tenderId: number,
  remarks: string
) =>
  authAxios.patch(`v1/tenderBidder/${tenderId}/applyEarnestMoneyRefund`, {
    remarks
  });

// 价格确认
export const patchPriceConfirm = (
  tenderId: number,
  params: IPriceConfirmParams
) => authAxios.patch(`v1/tenderBidder/${tenderId}/confirm`, params);

// 获取退保申请时相关信息
export const getRefundInfo = (tenderId: number) =>
  authAxios.get<IRefundInfoRes, IRefundInfoRes>(
    `v1/tenderBidder/${tenderId}/refundInfo`
  );
