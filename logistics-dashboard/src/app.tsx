import { getUserInfo } from '@/service/user';
import { history } from 'umi';
import { message } from 'antd';
import './envConfig';

export const dva = {
  config: {
    onError(e: Error) {
      message.error(e.message, 3);
    },
  },
};

export function render(oldRender: Function) {
  const { accessToken } = getUserInfo();
  if (accessToken) {
    history.replace('/');
    oldRender();
  } else {
    // TODO 登录状态校验
    // window.location.href = 'www.51ejd.cn';
    message.error('登录信息已过期');
    oldRender();
  }
}

export function onRouteChange({ matchedRoutes }) {
  if (matchedRoutes.length) {
    document.title = matchedRoutes[matchedRoutes.length - 1].route.title || '';
  }
}
