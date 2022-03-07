import { isEmpty } from "lodash";
import {
  IOSSTokenResponse,
  IUserInfo,
  IUserInfoResponse,
  IAuthorizationPhoneRes,
  OrganizationType
} from "../declares";
import { authAxios, basicAxios } from "@/utils/axios";

let userInfo: IUserInfo;

// 从浏览器缓存获取用户信息
export const getUserInfo = (tokenStr: string): IUserInfo => {
  if (!isEmpty(userInfo)) {
    return userInfo;
  }
  // token_storage 承运、平台
  // token 托运
  const infoStr = localStorage.getItem(tokenStr);
  // return infoStr;
  userInfo = infoStr
    ? JSON.parse(infoStr)
    : {
        accessToken: "", // 开发时token复制过来, 部署测试或者正式就删除
        organizationType: 0, // 当前登录角色
        organizationName: "",
        nickName: "",
        organizationId: 0
      };

  localStorage.setItem("tender_token", userInfo.accessToken);
  localStorage.setItem("tender_token_str", tokenStr);
  return userInfo;
};

// 获取上传文件token
export const getOSSToken = () =>
  authAxios.get<IOSSTokenResponse>("v1/securitytokenoss");

// 获取当前用户信息
export const getCurrentUserInfo = () =>
  authAxios.get<IUserInfoResponse, IUserInfoResponse>("v1/users/now");

export const putSendSms = (phone: string, template: string) =>
  authAxios.post("/authnotcode", { phone, template });

export const getAuthorizationPhone = () =>
  authAxios.get<IAuthorizationPhoneRes, IAuthorizationPhoneRes>(
    "/v1/paymentAuthorizationPhone"
  );
export const getBanner = () => basicAxios.get(`/authJumpUrl?key=tender`);
// export const getSmscode = (params: IAuthsendsms) =>
//   authAxios.post(`/authnotcode`, {
//     // code: params.code,
//     phone: params.phone,
//     template: SMSCODE_TYPE[params.type]
//   });
