export const PLANSTATUS = {
  CONSIGNMENT_UNTREATED: 0,
  CONSIGNMENT_REFUSED: 1,
  GOINGON: 2, // TODO, key名可能要重设下
  COMPLETE: 3,
  CANCEL: 4,
  FINISH: 5
}

export const PLANSTATUSARRAY = {
  [PLANSTATUS.CONSIGNMENT_UNTREATED]: {
    title: '● 托运待确认',
    words: '托运待确认',
    color: 'red'
  },
  [PLANSTATUS.CONSIGNMENT_REFUSED]:{
    title: "● 托运已拒绝",
    words: '托运已拒绝',
    color: "red"
  },
  [PLANSTATUS.GOINGON]:{
    title: "● 进行中",
    words: '进行中',
    color: "orange"
  },
  [PLANSTATUS.COMPLETE]:{
    title: "● 已完成",
    words: "已完成",
    color: "green"
  },
  [PLANSTATUS.CANCEL]:{
    title: "● 已撤销",
    words: '已撤销',
    color: "red"
  },
  [PLANSTATUS.FINISH]:{
    title: "● 已结束",
    words: '已结束',
    color: "green" }
}
