import request from '@/tools/request';

export const login = (userInfo) =>
  request.post('/authcreate?', { data: userInfo, noAuth: true });

export const getPrebookList = (params) =>
  request.get(`/v1/prebookings`, { params });

export const findBigScreenCarList = (params?: object) =>
  request.get(`/v1/findBigScreenCarList`, { params });

export const getProject = (params) => request.get(`/v1/projects`, { params });

export const detailProject = (params) =>
  request.get(`/v1/projects/${params.projectId}`, { params });

export const findAllDeAndRe = (params) =>
  request.get('/v1/findAllDeAndRe', { params });

export const getMessage = (params) => request.get('/v1/message', { params });

export const getDictionaries = (params) =>
  request.get(`/v1/dictionaries`, { params });

export const getShipmentCars = (params) =>
  request.get(`/v1/shiment/cars`, { params });

export const getPlatformAllCars = (params) =>
  getShipmentCars({ ...params, isAll: true });

export const getShipmentDrivers = (params) =>
  request.get(`/v1/shiment/drivers`, { params });

export const getPlatformAllDrivers = (params) =>
  getShipmentDrivers({ ...params, isAll: true });

export const readMessage = (params) =>
  request.patch(`/v1/message/${params.messageId}`, { data: params });

export const postTransport = (params) =>
  request.post('/v1/transports', { data: params });

export const getLocation = (params) =>
  request.get('/v1/changeLocationAddress', { params });

export const carRecentDriver = (params) =>
  request.get('/v1/shipment/carRecentDriver', { params });
