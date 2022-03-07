export const RADIO_ROLE = {
  LEGAL: 0,
  AGENT: 1
}

export const registerRadio = [{
  label: '法人注册',
  value: RADIO_ROLE.LEGAL
}, {
  label: '代理人注册',
  value: RADIO_ROLE.AGENT
}]

export const AUTHENTICATION_TYPE ={
  COMPANY:0,
  PERSONAL:1
}

export const authenticationRadio =[{
  label: '公司认证',
  value: AUTHENTICATION_TYPE.COMPANY
}, {
  label: '个人认证',
  value: AUTHENTICATION_TYPE.PERSONAL
}]
export default {
  RADIO_ROLE,
  registerRadio
}
