import { isArray } from "lodash";
import dayjs from "dayjs";
import { ISelectOptionProps, TenderStatus } from "@/declares";

/**
 * 阿拉伯数字转成汉字大写
 * @param money: 阿拉伯数字
 * @returns 转换成大写的字符串
 */
export const digitUppercase = (money: number | string) => {
  // 汉字的数字
  const cnNums = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  // 基本单位
  const cnIntRadice = ["", "拾", "佰", "仟"];
  // 对应整数部分扩展单位
  const cnIntUnits = ["", "万", "亿", "兆"];
  // 对应小数部分单位
  const cnDecUnits = ["角", "分", "毫", "厘"];
  // 整数金额时后面跟的字符
  const cnInteger = "整";
  // 整型完以后的单位
  const cnIntLast = "元";
  // 最大处理的数字
  const maxNum = 999999999999999.9999;
  // 金额整数部分
  let integerNum;
  // 金额小数部分
  let decimalNum;
  // 输出的中文金额字符串
  let chineseStr = "";
  // 分离金额后用的数组，预定义
  let parts;
  if (money === "") {
    // 不能用==
    return "";
  }
  money = parseFloat(money.toString());
  if (money >= maxNum) {
    // 超出最大处理数字
    return "";
  }
  if (money === 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger;
    return chineseStr;
  }
  // 转换为字符串
  money = money.toString();
  if (money.indexOf(".") === -1) {
    integerNum = money;
    decimalNum = "";
  } else {
    parts = money.split(".");
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
      if (n === "0") {
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
  if (decimalNum !== "") {
    const decLen = decimalNum.length;
    for (let i = 0; i < decLen; i++) {
      const n = decimalNum.substr(i, 1);
      if (n !== "0") {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (chineseStr === "") {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum === "") {
    chineseStr += cnInteger;
  }
  return chineseStr;
};

/**
 * 数字加千分位
 * @param num: 阿拉伯数字
 * @returns 转换成大写的字符串
 */
export const formatMoney = (num: string | number) => {
  if (num) {
    num = num.toString().replace(/\$|\,/g, "");
    const sign = num.indexOf("-") !== -1 ? "-" : "";
    let cents = num.indexOf(".") > 0 ? num.substr(num.indexOf(".")) : "";
    cents = cents.length > 1 ? cents : "";
    num = num.indexOf(".") > 0 ? num.substring(0, num.indexOf(".")) : num;
    num = num.replace("-", "").trim();
    for (let i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
      num = `${num.substring(0, num.length - (4 * i + 3))},${num.substring(
        num.length - (4 * i + 3)
      )}`;
    }
    return sign + num + cents;
  }
  return num;
};

/**
 * 包装图片地址
 * @param file: 需要包装的图片
 * @returns 返回新地址
 */
export const getOssImg = (window._getOssImg = (
  file: string,
  { width, height } = {}
) => {
  if (!file) {
    return "";
  }
  let optionStr = "";
  const { ossBucket, ossEndpoint } = window.env;
  const encodedFile = file.replace(new RegExp(`[#%+]`, "g"), (match, group) =>
    encodeURIComponent(match)
  );

  let imgUrl = `https://${ossBucket.dev}.${ossEndpoint}/${encodedFile}`;
  const routeIndex = imgUrl.indexOf("rotate*|*");
  // 由于后端旋转图片传了大写字母，导致oss用url进行图片处理失效，这里增加逻辑，如果有传参数（旋转），将?后的参数进行小写转化处理
  const [l, r] = imgUrl.split("?");
  if (r) {
    imgUrl = `${l}?${r.toLowerCase()}`;
  }

  if (routeIndex > -1) {
    optionStr = "/resize";
    optionStr += `,w_${width || 4096}`;
    optionStr += `,h_${height || 4096}`;
    imgUrl = imgUrl.slice(0, routeIndex) + optionStr + imgUrl.slice(routeIndex);
  } else if (width || height) {
    optionStr = "?x-oss-process=image/resize";
    if (width) {
      optionStr += `,w_${width}`;
    }
    if (height) {
      optionStr += `,h_${height}`;
    }
    imgUrl = `${imgUrl}${optionStr}`;
  }
  imgUrl = `${imgUrl}`.replace("rotate*|*", "/rotate,");
  return imgUrl;
});

/**
 * 转换时间为固定格式字符串
 * @param time: date格式的字符串
 * @param haveSecond: 是否转换成带分秒的字符串
 * @returns 字符串
 */
export const formatTime = (time: string, haveSecond: boolean = false) => {
  if (!time) {
    return "-";
  }
  if (haveSecond) {
    return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
  }
  return dayjs(time).format("YYYY/MM/DD");
};

/**
 *  用于处理树形数据
 *  -将拍平的树形数据处理成树形结构
 *  -提供快速查寻上下级能力
 */
export class MapTreeData {
  itemMap = new Map();

  itemTree = { children: [] };

  constructor(
    items: any[],
    {
      privateKey = "id",
      parentKey = "parentId",
      rootId = "root",
      labelKey
    }: any
  ) {
    // 创建根结点

    this.itemTree[privateKey] = rootId;
    const rootNodeChildren = this.itemTree.children;
    const switchItem = (item: { [x: string]: any }) => ({
      ...item,
      value: item[privateKey],
      label: item[labelKey],
      [parentKey]: item[parentKey]
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

  getItem(itemId: any) {
    return this.itemMap(itemId);
  }
}

/**
 * 验证非负数
 */
export const regNumber1 = /^\d*(\.\d*)?$/;

/**
 * 验证数字（可以负数也可以小数）
 */
export const regNumber2 = /^-?\d*(\.\d*)?$/;

// 字典转可选数组
export function renderOptions(dict: any): ISelectOptionProps[] {
  const list: ISelectOptionProps[] = [];
  for (const [key, val] of Object.entries(dict)) {
    list.push({
      label: val as string,
      key,
      value: key
    });
  }
  return list;
}

/**
 * 根据状态返回文字
 *  @param type: 状态
 */

export const renderText = (type: number) => {
  switch (type) {
    case TenderStatus.Daft:
      return "草稿 ";
    case TenderStatus.Prediction:
      return "预报";
    case TenderStatus.InBidding:
      return "投标中";
    case TenderStatus.InBidEvaluation:
      return "待开标-评标";
    case TenderStatus.twoPrice:
      return "待开标-二次报价";
    case TenderStatus.PriceSure:
      return "待开标-价格确认 ";
    case TenderStatus.NotPublicized:
      return "待开标-未公示";
    case TenderStatus.BidOpened:
      return "已开标";
    case TenderStatus.Withdrawn:
      return "已撤回";
    default:
      return "-";
  }
};

export const getBaseUrl = () => {
  return window.env.baseURL.prod.indexOf("#") !== -1
    ? `${window.env.baseURL.dev}`
    : `${window.env.baseURL.prod}`;
};

export const getLoginUrl = () => {
  return `${getBaseUrl()}user/role?redirect=/tender/home`
};

export function xmlStr2XmlObj(xmlStr: string) {
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

export function xmlObj2json(xml: any) {
  try {
    let obj = {};
    if (xml.children.length > 0) {
      for (let i = 0; i < xml.children.length; i++) {
        const item = xml.children.item(i);
        const { nodeName } = item;
        if (typeof obj[nodeName] === "undefined") {
          obj[nodeName] = xmlObj2json(item);
        } else {
          if (typeof obj[nodeName].push === "undefined") {
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

export function xmlStr2json(xml: string) {
  const xmlObj = xmlStr2XmlObj(xml);
  let jsonObj = {};
  if (xmlObj.childNodes.length > 0) {
    jsonObj = xmlObj2json(xmlObj);
  }
  return jsonObj;
}

export function jqueryUrl(url: string) {
  //将地址从"？"位置分割成两部分
  const arr = url.split("?");
  //取地址右边参数部分从"&"位置继续分割，成为单独参数列表
  const params = arr[1].split("&"); //得到[a=1,b=2,c=3]
  //定义一个空对象
  const obj: any = {};
  for (let i = 0; i < params.length; i++) {
    const param = params[i].split("="); //得到[a,1]、[b,2]、[c,3]
    obj[param[0]] = param[1]; //为对象赋值
  }
  return obj;
}
export function rendText(oldStr: string, target: string) {
  if (!oldStr) {
    return "";
  }
  if (!target) {
    return oldStr;
  }
  const reg = new RegExp(target, "g");

  const newStr = oldStr.replace(
    reg,
    `<span style="color: red">${target}</span>`
  );
  return newStr;
}


//电话号码*号显示
export function renderPhone(text: string) {
  return `${text.substring(0, 3)}****${text.substring(7)}`;
}

// 数字转汉字
export const toChinesNum = (num : number | string) => {
  let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  let unit = ["", "十", "百", "千", "万"];
  if(typeof num !== 'number'){
    num = parseInt(num);
  }
  let getWan = (temp : any) => {
    let strArr = temp.toString().split("").reverse();
    let newNum = "";
    for (var i = 0; i < strArr.length; i++) {
      newNum = (i == 0 && strArr[i] == 0 ? "" : (i > 0 && strArr[i] == 0 && strArr[i - 1] == 0 ? "" : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i]))) + newNum;
    }
    return newNum;
  }
  let overWan = Math.floor(num / 10000);
  let noWan : string = String(num % 10000);
  if (noWan.toString().length < 4) { noWan = "0" + noWan; }
  return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);
}


