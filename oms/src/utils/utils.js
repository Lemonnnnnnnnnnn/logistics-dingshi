import moment from 'moment';
import { isEqual, isArray, isFunction, values as getValues } from 'lodash';
import router from 'umi/router';
import { message } from "antd";
import { getUserInfo } from "@/services/user";
import md5 from './md5';
import {
  CONSIGNMENT_TO_PLAT,
  SHIPMENT_TO_CONSIGNMENT, SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT,
  SHIPMENT_TO_PLAT,
  SUBORDINATE_SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT,
  SUPERIOR_SHIPMENT,
  SUBORDINATE_SHIPMENT
} from "@/constants/account";

export { default as md5 } from './md5';
export {
  zipObject, unionBy, pullAllBy, find, forEach, reverse, pick, isArray,
  findIndex, isFunction, isObject, isString, isEqual, isEqualWith, trim,
  isEmpty, throttle, omit, values, isNumber, uniqBy, xorBy, groupBy,
  flattenDeep, cloneDeep, sortBy, uniq, debounce as lodashDebounce, flatMap, sumBy,
  filter, remove, round, difference, invert, intersection, intersectionWith, intersectionBy, forOwn, last, camelCase,
  uniqueId, xor, union, compact, assign
} from 'lodash';
/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;


export function isUrl(path) {
  return reg.test(path);
}

// 路径queryshez
export const pathQueryStr = (params) => {
  let paramsData = '';
  Object.keys(params).forEach((item) => {
    paramsData += `${item}=${params[item]}&`;
  });
  return `?${paramsData.substring(0, paramsData.length - 1)}`;
};

export function toSnakeCase(str) {
  return str.replace(/\B_*([A-Z])/g, '_$1').toLowerCase();
}

export function toCamelCase(str) {
  return str.replace(/\B_(\w)/g, (all, letter) => letter.toUpperCase());
}

export function firstCharUpperCase(str) {
  const first = str[0];
  return str.replace(first, first.toUpperCase());
}

export function compose(...decorators) {
  return decorators.reduce((oldFunc, targetFunc) => (...params) => targetFunc(oldFunc(...params)));
}

export function translatePageType({ current, pageSize: limit }) {
  const offset = (current - 1) * limit;
  return { offset, limit, current };
}

export class PromiseAll {
  promise = []

  push(promise) {
    this.promise.push(promise);
  }

  exec() {
    return Promise.all(this.promise);
  }

  isEmpty() {
    return this.promise.length === 0;
  }
}

export const getType = arg => ({
  '[object String]': 'string',
  '[object Array]': 'array',
  '[object Function]': 'function',
  '[object Object]': 'object',
  '[object Number]': 'number',
}[({}).toString.call(arg)]);

const defaultCompare = (item, otherItem) => item === otherItem;


export const compare = (item, otherItem) => {
  const itemType = getType(item);
  const otherItemType = getType(otherItem);

  if (itemType !== otherItemType) return false;

  const compareMethod = {}[itemType] || defaultCompare;

  compareMethod(item, otherItem);
  return true;
};

/**
 *  用于处理树形数据
 *  -将拍平的树形数据处理成树形结构
 *  -提供快速查寻上下级能力
 */
export class MapTreeData {

  itemMap = new Map()

  itemTree = { children: [] }

  constructor(items, { privateKey = 'id', parentKey = 'parentId', rootId = 'root', labelKey }) {
    // 创建根结点

    this.itemTree[privateKey] = rootId;
    const rootNodeChildren = this.itemTree.children;
    const switchItem = item => ({
      ...item,
      value: item[privateKey],
      label: item[labelKey],
      [parentKey]: item[parentKey],
    });
    const finalItems = items.map(switchItem);

    finalItems.forEach(item => {
      const _parentKey = item[parentKey];

      if (!_parentKey) {
        // 如果parentKey为0， 则为根节点
        rootNodeChildren.push(item);
      } else {
        // 非根节点， 初始化父节点的children并push
        const parentNode = finalItems.find(_item => _item.value === _parentKey);

        if (!isArray(parentNode.children)) {
          parentNode.children = [];
        }

        parentNode.children.push(item);
      }
    });
  }

