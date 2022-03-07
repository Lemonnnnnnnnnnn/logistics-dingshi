import { getCurrentUserInfo, getUserInfo } from "@/services/common";
import {
  ICommonStoreProps,
  IOrganizationsParams,
  IOrganizationsReqs,
  ITenderManageStoreProps,
  IUserInfoResponse
} from "../declares";
import { getOrganizationsList } from "@/services/tender-manage-server";

const defaultState: ICommonStoreProps = {
  currentMenuKey: "home",
  userInfo: {
    accessToken: "",
    organizationType: 0,
    organizationName: "",
    nickName: ""
  },
  currentUserInfo: null,
  shipmentList: {
    count: 0,
    items: []
  },
  supplierList: {
    count: 0,
    items: []
  },
  addShipmentList: {
    count: 0,
    items: []
  },
  fuzzySearchStr: ""
};
export default {
  namespace: "commonStore",
  state: defaultState,
  effects: {
    *getUserInfo(
      { payload }: { payload: { tokenStr: string } },
      { put, call }: any
    ) {
      const { ...other } = yield call(getUserInfo, payload.tokenStr);
      yield put({
        type: "setUserInfo",
        payload: other
      });
    },
    *getCurrentUserInfo(_: any = {}, { put, call }: any) {
      const { phone, userId, nickName, organizationName } = yield call(
        getCurrentUserInfo
      );
      yield put({
        type: "setCurrentUserInfo",
        payload: { phone, userId, nickName, organizationName }
      });
    },
    *getShipmentList(
      { payload }: { payload: IOrganizationsParams },
      { put, call }: any
    ) {
      const { items, count } = yield call(getOrganizationsList, payload);
      yield put({
        type: "setShipmentList",
        payload: { items, count }
      });
    },
    *getSupplierList(
      { payload }: { payload: IOrganizationsParams },
      { put, call }: any
    ) {
      const { items, count } = yield call(getOrganizationsList, payload);
      yield put({
        type: "setSupplierList",
        payload: { items, count }
      });
    },
    *getAddShipmentList(
      { payload }: { payload: IOrganizationsParams },
      { put, call }: any
    ) {
      const { items, count } = yield call(getOrganizationsList, payload);
      yield put({
        type: "setAddShipmentList",
        payload: { items, count }
      });
    }
  },
  reducers: {
    setCurrentMenu(state: ICommonStoreProps, { payload }: { payload: string }) {
      return {
        ...state,
        currentMenuKey: payload
      };
    },
    setUserInfo(state: ICommonStoreProps, { payload }: { payload: any }) {
      return {
        ...state,
        userInfo: payload
      };
    },
    setCurrentUserInfo(
      state: ICommonStoreProps,
      { payload }: { payload: IUserInfoResponse }
    ) {
      return {
        ...state,
        currentUserInfo: payload
      };
    },
    setShipmentList(
      state: ITenderManageStoreProps,
      { payload }: { payload: IOrganizationsReqs[] }
    ) {
      return {
        ...state,
        shipmentList: payload
      };
    },

    setSupplierList(
      state: ITenderManageStoreProps,
      { payload }: { payload: IOrganizationsReqs[] }
    ) {
      return {
        ...state,
        supplierList: payload
      };
    },

    setAddShipmentList(
      state: ITenderManageStoreProps,
      { payload }: { payload: IOrganizationsReqs[] }
    ) {
      return {
        ...state,
        addShipmentList: payload
      };
    },

    setFuzzySearchStr(
      state: ITenderManageStoreProps,
      { payload }: { payload: string }
    ) {
      return {
        ...state,
        fuzzySearchStr: payload
      };
    }
  }
};
