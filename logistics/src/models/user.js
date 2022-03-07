import router from 'umi/router';
import { query as queryUsers, queryAuthorizations, login, authdelete } from '@/services/apiService';
import { reloadAuthorized } from '@/utils/Authorized';
import { getOssImg, saveUserInfoToLocalStorage, savePermissionsToLocalStorage } from '@/utils/utils';
import { clearUserInfo, setUserInfo, getUserInfo } from '@/services/user';
import role from '@/constants/user/role';


function savaAuthority (authority) {
  localStorage.setItem('ejd_antd-pro-authority', JSON.stringify(authority.map(item => item.permissionCode)));
  localStorage.setItem('ejd_authority', JSON.stringify(authority));
  window.g_app._store.dispatch({ type: 'auth/saveAuth', payload: authority });
}

function clearInfoFromStorage () {
  const accessToken = JSON.parse(localStorage.getItem('token_storage'))?.accessToken;
  authdelete({ accessToken });
  localStorage.removeItem('token_storage');
  localStorage.removeItem('ejd_antd-pro-authority');
  localStorage.removeItem('ejd_authority');
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
      const { organizationType } = getUserInfo();
      yield put({ type: 'clearUser' });
      clearUserInfo();
      clearInfoFromStorage();
      if (organizationType === role.PLATFORM){
        router.replace('/user/platLogin');
      } else {
        router.replace('/user/login');
      }
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
        return response;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    *fetchCurrent (_, { put }) {
      const userStr = localStorage.getItem('token_storage');
      let userInfo;

      if (!userStr) return null;

      yield put({ type: 'auth/saveAuth', payload: JSON.parse(localStorage.getItem('ejd_authority')) });
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
