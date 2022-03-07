export const CAR_AUDIT_STATUS={
  FAIL:0, // 认证失败
  SUCCESS:1, // 已认证
  UNAUDITED:2 // 待认证
}

export const AUDIT_STATUS_OPTIONS = [
  { value: CAR_AUDIT_STATUS.FAIL, text: '认证失败', color: '#F04134' },
  { value: CAR_AUDIT_STATUS.SUCCESS, text: '已认证', color: '#00A854' },
  { value: CAR_AUDIT_STATUS.UNAUDITED, text: '待认证', color: '#CCC' }
]

export const LICENSE_TYPE = {
  BLUE_AND_WHITE:1,
  YELLOW_AND_BLACK:2,
  GREEN_AND_BLACK:3,
  WHITE_AND_BLACK:4,
  BLACK_AND_WHITE:5
}

export const AUDIT_STATUS = {
  FAILED: 0,
  SUCCESS: 1,
  PENDING: 2
}

export const LICENSE_TYPE_OPTIONS = [
  { value: 1, title: '蓝底白字车牌' },
  { value: 2, title: '黄底黑字车牌' },
  { value: 3, title: '绿底黑字车牌' },
  { value: 4, title: '白底黑字车牌' },
  { value: 5, title: '黑底白字车牌' },
]

export const AXLES_NUM_OPTIONS = [
  { value: 2, label: '2轴' },
  { value: 3, label: '3轴' },
  { value: 4, label: '4轴' },
  { value: 5, label: '5轴' },
  { value: 6, label: '6轴' },
]

export const HEAD_STOCK_OPTIONS = [
  { value: true, label: '是' },
  { value: false, label: '不是' },
]

export const BIND_CAR_TYPE = {
  BIND_CAR: 1,
  DELETE_CAR: 2
}
