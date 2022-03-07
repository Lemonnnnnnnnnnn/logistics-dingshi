import {
  query as queryUsers,
  queryAuthorizations,
  login,
  getNowUser
} from '@/services/apiService';
// import router from 'umi/router'
import {
  reloadAuthorized
} from '@/utils/Authorized'
import {
  getOssImg,
  saveUserInfoToLocalStorage,
  savePermissionsToLocalStorage,
  isEmpty
} from '@/utils/utils'
import {
  clearUserInfo,
  setUserInfo
} from '@/services/user'
import nativeApi from '@/utils/nativeApi'

function clearInfoFromStorage () {
  localStorage.removeItem('token')
  localStorage.removeItem('antd-pro-authority')
  localStorage.removeItem('authority')
}

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
    permissions: []
  },

  effects: {
    * logout (_, {
      put
    }) {
      yield put({
        type: 'clearUser'
      })
      clearUserInfo()
      clearInfoFromStorage()
      nativeApi.onLoginOccupied()
    },
    * login ({
      payload
    }, {
      call,
      put
    }) {
      const { mobileToken, ...params } = payload
      const loginMethod = mobileToken ?
        () => Promise.resolve(params) :
        login

      try {
        const response = yield call(loginMethod, params)
        setUserInfo(response)
        yield put({
          type: 'saveCurrentUser',
          payload: response
        })
        saveUserInfoToLocalStorage(response)
        const hasToken = isEmpty(params)
        if (hasToken) return
        yield put({
          type: 'fetchAuthorizations'
        })
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    * fetch (_, {
      call,
      put
    }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    * fetchCurrent (_, {
      put
    }) {
      const userStr = localStorage.getItem('token')
      let userInfo

      if (!userStr) return null

      yield put({
        type: 'auth/saveAuth',
        payload: JSON.parse(localStorage.getItem('authority'))
      })
      try {
        userInfo = JSON.parse(userStr)
        userInfo.unreadCount = 0
        userInfo.avatar = getOssImg(userInfo.portraitDentryid, {
          width: 40
        })
        yield put({
          type: 'saveCurrentUser',
          payload: userInfo
        })
        return userInfo
      } catch (error) {
        return null
      }
    },
    * fetchAuthorizations (_, {
      call,
      put
    }) {
      let {
        items = []
      } = yield call(queryAuthorizations)
      items === null && (items = [])
      yield put({
        type: 'saveAuth',
        payload: items
      })
      savePermissionsToLocalStorage(items)
      reloadAuthorized()
      return items
    },
    * getNowUser (_, { call, put }) {
      const nowUser = yield call(getNowUser)
      yield put({
        type: 'nowUser',
        payload: nowUser
      })
      return nowUser
    }
    // * saveMac ({ payload }, { put }) {
    //   yield put({
    //     type: 'saveMac',
    //     payload
    //   })
    // }
  },

  reducers: {
    saveMac (state, { payload }) {
      return {
        ...state,
        __mac: payload
      }
    },
    clearUser (state) {
      return {
        ...state,
        currentUser: []
      }
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
    savaAuthority (state, {
      payload
    }) {
      return {
        ...state,
        permissions: payload
      }
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
    nowUser (state, { payload }) {
      return {
        ...state,
        nowUser: payload
      }
    }
  },
};
