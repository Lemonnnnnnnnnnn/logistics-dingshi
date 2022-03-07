
export const CAR_AUDIT_STATUS = {
  FAIL: 0, // 认证失败
  SUCCESS: 1, // 已认证
  UNAUDITED: 2, // 待认证
  PART_SUCCESS: 3, // 待认证
  EXPIRE: 4,
}

export const AUDIT_STATUS_OPTIONS = [
  { value: CAR_AUDIT_STATUS.FAIL, text: '未完善', color: '#F54040' },
  { value: CAR_AUDIT_STATUS.SUCCESS, text: '', color: '#00A854' },
  { value: CAR_AUDIT_STATUS.UNAUDITED, text: '审核中', color: '#FFBF12' },
  { value: CAR_AUDIT_STATUS.PART_SUCCESS, text: '未完善', color: '#F54040' },
  { value: CAR_AUDIT_STATUS.EXPIRE, text: '已过期', color: '#F54040' }
]

export const getCertificationStatus = ({ auditStatus, perfectStatus }) => {
  let status = CAR_AUDIT_STATUS.UNAUDITED
  if (auditStatus === 1) {
    switch (perfectStatus) {
      case 0:
        status = CAR_AUDIT_STATUS.FAIL
        break
      case 1:
        status = CAR_AUDIT_STATUS.SUCCESS
        break
      case 2:
        status = CAR_AUDIT_STATUS.PART_SUCCESS
        break
      case 3:
        status = CAR_AUDIT_STATUS.UNAUDITED
        break
      case 4:
        status = CAR_AUDIT_STATUS.EXPIRE
        break
      default:
    }
  }
  return status
}

export default {}
