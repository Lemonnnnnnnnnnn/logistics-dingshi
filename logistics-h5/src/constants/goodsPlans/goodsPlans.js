export const CONSIGNMENT_UNTREATED = 0
export const CONSIGNMENT_REFUSED = 1
export const GOINGON = 2
export const COMPLETE = 3
export const CANCEL = 4
export const FINISH = 5

export const PLANSTATUS = {
  [CONSIGNMENT_UNTREATED]:'托运待确认',
  [CONSIGNMENT_REFUSED]:'托运已拒绝',
  [GOINGON]:'进行中',
  [COMPLETE]:'已完成',
  [CANCEL]:'已撤销',
  [FINISH]:'已结束'
}
