import { ORGANIZATION_TEXT } from '@/constants/user';
import { isEmpty } from 'lodash';

export interface UserInfo {
  accessToken: string;
  organizationType: number;
  organizationId: number;
}

let userInfo: UserInfo;

export const getUserInfo = (): UserInfo => {
  if (!isEmpty(userInfo)) return userInfo;
  const infoStr = localStorage.getItem('token_storage');
  userInfo = JSON.parse(infoStr) || {};
  return userInfo;
};

export const getRole = () => {
  const userInfo = getUserInfo();
  return userInfo.organizationType;
};

export const getRoleText = () => {
  const roleType = getRole();

  return ORGANIZATION_TEXT[roleType];
};

export const setUserInfo = (info: UserInfo) => {
  const newInfo = info || ({} as UserInfo);
  userInfo = newInfo;
  localStorage.setItem('token_storage', JSON.stringify(userInfo));
};

export const clearUserInfo = () => (userInfo = {} as UserInfo);