  getItemTree() {
    return this.itemTree.children;
  }

  getItem(itemId) {
    return this.itemMap(itemId);
  }

}

//  ## 节流请求示例
//
//  ** 请求方法**
// function getProject(params){
//   return request('/v1/formDemo/selectList',params)
// }
//
//  ** 创建节流请求 **
// const getProjectDebounce =  requestDebounce(getProject)
//
//  ** 使用节流请求 **
// const result = await getProjectDebounce(params)

/**
 * 用于请求节流，会根据对应的params，在一段时间内重复请求相同的请求只会发送一次
 * 是否重复请求根据请求的params参数而定
 *
 * @param action  要执行的方法
 * @param time    方法执行的间隔时间（毫秒）
 * @returns {function(*=)}
 */
export function requestDebounce(action, time = 100) {
  const paramsMap = new Map();
  const clearMap = () => paramsMap.clear();
  return [async (params = {}) => {
    let request;
    paramsMap.forEach((value, paramsItem) => {
      if (isEqual(paramsItem, params)) {
        request = () => value;
        return request;
      }
    });
    if (!request) {
      request = debounce(action, time);
      const promise = request(params);
      paramsMap.set(params, promise);
      return promise;
    }
    return request(params);
  }, clearMap];
}


/**
 * 用于请求节流，在一段时间内只会执行一次
 *
 * @param action  要执行的方法
 * @param time    方法执行的间隔
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

export function debounce(func, time = 1000) {
  let pending = false;
  return function wrappedFunc(...args) {
    if (pending) return;
    pending = true;
    const result = func.apply(this, args);
    const isPromise = result && isFunction(result.then);
    if (isPromise) {
      result.then(data => {
        pending = false;
        return data;
      });
    } else {
      setTimeout(() => {
        pending = false;
      }, time);
    }

    return result;
  };
}

/**
 * @export 身份证号码校验
 * @param {*} value 输入的值
 * @returns 校验是否成功
 */
export function testIdCard(value) {
  const format = /^(([1][1-5])|([2][1-3])|([3][1-7])|([4][1-6])|([5][0-4])|([6][1-5])|([7][1])|([8][1-2]))\d{4}(([1][9]\d{2})|([2]\d{3}))(([0][1-9])|([1][0-2]))(([0][1-9])|([1-2][0-9])|([3][0-1]))\d{3}[0-9xX]$/;
  // 号码规则校验
  if (!format.test(value)) {
    return false;
  }
  // 区位码校验
  // 出生年月日校验   前正则限制起始年份为1900;
  const year = value.substr(6, 4); // 身份证年
  const month = value.substr(10, 2); // 身份证月
  const date = value.substr(12, 2); // 身份证日
  const time = Date.parse(`${month}-${date}-${year}`); // 身份证日期时间戳date
  const nowTime = Date.parse(new Date()); // 当前时间戳
  const dates = (new Date(year, month, 0)).getDate(); // 身份证当月天数
  if (time > nowTime || date > dates) {
    return false;
  }
  // 校验码判断
  const c = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];  // 系数
  const b = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];  // 校验码对照表
  const idArray = value.split('');
  let sum = 0;
  for (let k = 0; k < 17; k++) {
    sum += parseInt(idArray[k], 10) * parseInt(c[k], 10);
  }
  if (idArray[17].toUpperCase() !== b[sum % 11].toUpperCase()) {
    return false;
  }
  return true;
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
  if (!list) return [];
  const goodsWeight = list.reduce((summary, current) => {
    const primaryId = current[primaryKey];
    if (!summary[primaryId]) {
      summary[primaryId] = _.pick(current, pickKeys);
    } else {
      reduceFunc(summary[primaryId], current);
    }
    return summary;
  }, {});

  return getValues(goodsWeight).sort((prev, next) => prev[primaryKey] - next[primaryKey]);
};

