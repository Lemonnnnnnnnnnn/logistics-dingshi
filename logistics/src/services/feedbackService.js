import request from '../utils/request';


// 意见反馈列表
export const getFeedbackList = (params) => request.get(`/v1/feedback`, { params });

// 创建税率配置
export const putFeedback = (data) => request.post(`/v1/feedback`, { data });

// 回复意见反馈
export const patchReplyFeedback = (feedbackId, data) => request.patch(`/v1/feedback/reply/${feedbackId}`, { data });

// 修改意见反馈
export const patchFeedback = (feedbackId, data) => request.patch(`/v1/feedback/${feedbackId}}`, { data });

// 意见反馈详情
export const getFeedbackDetail = (feedbackId) => request.get(`/v1/feedback/${feedbackId}`);

// 导出
export const exportExcel = (params) => request.get(`/v1/feedback/excel`, { params });
