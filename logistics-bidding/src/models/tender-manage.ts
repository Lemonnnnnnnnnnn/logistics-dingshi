import {
  getBiddingDetail,
  getBiddingList,
  getDeliveriesList,
  getGoodsCategoriesList,
  getGoodsList,
  getReceivingList,
  getUsersList,
  getInvitedList,
  getRefundAuditList,
  getEvaluation,
  getBidderMainDetail,
  getTenderMainDetail,
  getTenderCorrelationMainDetail
} from "../services/tender-manage-server";
import {
  ITenderManageStoreProps,
  IBiddingParams,
  IPaginationResponse,
  IGoodsParams,
  IBiddingItem,
  IGoodsReqs,
  IDeliveriesParams,
  IDeliveriesReqs,
  IReceivingParams,
  IReceivingReqs,
  IUsersReqs,
  IGoodsCategoriesParams,
  IGoodsCategoriesReqs,
  IPutBiddingParams,
  IContactConfirmEntitiesData,
  IPublicBidderDetailReqs,
  ITenderInvitedList,
  IRefundEarnestMoneyReqs
} from "../declares";
import { MapTreeData } from "../utils/utils";
import dayjs from "dayjs";
import { cloneDeep, omit, uniq } from "lodash";
import moment from "moment";
import { ConsoleSqlOutlined } from "@ant-design/icons";