export const getOssImg = window._getOssImg = (file, { width, height } = {}) => {
  if (!file) return '';
  let optionStr = '';
  const { ossBucket, ossEndpoint } = window.envConfig;
  const encodedFile = file.replace(new RegExp(`[#%+]`, 'g'), (match, group) => encodeURIComponent(match));

  let imgUrl = `https://${ossBucket}.${ossEndpoint}/${encodedFile}`;
  const routeIndex = imgUrl.indexOf('rotate*|*');
  // 由于后端旋转图片传了大写字母，导致oss用url进行图片处理失效，这里增加逻辑，如果有传参数（旋转），将?后的参数进行小写转化处理
  const [l, r] = imgUrl.split('?');
  if (r) imgUrl = `${l}?${r.toLowerCase()}`;

  if (routeIndex > -1) {
    optionStr = '/resize';
    optionStr += `,w_${width || 4096}`;
    optionStr += `,h_${height || 4096}`;
    imgUrl = imgUrl.slice(0, routeIndex) + optionStr + imgUrl.slice(routeIndex);
  } else if (width || height) {
    optionStr = '?x-oss-process=image/resize';
    width && (optionStr += `,w_${width}`);
    height && (optionStr += `,h_${height}`);
    imgUrl = `${imgUrl}${optionStr}`;
  }
  imgUrl = `${imgUrl}`.replace('rotate*|*', '/rotate,');
  return imgUrl;
};

export const disableDateBeforeToday = current => current && current < moment().subtract(1, 'day').endOf('day');

export const disableDateAfterToday = current => current && current > moment().endOf('day');

export function saveUserInfoToLocalStorage(userInfo = {}) {
  localStorage.setItem('token', JSON.stringify(userInfo));
}

export function savePermissionsToLocalStorage(authority) {
  localStorage.setItem('antd-pro-authority', JSON.stringify(authority.map(item => item.permissionCode)));
  localStorage.setItem('authority', JSON.stringify(authority));
}

export function isNull(value) {
  return (value === null || value === undefined);
}

export const encodePassword = (password) => {
  const fillChar = '\x8f\x70\x83\x8f';
  const salt = '2eh1.iaqw7';
  const s = password + fillChar + salt;

  return md5(s);
};

export const getAbsoluteRoutePath = routes => {
  const _getAbsoluteRoutePath = (pre, routes) => routes.reduce((plattedRoutes, route) => {
    if (!route.path) return plattedRoutes;
    const tempPath = route.path.startsWith('/') ? `${pre.path}${route.path}` : `${pre.path}/${route.path}`;
    const tempAuth = isArray(route.authority) ? [...pre.authority, ...route.authority] : [...pre.authority, route.authority];
    const temp = { path: tempPath, authority: tempAuth };
    if (route.routes && route.routes.length) {
      plattedRoutes.push(..._getAbsoluteRoutePath(temp, route.routes));
    } else {
      plattedRoutes.push(temp);
    }

    return plattedRoutes;
  }, []);

  return _getAbsoluteRoutePath({ path: '', authority: [] }, routes).filter(item => item.path !== '/');
};

export const getOssFile = (accessInfo, key) => {
  const { credentials: { accessKeyId, accessKeySecret, securityToken } } = accessInfo;
  const { ossEndpoint, ossBucket } = window.envConfig;
  import('ali-oss').then(({ default: OSS }) => {
    const client = new OSS({
      accessKeyId,
      accessKeySecret,
      stsToken: securityToken,
      endpoint: ossEndpoint,
      bucket: ossBucket,
    });
    const url = client.signatureUrl(key);
    window.open(url);
  });
};

export const formatMoney = (num) => {
  if (num) {
    num = num.toString().replace(/\$|\,/g, '');
    const sign = num.indexOf("-") != -1 ? '-' : '';
    let cents = num.indexOf('.') > 0 ? num.substr(num.indexOf('.')) : '';
    cents = cents.length > 1 ? cents : '';
    num = num.indexOf('.') > 0 ? num.substring(0, (num.indexOf('.'))) : num;
    num = num.replace('-', '').trim();
    for (let i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
      num = `${num.substring(0, num.length - (4 * i + 3))},${num.substring(num.length - (4 * i + 3))}`;
    }
    return (sign + num + cents);
  }
  return num;
};

