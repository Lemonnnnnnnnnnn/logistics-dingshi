import moment from 'moment';
import {
  getTrajectories,
  getTrackRecordDetail
} from '@/services/trackRecordSheet';

export default {
  namespace: 'trackRecordSheetStore',
  state: {
    trackRecordList: { items: [], count: 1 },
    trackRecordDetail: {},
  },

  effects: {
    // 轨迹记录单列表
    *getTrackRecordList ({ payload }, { call, put }) {
      try {
        const { items = [], count = 0 } = yield call(getTrajectories, payload);
        yield put({
          type: 'saveTrackRecordList',
          payload: { items, count },
        });
      } catch (error) {
        return error;
      }
    },
    // 轨迹记录单详情
    *getTrackRecordDetail ({ payload }, { call, put }) {
      try {
        const { ...other } = yield call(getTrackRecordDetail, payload.trajectoryId);
        yield put({
          type: 'saveTrackRecordDetail',
          payload: { ...other },
        });
      } catch (error) {
        return error;
      }
    },
  },
  reducers: {
    saveTrackRecordList (state, { payload }) {
      return {
        ...state,
        trackRecordList: payload,
      };
    },
    saveTrackRecordDetail (state, { payload }) {
      return {
        ...state,
        trackRecordDetail: payload,
      };
    },
  },
};
