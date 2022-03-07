import { getServiceUsers, getServiceCars, getServiceLeases, getDictionarys, getOrganizations } from '@/services/deviceManageService';

export default {
  namespace: 'deviceManageStore',
  state: {
    serviceUsers: {},
    serviceCars: {},
    serviceLeases: {},
    dictionarys: [],
    organizations: [],
  },

  effects: {
    // GPS账号管理列表
    *getServiceUsers ({ payload }, { call, put }) {
      try {
        const { items = [], count = 0 } = yield call(getServiceUsers, { ...payload });
        yield put({
          type: 'saveServiceUsers',
          payload: { items, count },
        });
      } catch (error) {
        return error;
      }
    },

    // GPS设备管理列表
    *getServiceCars ({ payload }, { call, put }) {
      try {
        const { items = [], count = 0 } = yield call(getServiceCars, { ...payload });
        yield put({
          type: 'saveServiceCars',
          payload: { items, count },
        });
      } catch (error) {
        return error;
      }
    },

    // 设备租赁记录列表
    *getServiceLeases ({ payload }, { call, put }) {
      try {
        const { items = [], count = 0 } = yield call(getServiceLeases, { ...payload });
        yield put({
          type: 'saveServiceLeases',
          payload: { items, count },
        });
      } catch (error) {
        return error;
      }
    },

    // GPS应商选择列表
    *getDictionarys ({ payload }, { call, put }) {
      try {
        const res = yield call(getDictionarys, { ...payload });
        const data = res.map(item => ({ ...item, label: item.text, value: item.key }));
        yield put({
          type: 'saveDictionarys',
          payload: [{ label: '全部', value: null, key: null }, ...data ],
        });
      } catch (error) {
        return error;
      }
    },
    // 查询组织机构列表
    *getOrganizations ({ payload }, { call, put }) {
      try {
        const { items = [] } = yield call(getOrganizations, { ...payload });
        yield put({
          type: 'saveOrganizations',
          payload: items,
        });
      } catch (error) {
        return error;
      }
    },
  },
  reducers: {
    saveServiceUsers (state, { payload }) {
      return {
        ...state,
        serviceUsers: payload,
      };
    },
    saveServiceUser (state, { payload }) { // 查看密码
      const data = state.serviceUsers.items.map(item => {
        if (item.serviceUserId === payload.serviceUserId) {
          item.password = payload.password;
        }
        return item;
      });
      return {
        ...state,
        serviceUsers: { ...state.serviceUsers, items: data },
      };
    },
    saveServiceCars (state, { payload }) {
      return {
        ...state,
        serviceCars: payload,
      };
    },
    saveServiceLeases (state, { payload }) {
      return {
        ...state,
        serviceLeases: payload,
      };
    },
    saveDictionarys (state, { payload }) {
      return {
        ...state,
        dictionarys: payload,
      };
    },
    saveOrganizations (state, { payload }) {
      return {
        ...state,
        organizations: payload,
      };
    },
  },
};