export const digitUppercase = (money) => {
  // 汉字的数字
  const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  // 基本单位
  const cnIntRadice = ['', '拾', '佰', '仟'];
  // 对应整数部分扩展单位
  const cnIntUnits = ['', '万', '亿', '兆'];
  // 对应小数部分单位
  const cnDecUnits = ['角', '分', '毫', '厘'];
  // 整数金额时后面跟的字符
  const cnInteger = '整';
  // 整型完以后的单位
  const cnIntLast = '元';
  // 最大处理的数字
  const maxNum = 999999999999999.9999;
  // 金额整数部分
  let integerNum;
  // 金额小数部分
  let decimalNum;
  // 输出的中文金额字符串
  let chineseStr = '';
  // 分离金额后用的数组，预定义
  let parts;
  if (money === '') { // 不能用==
    return '';
  }
  money = parseFloat(money);
  if (money >= maxNum) {
    // 超出最大处理数字
    return '';
  }
  if (money === 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger;
    return chineseStr;
  }
  // 转换为字符串
  money = money.toString();
  if (money.indexOf('.') === -1) {
    integerNum = money;
    decimalNum = '';
  } else {
    parts = money.split('.');
    integerNum = parts[0];
    decimalNum = parts[1].substr(0, 4);
  }
  // 获取整型部分转换
  if (parseInt(integerNum, 10) > 0) {
    let zeroCount = 0;
    const IntLen = integerNum.length;
    for (let i = 0; i < IntLen; i++) {
      const n = integerNum.substr(i, 1);
      const p = IntLen - i - 1;
      const q = p / 4;
      const m = p % 4;
      if (n === '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0];
        }
        // 归零
        zeroCount = 0;
        chineseStr += cnNums[parseInt(n, 10)] + cnIntRadice[m];
      }
      if (m === 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q];
      }
    }
    chineseStr += cnIntLast;
  }
  // 小数部分
  if (decimalNum !== '') {
    const decLen = decimalNum.length;
    for (let i = 0; i < decLen; i++) {
      const n = decimalNum.substr(i, 1);
      if (n !== '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (chineseStr === '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum === '') {
    chineseStr += cnInteger;
  }
  return chineseStr;
};

export const getUrl = (baseUrl, options) => {
  let urlParams = '';
  Object.keys(options).forEach(keyName => {
    if (options[keyName] || options[keyName] === 0) {
      urlParams += `&${keyName}=${options[keyName]}`;
    }
  });
  urlParams = encodeURI(urlParams);
  return `${baseUrl}${urlParams}`;
};

export const objectTrim = (object) => {
  const result = {};
  Object.getOwnPropertyNames(object).forEach(index => {
    result[index] = object[index].toString().trim();
  });
  return result;
};

/**
 * 处理对象参数值，排除对象参数值为”“、null、undefined，并返回一个新对象
 * */

export const dealElement = (obj) => {
  const param = {};
  if (obj === null || obj === undefined || obj === "") return param;
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
      param[key] = obj[key];
    }
  }
  return param;
};


export const formatTop = (value) => {
  if (value !== undefined && value !== null) {
    const num = Math.floor(value);
    if (num.toString()[0] === '-') return '';

    const len = num.toString().length;
    switch (len) {
      case 1:
        return '个';
      case 2:
        return '十';
      case 3:
        return '百';
      case 4:
        return '千';
      case 5:
        return '万';
      case 6:
        return '十万';
      case 7:
        return '百万';
      case 8:
        return '千万';
      case 9:
        return '亿';
      case 10:
        return '十亿';
      case 11:
        return '百亿';
      case 12:
        return '千亿';
      default:
        '';
    }
  }
  return value;

};

export const encodeURI = (val) => val.replace(new RegExp(`[#%+]`, 'g'), (match, group) => encodeURIComponent(match));

export const routerToExportPage = (promise, params) => {
  if (isFunction(promise)) {
    let newParams = dealElement(params);
    newParams = { ...newParams, accessToken: getUserInfo().accessToken };
    promise(newParams)
      .then(() => {
        const { organizationType } = getUserInfo();
        message.success('导出成功！正在跳转至导出内容下载页面...', 0.5);
        if (organizationType === 1) {
          setTimeout(() => {
            router.push("/buiness-center/exportAndImportRecordPlat");
          }, 500);
        } else {
          setTimeout(() => {
            router.push("/buiness-center/exportAndImportRecord");
          }, 500);
        }
      });
  }
};

