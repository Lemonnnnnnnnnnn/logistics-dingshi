import request from '@/utils/request';


// 项目列表
export const getProjectList = (params) => request.get(`/v1/projects/shipments`, { params });

// 交票清单列表
export const getTangibleBills = (params) => request.get(`/v1/tangibleBills`, { params });

// 创建
export const putTangibleBills = (data) => request.post(`/v1/tangibleBills`, { data });

// 删除
export const delTangibleBill = (tangibleBillId) => request.patch(`/v1/tangibleBills/${tangibleBillId}/delete`);

// 详情
export const tangibleBillDetail = (tangibleBillId) => request.get(`/v1/tangibleBills/${tangibleBillId}`);

// 转交
export const transferTangibleBill = (tangibleBillId, data) => request.patch(`/v1/tangibleBills/${tangibleBillId}/transfer`, { data });

// 签收，代签(传signPhoto)
export const signTangibleBill = (tangibleBillId, signPhoto) => request.patch(`/v1/tangibleBills/${tangibleBillId}/sign`, { data: { signPhoto } });

// 提交审核，审核，审核拒绝
export const auditOrSubmitTangibleBill = (tangibleBillId, data) => request.patch(`/v1/tangibleBills/${tangibleBillId}/auditOrSubmit`, { data });

// 运单号添加运单
export const getByTransportNo= (params) => request.get(`/v1/tangibleBills/byTransportNo`, { params });

// 导出
export const exportExcel = (params) => request.get(`/v1/tangibleBills/${params.tangibleBillId}/excel`, { params });

// 筛选添加运单
export const screenOutTransport = (params) => request.get(`/v1/tangibleBills/screenOutTransport`, { params });

// 修改
export const updateTangibleBills = (tangibleBillId, data) => request.patch(`/v1/tangibleBills/${tangibleBillId}`, { data });
