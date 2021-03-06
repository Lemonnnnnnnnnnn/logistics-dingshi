import moment from 'moment'
import { isArray, isEqual, isFunction, values as getValues } from 'lodash'
import FastClick from 'fastclick'
import md5 from './md5'

export { default as md5 } from './md5'
export {
  zipObject, unionBy, pullAllBy, find, forEach, curry, pick, isArray,
  findIndex, isFunction, isObject, isString, isEqual, isEqualWith,
  isEmpty, throttle, omit, values, isNumber, uniqBy, xorBy, groupBy,
  flattenDeep, cloneDeep, sortBy, isNaN, debounce as lodashDebounce, round
} from 'lodash'
/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;


export function isUrl (path) {
  return reg.test(path);
}

export function toSnakeCase (str) {
  return str.replace(/\B_*([A-Z])/g, '_$1').toLowerCase()
}

export function toCamelCase (str) {
  return str.replace(/\B_(\w)/g, (all, letter) => letter.toUpperCase())
}

export function firstCharUpperCase (str) {
  const first = str[0]
  return str.replace(first, first.toUpperCase())
}

export function compose (...decorators) {
  return decorators.reduce((oldFunc, targetFunc) => (...params) => targetFunc(oldFunc(...params)))
}

export function translatePageType ({ current, pageSize: limit }) {
  const offset = (current - 1) * limit
  return { offset, limit, current }
}

export class PromiseAll {
  promise = []

  push (promise) {
    this.promise.push(promise)
  }

  exec () {
    return Promise.all(this.promise)
  }

  isEmpty () {
    return this.promise.length === 0
  }
}

export const getType = arg => ({
  '[object String]': 'string',
  '[object Array]': 'array',
  '[object Function]': 'function',
  '[object Object]': 'object',
  '[object Number]': 'number'
}[({}).toString.call(arg)])

const defaultCompare = (item, otherItem) => item === otherItem


export const compare = (item, otherItem) => {
  const itemType = getType(item)
  const otherItemType = getType(otherItem)

  if (itemType !== otherItemType) return false

  const compareMethod = {
  }[itemType] || defaultCompare

  compareMethod(item, otherItem)
  return true
}

/**
 *  ????????????????????????
 *  -?????????????????????????????????????????????
 *  -?????????????????????????????????
 */
export class MapTreeData {

  itemMap = new Map()

  itemTree = { children: [] }

  constructor (items, { privateKey = 'id', parentKey = 'parentId', rootId = 'root', labelKey }) {
    // ???????????????

    this.itemTree[privateKey] = rootId
    const rootNodeChildren = this.itemTree.children
    const switchItem = item => ({
      ...item,
      value: item[privateKey],
      label: item[labelKey],
      [parentKey]: item[parentKey]
    })
    const finalItems = items.map(switchItem)

    finalItems.forEach(item => {
      const _parentKey = item[parentKey]

      if (!_parentKey) {
        // ??????parentKey???0??? ???????????????
        rootNodeChildren.push(item)
      } else {
        // ??????????????? ?????????????????????children???push
        const parentNode = finalItems.find(_item => _item.value === _parentKey)

        if (!isArray(parentNode.children)) {
          parentNode.children = []
        }

        parentNode.children.push(item)
      }
    })
  }

  getItemTree () {
    return this.itemTree.children
  }

  getItem (itemId) {
    return this.itemMap(itemId)
  }

}

//  ## ??????????????????
//
//  ** ????????????**
// function getProject(params){
//   return request('/v1/formDemo/selectList',params)
// }
//
//  ** ?????????????????? **
// const getProjectDebounce =  requestDebounce(getProject)
//
//  ** ?????????????????? **
// const result = await getProjectDebounce(params)

/**
 * ???????????????????????????????????????params??????????????????????????????????????????????????????????????????
 * ?????????????????????????????????params????????????
 *
 * @param action  ??????????????????
 * @param time    ???????????????????????????????????????
 * @returns {function(*=)}
 */
export function requestDebounce (action, time = 100) {
  const paramsMap = new Map()
  const clearMap = () => paramsMap.clear()
  return [async (params = {}) => {
    let request
    paramsMap.forEach((value, paramsItem) => {
      if (isEqual(paramsItem, params)) {
        request = () => value
        return request
      }
    })
    if (!request) {
      request = debounce(action, time)
      const promise = request(params)
      paramsMap.set(params, promise)
      return promise
    }
    return request(params)
  }, clearMap]
}


/**
 * ?????????????????????????????????????????????????????????
 *
 * @param action  ??????????????????
 * @param time    ?????????????????????
 * @returns {function(*=)}
 */
