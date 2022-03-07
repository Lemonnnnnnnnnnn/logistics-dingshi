import { getTaxRateList } from '@/services/basicSettingService';

export default {
  namespace: 'basicSettingStore',
  state: {
    taxRate: {},
  },

  effects: {
    // 税率配置列表
    *getTaxRateList ({ payload }, { call, put }) {
      try {
        const { items = [], count = 0 } = yield call(getTaxRateList, { ...payload });
        yield put({
          type: 'saveTaxRate',
          payload: { items, count },
        });
      } catch (error) {
        return error;
      }
    },
  },
  reducers: {
    saveTaxRate (state, { payload }) {
      return {
        ...state,
        taxRate: payload,
      };
    },
  },
};