export const routerToExportPagePromise = (promise, params, routerParams = '') => new Promise((resolve, reject) => {
  if (isFunction(promise)) {
    let newParams = dealElement(params);
    newParams = { ...newParams, accessToken: getUserInfo().accessToken };
    promise(newParams)
      .then(() => {
        const { organizationType } = getUserInfo();
        message.success('导出成功！正在跳转至导出内容下载页面...', 0.5);
        if (organizationType === 1) {
          setTimeout(() => {
            router.push(`/buiness-center/exportAndImportRecordPlat?routerParams=${routerParams}`);
          }, 500);
          resolve('/buiness-center/exportAndImportRecordPlat');
        } else {
          setTimeout(() => {
            router.push(`/buiness-center/exportAndImportRecord?routerParams=${routerParams}`);
          }, 500);
          resolve('/buiness-center/exportAndImportRecord');
        }
      })
      .catch((err) => {
        reject(err);
      });
  } else {
    reject(new Error('传入参数有误'));
  }
});

export const getLocal = (namKey, initData = undefined) => {
  try {
    return localStorage.getItem(namKey) ? JSON.parse(localStorage.getItem(namKey)) : initData;
  } catch (error) {
    console.log(error, '使用默认值');
    return initData;
  }
};

export const removeSpace = (val) => {
  let res;
  if (val?.constructor === String) {
    res = val.replace(/\s/g, '');
  }
  if (val?.constructor === Object) {
    res = {};
    Object.entries(val).forEach(([k, v]) => {
      if (v?.constructor === String) {
        res[k] = v.replace(/\s/g, "");
      } else {
        res[k] = v;
      }
    }
    );
  }
  if (val?.constructor === Array) {
    res = val.map(item => {
      if (item?.constructor === String) {
        return item.replace(/\s/g, "");
      }
      return item;
    });
  }
  return res;
};

export const routerGoBack = (path) => {
  const errMsg = '无法找到上一路径';
  const reg = /(.*)\/.*/;

  try {
    const url = path.match(reg)[1];
    router.push(url);

  } catch (e) {
    console.log(errMsg);
    console.log(e);
    router.goBack();
  }

};

export const getWeight = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return Number(val.replace('kg', ''));
  return 0;
};

export function formatDuring(mss) {
  const days = parseInt(mss / (1000 * 60 * 60 * 24));
  const hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = (mss % (1000 * 60)) / 1000;
  // return  `${hours  } 小时 ${  minutes  } 分钟 ${  seconds  } 秒 `;
  if (days) return `${days} 天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒 `;
  if (hours) return `${hours} 小时 ${minutes} 分钟 ${seconds} 秒 `;
  if (minutes) return `${minutes} 分钟 ${seconds} 秒 `;
  return `${seconds} 秒 `;
}

export const getGoodsName = (item) => {
  let word = item._categoryName || item.categoryName;
  if (item.goodsName) word += `-${item.goodsName}`;
  if (item.specificationType) word += `-${item.specificationType}`;
  if (item.materialQuality) word += `-${item.materialQuality}`;
  return word;
};

export function xmlStr2XmlObj(xmlStr) {
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
export function xmlObj2json(xml) {
  try {
    let obj = {};
    if (xml.children.length > 0) {
      for (let i = 0; i < xml.children.length; i++) {
        const item = xml.children.item(i);
        const { nodeName } = item;
        if (typeof (obj[nodeName]) === "undefined") {
          obj[nodeName] = xmlObj2json(item);
        } else {
          if (typeof (obj[nodeName].push) === "undefined") {
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

export function xmlStr2json(xml) {
  const xmlObj = xmlStr2XmlObj(xml);
  let jsonObj = {};
  if (xmlObj.childNodes.length > 0) {
    jsonObj = xmlObj2json(xmlObj);
  }
  return jsonObj;
}

export function renderOptions(dict) {
  return Object.entries(dict).reduce((final, current) => {
    const [key, val] = current;
    final.push({
      label: val,
      key,
      value: key
    });
    return final;
  }, []);
}