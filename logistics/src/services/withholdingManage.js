import request from '@/utils/request';


// 代缴人员管理列表
export const getRemitUsersList = (params) => request.get(`/v1/remitUsers`, { params });

// 代扣代缴月度管理列表
export const getRemitMonthsList = (params) => request.get(`/v1/remitMonths`, { params });

// 代扣代缴明细列表
export const getRemitDetailsList = (params) => request.get(`/v1/remitDetails`, { params });

// 导出代扣代缴明细列表excel
export const exportRemitDetailsExcel = (params) => request.get(`/v1/remitDetails/excel`, { params });

// 导出代缴人员管理列表excel
export const exportRemitUsersExcel = (params) => request.get(`/v1/remitUsers/excel`, { params });

// 导出代缴人员管理修改
export const patchRemitUsers = (remitUserId, data) => request.patch(`/v1/remitUsers/${remitUserId}`, { data });

// 导出代缴人员管理修改
export const postRemitUsers = (data) => request.post(`/v1/remitUsers`, { data });

// 代扣代缴月度管理列表excel
export const exportRemitMonthsExcel = (params) => request.get(`/v1/remitMonths/excel`, { params });

// 添加代扣人员列表
export const getUserAddList = (params) => request.get(`/v1/remitUsers/userAddList`, { params });