const defaultState: ITenderManageStoreProps = {
  bidding: {
    count: 0,
    items: []
  },
  goodsList: [],
  deliveriesList: [],
  receivingList: [],
  usersList: [],
  goodsCategoriesList: [],
  biddingDetail: null,
  organizationsList: {
    count: 0,
    items: []
  }, // 供应商列表
  publicBidderDetail: null,
  inviteListDetailResps: [],
  refundEarnestMoneyList: [],
  evaluationInfo: null,
  priceSureList: [],
  bidderMainDetail: null,
  tenderMainDetail: null,
  bidEvaluationResults: null,
  tenderCorrelationMainDetail: null
};
export default {
  namespace: "tenderManageStore",
  state: defaultState,
  effects: {
    *getBiddingList(
      { payload }: { payload: IBiddingParams },
      { put, call }: any
    ) {
      const { items, count } = yield call(getBiddingList, payload);
      yield put({
        type: "setBiddingList",
        payload: { items, count }
      });
    },
    *getGoodsList({ payload }: { payload: IGoodsParams }, { put, call }: any) {
      const { items } = yield call(getGoodsList, payload);
      yield put({
        type: "setGoodsList",
        payload: items
      });
    },
    *getDeliveriesList(
      { payload }: { payload: IDeliveriesParams },
      { put, call }: any
    ) {
      const { items } = yield call(getDeliveriesList, payload);
      yield put({
        type: "setDeliveriesList",
        payload: items
      });
    },
    *getReceivingList(
      { payload }: { payload: IReceivingParams },
      { put, call }: any
    ) {
      const { items } = yield call(getReceivingList, payload);
      yield put({
        type: "setReceivingList",
        payload: items
      });
    },
    *getUsersList({ payload }: { payload: IUsersReqs }, { put, call }: any) {
      const { items } = yield call(getUsersList, payload);
      yield put({
        type: "setUsersList",
        payload: items
      });
    },
    *getGoodsCategoriesList(
      { payload }: { payload: IGoodsCategoriesParams },
      { put, call }: any
    ) {
      const { items } = yield call(getGoodsCategoriesList, payload);
      yield put({
        type: "setGoodsCategoriesList",
        payload: items
      });
    },
    *getBiddingDetail(
      { payload }: { payload: { tenderId: number } },
      { put, call }: any
    ) {
      const {
        isMultipleWinner,
        tenderType,
        tenderTitle,
        offerStartTime,
        offerEndTime,
        contactConfirmRespList,
        contactPurchaseRespList,
        tenderOpenTime,
        invoiceRequirements,
        settlementType,
        settlementTypeContent,
        supplierScope,
        performanceBond,
        paymentTypeContent,
        paymentType,
        seeTenderContent,
        seeIsConfirm,
        priceConfirmTime,
        tenderPackageEntities,
        remark,
        tenderDentryid,
        tenderStatus,
        priceTwoTime,
        unlockStartTime,
        tenderEventResps,
        bidderDetailEventResps,
        transactionEntities
      } = yield call(getBiddingDetail, payload.tenderId);
      const packageCreateReqs =
        tenderPackageEntities &&
        tenderPackageEntities.map((item: any): any => {
          item.packageCorrelationCreateReqs = cloneDeep(
            item.packageCorrelationResps
          );
          return { ...item };
        });
      const data = {
        tenderType,
        isMultipleWinner,
        tenderTitle,
        invoiceRequirements,
        settlementType,
        priceConfirmTime,
        tenderStatus,
        priceTwoTime,
        settlementTypeContent1:
          settlementType === 2 ? settlementTypeContent : undefined,
        settlementTypeContent:
          settlementType === 3 ? settlementTypeContent : undefined,
        offerTime:
          offerStartTime && offerEndTime
            ? [moment(offerStartTime), moment(offerEndTime)]
            : undefined, //antd 只能接受更改moment格式
        tenderOpenTime: tenderOpenTime ? moment(tenderOpenTime) : undefined,
        contactPurchaseList: contactPurchaseRespList?.map(
          (item: IContactConfirmEntitiesData) => item.contactId
        ),
        contactConfirmRespList,
        supplierScope,
        performanceBond,
        unlockStartTime,
        paymentType,
        paymentTypeContent: paymentType === 3 ? paymentTypeContent : undefined,
        seeTenderContent,
        contactConfirmList: contactConfirmRespList?.map(
          (item: IContactConfirmEntitiesData) => item.contactId
        ),
        seeIsConfirm,
        packageCreateReqs,
        remark,
        tenderDentryid: tenderDentryid ? tenderDentryid.split(",") : undefined,
        tenderEventResps,
        bidderDetailEventResps,
        transactionEntities
      };
      yield put({
        type: "setBiddingDetail",
        payload: data
      });
    },
    *getInvitedList(
      { payload }: { payload: { tenderId: number } },
      { put, call }: any
    ) {
      const { inviteListDetailResps } = yield call(
        getInvitedList,
        payload.tenderId
      );
      yield put({
        type: "setInvitedList",
        payload: inviteListDetailResps
      });
    },
    *getRefundAuditList(
      { payload }: { payload: { tenderId: number } },
      { put, call }: any
    ) {
      const [...rest] = yield call(getRefundAuditList, payload.tenderId);
      yield put({
        type: "setRefundEarnestMoneyList",
        payload: rest
      });
    },
    *getEvaluation(
      { payload }: { payload: { tenderId: number } },
      { put, call }: any
    ) {
      const { ...other } = yield call(getEvaluation, payload.tenderId);
      yield put({
        type: "setEvaluationInfo",
        payload: { ...other }
      });
    },
    *getBidderMainDetail(
      { payload }: { payload: { tenderId: number } },
      { put, call }: any
    ) {
      const { ...other } = yield call(getBidderMainDetail, payload.tenderId);
      yield put({
        type: "setBidderMainDetail",
        payload: { ...other }
      });
    },
    *getTenderMainDetail(
      { payload }: { payload: { tenderId: number } },
      { put, call }: any
    ) {
      try {
        const { tenderPackageEntities, ...other } = yield call(
          getTenderMainDetail,
          payload.tenderId
        );
        // console.log(tenderPackageEntities)
        tenderPackageEntities?.forEach((tenderPackage: any) => {
          //线路列表
          const allGoods: any[] = [];
          tenderPackage.bidderPackageDetailResps?.forEach(
            (bidderPackageDetail: any) => {
              //如果当前投标者中标
              if (bidderPackageDetail.tenderBidderPackageStatus) {
                // 查找当前包有投标者的所有线路
                bidderPackageDetail.packageCorrelationResps?.forEach(
                  (packageCorrelation: any) => {
                    // 如果线路列表没有这条线路就添加
                    if (
                      !allGoods.some(
                        item =>
                          item.packageCorrelationId ===
                          packageCorrelation.packageCorrelationId
                      )
                    ) {
                      allGoods.push({
                        ...packageCorrelation,
                        bidderPackageDetailResps: [],
                      });
                    }
                  }
                );
                // 通过线路列表去查询投标者是否投过这个线路
                allGoods
                  .map(item => item.goodsId)
                  ?.forEach((item, index) => {
                    // 查找当前包的投标者中是否有当前线路
                    const currentData = bidderPackageDetail.packageCorrelationResps.find(
                      (packageCorrelation: any) =>
                        packageCorrelation.goodsId === item
                    );
                    const bidderOfferItems = bidderPackageDetail.packageCorrelationResps.find(
                      _item => _item.goodsId === item
                    )?.bidderOfferItems;
                    bidderPackageDetail.bidderOfferItems = bidderOfferItems;
                    // 如果有当前线路就把当前投标者加入线路列表
                    if (currentData) {
                      allGoods[index].bidderPackageDetailResps.push(
                        omit(bidderPackageDetail, "packageCorrelationResps")
                      );
                      allGoods[index].bidderPackageDetailResps = allGoods[
                        index
                      ].bidderPackageDetailResps.sort(
                        (a, b) => a.bidderSequence - b.bidderSequence
                      );
                    }
                  });
              }
            }
          );
          tenderPackage.bidderPackageDetailResps = allGoods
            .sort((a, b) => a.bidderSequence - b.bidderSequence)
            .map(_item => omit(_item, "bidderOfferItems"));
        });

        yield put({
          type: "setTenderMainDetail",
          payload: {
            ...other,
            tenderPackageEntities: tenderPackageEntities.filter(
              item =>
                item.bidderPackageDetailResps.filter(
                  data => data.bidderPackageDetailResps.length > 1
                ).length > 0
            )
          }
        });
      } catch (err) {}
    },
    *getBidEvaluationResults(
      { payload }: { payload: { tenderId: number } },
      { put, call }: any
    ) {
      try {
        const { ...other } = yield call(getTenderMainDetail, payload.tenderId);

        yield put({
          type: "setBidEvaluationResults",
          payload: { ...other }
        });
      } catch (err) {}
    },
    *getTenderCorrelationMainDetail(
      { payload }: { payload: { tenderId: number } },
      { put, call }: any
    ) {
      const { ...other } = yield call(
        getTenderCorrelationMainDetail,
        payload.tenderId
      );

      yield put({
        type: "setTenderCorrelationMainDetail",
        payload: { ...other }
      });
    }
  },
  reducers: {
    setBiddingList(
      state: ITenderManageStoreProps,
      { payload }: { payload: IPaginationResponse<IBiddingItem> }
    ) {
      return {
        ...state,
        bidding: payload
      };
    },
    setGoodsList(
      state: ITenderManageStoreProps,
      { payload }: { payload: IGoodsReqs[] }
    ) {
      return {
        ...state,
        goodsList: payload
      };
    },
    setDeliveriesList(
      state: ITenderManageStoreProps,
      { payload }: { payload: IDeliveriesReqs[] }
    ) {
      return {
        ...state,
        deliveriesList: payload
      };
    },
    setReceivingList(
      state: ITenderManageStoreProps,
      { payload }: { payload: IReceivingReqs[] }
    ) {
      return {
        ...state,
        receivingList: payload
      };
    },
    setUsersList(
      state: ITenderManageStoreProps,
      { payload }: { payload: IUsersReqs[] }
    ) {
      return {
        ...state,
        usersList: payload
      };
    },
    setGoodsCategoriesList(
      state: ITenderManageStoreProps,
      { payload }: { payload: IGoodsCategoriesReqs[] }
    ) {
      return {
        ...state,
        goodsCategoriesList: new MapTreeData(payload, {
          privateKey: "categoryId",
          labelKey: "categoryName"
        }).getItemTree()
      };
    },
    setBiddingDetail(
      state: ITenderManageStoreProps,
      { payload }: { payload: IPutBiddingParams }
    ) {
      return {
        ...state,
        biddingDetail: payload
      };
    },
    setInvitedList(
      state: ITenderManageStoreProps,
      { payload }: { payload: ITenderInvitedList }
    ) {
      return {
        ...state,
        inviteListDetailResps: payload
      };
    },
    setPublicBidderDetail(
      state: ITenderManageStoreProps,
      { payload }: { payload: IPublicBidderDetailReqs }
    ) {
      return {
        ...state,
        publicBidderDetail: payload
      };
    },
    setRefundEarnestMoneyList(
      state: ITenderManageStoreProps,
      { payload }: { payload: IRefundEarnestMoneyReqs }
    ) {
      return {
        ...state,
        refundEarnestMoneyList: payload
      };
    },
    setEvaluationInfo(
      state: ITenderManageStoreProps,
      { payload }: { payload: IRefundEarnestMoneyReqs }
    ) {
      return {
        ...state,
        evaluationInfo: payload
      };
    },
    setBidderMainDetail(
      state: ITenderManageStoreProps,
      { payload }: { payload: any }
    ) {
      return {
        ...state,
        bidderMainDetail: payload
      };
    },
    setTenderMainDetail(
      state: ITenderManageStoreProps,
      { payload }: { payload: any }
    ) {
      return {
        ...state,
        tenderMainDetail: payload
      };
    },
    setBidEvaluationResults(
      state: ITenderManageStoreProps,
      { payload }: { payload: any }
    ) {
      return {
        ...state,
        bidEvaluationResults: payload
      };
    },
    setTenderCorrelationMainDetail(
      state: ITenderManageStoreProps,
      { payload }: { payload: any }
    ) {
      return {
        ...state,
        tenderCorrelationMainDetail: payload
      };
    }
  }
};
