/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { message, notification } from 'antd';
import { getUserInfo } from '@/service/user';
import moment from 'moment';
import { isArray, pick } from 'lodash';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  // 400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  // 401: '用户没有权限（令牌、用户名、密码错误）。',
  // 403: '用户得到授权，但是访问是被禁止的。',
  // 404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  // 406: '请求的格式不可得。',
  // 410: '请求的资源被永久删除，且不会再得到的。',
  // 422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const logout = (data) => {
  localStorage.removeItem('token_storage');
  if (data.code === 'LOGISTICS/TOKEN_LOGIN_ERROR') {
    notification.error({
      message: `失败`,
      description: '该用户已在其它终端登入',
    });
  }
  setTimeout(() => {
    window.location.replace(`${window.envConfig.sourceUrl}/user/login`);
  }, 1500);
};

/**
 * 异常处理程序
 */
const errorHandler = (error) => {
  endRequest();
  const { response, data } = error;
  if (!response) {
    return notification.error({
      message: `请求错误`,
      description: '请求接口超时，请与系统管理员联系',
    });
  }

  const { status } = response;
  const errortext = codeMessage[status] || data.message;

  notification.error({
    message: `失败`,
    description: errortext,
  });

  if (response.status === 403 || response.status === 401) {
    logout(data);
  }

  return Promise.reject(data);
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler, // 默认错误处理
  // prefix: window.envConfig.baseUrl,
  credentials: 'omit', // 默认请求是否带上cookie
});

const authorize = (url, options) => {
  if (options.noAuth) return false;

  const { accessToken } = getUserInfo();
  Object.assign(options.headers, {
    Authorization: `Bearer ${accessToken}`,
  });
  return true;
};

let requestNumber = 0;
let messageHandle;

function startRequest() {
  requestNumber++;
  if (!(requestNumber <= 0) && !messageHandle) {
    messageHandle = message.loading('正在执行中...', 0);
  }
}

function endRequest() {
  requestNumber--;
  if (requestNumber <= 0 && messageHandle) {
    setTimeout(() => {
      messageHandle && messageHandle();
      messageHandle = null;
    }, 100);
  }
}

request.interceptors.request.use((url, options) => {
  startRequest();
  const pattern = /^https?:\/\//;
  if (!pattern.test(url)) {
    url = `${window.envConfig.baseUrl}${url}`;
  }
  authorize(url, options);
  let _params;
  if (options.method === 'get') {
    const { params } = options;
    const usefulKey = Object.keys(params).filter((key) => {
      const value = params[key];
      if (isArray(value) && value[0] instanceof moment) {
        return false;
      }
      if (value instanceof moment) {
        return false;
      }
      return true;
    });
    _params = pick(params, usefulKey);
  }

  return {
    url,
    options: { ...options, params: options.params },
  };
});

request.interceptors.response.use((response, options) => {
  endRequest();
  return response;
});

export const requestNotHandleError = extend({
  prefix: window.envConfig.baseUrl,
  credentials: 'omit', // 默认请求是否带上cookie
});

export default request;
