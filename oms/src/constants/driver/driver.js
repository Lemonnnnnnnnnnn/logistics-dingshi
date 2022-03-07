export const DRIVER_STATUS = [
  { value: 0, text: '认证失败', color: '#F04134' },
  { value: 1, text: '已认证', color: '#00A854' },
  { value: 2, text: '待认证', color: '#CCC' }
]

export const DRIVER_LICENSE_TYPE = [ // 暂时先列举一些驾驶
  { value: 1, text: 'A1', key:1 },
  { value: 2, text: 'A2', key:2 },
  { value: 3, text: 'A3', key:3 },
  { value: 4, text: 'B1', key:4 },
  { value: 5, text: 'B2', key:5 },
  { value: 6, text: 'A1A2', key:6 },
  { value: 7, text: 'A1D', key:7 },
  { value: 8, text: 'A1F', key:8 },
  { value: 9, text: 'A2D', key:9 },
  { value: 10, text: 'A2F', key:10 },
  { value: 11, text: 'B1E', key:11 },
  { value: 12, text: 'B1D', key:12 },
  { value: 13, text: 'B1F', key:13 },
  { value: 14, text: 'B2E', key:14 },
  { value: 15, text: 'B2D', key:15 },
  { value: 16, text: 'B2F', key:16 },
  { value: 17, text: 'A2E', key:17 },
  { value: 18, text: 'A1A2E', key:18 },
  { value: 19, text: 'C1', key:19 },
  { value: 20, text: 'C2', key:20 },
  { value: 21, text: 'A2A3', key:21 },
  { value: 22, text: 'A1A2D', key:22 },
  { value: 23, text: 'B1B2', key:23 },
]

export const AUDIT_STATUS = {
  FAILED: 0,
  SUCCESS: 1,
  PENDING: 2
}

export const PERFECT_STATUS = {
  FAILED: 0,
  SUCCESS: 1,
  notFilled: 2,
  filled: 3
}

export const getDriverStatus = (auditStatus, perfectStatus, organizationType) => {
  if (!auditStatus) return { text: '未实名', color: '#CCCCCC' }
  if (!auditStatus && !perfectStatus) return { text: '未实名', color: '#CCCCCC' }
  if (auditStatus === 1 && perfectStatus === 1) return { text: '已认证', color: '#00A854' }
  if (auditStatus === 1 && perfectStatus === 2) return { text: '已实名', color: '#00A854' }
  if (auditStatus === 1 && perfectStatus === 3) return { text: organizationType === 4? '待审核': '审核中', color: '#F59A23' }
  if (auditStatus === 1 && perfectStatus === 0) return { text: organizationType === 4? '已拒绝': '认证失败', color: '#F04134' }
  return { text: '已实名', color: '#00A854' }
}
