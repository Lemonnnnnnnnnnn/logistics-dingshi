import { isFunction } from 'lodash'

const None = null
/**
 * 权限控制高阶组件
 *
 * @param permissions   本组件允许的权限范围
 * @param getPermission 获取权限的方法, 如果方法返回的权限在允许范围内，则显示该组件，否则不显示,方法的参数为该组件的 props
 * @returns {function(*): function(*=): null}
 * @constructor
 */

export default function Permission (permissions, getPermission){
  return (Component)=>(props)=>{
    let permission = getPermission
    if (isFunction(getPermission)){
      permission = getPermission(props)
    }
    return permissions.indexOf(permission)!==0 ? Component:None
  }
}
