import { ORGANIZATION_TEXT } from '@/constants/organization/organization-type'
import { isEmpty } from '@/utils/utils'

let userInfo = {}

export const getUserInfo = () => {
  if (!isEmpty(userInfo)) return userInfo
  const infoStr = localStorage.getItem('token')
  userInfo = JSON.parse(infoStr) || {}
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

export const setUserInfo = (info={}) => {
  userInfo = info
}

export const clearUserInfo = () => (userInfo = {})
