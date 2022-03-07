import { saveRoleAuth, getAllAuth } from '@/services/apiService';

const defaultState = {
  auth: [],
  organizationAuth:[]
};

export default ({
  namespace: 'auth',
  state: defaultState,
  effects: {
    *saveRoleAuth ({ payload }, { call }) {
      const response = yield call(saveRoleAuth, payload);
    },
    *getAllAuth ({ payload }, { call, put }) {
      const response = yield call(getAllAuth, payload);

      yield put({ type: 'getAuth', payload: response });
    }
  },
  reducers: {
    saveAuth (state, { payload }) {
      return { ...state, auth: payload };
    },
    getAuth (state, { payload }) {
      return { ...state, organizationAuth: payload };
    }
  }
});
