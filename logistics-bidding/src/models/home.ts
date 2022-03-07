import {
  getAllCategory,
  getAuthBidderInfo,
  getAuthBidderInfoMore,
  getAuthTenderList,
  getHomePageList,
  getNoticeDetail,
  getNoticeDetailLogin,
  getNoticeDetailFull
} from "@/services/home";
import {
  IHomeStoreProps,
  ICategory,
  IUserParams,
  IHomePageListParams,
  IPaginationResponse,
  IHomePageListRes,
  IPublicBidderDetailReqs,
  INoticeDetailParams,
  IAuthBidderInfo
} from "../declares";
import { getUser } from "@/services/bidding-manage-server";

const defaultState: IHomeStoreProps = {
  categoryList: [],
  homePageListBidding: {
    count: 0,
    items: []
  },
  homePageListInquiry: {
    count: 0,
    items: []
  },
  tenderNotice: {
    count: 0,
    items: []
  },
  biddingResult: {
    count: 0,
    items: []
  },
  noticeDetail: {},
  authBidderInfo: {},
  noticeTitle: ""
};

export default {
  namespace: "homeStore",
  state: defaultState,
  effects: {
    *getAllCategory(_: any, { put, call }: any) {
      const [...other] = yield call(getAllCategory);
      yield put({
        type: "setAllCategory",
        payload: other
      });
    },
    *getHomePageListBidding(
      { payload }: { payload: IHomePageListParams },
      { put, call }: any
    ) {
      const { count, items } = yield call(getAuthTenderList, payload);

      yield put({
        type: "setHomePageListBidding",
        payload: { count, items }
      });
    },
    *getHomePageListInquiry(
      { payload }: { payload: IHomePageListParams },
      { put, call }: any
    ) {
      const { count, items } = yield call(getAuthTenderList, payload);

      yield put({
        type: "setHomePageListInquiry",
        payload: { count, items }
      });
    },
    *getTenderNotice(
      { payload }: { payload: IHomePageListParams },
      { put, call }: any
    ) {
      const { count, items } = yield call(getAuthTenderList, payload);

      yield put({
        type: "setTenderNotice",
        payload: { count, items }
      });
    },
    *getBiddingResult(
      { payload }: { payload: IHomePageListParams & { viewMyself: boolean } },
      { put, call }: any
    ) {
      const { viewMyself, ...params } = payload;
      const req = viewMyself ? getHomePageList : getAuthTenderList;
      const { ...other } = yield call(req, params);

      yield put({
        type: "setBiddingResult",
        payload: other
      });
    },
    *getNoticeDetail(
      { payload }: { payload: INoticeDetailParams & { resolve?: any } },
      { put, call }: any
    ) {
      const { tenderId, login, sysCode } = payload;

      let data;
      if (sysCode) {
        data = yield call(getNoticeDetailFull, tenderId, sysCode);
      } else {
        if (login) {
          data = yield call(getNoticeDetailLogin, tenderId);
        } else {
          data = yield call(getNoticeDetail, tenderId);
        }
      }

      if (typeof payload.resolve === "function") {
        payload.resolve(data);
      }

      yield put({
        type: "setNoticeDetail",
        payload: data
      });
      yield put({
        type: "setNoticeTitle",
        payload: data.tenderTitle
      });
    },
    *getAuthBidderInfo(
      {
        payload
      }: { payload: { tenderId: number; isShowPrice: number; resolve?: any } },
      { put, call }: any
    ) {
      const { tenderId, isShowPrice } = payload;

      const req = isShowPrice ? getAuthBidderInfoMore : getAuthBidderInfo;
      const { ...other } = yield call(req, tenderId);
      if (typeof payload.resolve === "function") {
        payload.resolve(other);
      }

      yield put({
        type: "setAuthBidderInfo",
        payload: other
      });
      yield put({
        type: "setNoticeTitle",
        payload: other.tenderTitle
      });
    }
  },
  reducers: {
    setAllCategory(
      state: IHomeStoreProps,
      { payload }: { payload: ICategory[] }
    ) {
      return {
        ...state,
        categoryList: payload
      };
    },
    setHomePageListBidding(
      state: IHomeStoreProps,
      { payload }: { payload: IPaginationResponse<IHomePageListRes> }
    ) {
      return {
        ...state,
        homePageListBidding: payload
      };
    },
    setHomePageListInquiry(
      state: IHomeStoreProps,
      { payload }: { payload: IPaginationResponse<IHomePageListRes> }
    ) {
      return {
        ...state,
        homePageListInquiry: payload
      };
    },
    setTenderNotice(
      state: IHomeStoreProps,
      { payload }: { payload: IPaginationResponse<IHomePageListRes> }
    ) {
      return {
        ...state,
        tenderNotice: payload
      };
    },
    setBiddingResult(
      state: IHomeStoreProps,
      { payload }: { payload: IPaginationResponse<IHomePageListRes> }
    ) {
      return {
        ...state,
        biddingResult: payload
      };
    },
    setNoticeDetail(
      state: IHomeStoreProps,
      { payload }: { payload: IPublicBidderDetailReqs }
    ) {
      return {
        ...state,
        noticeDetail: payload
      };
    },
    setAuthBidderInfo(
      state: IHomeStoreProps,
      { payload }: { payload: IAuthBidderInfo }
    ) {
      return {
        ...state,
        authBidderInfo: payload
      };
    },
    setNoticeTitle(state: IHomeStoreProps, { payload }: { payload: string }) {
      return {
        ...state,
        noticeTitle: payload
      };
    }
  }
};
