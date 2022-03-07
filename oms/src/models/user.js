import router from 'umi/router';
import { query as queryUsers, queryAuthorizations, login, authdelete } from '@/services/apiService';
import { reloadAuthorized } from '@/utils/Authorized';
import { getOssImg, saveUserInfoToLocalStorage, savePermissionsToLocalStorage } from '@/utils/utils';
import { clearUserInfo, setUserInfo, getUserInfo } from '@/services/user';
import role from '@/constants/user/role';


function savaAuthority (authority) {
  localStorage.setItem('antd-pro-authority', JSON.stringify(authority.map(item => item.permissionCode)));
  localStorage.setItem('authority', JSON.stringify(authority));
  window.g_app._store.dispatch({ type: 'auth/saveAuth', payload: authority });
}

function clearInfoFromStorage () {
  const accessToken = JSON.parse(localStorage.getItem('token'))?.accessToken;
  authdelete({ accessToken });
  localStorage.removeItem('token');
  localStorage.removeItem('antd-pro-authority');
  localStorage.removeItem('authority');
}

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
    permissions: []
  },

  effects: {
    *logout (_, { put }) {
      yield put({ type: 'clearUser' });
      clearUserInfo();
      clearInfoFromStorage();
      router.replace('/user/login');
    },
    *login ({ payload }, { call, put }) {
      const { mobileToken, ...params } = payload;
      const loginMethod = mobileToken
        ? () => Promise.resolve(params)
        : login;

      try {
        const response = yield call(loginMethod, params);

        setUserInfo(response);
        yield put({ type: 'saveCurrentUser', payload: response });
        saveUserInfoToLocalStorage(response);
        // .log('after saveUserInfoToLocalStorage')
        // yield put({ type: 'fetchAuthorizations' })
        // console.log('after fetchAuthorizations')
        return response;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchCurrent (_, { put }) {
      const userStr = localStorage.getItem('token');
      let userInfo;

      if (!userStr) return null;

      yield put({ type: 'auth/saveAuth', payload: JSON.parse(localStorage.getItem('authority')) });
      try {
        userInfo = JSON.parse(userStr);
        userInfo.unreadCount = 0;
        userInfo.avatar = getOssImg(userInfo.portraitDentryid, { width: 40 });
        yield put({ type: 'saveCurrentUser', payload: userInfo });
        return userInfo;
      } catch (error) {
        return null;
      }
    },
    *fetchAuthorizations (_, { call, put }) {
      let { items = [] } = yield call(queryAuthorizations);
      items === null && (items = []);
      yield put({ type: 'saveAuth', payload: items });
      savePermissionsToLocalStorage(items);
      reloadAuthorized();

      return items;
    }
  },

  reducers: {
    clearUser (state) {
      return { ...state, currentUser: [] };
    },
    save (state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser (state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    savaAuthority (state, { payload }) {
      return {
        ...state,
        permissions: payload
      };
    },
    changeNotifyCount (state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};
