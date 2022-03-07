import { getFeedbackList } from '../services/feedbackService';
import { uniqueId } from '../utils/utils';

export default {
  namespace: 'feedbackStore',
  state: {
    feedback: {},
  },

  effects: {
    // 意见反馈列表
    *getFeedbackList ({ payload }, { call, put }) {
      try {
        const { items = [], count = 0 } = yield call(getFeedbackList, { ...payload });
        yield put({
          type: 'saveFeedbackList',
          payload: { items, count },
        });
      } catch (error) {
        return error;
      }
    },
  },
  reducers: {
    saveFeedbackList (state, { payload }) {
      return {
        ...state,
        feedback: payload,
      };
    },
  },
};
