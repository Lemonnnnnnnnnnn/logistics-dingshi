import {
  getOrganizationSupplier,
} from '@/services/apiService';

export default {
  namespace : 'supplierManageStore',
  state : {
    organizationSupplier : {}
  },
  effects : {
    *getOrganizationSupplier ({ payload }, { call, put }) {
      try {
        const { items = [], count = 0 } = yield call(getOrganizationSupplier, payload);
        yield put({
          type: 'saveOrganizationSupplier',
          payload: { items, count },
        });
      } catch (error) {
        return error;
      }
    },
  },
  reducers : {
    saveOrganizationSupplier(state, { payload }){
      return {
        ...state,
        organizationSupplier : payload
      };
    }
  }
};
