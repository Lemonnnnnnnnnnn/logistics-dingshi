import {
  getRefundInfo,
  getTenderBidder,
  getTenderBidderDetail,
  getUser
} from "@/services/bidding-manage-server";
import {
  ITenderBidderParams,
  ITenderBidderManageStoreProps,
  IPaginationResponse,
  ITenderBidderItem,
  ITenderBidderDetail,
  IUserParams,
  IRefundInfoRes
} from "../declares";

const defaultState: ITenderBidderManageStoreProps = {
  tenderBidderList: {
    count: 0,
    items: []
  },
  contactIdItems: {
    count: 0,
    items: []
  },
  tenderBidderDetail: null,
  refundInfo: null
};

export default {
  namespace: "biddingManageStore",
  state: defaultState,
  effects: {
    *getTenderBidderList(
      { params }: { params: ITenderBidderParams },
      { put, call }: any
    ) {
      const { items, count } = yield call(getTenderBidder, params);
      yield put({
        type: "setTenderBidderList",
        payload: { items, count }
      });
    },
    *getTenderBidderDetail(
      { payload: { tenderId } }: { payload: { tenderId: number } },
      { put, call }: any
    ) {
      const { ...other } = yield call(getTenderBidderDetail, tenderId);
      yield put({
        type: "setTenderBidderDetail",
        payload: { ...other }
      });
    },
    *getContactIdItems(
      { payload: { params } }: { payload: { params: IUserParams } },
      { put, call }: any
    ) {
      const { ...other } = yield call(getUser, params);

      yield put({
        type: "setContactIdItems",
        payload: { ...other }
      });
    },
    *getRefundInfo(
      { payload: { tenderId } }: { payload: { tenderId: number } },
      { put, call }: any
    ) {
      const { ...other } = yield call(getRefundInfo, tenderId);
      yield put({
        type: "setRefundInfo",
        payload: other
      });
    }
  },
  reducers: {
    setTenderBidderList(
      state: ITenderBidderManageStoreProps,
      { payload }: { payload: IPaginationResponse<ITenderBidderItem> }
    ) {
      return {
        ...state,
        tenderBidderList: payload
      };
    },
    setTenderBidderDetail(
      state: ITenderBidderManageStoreProps,
      { payload }: { payload: ITenderBidderDetail }
    ) {
      return {
        ...state,
        tenderBidderDetail: payload
      };
    },
    setContactIdItems(
      state: ITenderBidderManageStoreProps,
      { payload }: { payload: IUserParams }
    ) {
      return {
        ...state,
        contactIdItems: payload
      };
    },
    setRefundInfo(
      state: ITenderBidderManageStoreProps,
      { payload }: { payload: IRefundInfoRes }
    ) {
      return {
        ...state,
        refundInfo: payload
      };
    }
  }
};
