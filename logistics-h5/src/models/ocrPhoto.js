import { useOcrGeneral } from '@/services/apiService'

const defaultState = {
  entity: {}
}

export default ({
  namespace: 'ocrImage',
  state: defaultState,
  effects: {
    *getOcrData ({ payload }, { call, put }) {
      const response = yield call(useOcrGeneral, payload)
      yield put({ type: 'saveOcrData', payload: response })
      return Promise.resolve(response)
    }
  },
  reducers: {
    saveOcrData (state, { payload }) {
      return { ...state, entity: payload }
    }
  }
})
