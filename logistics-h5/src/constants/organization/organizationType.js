export const PLATFORM = 1 // 平台方
export const OPERATOR = 2 // 运营方
export const CARGOES = 3 // 货权方
export const OWNER = 4 // 托运方
export const SHIPMENT = 5 // 承运方
export const SUPPLIER = 6 // 供应商
export const CUSTOMER = 7 // 客户

export const ORGANIZATION_TEXT = ['', '平台方', '运营方', '货权方', '托运方', '承运方', '供应商', '客户']

export const ORGANIZATION_STATUS = [
  { value: 0, text: '认证失败', color: '#F04134' },
  { value: 1, text: '已认证', color: '#00A854' },
  { value: 2, text: '待认证', color: '#CCC' }
]

export const SHIPMENT_OBJ = {
  title: 'shipment',
  type: SHIPMENT,
  verifyType: 55
}

export const CONSIGNMENT_OBJ = {
  title: 'consignment',
  type: OWNER,
  verifyType: 54
}

export const CARGO_OBJ = {
  title: 'cargo',
  type: CARGOES,
  verifyType: 53
}

export const AUDIT_STATUS = {
  FAILED: 0,
  SUCCESS: 1,
  PENDING: 2
}

export default {
  PLATFORM,
  OPERATOR,
  CARGOES,
  OWNER,
  SHIPMENT,
  SUPPLIER,
  CUSTOMER
}
