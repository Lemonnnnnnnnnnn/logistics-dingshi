import { message, notification } from "antd";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
// import { addRequest, removeRequest } from "@/utils/cancelToken";
import { getBaseUrl, getLoginUrl } from "./utils";

const baseURL =
  window.env.apiURL.prod.indexOf("#") !== -1
    ? `${window.env.apiURL.dev}`
    : `${window.env.apiURL.prod}`;
const authRequestInterceptor = async (config: AxiosRequestConfig) => {
  // removeRequest(config); // 在请求开始前，对之前的请求做检查取消操作
  // addRequest(config); // 将当前请求添加到 pending 中
  // 开发的时候打开
  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${localStorage.getItem("tender_token")}`
  };
  return config;
};

const basicRequestInterceptor = async (config: AxiosRequestConfig) => {
  return config;
};

// 响应成功
const axiosResponseSuccessInterceptors = (response: AxiosResponse) => {
  // removeRequest(response); // 在请求结束后，移除本次请求
  return response.data;
};

// 响应报错
const authResponseErrorInterceptors = (axiosError: AxiosError) => {
  if (axiosError) {
    if (axiosError.response) {
      message.error(axiosError.response.data.message);
      let url = getLoginUrl();
      const str = localStorage.getItem("tender_token_str") || "";
      if (str === "token") {
        url = `${getBaseUrl()}oms/user/login?redirect=/tender/home`;
      } else if (str === "token_storage") {
        url = `${getBaseUrl()}user/login?redirect=/tender/home`;
      }
      switch (axiosError.response.status) {
        case 401:
          message.destroy();
          notification.destroy();
          notification.error({
            message: `失败`,
            description: "登录失效"
          });
          localStorage.removeItem("tender_token_str");
          localStorage.removeItem(str);
          localStorage.removeItem("tender_token");
          setTimeout(() => {
            window.location.replace(url);
          }, 1500);
          break;
        case 403:
          if (axiosError.response.data.code === "LOGISTICS/TOKEN_LOGIN_ERROR") {
            message.destroy();
            notification.destroy();
            notification.error({
              message: `失败`,
              description: "该用户已在其它终端登入"
            });
            // token_storage 承运、平台
            // token 托运
            localStorage.removeItem("tender_token_str");
            localStorage.removeItem(str);
            localStorage.removeItem("tender_token");
            setTimeout(() => {
              window.location.replace(url);
            }, 1500);
          }
          break;
        default:
      }
    }
    if (axios.isCancel(axiosError)) {
      console.log("request cancel ", JSON.stringify(axiosError));
      return new Promise(() => {});
    }
  } else {
    message.error("network_error");
  }
  return Promise.reject(axiosError);
};

export const basicAxios = axios.create({
  // 处理需要不需要登录调用的接口逻辑
  baseURL
  // timeout: 20000
});

basicAxios.interceptors.request.use(
  basicRequestInterceptor,
  (error: AxiosError) => Promise.reject(error)
);

basicAxios.interceptors.response.use(
  axiosResponseSuccessInterceptors,
  error => {
    return Promise.reject(error);
  }
);

export const authAxios = axios.create({ baseURL });

authAxios.interceptors.request.use(
  authRequestInterceptor,
  (error: AxiosError) => Promise.reject(error)
);

authAxios.interceptors.response.use(
  axiosResponseSuccessInterceptors,
  authResponseErrorInterceptors
);
