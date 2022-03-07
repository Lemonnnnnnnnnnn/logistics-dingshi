import { ORGANIZATION_TEXT } from '@/constants/organization/organizationType'
import { isEmpty } from '@/utils/utils'

let userInfo = {}

export const getUserInfo = () => {
  if (!isEmpty(userInfo)) return userInfo
  const infoStr = localStorage.getItem('token')
  userInfo = JSON.parse(infoStr) || {}
  // userInfo = JSON.parse(infoStr) || { organizationType : 4 }
  return userInfo
}

export const getRole = () => {
  const userInfo = getUserInfo()
  return userInfo.organizationType
}

export const getRoleText = () => {
  const roleType = getRole()
  return ORGANIZATION_TEXT[roleType]
}

export const setUserInfo = info => {
  if (!info) return
  userInfo = info
  localStorage.setItem('token', JSON.stringify(info))
  setMac(JSON.stringify(info))
}

export const clearUserInfo = () => {
  userInfo = {}
  localStorage.removeItem('token')
  localStorage.removeItem('__Mac')
}

export const setMac = (__Mac) => {
  localStorage.setItem('__Mac', __Mac)
}

export const removeMac = () => {
  localStorage.removeItem('__Mac')
}

export const getMac = (type) => {
  if (type){
    const { scope } = JSON.parse(localStorage.getItem('__Mac')) || {}
    if (scope === type) return localStorage.getItem('__Mac')
    return null
  }
  return localStorage.getItem('__Mac')
}
