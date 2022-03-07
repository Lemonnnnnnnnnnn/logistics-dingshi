export default {
  namespace: 'commonStore',
  state: {
    tabs:  localStorage.getItem('local_commonStore_tabs') ? JSON.parse(localStorage.getItem('local_commonStore_tabs')).tabs : [{ itemPath: '/index', name: '首页', id: '1' }],
    activeKey: localStorage.getItem('local_commonStore_tabs') ? JSON.parse(localStorage.getItem('local_commonStore_tabs')).activeKey : '1',
    dele: false,
  },
  reducers: {
    clearSetTabs (state) {
      localStorage.setItem('local_commonStore_tabs', JSON.stringify({ tabs: [{ itemPath: '/index', name: '首页', id: '1' }], activeKey: '1' }));
      state.tabs.forEach(item => {
        if (item.id) {
          localStorage.removeItem(item.id);
        }
      });
      return {
        ...state,
        tabs: [{ itemPath: '/index', name: '首页',  id: '1' }],
        activeKey: '1',
      };
    },
    deleteTab (state, { payload }) {
      localStorage.setItem('local_commonStore_tabs', JSON.stringify({ tabs: state.tabs.filter(item => item.id !== payload.id), activeKey: state.activeKey }));
      localStorage.removeItem(payload.id);
      return {
        ...state,
        tabs: state.tabs.filter(item => item.id !== payload.id),
      };
    },
    setTabs (state, { payload }) {
      localStorage.setItem('local_commonStore_tabs', JSON.stringify({ tabs: payload.items, activeKey: payload.activeKey || '1' }));
      return {
        ...state,
        tabs: payload.items,
        activeKey: payload.activeKey || '1',
      };
    },
  },
};
