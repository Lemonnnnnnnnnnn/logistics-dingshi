import request from '@/utils/request';

// GPS账号管理列表
export const getServiceUsers = (params) => request.get(`/v1/serviceUser`, { params });

// 获取GPS账号详情
export const getServiceUserDetail = (serviceUserId) => request.get(`/v1/serviceUser/${serviceUserId}`);

// 创建gps提供商账号
export const postServiceUser = (params) => request.post(`/v1/serviceUser`, { data: params });

// 更新gps提供商账号
export const putServiceUser = (serviceUserId, params) => request.patch(`/v1/serviceUser/${serviceUserId}`, { data: params });

// 获取可租赁设备
export const getServiceLeaseConfigureAll = (params) => request.get(`/v1/serviceLeaseConfigure/all`, { params });

// GPS设备管理列表
export const getServiceCars = (params) => request.get(`/v1/serviceCar`, { params });

// GPS设备管理详情
export const getServiceCarDetail = (serviceCarId) => request.get(`/v1/serviceCar/${serviceCarId}`);

// GPS设备管理Excel导出
export const getServiceCarExcel = (params) => request.get(`/v1/serviceCar/excel`, { params });

// GPS设备管理修改
export const putServiceCar = (serviceCarId, params) => request.patch(`/v1/serviceCar/${serviceCarId}`, { data: params });

// 创建设备租赁记录
export const postServiceLease= (params) => request.post(`/v1/serviceLease`, { data: params });

// 设备租赁记录列表
export const getServiceLeases = (params) => request.get(`/v1/serviceLease`, { params });

// GPS应商选择列表
export const getDictionarys = () => request.get(`/v1/serviceProvider/dictionary`);

// 查询组织机构列表
export const getOrganizations = (params) => request.get(`/v1/organizations`, { params });

// 根据密码获取GPS账号详情
export const getPasswordCheck = (serviceUserId, params) => request.get(`/v1/serviceUser/check/${serviceUserId}`, { params });

// 设备租赁记录Excel导出
export const getServiceLeaseExcel = (params) => request.get(`/v1/serviceLease/excel`, { params });

// 设备租赁记录详情
export const getServiceLeaseDetail = (leaseId) => request.get(`/v1/serviceLease/${leaseId}`);
