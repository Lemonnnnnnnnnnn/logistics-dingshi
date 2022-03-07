import moment from 'moment';
import {
  getProjectList,
  getTangibleBills,
  screenOutTransport,
  getByTransportNo,
} from '@/services/billDeliveryService';
import { getTransportList } from '@/services/apiService';
import { getLocal } from '@/utils/utils';

export default {
  namespace: 'billDeliveryStore',
  state: {
    projectList: [],
    tangibleBills: {},
    transportList: { items: [], count: 1 },
    transportItems: [],
    errorMsg: [],
    transports: {},
  },

  effects: {
    // 项目列表
    *getProjectList ({ payload }, { call, put }) {
      try {
        const res = yield call(getProjectList, { queryText: payload.queryText });
        const newList = res.map(item => ({ key: item.key, value: item.key, label: item.value }));
        yield put({
          type: 'saveProjectList',
          payload: [{ key: null, value: null, label: '全部' }, ...newList],
        });
      } catch (error) {
        return error;
      }
    },

    // 交票清单
    *getTangibleBills ({ payload }, { call, put }) {
      try {
        const { items = [], count = 0 } = yield call(getTangibleBills, payload);
        yield put({
          type: 'saveTangibleBills',
          payload: { items, count },
        });
      } catch (error) {
        return error;
      }
    },
    // 运单列表
    *getTransportList ({ payload }, { call, put }) {
      const { shortTime } = payload;
      delete payload.shortTime;
      try {
        const { items = [], count = 0 } = yield call(getTransportList, { ...payload });
        const data = items  ? items.map(item => {
          const { deliveryItems: list } = item;
          // 打印页面的时间只需要年月日
          if (shortTime) item.deliveryTime = list ? list.filter(i => i.processPointCreateTime).map(_item => moment(_item.processPointCreateTime).format("YYYY-MM-DD")).join(',') : '';
          else item.deliveryTime = list ? list.filter(i => i.processPointCreateTime).map(_item => moment(_item.processPointCreateTime).format("YYYY-MM-DD HH:mm:ss")).join(',') : '';
          item.deliveryNum = list ? list.map(_item=>_item.deliveryNum).join(',') : '';
          item.billNumber = list ? list.filter(i => i.billNumber).map(_item=>_item.billNumber).join(',') : '';
          item.weighNum = list ? list.map(_item=>_item.weighNum).join(',') : '';
          item.receivingNum = list ? list.map(_item=>_item.receivingNum).join(','): '';
          item.goodsUnit = list ? list.map(_item=>_item.goodsUnitCN).join(','): '';
          item.goodsName = list ? list.map(_item=>`${_item.categoryName}-${_item.goodsName}`).join(',') : '';
          item.carNo = item.plateNumber;
          item.deliveryDentryid = list ? list.filter(i => i.billDentryid).reduce((r, n) => r.concat(n.billDentryid.split(',')), []) : [];
          item.weighDentryid =  item.weighDentryid ? item.weighDentryid.split(',') : [];
          item.receivingDentryid = item.receivingDentryid ? item.receivingDentryid.split(',') : [];
          // item.deliveryTime = moment(item.deliveryTime).format("YYYY-MM-DD HH:mm:ss");
          return item;
        }) : [];

        yield put({
          type: 'saveTransportList',
          payload: { items: data, count },
        });
      } catch (error) {
        return error;
      }
    },
    // 创建列表
    *getByTransportNo ({ payload }, { call, put }) {
      try {
        const { transportItems = [], errorMsg = [] } = yield call(getByTransportNo, payload);
        const data = transportItems ? transportItems.map(item => {
          const { items: list } = item;
          item.deliveryTime = list ? list.map(i => moment(i.deliveryTime).format("YYYY-MM-DD HH:mm:ss")).join(', ') : '';
          item.receivingNum = list ? list.map(i => i.receivingNum).join(', ') : '';
          item.deliveryNum = list ?list.map(i => i.deliveryNum).join(', ') : '';
          item.weighNum = list ? list.map(i => i.weighNum || 0).join(', ') : '';
          item.billNumber = list ? list.filter(i => i.deliveryNo).map(k => k.deliveryNo).join(', ') : '';
          item.goodsName = list ? list.map(i => `${i.categoryName}-${i.goodsName}`).join(', ') : '';
          item.deliveryDentryid = item.deliveryDentryid ? item.deliveryDentryid.split(',') : [];
          item.weighDentryid = item.weighDentryid ? item.weighDentryid.split(',') : [];
          item.receivingDentryid = item.receivingDentryid ? item.receivingDentryid.split(',') : [];
          return item;
        }) : [];
        yield put({
          type: 'saveByTransportNo',
          payload: { items: data, errorMsg },
        });
      } catch (error) {
        return error;
      }
    },

    // 详情添加筛选
    *getDetailByTransportNo ({ payload }, { _, put }) {
      try {
        const data = payload.items ? payload.items.map(item => {
          const { items: list } = item;
          item.deliveryTime = list ? list.map(i => moment(i.deliveryTime).format("YYYY-MM-DD HH:mm:ss")).join(', ') : '';
          item.receivingNum = list ? list.map(i => i.receivingNum).join(', ') : '';
          item.deliveryNum = list ?list.map(i => i.deliveryNum).join(', ') : '';
          item.weighNum = list ? list.map(i => i.weighNum || 0).join(', ') : '';
          item.billNumber = list ? list.filter(i => i.deliveryNo).map(k => k.deliveryNo).join(', ') : '';
          item.goodsName = list ? list.map(i => `${i.categoryName}-${i.goodsName}`).join(', ') : '';
          item.deliveryDentryid = item.deliveryDentryid ? item.deliveryDentryid.split(',') : [];
          item.weighDentryid = item.weighDentryid ? item.weighDentryid.split(',') : [];
          item.receivingDentryid = item.receivingDentryid ? item.receivingDentryid.split(',') : [];
          return item;
        }) : [];
        yield put({
          type: 'saveTransportList',
          payload: { items: data, type: 1  },
        });
      } catch (error) {
        return error;
      }
    },

    // 筛选框里面的列表
    *screenOutTransport ({ payload }, { call, put }) {
      try {
        const { items = [], count = 0 } = yield call(screenOutTransport, payload);
        const data = items ? items.map(item => {
          item.goodsName = item.items ? item.items.map(i => `${i.categoryName}-${i.goodsName}`).join(', ') : '';
          item.receivingNum = item.items ? item.items.map(i => i.receivingNum).join(', ') : '';
          item.weighNum = item.items ? item.items.map(i => i.weighNum || 0).join(', ') : '';
          item.deliveryNum = item.items ? item.items.map(i => i.deliveryNum).join(', ') : '';
          item.billNumber = item.items ? item.items.map(i => i.billNumber).join(', ') : '';
          return item;
        }) : [];
        yield put({
          type: 'saveScreenOutTransport',
          payload: { items: data, count },
        });
      } catch (error) {
        return error;
      }
    },
  },
  reducers: {
    saveProjectList (state, { payload }) {
      return {
        ...state,
        projectList: payload,
      };
    },
    saveTangibleBills (state, { payload }) {
      return {
        ...state,
        tangibleBills: payload,
      };
    },
    saveTransportList (state, { payload }) {
      const oldList = getLocal('local_transportList') || null;

      switch (payload.type) {
        case 1:  // 添加、清除更新
          localStorage.setItem('local_transportList', JSON.stringify(payload.items.concat(oldList)));
          return {
            ...state,
            transportList: {
              ...state.transportList,
              items: payload.items.concat(state.transportList.items),
              count:  payload.items.concat(state.transportList.items).length || state.transportList.count,
              errorMsg: payload.errorMsg
            },
          };
        case 2: // 删除更新
          try {
            const oldList = localStorage.getItem('local_transportList') ? JSON.parse(localStorage.getItem('local_transportList')) : null;
            localStorage.setItem('local_transportList', JSON.stringify(oldList.filter(item => item.transportNo !== payload.deleObj.transportNo)));
            return {
              ...state,
              transportList: {
                ...state.transportList,
                items: state.transportList.items.filter(item => item.transportNo !== payload.deleObj.transportNo),
                count: payload.count || state.transportList.count,
                deles: state.transportList.deles ?
                  state.transportList.deles.concat(payload.deleObj.transportId || []) :
                  [payload.deleObj.transportId],
              },
            };
          } catch (error) {
            console.log('json出错了');
            return;
          }
        case 3: // 添加、清除更新
          return {
            ...state,
            transportList: {
              items: payload.items,
              count: payload.count,
              errorMsg: payload.errorMsg ? payload.errorMsg : state.transportList.errorMsg,
            },
          };
        case 4: // 修改更新
          localStorage.setItem('local_transportList', JSON.stringify(payload.items));
          return {
            ...state,
            transportList: {
              ...state.transportList,
              items: payload.items,
            },
          };
        default:
          localStorage.setItem('local_transportList', JSON.stringify(payload.items));
          return {
            ...state,
            transportList: { ...state.transportList, items: payload.items, count: payload.count },
          };
      }
    },
    saveByTransportNo (state, { payload }) {
      return {
        ...state,
        transportItems: !payload.clear ? state.transportItems.concat(payload.items || []) : payload.items,
        errorMsg: payload.errorMsg
      };
    },
    saveScreenOutTransport (state, { payload }) {
      return {
        ...state,
        transports: payload,
      };
    },
  },
};
