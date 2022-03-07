import request from '@/utils/request';

// 列表
export const getTrajectories = (params) => request.get(`/v1/trajectories`, { params });

// 详情
export const getTrackRecordDetail = (trajectoryId) => request.get(`/v1/trajectories/${trajectoryId}`);

// 修改轨迹记录单
export const patchTrackRecord = ({ trajectoryId, ...data }) => request.patch(`/v1/trajectories/${trajectoryId}`,  { data });

// 导出轨迹记录单
export const exportTrackRecord = (params) => request.get(`/v1/trajectories/excel`,  { params });
