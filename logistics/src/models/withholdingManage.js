import { getRemitUsersList, getRemitMonthsList, getRemitDetailsList, getUserAddList } from '@/services/withholdingManage';
import { uniqueId } from '../utils/utils';

export default {
  namespace: 'withholdingManageStore',
  state: {
    remitDrivers: {},
    remitMonths: {},
    remitDetails: {},
    usersAdd: {},
  },

  effects: {
    // 代缴人员管理列表
    *getRemitUsersList ({ payload }, { call, put }) {
      try {
        const { items = [], count = 0 } = yield call(getRemitUsersList, { ...payload });
        yield put({
          type: 'saveRemitDriversList',
          payload: { items, count },
        });
      } catch (error) {
        return error;
      }
    },
    // 代扣代缴月度管理列表
    *getRemitMonthsList ({ payload }, { call, put }) {
      try {
        const { items = [], count = 0 } = yield call(getRemitMonthsList, { ...payload });
        const data = items.map(item => ({ ...item, id: uniqueId() }));
        yield put({
          type: 'saveRemitMonthsList',
          payload: { items: data, count },
        });
      } catch (error) {
        return error;
      }
    },
    // 代扣代缴明细列表
    *getRemitDetailsList ({ payload }, { call, put }) {
      try {
        const { items = [], count = 0 } = yield call(getRemitDetailsList, { ...payload });
        yield put({
          type: 'saveRemitDetailsList',
          payload: { items, count },
        });
      } catch (error) {
        return error;
      }
    },
    // 添加代扣人员列表
    *getUserAddList ({ payload }, { call, put }) {
      try {
        const { items = [], count = 0 } = yield call(getUserAddList, { ...payload });
        yield put({
          type: 'saveUserAddList',
          payload: { items, count },
        });
      } catch (error) {
        return error;
      }
    },
  },
  reducers: {
    saveRemitDriversList (state, { payload }) {
      return {
        ...state,
        remitDrivers: payload,
      };
    },
    saveRemitMonthsList (state, { payload }) {
      return {
        ...state,
        remitMonths: payload,
      };
    },
    saveRemitDetailsList (state, { payload }) {
      return {
        ...state,
        remitDetails: payload,
      };
    },
    saveUserAddList (state, { payload }) {
      return {
        ...state,
        usersAdd: payload,
      };
    },
  },
};