// export function debounce (action, time = 100) {
//   let promise
//   let start
//   return async (params) => {
//     if (!start) {
//       start = true
//       promise = new Promise(async (resolve) => {
//         resolve(await action(params))
//       })
//       setTimeout(() => {
//         start = false
//       }, time)
//     }
//     return promise
//   }
// }

export function debounce (func, time = 1000) {
  let pending = false
  return function wrappedFunc (...args) {
    if (pending) return

    pending = true
    const result = func.apply(this, args)
    const isPromise = result && isFunction(result.then)

    if (isPromise) {
      result.then(data => {
        pending = false
        return data
      })
    } else {
      setTimeout(() => {
        pending = false
      }, time)
    }

    return result
  }
}
/**
 * @export ?????????????????????
 * @param {*} value ????????????
 * @returns ??????????????????
 */
export function testIdCard (value) {
  const format = /^(([1][1-5])|([2][1-3])|([3][1-7])|([4][1-6])|([5][0-4])|([6][1-5])|([7][1])|([8][1-2]))\d{4}(([1][9]\d{2})|([2]\d{3}))(([0][1-9])|([1][0-2]))(([0][1-9])|([1-2][0-9])|([3][0-1]))\d{3}[0-9xX]$/;
  // ??????????????????
  if (!format.test(value)) {
    return false
  }
  // ???????????????
  // ?????????????????????   ??????????????????????????????1900;
  const year = value.substr(6, 4) // ????????????
  const month = value.substr(10, 2) // ????????????
  const date = value.substr(12, 2) // ????????????
  const time = Date.parse(`${month}-${date}-${year}`) // ????????????????????????date
  const nowTime = Date.parse(new Date()) // ???????????????
  const dates = (new Date(year, month, 0)).getDate() // ?????????????????????
  if (time > nowTime || date > dates) {
    return false
  }
  // ???????????????
  const c = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]  // ??????
  const b = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']  // ??????????????????
  const idArray = value.split("")
  let sum = 0
  for (let k = 0; k < 17; k++) {
    sum += parseInt(idArray[k], 10) * parseInt(c[k], 10);
  }
  if (idArray[17].toUpperCase() !== b[sum % 11].toUpperCase()) {
    return false
  }
  return true
}

// const plannedGoodsweight = record.deliveryItems.reduce((goodsWeight, good) => {
//   if (!goodsWeight[good.goodsId]) {
//     goodsWeight[good.goodsId] = {
//       goodsId: good.goodsId,
//       unit: good.goodsUnitCN,
//       num: 0
//     }
//   }

//   goodsWeight[good.goodsId].num += good.receivingNum

//   return goodsWeight
// }, {})

export const classifyGoodsWeight = (list, primaryKey, pickKeys, reduceFunc) => {
  if (!list) return []

  const goodsWeight = list.reduce((summary, current) => {
    const primaryId = current[primaryKey]
    if (!summary[primaryId]) {
      summary[primaryId] = _.pick(current, pickKeys)
    } else {
      reduceFunc(summary[primaryId], current)
    }

    return summary
  }, {})

  return getValues(goodsWeight).sort((prev, next) => prev[primaryKey] - next[primaryKey])
}

export const getOssImg = window._getOssImg = (file, { width, height } = {}) => {
  if (!file) return ''
  let optionStr = ''
  const specialLetters = ['#', '%']
  const { ossBucket, ossEndpoint } = window.envConfig
  const encodedFile = file.replace(new RegExp(`(${specialLetters.join('|')})`, 'g'), (match, group) => encodeURIComponent(group))
  let imgUrl = `https://${ossBucket}.${ossEndpoint}/${encodedFile}`
  // const imgUrl = `${ossCDN}/${encodedFile}`
  const routeIndex = imgUrl.indexOf('rotate*|*')
  if (routeIndex>-1) {
    optionStr = '/resize'
    optionStr += `,w_${width || 4096}`
    optionStr += `,h_${height || 4096}`
    imgUrl = imgUrl.slice(0, routeIndex) + optionStr + imgUrl.slice(routeIndex)
  } else if (width || height) {
    optionStr = '?x-oss-process=image/resize'
    width && (optionStr += `,w_${width}`)
    height && (optionStr += `,h_${height}`)
    imgUrl = `${imgUrl}${optionStr}`
  }
  imgUrl = `${imgUrl}`.replace('rotate*|*', '/rotate,')
  return imgUrl
}

export const getOssVideo = (file) =>{
  if (!file) return ''
  const specialLetters = ['#', '%']
  const { ossBucket, ossEndpoint } = window.envConfig
  const encodedFile = file.replace(new RegExp(`(${specialLetters.join('|')})`, 'g'), (match, group) => encodeURIComponent(group))
  return `https://${ossBucket}.${ossEndpoint}/${encodedFile}`
}

