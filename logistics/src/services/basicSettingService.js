import request from '@/utils/request';


// 税率配置列表
export const getTaxRateList = (params) => request.get(`/v1/taxRate`, { params });

// 创建税率配置
export const putTaxRate = (data) => request.post(`/v1/taxRate`, { data });

// 修改税率配置
export const patchTaxRate = (taxRateId, data) => request.patch(`/v1/taxRate/${taxRateId}`, { data });

// 税率配置列表
export const getTaxRateDetail = (taxRateId) => request.get(`/v1/taxRate/${taxRateId}`);

