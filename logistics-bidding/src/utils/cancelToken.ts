/**
 * axios取消重复接口请求封装
 */
import axios, { AxiosRequestConfig } from "axios";

const pending = new Map(); // 储存请求接口

// 添加请求
const addRequest = (config: AxiosRequestConfig) => {
  const key = [config.method, config.url, JSON.stringify(config.params)].join(
    "&"
  ); // 拼接map键

  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken(cancel => {
      if (!pending.has(key)) {
        pending.set(key, cancel);
      }
    });
};

// 移除请求
const removeRequest = (config: AxiosRequestConfig) => {
  const key = [config.method, config.url, JSON.stringify(config.params)].join(
    "&"
  ); // 拼接map键

  if (pending.has(key)) {
    // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
    const cancel = pending.get(key);
    cancel(key);
    pending.delete(key);
  }
};

export { addRequest, removeRequest };