export const judgeFileType = (fileName)=>{
  const imgExt = [".png", ".jpg", ".jpeg", ".bmp", ".gif"];
  const videoExt = ['.flv', '.avi', '.mov', '.mp4', '.wmv', ]
  const fileExt = fileName.substring(fileName.lastIndexOf('.'))
  if (imgExt.find(item=>item === fileExt)) return 'image'
  if (videoExt.find(item=>item === fileExt)) return 'video'
}


export function changeUnit (limit){
  let size = "";
  if (limit < 0.1 * 1024){                            // ??????0.1KB???????????????B
    size = `${limit.toFixed(2) }B`
  } else if (limit < 0.1 * 1024 * 1024){            // ??????0.1MB???????????????KB
    size = `${(limit/1024).toFixed(2) }KB`
  } else if (limit < 0.1 * 1024 * 1024 * 1024){        // ??????0.1GB???????????????MB
    size = `${(limit/(1024 * 1024)).toFixed(2) }MB`
  } else {                                            // ???????????????GB
    size = `${(limit/(1024 * 1024 * 1024)).toFixed(2) }GB`
  }

  const sizeStr = `${size }`;                        // ???????????????
  const index = sizeStr.indexOf(".");                    // ???????????????????????????
  const dou = sizeStr.substr(index + 1, 2)            // ??????????????????????????????
  if (dou === "00"){                                // ????????????????????????00?????????????????????00
    return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
  }
  return size;
}

export const disableDateBeforeToday = current => current && current < moment().subtract(1, 'day').endOf('day')

export const disableDateAfterToday = current => current && current > moment().endOf('day')

export function saveUserInfoToLocalStorage (userInfo) {
  localStorage.setItem('token', JSON.stringify(userInfo))
}

export function savePermissionsToLocalStorage (authority) {
  localStorage.setItem('antd-pro-authority', JSON.stringify(authority.map(item => item.permissionCode)))
  localStorage.setItem('authority', JSON.stringify(authority))
}

export function isNull (value) {
  return (value === null || value === undefined)
}

export const encodePassword = (password) => {
  const fillChar = '\x8f\x70\x83\x8f'
  const salt = '2eh1.iaqw7'
  const s = password + fillChar + salt

  return md5(s)
}

export const getAbsoluteRoutePath = routes => {
  const _getAbsoluteRoutePath = (pre, routes) => routes.reduce((plattedRoutes, route) => {
    if (!route.path) return plattedRoutes
    const tempPath = route.path.startsWith('/') ? `${pre.path}${route.path}` : `${pre.path}/${route.path}`
    const tempAuth = isArray(route.authority) ? [...pre.authority, ...route.authority] : [...pre.authority, route.authority]
    const temp = { path: tempPath, authority: tempAuth }
    if (route.routes && route.routes.length) {
      plattedRoutes.push(..._getAbsoluteRoutePath(temp, route.routes))
    } else {
      plattedRoutes.push(temp)
    }

    return plattedRoutes
  }, [])

  return _getAbsoluteRoutePath({ path: '', authority: [] }, routes).filter(item => item.path !== '/')
}

export const formatTime = time => {
  const now = moment()
  const targetTime = moment(time)
  const yearDiff = now.years() - targetTime.years()
  const monthDiff = now.months() - targetTime.months()
  const dayDiff = now.date() - targetTime.date()
  const hourDiff = now.hours() - targetTime.hours()
  const minuteDiff = now.minutes() - targetTime.minutes()
  if (yearDiff >= 1 || monthDiff >= 1 || dayDiff >= 1) return targetTime.format('YYYY-MM-DD')
  if (hourDiff >= 1 && minuteDiff > 0) return targetTime.format('HH:mm')
  return `${minuteDiff}?????????`
}

// ?????????????????????,???????????????  ?????????_KETY_?????????.??????????????????
export function getTempNameWithKey (name) {
  const nowDate = moment(new Date()).format('YYYY/MM/DD')
  return `temp/${nowDate}/${name.replace(/\.([^.]+)$/, `|&|_KEY_${new Date().getTime()}.$1`).split('|&|')[1]}`
}

export function getBusinessNameWithKey (name) {
  const nowDate = moment(new Date()).format('YYYY/MM/DD')
  return `business/${nowDate}/${name.replace(/\.([^.]+)$/, `|&|_KEY_${new Date().getTime()}.$1`).split('|&|')[1]}`
}

export function tempNameToBusinessName (name){
  return name.replace('temp', 'business')
}

export function businessNameToTempName (name){
  return name.replace('business', 'temp')
}

