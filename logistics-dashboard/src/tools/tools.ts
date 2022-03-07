export function toCamelCase(str: string) {
  return str.replace(/\B_(\w)/g, (all, letter) => letter.toUpperCase());
}

export const isObject = (obj: any): obj is Object => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

export const isEmptyObject = (obj: any): obj is {} => {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

export const isArray = (arr: any): arr is Array<any> => {
  return Object.prototype.toString.call(arr) === '[object Array]';
};

export const isEmpty = (variable) => {
  var result = false;
  if (typeof variable === 'string') {
    if (
      variable === '' ||
      variable === 'undefined' ||
      // variable === "null" ||
      variable === 'NaN' ||
      variable === 'Infinity'
    ) {
      result = true;
    }
  } else if (typeof variable === 'number') {
    if (isNaN(variable) || !isFinite(variable)) {
      result = false;
    }
  } else if (variable === null) {
    result = true;
  } else if (typeof variable === 'undefined') {
    result = true;
  } else if (isObject(variable)) {
    if (isEmptyObject(variable)) {
      result = true;
    }
  } else if (isArray(variable)) {
    if (variable.length === 0) {
      result = true;
    }
  }
  return result;
};

// 这个应该放service里
export const getStatusToNum = (obj, key, val, needValue) => {
  if (isEmpty(obj)) return 0;
  return obj.find((item) => item[key] === val)[needValue];
};

// 距离换算
export const getDistance = ({ latOne, lngOne, latTwo, lngTwo }) => {
  const EARTH_RADIUS = 6378.137;

  const radLat1 = rad(latOne);
  const radLat2 = rad(latTwo);
  const a = radLat1 - radLat2;
  const b = rad(lngOne) - rad(lngTwo);
  let s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2),
      ),
    );
  s = s * EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000;
  s = s * 1000;
  return s;
};

const rad = (d) => {
  return (d * Math.PI) / 180.0;
};

// 递归调用请求
export const recursion = (reqList, callback, current = 0) => {
  if (current === reqList.length - 1) {
    reqList[current]().then(() => {
      callback();
    });
  } else {
    reqList[current]().then(() => {
      recursion(reqList, callback, current + 1);
    });
  }
};
