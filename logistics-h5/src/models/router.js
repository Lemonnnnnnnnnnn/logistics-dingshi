import { createAction } from 'redux-actions'

export default {
  namespace: 'router',
  state: {},
  actions: {
    addQuery: createAction(`router/addQuery`),
    delQuery: createAction(`router/delQuery`),
  },
  effects: {
    addQuery ({ payload }, { call, put }) {
      put({
        type: 'addQuery',
        payload
      })
      return payload
    },
    delQuery ({ payload }, { call, put }) {
      put({
        type: 'delQuery',
        payload
      })
      return payload
    },
  },
  reducers: {
    addQuery: (state, { payload }) => ({ ...state, ...payload }),
    delQuery: (state, { payload }) => {
      delete state[payload]
      return state
    },
  }
}