export const dataURLtoBlob = dataurl => {
  const arr = dataurl.split(','); const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export const loadScript = scriptUrl => new Promise((resolve) => {
  const script = document.createElement('script')
  script.onload = () => resolve()
  script.src = scriptUrl
  document.body.append(script)
})

export const browser ={
  versions:(() =>{
    const u = navigator.userAgent
    // const app = navigator.appVersion;
    return {
      trident: u.indexOf('Trident') > -1, // IE??????
      presto: u.indexOf('Presto') > -1, // opera??????
      webKit: u.indexOf('AppleWebKit') > -1, // ?????????????????????
      gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') === -1, // ????????????
      mobile: !!u.match(/AppleWebKit.*Mobile.*/), // ?????????????????????
      ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), // ios??????
      android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, // android??????
      iPhone: u.indexOf('iPhone') > -1, // ?????????iPhone??????QQHD?????????
      iPad: u.indexOf('iPad') > -1, // ??????iPad
      webApp: u.indexOf('Safari') === -1, // ??????web????????????????????????????????????
      weixin: u.indexOf('MicroMessenger') > -1, // ????????????
      qq: u.match(/\sQQ/i) === " qq" // ??????QQ
    };
  })(),
  language:(navigator.browserLanguage || navigator.language).toLowerCase()
}

export const formatMoney = (num) => {
  num = num.toString().replace(/\$|\,/g, '');
  const sign = num.indexOf("-")> 0 ? '-' : ''
  let cents = num.indexOf(".")> 0 ? num.substr(num.indexOf(".")) : ''
  cents = cents.length>1 ? cents : '' ;
  num = num.indexOf(".") > 0 ? num.substring(0, (num.indexOf("."))) : num
  for (let i = 0; i < Math.floor((num.length-(1+i))/3); i++) {
    num = `${num.substring(0, num.length-(4*i+3))},${num.substring(num.length-(4*i+3))}`;
  }
  return (sign + num + cents)
}

export const getUrl = (baseUrl, options, isExistMark = false) => {
  let urlParams = ''
  Object.keys(options).forEach(keyName=>{
    if (options[keyName] || options[keyName] === 0){
      urlParams+=`&${keyName}=${options[keyName]}`
    }
  })
  if (isExistMark) return `${baseUrl}${urlParams.substr(1)}`
  return `${baseUrl}${urlParams}`
}


// ??????
export const unitPrice = (detail, organization) => {
  let unit
  let avgPrice = detail.deliveryItems.reduce((total, current) => {
    total += current.freightPrice
    return total
  }, 0) / detail.deliveryItems.length
  if (!detail.logisticsBusinessTypeEntity) unit = '???/???'
  if (detail.logisticsBusinessTypeEntity) {
    const options = {
      1: '???/??????',
      2: '???',
      3: '???/???',
      4: '???/???',
      5: '???/???'
    }
    unit = options[detail.logisticsBusinessTypeEntity.measurementUnit]
  }
  if (organization === 4 || !detail.logisticsTradingSchemeEntity) return `${avgPrice.toFixed(2)._toFixed(2)}${unit}`
  if (detail.logisticsTradingSchemeEntity && detail.logisticsTradingSchemeEntity.driverServiceStandard === 1) {
    avgPrice *= (1 - detail.logisticsTradingSchemeEntity.driverServiceRate)
  }
  return `${avgPrice.toFixed(2)._toFixed(2)}${unit}`
}

FastClick.prototype.focus = (targetElement) => {
  targetElement.focus();
}


export const getWeight = (val) =>{
  if (!val) return 0
  if (typeof val === 'number') return val
  if (typeof val === 'string') return Number(val.replace('kg', ''))
  return 0
}

export { FastClick }


export function xmlStr2XmlObj (xmlStr) {
  let xmlObj = {};
  if (document.all) {
    const xmlDom = new ActiveXObject("Microsoft.XMLDOM");
    xmlDom.loadXML(xmlStr);
    xmlObj = xmlDom;
  } else {
    xmlObj = new DOMParser().parseFromString(xmlStr, "text/xml");
  }
  return xmlObj;
}
export function xmlObj2json (xml) {
  try {
    let obj = {};
    if (xml.children.length > 0) {
      for (let i = 0; i < xml.children.length; i++) {
        const item = xml.children.item(i);
        const { nodeName } = item;
        if (typeof(obj[nodeName]) === "undefined") {
          obj[nodeName] = xmlObj2json(item);
        } else {
          if (typeof(obj[nodeName].push) === "undefined") {
            const old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xmlObj2json(item));
        }
      }
    } else {
      obj = xml.textContent;
    }
    return obj;
  } catch (e) {
    console.log(e.message);
  }
}

export function xmlStr2json (xml) {
  const xmlObj = xmlStr2XmlObj(xml);
  let jsonObj = {};
  if (xmlObj.childNodes.length > 0) {
    jsonObj = xmlObj2json(xmlObj);
  }
  return jsonObj;
}

export function dealWithErrorDate (date){
  if (date === "Invalid date"){
    return undefined;
  }
  return date

}