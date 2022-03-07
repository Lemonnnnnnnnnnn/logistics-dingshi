export default {
  namespace: 'common',
  state: {
    wxSdk: undefined
  },
  effects: {},
  reducers: {
    setWXSdk (state, { payload }) {
      return {
        ...state,
        wxSdk: payload
      }
    }
  },
};
