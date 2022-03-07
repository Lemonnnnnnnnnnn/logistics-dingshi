export const PLATFORM = 1 // 平台方
export const CONSIGNMENT = 2 // 托运方
export const SHIPMENT = 3 // 承运方
export const DRIVER = 4 // 司机
export const CARGO = 5 // 货权

export const roleOptions=[
  {
    label:'平台',
    value:PLATFORM
  }, {
    label:'托运方',
    value:CONSIGNMENT
  }, {
    label:'承运方',
    value:SHIPMENT
  }, {
    label:'货权方',
    value:CARGO
  }, {
    label:'司机',
    value:DRIVER
  }
]

export const SCOPE = {
  [PLATFORM]: 'PLATFORM',
  [CONSIGNMENT]: 'CONSIGNMENT',
  [SHIPMENT]: 'SHIPMENT',
  [DRIVER]: 'DRIVER',
  [CARGO]:'CARGO'
}

export default {
  PLATFORM,
  CONSIGNMENT,
  SHIPMENT,
  DRIVER,
  CARGO
}
